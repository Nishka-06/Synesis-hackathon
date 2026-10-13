export type DepartmentId = 'ED' | 'ICU' | 'MED' | 'SURG' | 'CARD' | 'ORTHO' | 'RAD' | 'LAB';

export interface Department {
  id: DepartmentId;
  name: string;
  shortName: string;
  floor: string;
  head: string;
  activeStaff: number;
  totalBeds: number;
  currentQueue: number;
  avgWaitMinutes: number;
  targetWaitMinutes: number;
}

export type BedStatus =
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'discharge_pending'
  | 'awaiting_cleaning'
  | 'cleaning_in_progress'
  | 'unavailable';

export type BedType =
  | 'general'
  | 'icu'
  | 'stepdown'
  | 'isolation_negative_pressure'
  | 'pediatric'
  | 'post_op';

export type EquipmentTag =
  | 'ventilator'
  | 'telemetry'
  | 'oxygen_high_flow'
  | 'bipap'
  | 'dialysis_ready'
  | 'none';

export interface Bed {
  id: string;
  departmentId: DepartmentId;
  ward: string;
  roomNumber: string;
  bedLabel: string;
  type: BedType;
  status: BedStatus;
  equipment: EquipmentTag[];
  isolation: boolean;
  currentPatientId?: string;
  lastUpdated: string;
  cleaningStartedAt?: string;
  assignedCleaner?: string;
}

export type TriageCategory = 'P1_resuscitation' | 'P2_emergency' | 'P3_urgent' | 'P4_less_urgent';

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  fullName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  admissionDate: string;
  admittingDiagnosis: string;
  primaryPhysician: string;
  departmentId: DepartmentId;
  bedId?: string;
  clinicalStatus: 'stable' | 'monitoring' | 'critical' | 'ready_for_discharge' | 'discharged';
  triageCategory: TriageCategory;
  attendingNurse: string;
  insurancePolicyId?: string;
  acuityScore: number; // 1-5
}

export interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  departmentId: DepartmentId;
  triageCategory: TriageCategory;
  arrivalTime: string;
  waitingMinutes: number;
  status: 'waiting' | 'in_assessment' | 'admission_pending' | 'allocated';
  assignedBedId?: string;
  chiefComplaint: string;
  targetWard: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'physician' | 'charge_nurse' | 'staff_nurse' | 'cleaning_staff' | 'billing_specialist' | 'pharmacist' | 'radiology_tech';
  departmentId: DepartmentId;
  shift: 'Day' | 'Evening' | 'Night';
  isAvailable: boolean;
  contactExt: string;
}

export interface DiagnosticEquipment {
  id: string;
  name: string;
  type: 'CT' | 'MRI' | 'X_RAY' | 'ULTRASOUND' | 'LAB_ANALYZER';
  departmentId: DepartmentId;
  status: 'online' | 'busy' | 'maintenance' | 'offline';
  queueLength: number;
  avgTurnaroundMinutes: number;
  dailyCapacity: number;
  currentCompletedToday: number;
}

export interface DiagnosticOrder {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  equipmentId: string;
  orderedAt: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  isUrgent: boolean;
  chargeId?: string;
}

export type BillingChargeCategory =
  | 'room'
  | 'pharmacy'
  | 'diagnostic'
  | 'procedure'
  | 'nursing'
  | 'meal'
  | 'other';

export type BillingChargeStatus =
  | 'ordered'
  | 'performed'
  | 'verified'
  | 'disputed'
  | 'reversed';

export interface BillingCharge {
  id: string;
  transactionId: string; // Unique idempotency ID
  patientId: string;
  category: BillingChargeCategory;
  description: string;
  amount: number;
  timestamp: string;
  status: BillingChargeStatus;
  reversalReason?: string;
  verifiedBy?: string;
  departmentId: DepartmentId;
}

export interface PaymentRecord {
  id: string;
  patientId: string;
  amount: number;
  method: 'insurance_advance' | 'credit_card' | 'wire' | 'cash';
  timestamp: string;
  receiptNumber: string;
  recordedBy: string;
}

export interface PatientAccount {
  patientId: string;
  roomTariffPerDay: number;
  admissionTime: string;
  charges: BillingCharge[];
  payments: PaymentRecord[];
  insuranceApprovedAmount: number;
  insuranceStatus: 'pending' | 'verified' | 'disputed';
  isSettled: boolean;
}

export type InsuranceStatus =
  | 'documents_pending'
  | 'ready_for_submission'
  | 'submitted'
  | 'under_review'
  | 'query_raised'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'settlement_pending'
  | 'settled';

export interface InsuranceClaimDoc {
  docType: string;
  displayName: string;
  isSubmitted: boolean;
  isVerified: boolean;
  uploadedAt?: string;
}

