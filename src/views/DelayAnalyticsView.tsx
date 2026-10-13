import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  DollarSign,
  TrendingDown,
  Layers,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const DelayAnalyticsView: React.FC = () => {
  const [costPerHour, setCostPerHour] = useState(125); // Configurable hospital bed-hour opportunity cost

  // Bottleneck Delay Metrics Breakdown
  const delayData = [
    { category: 'Central Pharmacy Med-Rec', observedMin: 68, targetMin: 25, delayMin: 43, bedHoursLost: 18.5 },
    { category: 'Insurance Query Response', observedMin: 85, targetMin: 30, delayMin: 55, bedHoursLost: 24.0 },
    { category: 'Environmental Bed Turnover', observedMin: 52, targetMin: 30, delayMin: 22, bedHoursLost: 14.2 },
    { category: 'Billing Item Audit', observedMin: 38, targetMin: 20, delayMin: 18, bedHoursLost: 9.6 },
    { category: 'CT Scanner Decision Latency', observedMin: 48, targetMin: 20, delayMin: 28, bedHoursLost: 12.0 },
    { category: 'Patient Transport Coordination', observedMin: 35, targetMin: 15, delayMin: 20, bedHoursLost: 8.4 },
  ];

  const totalLostBedHours = delayData.reduce((acc, d) => acc + d.bedHoursLost, 0);
  const totalFinancialImpact = Math.round(totalLostBedHours * costPerHour);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Operational Efficiency & Fiscal Analytics
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Delay Diagnostics & Operational Cost Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Quantifies operational friction across clinical handoffs, measuring lost bed-hours and opportunity cost
            resulting from avoidable administrative, pharmacy, and payor processing delays.
          </p>
        </div>

        {/* Cost Assumption Input */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs">
          <span className="text-slate-600 font-medium">Bed-Hour Cost Assumption:</span>
          <span className="font-bold text-slate-900 font-mono">$</span>
          <input
            type="number"
            min="50"
            max="500"
            step="5"
            value={costPerHour}
            onChange={(e) => setCostPerHour(parseInt(e.target.value) || 125)}
            className="w-16 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold bg-white text-slate-900"
          />
          <span className="text-slate-400">/hr</span>
        </div>
      </div>

      {/* Financial & Time Lost Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Cumulative Lost Bed-Hours</div>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {totalLostBedHours.toFixed(1)} <span className="text-xs font-normal text-slate-400">bed-hours</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Equivalent to ~3.6 full inpatient hospital days
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Operational Opportunity Cost</div>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            ${totalFinancialImpact.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            At configured ${costPerHour}/bed-hour facility cost benchmark
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Largest Bottleneck Category</div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            Insurance Query Response (55m avg delay)
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            24.0 bed-hours wasted waiting on payor addendums
          </div>
        </div>
      </div>

      {/* Delay Comparison Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Observed Duration vs SLA Target by Workflow Category (Minutes)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Breakdown of process friction where operational time is currently lost
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={delayData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis unit="m" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="targetMin" name="Target SLA (mins)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="observedMin" name="Observed Actual (mins)" fill="#0369a1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delay Impact Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Workflow Bottleneck Delay & Cost Impact Audit</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Workflow Process</th>
                <th className="py-2.5 px-4 text-center">Observed Avg</th>
                <th className="py-2.5 px-4 text-center">SLA Benchmark</th>
                <th className="py-2.5 px-4 text-center">Friction Variance</th>
                <th className="py-2.5 px-4 text-right">Lost Bed-Hours</th>
                <th className="py-2.5 px-4 text-right">Fiscal Cost Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {delayData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-900">{d.category}</td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-800">{d.observedMin}m</td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500">{d.targetMin}m</td>
                  <td className="py-3 px-4 text-center font-mono font-bold tabular-nums text-rose-700">
                    +{d.delayMin}m
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {d.bedHoursLost} hrs
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    ${Math.round(d.bedHoursLost * costPerHour).toLocaleString()}
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
