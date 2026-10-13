import React, { useState } from 'react';
import {
  Users,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  BedDouble,
  Search,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { NavTabId } from '../components/Sidebar';

interface PatientFlowViewProps {
  setActiveTab: (tab: NavTabId) => void;
}

export const PatientFlowView: React.FC<PatientFlowViewProps> = ({ setActiveTab }) => {
  const { queueItems, departments, beds, setSelectedPatientId } = useHospital();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const edBoardingItems = queueItems.filter((q) => q.departmentId === 'ED' && q.status === 'admission_pending');

  const filteredQueue = queueItems.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
          Patient Intake & Queue Monitoring
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Patient Flow & Emergency Boarding Prevention
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Monitor real-time patient progression from Emergency intake through clinical assessment, inpatient bed allocation,
          and transfer. Predict and eliminate emergency boarding risks caused by downstream bed turnaround delays.
        </p>
      </div>

      {/* Emergency Boarding Prevention Callout Card */}
      <div className="bg-white border border-rose-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rose-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Emergency Boarding Risk: High Alert</h3>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200 uppercase">
                  4 Patients Boarding
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Patients who have completed emergency care and were authorized for inpatient admission are boarding in ED hallway bays due to 0 ready beds in target units.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('bed-management')}
              className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              Allocate Compatible Beds
            </button>
            <button
              onClick={() => setActiveTab('autopilot')}
              className="px-3.5 py-2 bg-white text-slate-700 border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Expedite Discharge Plan →
            </button>
          </div>
        </div>

        {/* Boarding Queue Strip */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {edBoardingItems.map((b) => (
            <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{b.patientName}</span>
                <span className="text-[10px] font-mono tabular-nums text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded-sm border border-rose-200">
                  {b.waitingMinutes}m wait
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Target: <strong>{b.targetWard}</strong>
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 italic">
                "{b.chiefComplaint}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md overflow-x-auto">
          {[
            { id: 'all', label: 'All Patients' },
            { id: 'admission_pending', label: 'Admission Pending' },
            { id: 'in_assessment', label: 'In Assessment' },
            { id: 'waiting', label: 'Waiting Triage' },
            { id: 'allocated', label: 'Bed Allocated' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient or symptom..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-700 bg-white"
          />
        </div>
      </div>

      {/* Central Queue Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Live Intake Queue ({filteredQueue.length} Active Records)
            </h3>
          </div>
          <div className="text-xs text-slate-500">
            Sorted by clinical triage priority and wait duration
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Patient Name & Age</th>
                <th className="py-2.5 px-4">Triage Priority</th>
                <th className="py-2.5 px-4">Chief Complaint / Condition</th>
                <th className="py-2.5 px-4">Target Ward</th>
                <th className="py-2.5 px-4">Wait Time</th>
                <th className="py-2.5 px-4">Workflow Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedPatientId(item.patientId)}
                      className="font-bold text-slate-900 hover:text-sky-800 hover:underline text-left cursor-pointer"
                    >
                      {item.patientName}
                    </button>
                    <div className="text-[11px] text-slate-500">
                      {item.age}y {item.gender} · ID: {item.patientId}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tight ${
                        item.triageCategory === 'P1_resuscitation'
                          ? 'bg-rose-100 text-rose-800'
                          : item.triageCategory === 'P2_emergency'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.triageCategory === 'P3_urgent'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.triageCategory.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-medium text-slate-800 truncate">{item.chiefComplaint}</div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {item.targetWard}
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums">
                    <span className={item.waitingMinutes > 60 ? 'text-rose-700 font-bold' : 'text-slate-700'}>
                      {item.waitingMinutes} min
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-[11px] font-medium capitalize ${
                      item.status === 'admission_pending' ? 'text-rose-700' :
                      item.status === 'allocated' ? 'text-emerald-700' : 'text-slate-600'
                    }`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {item.status === 'admission_pending' ? (
                      <button
                        onClick={() => setActiveTab('bed-management')}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                      >
                        Allocate Bed
                      </button>
                    ) : item.assignedBedId ? (
                      <span className="text-[11px] text-emerald-700 font-medium font-mono">
                        Assigned: {item.assignedBedId}
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedPatientId(item.patientId)}
                        className="text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Details →
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
