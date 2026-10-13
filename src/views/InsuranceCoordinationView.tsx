import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { InsuranceClaim } from '../types/hospital';

export const InsuranceCoordinationView: React.FC = () => {
  const {
    insuranceClaims,
    updateClaimDocStatus,
    resolveInsuranceQuery,
    setSelectedPatientId,
  } = useHospital();

  const [selectedClaimId, setSelectedClaimId] = useState<string>('CLM-103');
  const [queryResolutionText, setQueryResolutionText] = useState(
    'Clinical telemetry monitoring justified on Day 3 post-PCI due to transient ventricular ectopy documented on 12-lead strip.'
  );

  const claimsList = Object.values(insuranceClaims);
  const activeClaim = claimsList.find((c) => c.id === selectedClaimId) || claimsList[0];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Payor & Pre-Authorization Gateway
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Insurance Claim Readiness & Query Resolution
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Prepare pre-authorization packets earlier, track missing clinical documentation, and answer insurer queries
            before patient discharge to eliminate settlement delays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Active Claim:</span>
          <select
            value={activeClaim?.id}
            onChange={(e) => setSelectedClaimId(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-white text-slate-900 font-semibold cursor-pointer"
          >
            {claimsList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.patientName} — {c.insurerName} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims Overview Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Inpatient Insurance Claim Pipeline</h3>
          <div className="text-xs text-slate-500">
            Real-time status synced with hospital case management
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Claim ID</th>
                <th className="py-2.5 px-4">Patient Name</th>
                <th className="py-2.5 px-4">Insurer & Policy</th>
                <th className="py-2.5 px-4 text-right">Requested</th>
                <th className="py-2.5 px-4 text-right">Approved</th>
                <th className="py-2.5 px-4">Claim Status</th>
                <th className="py-2.5 px-4">Next Required Action</th>
                <th className="py-2.5 px-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claimsList.map((c) => {
                const isSelected = c.id === activeClaim?.id;
                const isQuery = c.status === 'query_raised';
                const isPendingDocs = c.status === 'documents_pending';
                const isApproved = c.status === 'approved';

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedClaimId(c.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{c.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.patientName}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{c.insurerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.policyNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                      ${c.requestedAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-700">
                      ${c.approvedAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                          isQuery
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isPendingDocs
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{c.nextAction}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClaimId(c.id);
                        }}
                        className="text-sky-700 font-semibold hover:underline"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Claim Detail Inspector */}
      {activeClaim && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Required Documents Checklist */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Required Documentation Packet ({activeClaim.patientName})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Pre-Auth: {activeClaim.preAuthNumber}</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {activeClaim.requiredDocs.map((doc, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{doc.displayName}</div>
                    <div className="text-[11px] text-slate-400">
                      {doc.isSubmitted
                        ? `Uploaded: ${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleTimeString() : 'Verified'}`
                        : 'Missing from packet'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.isSubmitted ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submitted</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => updateClaimDocStatus(activeClaim.id, doc.docType, true, true)}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-md text-[11px] font-semibold cursor-pointer shadow-2xs"
                      >
                        Upload & Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Insurer Queries & Medical Review Resolution */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Insurer Medical Queries & Clarifications
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {activeClaim.queries.filter((q) => !q.isResolved).length} Unresolved
              </span>
            </div>

            {activeClaim.queries.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-md text-center text-slate-500 text-xs">
                No active queries raised by payor for this claim. All clinical criteria verified.
              </div>
            ) : (
              activeClaim.queries.map((q) => (
                <div key={q.id} className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 font-mono">{q.id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                      q.isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {q.isResolved ? 'Resolved' : 'Pending Physician Response'}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed bg-white/70 p-2.5 rounded-md border border-amber-100">
                    "{q.queryText}"
                  </p>

                  {!q.isResolved ? (
                    <div className="space-y-2 pt-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Physician Clinical Addendum / Justification:
                      </label>
                      <textarea
                        value={queryResolutionText}
                        onChange={(e) => setQueryResolutionText(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-xs text-slate-800 focus:ring-1 focus:ring-sky-700 focus:outline-none"
                        rows={3}
                      />
                      <button
                        onClick={() => resolveInsuranceQuery(activeClaim.id, q.id, queryResolutionText)}
                        className="px-3.5 py-1.5 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Clinical Addendum & Resolve Query</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-md border border-emerald-200">
                      <strong>Resolution Note:</strong> {q.resolutionNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
