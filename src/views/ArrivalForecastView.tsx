import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Layers,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useHospital } from '../context/HospitalContext';
import { calculateArrivalForecast } from '../services/forecasting';
import { DepartmentId } from '../types/hospital';

export const ArrivalForecastView: React.FC = () => {
  const { historicalArrivals, availableBeds } = useHospital();
  const [selectedDept, setSelectedDept] = useState<DepartmentId>('ED');
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.0);

  const forecasts = calculateArrivalForecast(historicalArrivals, selectedDept, surgeMultiplier, availableBeds);

  const chartData = forecasts.map((f) => ({
    hour: f.hourLabel,
    predicted: f.predictedArrivals,
    lower: f.lowerBound,
    upper: f.upperBound,
    capacity: f.availableCapacity,
    risk: f.capacityShortageRisk,
  }));

  const totalDemand = forecasts.reduce((acc, f) => acc + f.predictedArrivals, 0);
  const criticalHours = forecasts.filter((f) => f.capacityShortageRisk === 'critical' || f.capacityShortageRisk === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Predictive Operations
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Arrival Forecasting & Capacity Demand Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Transparent statistical regression modeling based on 14 days of historical diurnal intake patterns,
            day-of-week seasonality, and hourly variance.
          </p>
        </div>

        {/* Controls: Department & Surge Factor */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as DepartmentId)}
              className="border border-slate-200 rounded-md px-2.5 py-1 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="ED">Emergency Medicine</option>
              <option value="MED">General Medicine Admissions</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-1">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Surge Factor:</span>
            <span className="font-bold font-mono text-slate-900">{surgeMultiplier.toFixed(1)}x</span>
            <input
              type="range"
              min="0.8"
              max="1.8"
              step="0.1"
              value={surgeMultiplier}
              onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
              className="w-20 accent-sky-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">12-Hour Total Projected Intake</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {totalDemand} <span className="text-xs font-normal text-slate-400">patients</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Hourly Average: ~{Math.round(totalDemand / 12)} admissions/hr
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Capacity Deficit Risk</div>
          <div className="text-2xl font-bold text-rose-700 tabular-nums mt-1">
            {criticalHours.length} <span className="text-xs font-normal text-slate-400">hours at risk</span>
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            Demand exceeds turnover capacity between 22:00–02:00
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Model Methodology</div>
          <div className="text-xs font-semibold text-slate-800 mt-1">
            Diurnal Moving Average + Seasonality
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Confidence Interval: 95% (±1.96 standard deviations)
          </div>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Projected Intake Horizon (Next 12 Hours) with 95% Confidence Band
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hourly arrival estimates compared against current available bed turnover capacity ({availableBeds} beds/hr)
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="upper"
                name="95% Upper Bound"
                stroke="transparent"
                fill="#e0f2fe"
                fillOpacity={0.6}
              />
              <Bar dataKey="capacity" name="Available Bed Capacity" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted Arrivals"
                stroke="#0369a1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0369a1' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Forecast Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Hourly Demand & Capacity Risk Table</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Time Window</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4 text-center">Predicted Arrivals</th>
                <th className="py-2.5 px-4 text-center">95% Range (Lower - Upper)</th>
                <th className="py-2.5 px-4 text-center">Turnover Capacity</th>
                <th className="py-2.5 px-4 text-right">Capacity Shortage Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {forecasts.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50/60 font-sans">
                  <td className="py-2.5 px-4 font-semibold text-slate-900 font-mono">{f.hourLabel}</td>
                  <td className="py-2.5 px-4 text-slate-600">{f.departmentId}</td>
                  <td className="py-2.5 px-4 text-center font-bold font-mono tabular-nums text-sky-900">
                    {f.predictedArrivals}
                  </td>
                  <td className="py-2.5 px-4 text-center text-slate-500 font-mono tabular-nums">
                    {f.lowerBound} – {f.upperBound}
                  </td>
                  <td className="py-2.5 px-4 text-center text-slate-700 font-mono tabular-nums">
                    {f.availableCapacity} beds
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                        f.capacityShortageRisk === 'critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : f.capacityShortageRisk === 'high'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : f.capacityShortageRisk === 'moderate'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {f.capacityShortageRisk}
                    </span>
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
