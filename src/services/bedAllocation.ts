import { Bed, QueueItem, EquipmentTag } from '../types/hospital';

export interface BedAllocationRecommendation {
  bed: Bed;
  score: number; // 0-100
  matchConfidence: 'Exact Match' | 'Compatible' | 'Alternate Ward';
  rationale: string[];
  equipmentSatisfied: boolean;
  isolationSatisfied: boolean;
}

export function recommendBedsForPatient(
  queueItem: QueueItem,
  allBeds: Bed[],
  requiredEquipment: EquipmentTag[] = [],
  requiresIsolation: boolean = false
): BedAllocationRecommendation[] {
  // 1. Filter out occupied, cleaning, reserved, or unavailable beds
  const candidateBeds = allBeds.filter((b) => b.status === 'available');

  const recommendations: BedAllocationRecommendation[] = [];

  candidateBeds.forEach((bed) => {
    let score = 50;
    const rationale: string[] = [];

    // Department match
    if (bed.departmentId === queueItem.departmentId) {
      score += 30;
      rationale.push(`Located directly in primary requested department (${bed.departmentId}).`);
    } else {
      // Cross-department stepdown/overflow compatibility
      if (queueItem.departmentId === 'ED' && (bed.departmentId === 'MED' || bed.departmentId === 'SURG' || bed.departmentId === 'CARD')) {
        score += 20;
        rationale.push(`Suitable inpatient transfer destination ward (${bed.departmentId} - ${bed.ward}).`);
      } else {
        score -= 10;
        rationale.push(`Overflow ward placement (${bed.departmentId}).`);
      }
    }

    // Equipment checks
    let equipmentSatisfied = true;
    for (const req of requiredEquipment) {
      if (req !== 'none' && !bed.equipment.includes(req)) {
        equipmentSatisfied = false;
        break;
      }
    }

    if (requiredEquipment.length > 0 && requiredEquipment[0] !== 'none') {
      if (equipmentSatisfied) {
        score += 15;
        rationale.push(`Meets required equipment configuration (${requiredEquipment.join(', ')}).`);
      } else {
        score -= 40;
        rationale.push(`Missing required clinical equipment (${requiredEquipment.join(', ')}).`);
      }
    } else {
      rationale.push('Standard clinical monitoring configuration satisfied.');
    }

    // Isolation check
    let isolationSatisfied = true;
    if (requiresIsolation) {
      if (bed.isolation) {
        score += 15;
        rationale.push('Negative pressure isolation suite verified.');
      } else {
        isolationSatisfied = false;
        score -= 50;
        rationale.push('Does not meet airborne/contact negative pressure isolation protocol.');
      }
    } else if (bed.isolation) {
      // Avoid wasting isolation bed on non-isolation patient unless necessary
      score -= 10;
      rationale.push('Isolation room reserved for infectious containment; non-isolation patient.');
    }

    // Triage priority weighting
    if (queueItem.triageCategory === 'P1_resuscitation' || queueItem.triageCategory === 'P2_emergency') {
      score += 5;
      rationale.push(`High acuity patient priority score boosted (${queueItem.triageCategory}).`);
    }

    let matchConfidence: 'Exact Match' | 'Compatible' | 'Alternate Ward' = 'Compatible';
    if (score >= 80 && equipmentSatisfied && isolationSatisfied) {
      matchConfidence = 'Exact Match';
    } else if (bed.departmentId !== queueItem.departmentId) {
      matchConfidence = 'Alternate Ward';
    }

    recommendations.push({
      bed,
      score: Math.max(10, Math.min(99, score)),
      matchConfidence,
      rationale,
      equipmentSatisfied,
      isolationSatisfied,
    });
  });

  // Sort descending by score
  return recommendations.sort((a, b) => b.score - a.score);
}
