import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { NavTabId } from '../components/Sidebar';

interface AutopilotViewProps {
  setActiveTab: (tab: NavTabId) => void;
}

export const AutopilotView: React.FC<AutopilotViewProps> = ({ setActiveTab }) => {
  const {
    autopilotPlans,
    approveAutopilotPlan,
    executeAutopilotPlan,
    role,
    edBoardingCount,
    occupancyRate,
  } = useHospital();

  const [notification, setNotification] = useState<string | null>(null);

  const plan = autopilotPlans[0];

  const handleApprove = (id: string) => {
    approveAutopilotPlan(id);
    setNotification('Autopilot Plan approved by Hospital Administrator. Ready for execution.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExecute = (id: string) => {
    executeAutopilotPlan(id);
    setNotification('Autopilot Plan successfully executed! Pharmacy expedited, insurer query answered, EVS dispatched, and ED boarding queue relieved.');
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Systemwide Optimization Engine
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hospital Flow Autopilot — Coordinated Operational Action Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Synthesizes arrival forecasts, emergency queues, diagnostic queues, and discharge blockers to generate
            evidence-grounded operational action plans for administrative review and approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Autonomous Safety Rule:</span>
          <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            Human Approval Mandatory
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Active Autopilot Plan Showcase */}
      {plan && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-xs">
          {/* Plan Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                  {plan.priority} Priority
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">{plan.id}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="text-xs text-slate-500">
                  Formulated at {new Date(plan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {plan.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                {plan.problemSummary}
              </p>
            </div>

            {/* Approval & Execution Buttons */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {plan.isExecuted ? (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-md text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Plan Successfully Executed & Active</span>
                </div>
              ) : plan.isApproved ? (
                <button
                  onClick={() => handleExecute(plan.id)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Coordinated Plan Now</span>
                </button>
              ) : (
                <button
                  onClick={() => handleApprove(plan.id)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve Action Plan as Administrator</span>
                </button>
              )}

              <div className="text-[11px] text-slate-400">
                {plan.approvedBy ? `Approved by: ${plan.approvedBy}` : 'Pending executive authorization'}
              </div>
            </div>
          </div>

          {/* Evidence Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Grounded Evidence From Application State ({plan.evidence.length} Data Points)</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 pl-5 list-disc leading-relaxed">
              {plan.evidence.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
          </div>

          {/* Recommended Operational Action Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Coordinated Action Plan Steps ({plan.recommendedActions.length} Interventions)
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
              {plan.recommendedActions.map((action, i) => (
                <div key={action.id} className="p-3.5 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">{action.label}</div>
                      <div className="text-[11px] text-slate-500">
                        Responsible Team: <strong>{action.department}</strong> · Target: {action.targetId || 'Facility'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase shrink-0 ${
                      plan.isExecuted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {plan.isExecuted ? 'Executed' : 'Ready on Approval'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Impact Callout */}
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-lg text-xs space-y-1">
            <div className="font-bold text-sky-900 uppercase tracking-wider text-[11px]">
              Projected Operational Impact & Outcome
            </div>
            <p className="text-sky-950 font-medium leading-relaxed">
              {plan.expectedImpact}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
