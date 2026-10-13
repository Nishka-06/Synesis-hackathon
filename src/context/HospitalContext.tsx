import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Department,
  Bed,
  Patient,
  QueueItem,
  StaffMember,
  DiagnosticEquipment,
  DiagnosticOrder,
  PatientAccount,
  BillingCharge,
  PaymentRecord,
  InsuranceClaim,
  DischargeRecord,
  OperationalAlert,
  Bottleneck,
  AutopilotActionPlan,
  HistoricalArrival,
  BedStatus,
} from '../types/hospital';
import {
  initialDepartments,
  initialBeds,
  initialPatients,
  initialQueueItems,
  initialStaffMembers,
  initialDiagnosticEquipment,
  initialDiagnosticOrders,
  initialAccounts,
  initialInsuranceClaims,
  initialDischargeRecords,
  initialBottlenecks,
  initialOperationalAlerts,
  initialAutopilotPlans,
  initialHistoricalArrivals,
} from '../data/initialData';

export type UserRole = 'admin' | 'staff';

interface HospitalContextType {
  departments: Department[];
  beds: Bed[];
  patients: Patient[];
  queueItems: QueueItem[];
  staffMembers: StaffMember[];
  diagnosticEquipment: DiagnosticEquipment[];
  diagnosticOrders: DiagnosticOrder[];
  accounts: Record<string, PatientAccount>;
  insuranceClaims: Record<string, InsuranceClaim>;
  dischargeRecords: Record<string, DischargeRecord>;
  operationalAlerts: OperationalAlert[];
  bottlenecks: Bottleneck[];
  autopilotPlans: AutopilotActionPlan[];
  historicalArrivals: HistoricalArrival[];
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  isAskDrawerOpen: boolean;
  setIsAskDrawerOpen: (open: boolean) => void;

  // Key operations
  allocateBed: (queueItemId: string, bedId: string) => boolean;
  updateBedStatus: (bedId: string, status: BedStatus) => void;
  startBedCleaning: (bedId: string, cleanerName: string) => void;
  completeBedCleaning: (bedId: string) => void;
  addBillingCharge: (patientId: string, charge: Omit<BillingCharge, 'id' | 'transactionId' | 'timestamp' | 'patientId'>) => { success: boolean; duplicateWarn?: boolean; message: string };
  verifyBillingCharge: (patientId: string, chargeId: string) => void;
  reverseBillingCharge: (patientId: string, chargeId: string, reason: string) => void;
  recordPayment: (patientId: string, amount: number, method: PaymentRecord['method']) => void;
  updateClaimDocStatus: (claimId: string, docType: string, isSubmitted: boolean, isVerified: boolean) => void;
  resolveInsuranceQuery: (claimId: string, queryId: string, resolutionNotes: string) => void;
  updateDischargeTaskStatus: (patientId: string, taskId: string, status: 'pending' | 'in_progress' | 'blocked' | 'completed') => void;
  authorizeDischarge: (patientId: string, clinicianName: string) => void;
  completePatientDeparture: (patientId: string) => void;
  approveAutopilotPlan: (planId: string) => void;
  executeAutopilotPlan: (planId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  resetDemoData: () => void;

  // Computed KPIs
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  cleaningBeds: number;
  reservedBeds: number;
  occupancyRate: number;
  patientsWaitingAdmission: number;
  avgWaitTimeMinutes: number;
  patientsAwaitingDischarge: number;
  blockedDischargesCount: number;
  activeAlertsCount: number;
  edBoardingCount: number;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [queueItems, setQueueItems] = useState<QueueItem[]>(initialQueueItems);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers);
  const [diagnosticEquipment, setDiagnosticEquipment] = useState<DiagnosticEquipment[]>(initialDiagnosticEquipment);
  const [diagnosticOrders, setDiagnosticOrders] = useState<DiagnosticOrder[]>(initialDiagnosticOrders);
  const [accounts, setAccounts] = useState<Record<string, PatientAccount>>(initialAccounts);
  const [insuranceClaims, setInsuranceClaims] = useState<Record<string, InsuranceClaim>>(initialInsuranceClaims);
  const [dischargeRecords, setDischargeRecords] = useState<Record<string, DischargeRecord>>(initialDischargeRecords);
  const [operationalAlerts, setOperationalAlerts] = useState<OperationalAlert[]>(initialOperationalAlerts);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>(initialBottlenecks);
  const [autopilotPlans, setAutopilotPlans] = useState<AutopilotActionPlan[]>(initialAutopilotPlans);
  const [historicalArrivals] = useState<HistoricalArrival[]>(initialHistoricalArrivals);

