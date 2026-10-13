import React, { useState } from 'react';
import {
  Building2,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const ResourceUtilizationView: React.FC = () => {
  const { departments, staffMembers, diagnosticEquipment, beds, role } = useHospital();
  const [rebalanceApproved, setRebalanceApproved] = useState(false);

  // Group staff by department
  const staffByDept = departments.map((d) => {
    const activeStaff = staffMembers.filter((s) => s.departmentId === d.id);
    return {
      department: d.name,
      id: d.id,
      head: d.head,
      staffCount: d.activeStaff,
      shiftList: activeStaff,
    };
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Workforce & Asset Optimization
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Resource Utilization & Cross-Department Capacity Balancing
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Identifies imbalances between patient demand and active staff/equipment capacity.
            Recommends qualified cross-coverage reallocations with human supervisory sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Human Governance:</span>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Supervisor Approval Required
          </span>
        </div>
      </div>

      {/* Resource Balancing Recommendation Card */}
      <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                Recommendation Pending Review
              </span>
              <span className="text-xs text-slate-600 font-semibold">
                Central Inpatient Pharmacy & Float Nursing
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              Reassign Outpatient Float Pharmacist to Floor Discharge Reconciliation
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Central Dispensary discharge reconciliation duration currently averages 68 mins (target: 25 mins), delaying 3 inpatient bed releases.
              Outpatient Pharmacy volume is currently 35% below peak. Reallocating Pharmacist Aaliyah Washington creates immediate discharge throughput for General Medicine.
            </p>
          </div>

          <div className="shrink-0">
            {!rebalanceApproved ? (
              <button
                onClick={() => setRebalanceApproved(true)}
                className="px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap"
              >
                Approve Reallocation
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Reallocation Approved & Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Staff Coverage and Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Department Staffing Coverage */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Staff Coverage & Roster Availability
              </h3>
            </div>
            <span className="text-xs text-slate-500">{staffMembers.length} Active On Shift</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {staffMembers.map((staff) => (
              <div key={staff.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{staff.name}</div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {staff.role.replace(/_/g, ' ')} · {staff.departmentId} · Ext: {staff.contactExt}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-medium">{staff.shift} Shift</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      staff.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    title={staff.isAvailable ? 'Available for tasks' : 'Assigned / Busy'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Diagnostic Equipment Utilization */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Diagnostic Equipment Capacity & Uptime
              </h3>
            </div>
            <span className="text-xs text-slate-500">6 Monitored Devices</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {diagnosticEquipment.map((eq) => {
              const utilPercent = Math.min(100, Math.round((eq.currentCompletedToday / eq.dailyCapacity) * 100));

              return (
                <div key={eq.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{eq.name}</span>
                      <span className="ml-2 font-mono text-[11px] text-slate-500">({eq.id})</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                        eq.status === 'busy' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Queue: {eq.queueLength} studies · Turnaround: {eq.avgTurnaroundMinutes}m</span>
                    <span className="font-mono font-medium text-slate-800">{utilPercent}% Daily Capacity</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        utilPercent > 80 ? 'bg-amber-600' : 'bg-sky-700'
                      }`}
                      style={{ width: `${utilPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
