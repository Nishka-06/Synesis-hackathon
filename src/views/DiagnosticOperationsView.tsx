import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { DiagnosticOrder, DiagnosticEquipment } from '../types/hospital';

export const DiagnosticOperationsView: React.FC = () => {
  const { diagnosticEquipment, diagnosticOrders, departments } = useHospital();
  const [equipmentList, setEquipmentList] = useState<DiagnosticEquipment[]>(diagnosticEquipment);
  const [ordersList, setOrdersList] = useState<DiagnosticOrder[]>(diagnosticOrders);
  const [notification, setNotification] = useState<string | null>(null);

  // Rebalance workload action
  const handleRebalanceCT = () => {
    setEquipmentList((prev) =>
      prev.map((eq) => {
        if (eq.id === 'RAD-CT-01') {
          return { ...eq, queueLength: 3, avgTurnaroundMinutes: 30 };
        }
        if (eq.id === 'RAD-CT-02') {
          return { ...eq, queueLength: 5, avgTurnaroundMinutes: 32 };
        }
        return eq;
      })
    );

    setNotification('Workload rebalanced! Shifted 3 routine head/chest CT studies from CT-01 to CT-02. Urgent trauma backlog cleared.');
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Clinical Diagnostics & Throughput
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Diagnostic Bottleneck Balancer (Radiology & Laboratory)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Monitors high-demand modalities (CT scanners, 3T MRI, automated chemistry analyzers).
            Prevents acute emergency clinical bottlenecks through automated workload rebalancing.
          </p>
        </div>

        <button
          onClick={handleRebalanceCT}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rebalance CT-01 / CT-02 Workload</span>
        </button>
      </div>

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

      {/* Equipment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipmentList.map((eq) => {
          const isBusy = eq.status === 'busy';
          const isHighQueue = eq.queueLength >= 5;

          return (
            <div
              key={eq.id}
              className={`bg-white border rounded-lg p-4 space-y-3 transition-all ${
                isHighQueue ? 'border-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900">{eq.id}</span>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">{eq.name}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                    eq.status === 'busy'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {eq.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div>
                  <div className="text-slate-500 text-[11px]">Current Queue</div>
                  <div className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                    {eq.queueLength} orders
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Avg Turnaround</div>
                  <div className={`font-bold font-mono tabular-nums text-sm ${eq.avgTurnaroundMinutes > 35 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {eq.avgTurnaroundMinutes} mins
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span>Completed Today: {eq.currentCompletedToday}/{eq.dailyCapacity}</span>
                <span className="font-medium text-slate-700">
                  {Math.round((eq.currentCompletedToday / eq.dailyCapacity) * 100)}% Capacity
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Diagnostic Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">
            Active Urgent Diagnostic Study Queue ({ordersList.length} Studies)
          </h3>
          <span className="text-xs text-slate-500">Prioritizes emergency resuscitation and trauma imaging</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Order ID</th>
                <th className="py-2.5 px-4">Patient Name</th>
                <th className="py-2.5 px-4">Requested Study</th>
                <th className="py-2.5 px-4">Assigned Scanner</th>
                <th className="py-2.5 px-4">Urgency</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordersList.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{ord.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{ord.patientName}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{ord.testName}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{ord.equipmentId}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                        ord.isUrgent ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ord.isUrgent ? 'STAT / Trauma' : 'Routine'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                        ord.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'in_progress'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {ord.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setOrdersList((prev) =>
                            prev.map((o) => (o.id === ord.id ? { ...o, status: 'completed', completedAt: new Date().toISOString() } : o))
                          );
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-md cursor-pointer shadow-2xs"
                      >
                        Complete Scan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