  const [role, setRole] = useState<UserRole>('admin');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isAskDrawerOpen, setIsAskDrawerOpen] = useState<boolean>(false);

  // Recalculate KPIs dynamically from data
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const availableBeds = beds.filter((b) => b.status === 'available').length;
  const cleaningBeds = beds.filter((b) => b.status === 'awaiting_cleaning' || b.status === 'cleaning_in_progress').length;
  const reservedBeds = beds.filter((b) => b.status === 'reserved' || b.status === 'discharge_pending').length;
  const occupancyRate = totalBeds > 0 ? Math.round(((occupiedBeds + reservedBeds) / totalBeds) * 1000) / 10 : 0;

  const edBoardingCount = queueItems.filter((q) => q.departmentId === 'ED' && q.status === 'admission_pending').length;
  const patientsWaitingAdmission = queueItems.filter((q) => q.status === 'admission_pending' || q.status === 'waiting').length;

  const avgWaitTimeMinutes = useMemo(() => {
    if (queueItems.length === 0) return 0;
    const total = queueItems.reduce((acc, q) => acc + q.waitingMinutes, 0);
    return Math.round(total / queueItems.length);
  }, [queueItems]);

  const patientsAwaitingDischarge = Object.values(dischargeRecords).filter(
    (d) => d.currentStage !== 'bed_verified_ready' && !d.departureTime
  ).length;

  const blockedDischargesCount = Object.values(dischargeRecords).filter((d) =>
    d.tasks.some((t) => t.status === 'blocked')
  ).length;

  const activeAlertsCount = operationalAlerts.filter((a) => a.status === 'active').length;

  // Action: Allocate Bed
  const allocateBed = (queueItemId: string, bedId: string): boolean => {
    const queueItem = queueItems.find((q) => q.id === queueItemId);
    const targetBed = beds.find((b) => b.id === bedId);

    if (!queueItem || !targetBed || targetBed.status !== 'available') {
      return false;
    }

    // Update Bed
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'occupied',
              currentPatientId: queueItem.patientId,
              lastUpdated: new Date().toISOString(),
            }
          : b
      )
    );

    // Update Queue
    setQueueItems((prev) =>
      prev.map((q) =>
        q.id === queueItemId
          ? {
              ...q,
              status: 'allocated',
              assignedBedId: bedId,
            }
          : q
      )
    );

    // Create / Update Patient record
    setPatients((prev) => {
      const existing = prev.find((p) => p.id === queueItem.patientId);
      if (existing) {
        return prev.map((p) => (p.id === queueItem.patientId ? { ...p, bedId, departmentId: targetBed.departmentId } : p));
      }
      return [
        ...prev,
        {
          id: queueItem.patientId,
          mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
          fullName: queueItem.patientName,
          age: queueItem.age,
          gender: queueItem.gender as any,
          admissionDate: new Date().toISOString(),
          admittingDiagnosis: queueItem.chiefComplaint,
          primaryPhysician: 'Admitting Physician On-Call',
          departmentId: targetBed.departmentId,
          bedId,
          clinicalStatus: 'stable',
          triageCategory: queueItem.triageCategory,
          attendingNurse: 'Floor Staff Nurse, RN',
          acuityScore: queueItem.triageCategory === 'P1_resuscitation' ? 5 : 3,
        },
      ];
    });

    return true;
  };

  const updateBedStatus = (bedId: string, status: BedStatus) => {
    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status, lastUpdated: new Date().toISOString() } : b))
    );
  };

  const startBedCleaning = (bedId: string, cleanerName: string) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'cleaning_in_progress',
              cleaningStartedAt: new Date().toISOString(),
              assignedCleaner: cleanerName,
              lastUpdated: new Date().toISOString(),
            }
          : b
      )
    );
  };

  const completeBedCleaning = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'available',
              currentPatientId: undefined,
              cleaningStartedAt: undefined,
              assignedCleaner: undefined,
              lastUpdated: new Date().toISOString(),
            }
          : b
      )
    );
  };

  // Action: Add Billing Charge with Duplicate / Idempotency Check
  const addBillingCharge = (
    patientId: string,
    chargeData: Omit<BillingCharge, 'id' | 'transactionId' | 'timestamp' | 'patientId'>
  ) => {
    const existingAccount = accounts[patientId];
    if (!existingAccount) {
      return { success: false, message: 'Patient billing account not found.' };
    }

    // Idempotency check: duplicate if same patient, category, description, amount
    const isDuplicate = existingAccount.charges.some(
      (c) =>
        c.category === chargeData.category &&
        c.description.toLowerCase().trim() === chargeData.description.toLowerCase().trim() &&
        c.amount === chargeData.amount &&
        c.status !== 'reversed'
    );

    const newCharge: BillingCharge = {
      ...chargeData,
      id: `CHG-${Date.now().toString().slice(-5)}`,
      transactionId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      patientId,
      timestamp: new Date().toISOString(),
      status: isDuplicate ? 'disputed' : chargeData.status,
    };

    setAccounts((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        charges: [...prev[patientId].charges, newCharge],
      },
    }));

    if (isDuplicate) {
      return {
        success: true,
        duplicateWarn: true,
        message: 'Potential duplicate charge detected! Added to account flagged as Disputed for supervisor review.',
      };
    }

    return {
      success: true,
      duplicateWarn: false,
      message: `Charge of $${chargeData.amount.toLocaleString()} recorded successfully (TX: ${newCharge.transactionId}).`,
    };
  };

  const verifyBillingCharge = (patientId: string, chargeId: string) => {
    setAccounts((prev) => {
      const acct = prev[patientId];
      if (!acct) return prev;
      return {
        ...prev,
        [patientId]: {
          ...acct,
          charges: acct.charges.map((c) =>
            c.id === chargeId ? { ...c, status: 'verified', verifiedBy: 'Auditor ' + role.toUpperCase() } : c
          ),
        },
      };
    });
  };

  const reverseBillingCharge = (patientId: string, chargeId: string, reason: string) => {
    setAccounts((prev) => {
      const acct = prev[patientId];
      if (!acct) return prev;
      return {
        ...prev,
        [patientId]: {
          ...acct,
          charges: acct.charges.map((c) =>
            c.id === chargeId ? { ...c, status: 'reversed', reversalReason: reason } : c
          ),
        },
      };
    });
  };

  const recordPayment = (patientId: string, amount: number, method: PaymentRecord['method']) => {
    const payment: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      patientId,
      amount,
      method,
      timestamp: new Date().toISOString(),
      receiptNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
      recordedBy: role === 'admin' ? 'Finance Admin' : 'Discharge Cashier',
    };

    setAccounts((prev) => {
      const acct = prev[patientId];
      if (!acct) return prev;
      return {
        ...prev,
        [patientId]: {
          ...acct,
          payments: [...acct.payments, payment],
        },
      };
    });
  };

  const updateClaimDocStatus = (claimId: string, docType: string, isSubmitted: boolean, isVerified: boolean) => {
    setInsuranceClaims((prev) => {
      const claimEntry = Object.entries(prev).find(([, c]) => c.id === claimId);
      if (!claimEntry) return prev;
      const [patientKey, claim] = claimEntry;

      const updatedDocs = claim.requiredDocs.map((d) =>
        d.docType === docType
          ? {
              ...d,
              isSubmitted,
              isVerified,
              uploadedAt: isSubmitted ? new Date().toISOString() : d.uploadedAt,
            }
          : d
      );

      const allSubmitted = updatedDocs.every((d) => d.isSubmitted);
      const newStatus = allSubmitted && claim.status === 'documents_pending' ? 'ready_for_submission' : claim.status;

      return {
        ...prev,
        [patientKey]: {
          ...claim,
          requiredDocs: updatedDocs,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  };

  const resolveInsuranceQuery = (claimId: string, queryId: string, resolutionNotes: string) => {
    setInsuranceClaims((prev) => {
      const claimEntry = Object.entries(prev).find(([, c]) => c.id === claimId);
      if (!claimEntry) return prev;
      const [patientKey, claim] = claimEntry;

      const updatedQueries = claim.queries.map((q) =>
        q.id === queryId
          ? {
              ...q,
              isResolved: true,
              resolvedAt: new Date().toISOString(),
              resolutionNotes,
            }
          : q
      );

      // If all queries resolved, transition status to approved/under_review
      const allResolved = updatedQueries.every((q) => q.isResolved);
      const newStatus = allResolved ? 'approved' : claim.status;
      const approvedAmount = allResolved ? claim.requestedAmount - 1200 : claim.approvedAmount;

      return {
        ...prev,
        [patientKey]: {
          ...claim,
          queries: updatedQueries,
          status: newStatus,
          approvedAmount,
          nextAction: allResolved ? 'Ready for final billing settlement' : claim.nextAction,
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    // Also unblock any linked discharge task for this patient!
    setDischargeRecords((prev) => {
      const claimEntry = Object.entries(insuranceClaims).find(([, c]) => c.id === claimId);
      if (!claimEntry) return prev;
      const [patientKey] = claimEntry;
      const record = prev[patientKey];
      if (!record) return prev;

      const updatedTasks = record.tasks.map((t) =>
        t.blockingTaskId === queryId || t.name.toLowerCase().includes('insurance')
          ? { ...t, status: 'completed' as const, completedTime: new Date().toISOString(), notes: resolutionNotes }
          : t
      );

      return {
        ...prev,
        [patientKey]: {
          ...record,
          tasks: updatedTasks,
          estimatedCompletionMinutesMin: Math.max(10, record.estimatedCompletionMinutesMin - 40),
          estimatedCompletionMinutesMax: Math.max(20, record.estimatedCompletionMinutesMax - 50),
          delayExplanation: 'Insurance query resolved. Proceeding to provisional financial settlement.',
        },
      };
    });
  };

  const updateDischargeTaskStatus = (
    patientId: string,
    taskId: string,
    status: 'pending' | 'in_progress' | 'blocked' | 'completed'
  ) => {
    setDischargeRecords((prev) => {
      const record = prev[patientId];
      if (!record) return prev;

      const updatedTasks = record.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              completedTime: status === 'completed' ? new Date().toISOString() : undefined,
            }
          : t
      );

      // Recalculate estimated completion window
      const remainingTasks = updatedTasks.filter((t) => t.status !== 'completed');
      const hasBlocker = remainingTasks.some((t) => t.status === 'blocked');
      const baseDuration = remainingTasks.reduce((acc, t) => acc + t.estimatedDurationMinutes, 0);

      const minMin = Math.max(5, Math.round(baseDuration * 0.8));
      const maxMin = Math.max(10, Math.round(baseDuration * 1.3) + (hasBlocker ? 30 : 0));

      let delayMsg = 'All tasks progressing within nominal parameters.';
      if (hasBlocker) {
        const blocker = remainingTasks.find((t) => t.status === 'blocked');
        delayMsg = blocker?.blockingReason || 'A dependency is currently blocked.';
      } else if (remainingTasks.length === 0) {
        delayMsg = 'All discharge tasks completed. Patient cleared for departure.';
      }

      // Check if all tasks completed
      const allDone = remainingTasks.length === 0;

      return {
        ...prev,
        [patientId]: {
          ...record,
          tasks: updatedTasks,
          currentStage: allDone ? 'final_settlement_completed' : record.currentStage,
          estimatedCompletionMinutesMin: minMin,
          estimatedCompletionMinutesMax: maxMin,
          delayExplanation: delayMsg,
        },
      };
    });
  };

  const authorizeDischarge = (patientId: string, clinicianName: string) => {
    setDischargeRecords((prev) => {
      const record = prev[patientId];
      if (!record) return prev;
      return {
        ...prev,
        [patientId]: {
          ...record,
          authorizedClinician: clinicianName,
          authorizedAt: new Date().toISOString(),
          currentStage: 'authorized_by_clinician',
          tasks: record.tasks.map((t) =>
            t.name.toLowerCase().includes('authorization') ? { ...t, status: 'completed', completedTime: new Date().toISOString() } : t
          ),
        },
      };
    });
  };

  // Crucial: Patient departure triggers bed turnover workflow. Bed does NOT become available immediately!
  const completePatientDeparture = (patientId: string) => {
    const record = dischargeRecords[patientId];
    if (!record) return;

    // 1. Record Departure in Discharge Record
    setDischargeRecords((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        departureTime: new Date().toISOString(),
        currentStage: 'bed_cleaning_turnover',
        delayExplanation: 'Patient departed facility. Bed transferred to Environmental Services for terminal cleaning.',
      },
    }));

    // 2. Patient marked discharged
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, clinicalStatus: 'discharged' } : p))
    );

    // 3. Bed transitions to 'awaiting_cleaning'
    if (record.bedId) {
      setBeds((prev) =>
        prev.map((b) =>
          b.id === record.bedId
            ? {
                ...b,
                status: 'awaiting_cleaning',
                currentPatientId: undefined,
                lastUpdated: new Date().toISOString(),
              }
            : b
        )
      );
    }
  };

  const approveAutopilotPlan = (planId: string) => {
    setAutopilotPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, isApproved: true, approvedBy: 'Administrator Vance, MD' } : p
      )
    );
  };

  const executeAutopilotPlan = (planId: string) => {
    // Execute all proposed actions
    // 1. Expedite Pharmacy for P-102
    updateDischargeTaskStatus('P-102', 'TSK-102-3', 'completed');

    // 2. Resolve UnitedHealthcare Query for P-103
    resolveInsuranceQuery('CLM-103', 'QRY-301', 'Clinical addendum: telemetry indicated for Day 3 post-PCI due to transient ventricular ectopy.');

    // 3. Dispatch EVS cleaning to Bed MED-107
    startBedCleaning('MED-107', 'EVS Floater Maria Santos');

    // 4. Mark Autopilot Plan executed
    setAutopilotPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, isApproved: true, isExecuted: true } : p))
    );

    // 5. Update Alerts
    setOperationalAlerts((prev) =>
      prev.map((a) =>
        a.id === 'ALT-101' || a.id === 'ALT-104'
          ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
          : a
      )
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setOperationalAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, status: 'acknowledged', acknowledgedBy: 'Staff ' + role.toUpperCase() } : a
      )
    );
  };

  const resolveAlert = (alertId: string) => {
    setOperationalAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a))
    );
  };

  const resetDemoData = () => {
    setDepartments(initialDepartments);
    setBeds(initialBeds);
    setPatients(initialPatients);
    setQueueItems(initialQueueItems);
    setStaffMembers(initialStaffMembers);
    setDiagnosticEquipment(initialDiagnosticEquipment);
    setDiagnosticOrders(initialDiagnosticOrders);
    setAccounts(initialAccounts);
    setInsuranceClaims(initialInsuranceClaims);
    setDischargeRecords(initialDischargeRecords);
    setOperationalAlerts(initialOperationalAlerts);
    setBottlenecks(initialBottlenecks);
    setAutopilotPlans(initialAutopilotPlans);
    setSelectedPatientId(null);
  };

  return (
    <HospitalContext.Provider
      value={{
        departments,
        beds,
        patients,
        queueItems,
        staffMembers,
        diagnosticEquipment,
        diagnosticOrders,
        accounts,
        insuranceClaims,
        dischargeRecords,
        operationalAlerts,
        bottlenecks,
        autopilotPlans,
        historicalArrivals,
        role,
        setRole,
        selectedPatientId,
        setSelectedPatientId,
        isAskDrawerOpen,
        setIsAskDrawerOpen,
        allocateBed,
        updateBedStatus,
        startBedCleaning,
        completeBedCleaning,
        addBillingCharge,
        verifyBillingCharge,
        reverseBillingCharge,
        recordPayment,
        updateClaimDocStatus,
        resolveInsuranceQuery,
        updateDischargeTaskStatus,
        authorizeDischarge,
        completePatientDeparture,
        approveAutopilotPlan,
        executeAutopilotPlan,
        acknowledgeAlert,
        resolveAlert,
        resetDemoData,
        totalBeds,
        occupiedBeds,
        availableBeds,
        cleaningBeds,
        reservedBeds,
        occupancyRate,
        patientsWaitingAdmission,
        avgWaitTimeMinutes,
        patientsAwaitingDischarge,
        blockedDischargesCount,
        activeAlertsCount,
        edBoardingCount,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
