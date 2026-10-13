import React, { useState } from 'react';
import {
  BedDouble,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Brush,
  X,
  Check,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Bed, BedStatus, BedType, EquipmentTag } from '../types/hospital';
import { recommendBedsForPatient, BedAllocationRecommendation } from '../services/bedAllocation';

export const BedManagementView: React.FC = () => {
  const {
    beds,
    departments,
    queueItems,
    allocateBed,
    updateBedStatus,
    startBedCleaning,
    completeBedCleaning,
    setSelectedPatientId,
    role,
  } = useHospital();

  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Allocation Modal State
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedQueueItemId, setSelectedQueueItemId] = useState<string>('');
  const [requiredEquipment, setRequiredEquipment] = useState<EquipmentTag[]>([]);
  const [requiresIsolation, setRequiresIsolation] = useState(false);
  const [recommendations, setRecommendations] = useState<BedAllocationRecommendation[]>([]);

  // Filtered beds
  const filteredBeds = beds.filter((b) => {
    const matchesDept = deptFilter === 'all' || b.departmentId === deptFilter;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesType = typeFilter === 'all' || b.type === typeFilter;
    return matchesDept && matchesStatus && matchesType;
  });

  // Open Allocation Engine
  const openAllocationEngine = (defaultQueueId?: string) => {
    const targetQueueId = defaultQueueId || queueItems.find((q) => q.status === 'admission_pending')?.id || queueItems[0]?.id || '';
    setSelectedQueueItemId(targetQueueId);

    const queueItem = queueItems.find((q) => q.id === targetQueueId);
    if (queueItem) {
      // Auto-detect needed equipment from complaint
      let eq: EquipmentTag[] = [];
      if (queueItem.chiefComplaint.toLowerCase().includes('telemetry') || queueItem.chiefComplaint.toLowerCase().includes('troponin') || queueItem.chiefComplaint.toLowerCase().includes('chest')) {
        eq = ['telemetry'];
      } else if (queueItem.chiefComplaint.toLowerCase().includes('hypox') || queueItem.chiefComplaint.toLowerCase().includes('copd')) {
        eq = ['oxygen_high_flow'];
      }
      setRequiredEquipment(eq);
      setRequiresIsolation(queueItem.chiefComplaint.toLowerCase().includes('isolation'));

      const recs = recommendBedsForPatient(queueItem, beds, eq, false);
      setRecommendations(recs);
    }

    setIsAllocationModalOpen(true);
  };

  const handleQueueChange = (queueId: string) => {
    setSelectedQueueItemId(queueId);
    const queueItem = queueItems.find((q) => q.id === queueId);
    if (queueItem) {
      let eq: EquipmentTag[] = [];
      if (queueItem.chiefComplaint.toLowerCase().includes('telemetry') || queueItem.chiefComplaint.toLowerCase().includes('troponin') || queueItem.chiefComplaint.toLowerCase().includes('chest')) {
        eq = ['telemetry'];
      }
      setRequiredEquipment(eq);
      const recs = recommendBedsForPatient(queueItem, beds, eq, requiresIsolation);
      setRecommendations(recs);
    }
  };

  const handleEquipmentToggle = (tag: EquipmentTag) => {
    const updated = requiredEquipment.includes(tag)
      ? requiredEquipment.filter((t) => t !== tag)
      : [...requiredEquipment, tag];
    setRequiredEquipment(updated);
    const queueItem = queueItems.find((q) => q.id === selectedQueueItemId);
    if (queueItem) {
      setRecommendations(recommendBedsForPatient(queueItem, beds, updated, requiresIsolation));
    }
  };

  const handleIsolationToggle = (val: boolean) => {
    setRequiresIsolation(val);
    const queueItem = queueItems.find((q) => q.id === selectedQueueItemId);
    if (queueItem) {
      setRecommendations(recommendBedsForPatient(queueItem, beds, requiredEquipment, val));
    }
  };

  const handleConfirmAllocation = (bedId: string) => {
    const success = allocateBed(selectedQueueItemId, bedId);
    if (success) {
      setIsAllocationModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Inpatient Capacity & Wards
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Smart Bed Management & Allocation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Real-time ward telemetry, clinical equipment compatibility verification, and closed-loop bed turnover orchestration.
          </p>
        </div>

        <button
          onClick={() => openAllocationEngine()}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Recommend & Allocate Bed</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="border border-slate-200 rounded-md px-2.5 py-1 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="all">All Departments</option>
              {departments.filter((d) => d.totalBeds > 0).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-md px-2.5 py-1 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="discharge_pending">Discharge Pending</option>
              <option value="awaiting_cleaning">Awaiting Cleaning</option>
              <option value="cleaning_in_progress">Cleaning In Progress</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Bed Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-md px-2.5 py-1 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="all">All Bed Types</option>
              <option value="general">General</option>
              <option value="icu">ICU</option>
              <option value="stepdown">Stepdown</option>
              <option value="isolation_negative_pressure">Negative Pressure Isolation</option>
              <option value="post_op">Post-Op</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-700 inline-block" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>Discharge Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" />
            <span>Cleaning Turnover</span>
          </div>
        </div>
      </div>

      {/* Ward & Bed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredBeds.map((bed) => {
          const isAvailable = bed.status === 'available';
          const isOccupied = bed.status === 'occupied';
          const isDischargePending = bed.status === 'discharge_pending';
          const isAwaitingCleaning = bed.status === 'awaiting_cleaning';
          const isCleaningInProgress = bed.status === 'cleaning_in_progress';
          const isReserved = bed.status === 'reserved';

          return (
            <div
              key={bed.id}
              className={`bg-white border rounded-lg p-3.5 flex flex-col justify-between transition-all ${
                isAvailable
                  ? 'border-emerald-200 hover:border-emerald-300 shadow-2xs'
                  : isDischargePending
                  ? 'border-amber-200 hover:border-amber-300'
                  : isAwaitingCleaning || isCleaningInProgress
                  ? 'border-sky-200 hover:border-sky-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Bed ID & Status Indicator */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-xs font-mono">{bed.id}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAvailable
                        ? 'bg-emerald-600'
                        : isOccupied
                        ? 'bg-slate-700'
                        : isDischargePending
                        ? 'bg-amber-500'
                        : isCleaningInProgress
                        ? 'bg-sky-500'
                        : isAwaitingCleaning
                        ? 'bg-orange-400'
                        : 'bg-slate-300'
                    }`}
                  />
                </div>

                <div className="text-[11px] text-slate-500">
                  {bed.ward} · Room {bed.roomNumber} ({bed.bedLabel})
                </div>

                {/* Bed Type & Isolation Badge */}
                <div className="mt-2 text-[10px] text-slate-600 font-medium">
                  <span className="capitalize">{bed.type.replace(/_/g, ' ')}</span>
                  {bed.isolation && (
                    <span className="ml-1 text-purple-700 font-semibold bg-purple-50 px-1 py-0.2 rounded-xs border border-purple-200">
                      ISO
                    </span>
                  )}
                </div>

                {/* Equipment */}
                <div className="mt-1 text-[10px] text-slate-500">
                  {bed.equipment.length > 0 && bed.equipment[0] !== 'none' ? (
                    <span className="text-sky-800 font-medium">{bed.equipment.join(', ')}</span>
                  ) : (
                    <span>Standard Monitoring</span>
                  )}
                </div>

                {/* Occupant or State Detail */}
                <div className="mt-2 pt-2 border-t border-slate-100 text-[11px]">
                  {bed.currentPatientId ? (
                    <button
                      onClick={() => setSelectedPatientId(bed.currentPatientId!)}
                      className="text-slate-900 font-semibold hover:text-sky-800 hover:underline cursor-pointer truncate block w-full text-left"
                    >
                      Patient: {bed.currentPatientId}
                    </button>
                  ) : isAwaitingCleaning ? (
                    <span className="text-orange-700 font-medium">Awaiting EVS Turnover</span>
                  ) : isCleaningInProgress ? (
                    <span className="text-sky-700 font-medium">
                      EVS: {bed.assignedCleaner || 'Active Clean'}
                    </span>
                  ) : isAvailable ? (
                    <span className="text-emerald-700 font-medium">Ready For Allocation</span>
                  ) : (
                    <span className="text-slate-500 capitalize">{bed.status.replace(/_/g, ' ')}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                {isAwaitingCleaning && (
                  <button
                    onClick={() => startBedCleaning(bed.id, 'EVS Specialist ' + (role === 'admin' ? 'Admin Dispatched' : 'Staff'))}
                    className="w-full text-center text-[10px] font-semibold bg-sky-700 hover:bg-sky-800 text-white py-1 rounded-sm cursor-pointer shadow-2xs"
                  >
                    Dispatch EVS
                  </button>
                )}

                {isCleaningInProgress && (
                  <button
                    onClick={() => completeBedCleaning(bed.id)}
                    className="w-full text-center text-[10px] font-semibold bg-emerald-700 hover:bg-emerald-800 text-white py-1 rounded-sm cursor-pointer shadow-2xs"
                  >
                    Verify Ready
                  </button>
                )}

                {isAvailable && (
                  <button
                    onClick={() => openAllocationEngine()}
                    className="w-full text-center text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 text-white py-1 rounded-sm cursor-pointer"
                  >
                    Assign
                  </button>
                )}

                {isOccupied && (
                  <span className="text-[10px] text-slate-400 italic w-full text-center">
                    In Service
                  </span>
                )}

                {isDischargePending && (
                  <span className="text-[10px] text-amber-700 font-semibold w-full text-center">
                    Discharge Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Allocation Recommendation Modal */}
      {isAllocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Smart Bed Allocation Recommendation Engine
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Matches patients against available beds, clinical equipment, isolation rules & ward compatibility
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAllocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Patient Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Waiting Patient to Place:
                </label>
                <select
                  value={selectedQueueItemId}
                  onChange={(e) => handleQueueChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-md p-2 bg-white text-slate-800 font-medium"
                >
                  {queueItems.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.patientName} ({q.age}y {q.gender}) — {q.chiefComplaint} [{q.departmentId} · {q.waitingMinutes}m wait]
                    </option>
                  ))}
                </select>
              </div>

              {/* Required Equipment Checklist */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Clinical Equipment & Isolation Requirements:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: 'telemetry' as EquipmentTag, label: 'Telemetry Monitoring' },
                    { tag: 'oxygen_high_flow' as EquipmentTag, label: 'High-Flow Oxygen' },
                    { tag: 'ventilator' as EquipmentTag, label: 'Mechanical Ventilator' },
                    { tag: 'bipap' as EquipmentTag, label: 'BiPAP / NIV' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      onClick={() => handleEquipmentToggle(item.tag)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                        requiredEquipment.includes(item.tag)
                          ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {requiredEquipment.includes(item.tag) ? '✓ ' : '+ '}
                      {item.label}
                    </button>
                  ))}

                  <button
                    onClick={() => handleIsolationToggle(!requiresIsolation)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                      requiresIsolation
                        ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {requiresIsolation ? '✓ ' : '+ '}
                    Negative Pressure Isolation
                  </button>
                </div>
              </div>

              {/* Recommendation Results */}
              <div className="space-y-3 pt-2">
                <div className="font-semibold text-slate-900 text-xs flex items-center justify-between">
                  <span>Ranked Bed Options ({recommendations.length} Candidate Beds):</span>
                  <span className="text-slate-400 font-normal">Ranked by compatibility score</span>
                </div>

                {recommendations.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-center text-slate-500">
                    No available beds currently match these exact requirements. Expediting pending discharges or bed turnover is required.
                  </div>
                ) : (
                  recommendations.map((rec) => (
                    <div
                      key={rec.bed.id}
                      className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono text-sm">{rec.bed.id}</span>
                          <span className="text-xs text-slate-600 font-medium">
                            {rec.bed.ward} · Room {rec.bed.roomNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                              rec.matchConfidence === 'Exact Match'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {rec.score}% Match ({rec.matchConfidence})
                          </span>
                        </div>

                        <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5">
                          {rec.rationale.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleConfirmAllocation(rec.bed.id)}
                        className="px-3.5 py-1.5 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                      >
                        Confirm Allocation
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsAllocationModalOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
