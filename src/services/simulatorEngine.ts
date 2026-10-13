import { SimulationParams, SimulationResult, SimulationMetrics } from '../types/hospital';

export const defaultBaselineMetrics: SimulationMetrics = {
  avgWaitMinutes: 52,
  edBoardingCount: 4,
  bedOccupancyRate: 88.5,
  delayedDischargesCount: 3,
  diagnosticBacklogCount: 8,
  peakCapacityHour: '20:00 - 22:00',
  projectedBottlenecks: 4,
};

export function runHospitalSimulation(params: SimulationParams): SimulationResult {
  const baseline = { ...defaultBaselineMetrics };

  // Calculate Scenario Impacts based on user levers
  // 1. Arrival Multiplier impact
  const arrivalDelta = (params.arrivalVolumeMultiplier - 1.0) * 100;
  // 2. Bed offset impact
  const bedDelta = params.availableBedsOffset;
  // 3. Staffing impact
  const staffFactor = params.staffAvailabilityPercent / 100;
  // 4. Diagnostic uptime impact
  const diagFactor = params.diagnosticUptimePercent / 100;
  // 5. Discharge efficiency impact
  const dischargeFactor = params.dischargeEfficiencyMultiplier;
  // 6. Delays (pharmacy, billing, insurance, cleaning)
  const totalExtraDelaysMinutes =
    params.pharmacyDelayMinutes +
    params.billingDelayMinutes +
    params.insuranceQueryDelayMinutes +
    Math.max(0, params.cleaningDurationMinutes - 30);

  // New Wait Time
  let scenarioWait = baseline.avgWaitMinutes;
  scenarioWait += arrivalDelta * 0.45;
  scenarioWait -= bedDelta * 2.5;
  scenarioWait += (1 - staffFactor) * 25;
  scenarioWait += (1 - diagFactor) * 20;
  scenarioWait -= (dischargeFactor - 1.0) * 15;
  scenarioWait += totalExtraDelaysMinutes * 0.15;
  scenarioWait = Math.max(12, Math.round(scenarioWait));

  // ED Boarding Count
  let scenarioBoarding = baseline.edBoardingCount;
  scenarioBoarding += Math.round(arrivalDelta * 0.08);
  scenarioBoarding -= Math.round(bedDelta * 0.5);
  scenarioBoarding += Math.round((totalExtraDelaysMinutes / 60) * 1.2);
  scenarioBoarding -= Math.round((dischargeFactor - 1.0) * 2);
  scenarioBoarding = Math.max(0, scenarioBoarding);

  // Bed Occupancy Rate
  let scenarioOccupancy = baseline.bedOccupancyRate;
  scenarioOccupancy += arrivalDelta * 0.12;
  scenarioOccupancy -= bedDelta * 1.8;
  scenarioOccupancy -= (dischargeFactor - 1.0) * 4;
  scenarioOccupancy = Math.max(45, Math.min(100, Math.round(scenarioOccupancy * 10) / 10));

  // Delayed Discharges
  let scenarioDelayedDischarges = baseline.delayedDischargesCount;
  if (totalExtraDelaysMinutes > 60) {
    scenarioDelayedDischarges += Math.round(totalExtraDelaysMinutes / 45);
  } else if (dischargeFactor > 1.2) {
    scenarioDelayedDischarges = Math.max(0, scenarioDelayedDischarges - 2);
  }

  // Diagnostic Backlog
  let scenarioBacklog = baseline.diagnosticBacklogCount;
  scenarioBacklog += Math.round((1 - diagFactor) * 12);
  scenarioBacklog += Math.round(arrivalDelta * 0.06);
  scenarioBacklog = Math.max(1, scenarioBacklog);

  // Bottlenecks count
  let scenarioBottlenecks = 2;
  if (scenarioBoarding > 3) scenarioBottlenecks += 1;
  if (scenarioOccupancy > 90) scenarioBottlenecks += 1;
  if (scenarioBacklog > 8) scenarioBottlenecks += 1;
  if (scenarioDelayedDischarges > 3) scenarioBottlenecks += 1;

  const comparisonNotes: string[] = [];

  if (params.arrivalVolumeMultiplier > 1.2) {
    comparisonNotes.push(
      `Patient intake volume increased by ${Math.round((params.arrivalVolumeMultiplier - 1) * 100)}%, pushing peak admission waiting time up by ${Math.abs(scenarioWait - baseline.avgWaitMinutes)} mins.`
    );
  } else if (params.arrivalVolumeMultiplier < 0.9) {
    comparisonNotes.push(
      `Intake reduction of ${Math.round((1 - params.arrivalVolumeMultiplier) * 100)}% relieves emergency throughput and drops bed occupancy to ${scenarioOccupancy}%.`
    );
  }

  if (params.dischargeEfficiencyMultiplier > 1.2) {
    comparisonNotes.push(
      `Accelerated discharge turnaround released inpatient beds faster, mitigating ED boarding by ${Math.max(1, baseline.edBoardingCount - scenarioBoarding)} patient placements.`
    );
  }

  if (totalExtraDelaysMinutes > 45) {
    comparisonNotes.push(
      `Accumulated administrative, pharmacy, and insurance delays (+${totalExtraDelaysMinutes}m) increased the delayed discharge count to ${scenarioDelayedDischarges}.`
    );
  }

  if (params.diagnosticUptimePercent < 80) {
    comparisonNotes.push(
      `Radiology equipment downtime resulted in ${scenarioBacklog} scans backlogged, extending emergency decision latency.`
    );
  }

  if (comparisonNotes.length === 0) {
    comparisonNotes.push('Operational levers remain within standard nominal thresholds.');
  }

  const departmentForecast = [
    {
      department: 'Emergency Medicine',
      baselineWait: 42,
      scenarioWait: Math.round(42 * (scenarioWait / baseline.avgWaitMinutes)),
      baselineOccupancy: 85,
      scenarioOccupancy: Math.min(100, Math.round(85 * (scenarioOccupancy / baseline.bedOccupancyRate))),
    },
    {
      department: 'General Medicine',
      baselineWait: 78,
      scenarioWait: Math.round(78 * (scenarioWait / baseline.avgWaitMinutes)),
      baselineOccupancy: 92,
      scenarioOccupancy: Math.min(100, Math.round(92 * (scenarioOccupancy / baseline.bedOccupancyRate))),
    },
    {
      department: 'Surgery & Post-Op',
      baselineWait: 45,
      scenarioWait: Math.round(45 * (scenarioWait / baseline.avgWaitMinutes)),
      baselineOccupancy: 70,
      scenarioOccupancy: Math.min(100, Math.round(70 * (scenarioOccupancy / baseline.bedOccupancyRate))),
    },
    {
      department: 'Cardiology',
      baselineWait: 52,
      scenarioWait: Math.round(52 * (scenarioWait / baseline.avgWaitMinutes)),
      baselineOccupancy: 88,
      scenarioOccupancy: Math.min(100, Math.round(88 * (scenarioOccupancy / baseline.bedOccupancyRate))),
    },
    {
      department: 'Intensive Care Unit',
      baselineWait: 15,
      scenarioWait: Math.round(15 * (scenarioWait / baseline.avgWaitMinutes)),
      baselineOccupancy: 75,
      scenarioOccupancy: Math.min(100, Math.round(75 * (scenarioOccupancy / baseline.bedOccupancyRate))),
    },
  ];

  return {
    baseline,
    scenario: {
      avgWaitMinutes: scenarioWait,
      edBoardingCount: scenarioBoarding,
      bedOccupancyRate: scenarioOccupancy,
      delayedDischargesCount: scenarioDelayedDischarges,
      diagnosticBacklogCount: scenarioBacklog,
      peakCapacityHour: '19:00 - 23:00',
      projectedBottlenecks: scenarioBottlenecks,
    },
    comparisonNotes,
    departmentForecast,
  };
}
