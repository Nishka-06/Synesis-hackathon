import React from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Clock,
  Layers,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { NavTabId } from '../components/Sidebar';

interface BottleneckAnalysisViewProps {
  setActiveTab: (tab: NavTabId) => void;
}

export const BottleneckAnalysisView: React.FC<BottleneckAnalysisViewProps> = ({ setActiveTab }) => {
  const { bottlenecks, role } = useHospital();

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Flow Diagnostic Engine
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Operational Bottleneck Detection & Root Cause Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Continuously monitors queue velocity, service durations, resource contention, and administrative handoffs.
            Detects emerging bottlenecks before they result in ambulance diversions or hallway boarding.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('autopilot')}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Autopilot Intervention</span>
        </button>
      </div>

      {/* Bottlenecks Cards */}
      <div className="space-y-4">
        {bottlenecks.map((bn) => {
          const isCritical = bn.severity === 'critical';
          const isWarning = bn.severity === 'warning';

          return (
            <div
              key={bn.id}
              className={`bg-white border rounded-lg p-5 shadow-2xs transition-all ${
                isCritical ? 'border-rose-200' : isWarning ? 'border-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Title & Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tight ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isWarning
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {bn.severity}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{bn.location}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      Detected {new Date(bn.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{bn.title}</h3>

                  {/* Trigger Measurements */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs">
                    <span className="font-semibold text-slate-700">Triggering Measurements: </span>
                    <span className="text-slate-900 font-mono">{bn.measurements}</span>
                  </div>

                  {/* Cause & Downstream impact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <div className="font-semibold text-slate-700 mb-0.5">Probable Operational Cause:</div>
                      <p className="text-slate-600 leading-relaxed">{bn.probableCause}</p>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-700 mb-0.5">Affected Downstream Workflows:</div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {bn.downstreamWorkflows.map((flow, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm font-medium"
                          >
                            {flow}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Box */}
                <div className="md:w-72 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between shrink-0 text-xs">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Recommended Action
                    </div>
                    <p className="text-slate-900 font-medium mt-1 leading-relaxed">
                      {bn.recommendedNextAction}
                    </p>
                    <div className="text-[11px] text-slate-500 mt-2">
                      Responsible: <strong>{bn.responsibleTeam}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        if (bn.departmentId === 'MED' && bn.title.includes('Pharmacy')) {
                          setActiveTab('discharge');
                        } else if (bn.departmentId === 'ED') {
                          setActiveTab('autopilot');
                        } else if (bn.departmentId === 'RAD') {
                          setActiveTab('diagnostics');
                        } else {
                          setActiveTab('bed-management');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