export interface InsuranceQuery {
  id: string;
  queryText: string;
  raisedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  isResolved: boolean;
  responsibleRole: string;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  patientName: string;
  insurerName: string;
  policyNumber: string;
  preAuthNumber: string;
  requestedAmount: number;
  approvedAmount: number;
  patientResponsibility: number;
  status: InsuranceStatus;
  requiredDocs: InsuranceClaimDoc[];
  queries: InsuranceQuery[];
  lastUpdated: string;
  nextAction: string;
  responsibleTeam: string;
}

export type DischargeStage =
  | 'clinical_decision_pending'
  | 'authorized_by_clinician'
  | 'doc_preparation'
  | 'pharmacy_reconciliation'
  | 'diagnostic_charge_reconciliation'
  | 'billing_reconciliation'
  | 'insurance_review'
  | 'provisional_settlement'
  | 'final_settlement_completed'
  | 'patient_departure'
  | 'bed_cleaning_turnover'
  | 'bed_verified_ready';

export interface DischargeTask {
  id: string;
  name: string;
  department: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed';
  createdTime: string;
  completedTime?: string;
  priority: 'critical' | 'high' | 'normal';
  blockingTaskId?: string;
  blockingReason?: string;
  estimatedDurationMinutes: number;
  notes?: string;
  assignedRole: string;
}

export interface DischargeRecord {
  patientId: string;
  patientName: string;
  bedId: string;
  departmentId: DepartmentId;
  currentStage: DischargeStage;
  authorizedClinician?: string;
  authorizedAt?: string;
  tasks: DischargeTask[];
  estimatedCompletionMinutesMin: number;
  estimatedCompletionMinutesMax: number;
  delayExplanation: string;
  departureTime?: string;
  turnoverCompletedAt?: string;
}

export interface OperationalAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  departmentId: DepartmentId;
  title: string;
  measurements: string;
  probableCause: string;
  downstreamImpact: string;
  recommendedAction: string;
  responsibleTeam: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  resolvedAt?: string;
}

export interface Bottleneck {
  id: string;
  location: string;
  departmentId: DepartmentId;
  severity: 'critical' | 'warning' | 'moderate';
  title: string;
  measurements: string;
  probableCause: string;
  downstreamWorkflows: string[];
  recommendedNextAction: string;
  responsibleTeam: string;
  detectedAt: string;
  isActive: boolean;
}

export interface AutopilotActionItem {
  id: string;
  label: string;
  department: string;
  actionType: 'expedite_pharmacy' | 'resolve_insurance_query' | 'assign_cleaner' | 'rebalance_staff' | 'approve_transfer';
  targetId?: string;
  status: 'suggested' | 'approved' | 'executed';
  autoExecutable: boolean;
}

export interface AutopilotActionPlan {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'normal';
  problemSummary: string;
  evidence: string[];
  contributingBottlenecks: string[];
  affectedDepartments: string[];
  recommendedActions: AutopilotActionItem[];
  expectedImpact: string;
  requiresHumanApproval: boolean;
  isApproved: boolean;
  isExecuted: boolean;
  approvedBy?: string;
  createdAt: string;
}

export interface HistoricalArrival {
  timestamp: string;
  departmentId: DepartmentId;
  count: number;
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  isWeekend: boolean;
}

export interface ArrivalForecast {
  timestamp: string;
  departmentId: DepartmentId;
  hourLabel: string;
  predictedArrivals: number;
  lowerBound: number;
  upperBound: number;
  availableCapacity: number;
  capacityShortageRisk: 'none' | 'moderate' | 'high' | 'critical';
}

export interface SimulationParams {
  arrivalVolumeMultiplier: number; // 0.5 to 2.0
  availableBedsOffset: number; // -10 to +10
  staffAvailabilityPercent: number; // 50 to 150
  diagnosticUptimePercent: number; // 50 to 100
  dischargeEfficiencyMultiplier: number; // 0.5 to 2.0
  pharmacyDelayMinutes: number; // 0 to 90
  billingDelayMinutes: number; // 0 to 90
  insuranceQueryDelayMinutes: number; // 0 to 120
  cleaningDurationMinutes: number; // 15 to 90
}

export interface SimulationMetrics {
  avgWaitMinutes: number;
  edBoardingCount: number;
  bedOccupancyRate: number;
  delayedDischargesCount: number;
  diagnosticBacklogCount: number;
  peakCapacityHour: string;
  projectedBottlenecks: number;
}

export interface SimulationResult {
  baseline: SimulationMetrics;
  scenario: SimulationMetrics;
  comparisonNotes: string[];
  departmentForecast: {
    department: string;
    baselineWait: number;
    scenarioWait: number;
    baselineOccupancy: number;
    scenarioOccupancy: number;
  }[];
}
