import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  Check,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const AlertsTasksView: React.FC = () => {
  const { operationalAlerts, acknowledgeAlert, resolveAlert, role } = useHospital();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAlerts = operationalAlerts.filter((a) => {
    const matchesSev = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSev && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Operations Dispatch & Incident Response
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Unified Alerts & Operational Incident Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Consolidated operational alerts generated across bed management, diagnostic imaging, and discharge workflows.
            Includes triggering measurements, responsible clinical teams, and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Active Operational Queue:</span>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            {operationalAlerts.filter((a) => a.status === 'active').length} Unresolved
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border border-slate-200 rounded-md px-2.5 py-1 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-md px-2.5 py-1 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Audited under role: <strong className="text-slate-700 uppercase">{role}</strong>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          const isActive = alert.status === 'active';
          const isAcknowledged = alert.status === 'acknowledged';
          const isResolved = alert.status === 'resolved';

          return (
            <div
              key={alert.id}
              className={`bg-white border rounded-lg p-5 transition-all ${
                isResolved
                  ? 'border-slate-200 opacity-75'
                  : isCritical
                  ? 'border-rose-200 shadow-2xs'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isWarning
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-mono text-slate-400">{alert.id}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-700">{alert.departmentId}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold text-slate-900 ${isResolved ? 'line-through text-slate-500' : ''}`}>
                    {alert.title}
                  </h3>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-[11px] text-slate-800">
                    <span className="text-slate-500 font-sans font-semibold">Trigger: </span>
                    {alert.measurements}
                  </div>

                  <div className="text-slate-600 leading-relaxed pt-1">
                    <strong>Cause: </strong>{alert.probableCause}
                  </div>

                  <div className="text-slate-600">
                    <strong>Downstream Impact: </strong>{alert.downstreamImpact}
                  </div>

                  <div className="text-slate-800 font-medium">
                    <strong>Recommended Action: </strong>{alert.recommendedAction}
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-4">
                    <span>Responsible Team: <strong>{alert.responsibleTeam}</strong></span>
                    {alert.acknowledgedBy && (
                      <span>Acknowledged By: <strong>{alert.acknowledgedBy}</strong></span>
                    )}
                    {alert.resolvedAt && (
                      <span className="text-emerald-700 font-medium">
                        Resolved: {new Date(alert.resolvedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status & Action Buttons */}
                <div className="flex md:flex-col items-end justify-between md:justify-start gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isAcknowledged
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {alert.status}
                  </span>

                  {!isResolved && (
                    <div className="flex md:flex-col gap-1.5 pt-2">
                      {isActive && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-md text-slate-700 text-xs font-medium cursor-pointer whitespace-nowrap"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Resolve Alert
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
