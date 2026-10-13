import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldAlert,
  ArrowRight,
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
import { SimulationParams, SimulationResult } from '../types/hospital';
import { runHospitalSimulation } from '../services/simulatorEngine';

export const ResilienceSimulatorView: React.FC = () => {
  const defaultParams: SimulationParams = {
    arrivalVolumeMultiplier: 1.0,
    availableBedsOffset: 0,
    staffAvailabilityPercent: 100,
    diagnosticUptimePercent: 100,
    dischargeEfficiencyMultiplier: 1.0,
    pharmacyDelayMinutes: 25,
    billingDelayMinutes: 20,
    insuranceQueryDelayMinutes: 30,
    cleaningDurationMinutes: 30,
  };

  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [simulationResult, setSimulationResult] = useState<SimulationResult>(
    runHospitalSimulation(defaultParams)
  );

  const handleRun = () => {
    const result = runHospitalSimulation(params);
    setSimulationResult(result);
  };

  const handleReset = () => {
    setParams(defaultParams);
    setSimulationResult(runHospitalSimulation(defaultParams));
  };

  // Presets
  const applyPreset = (presetName: string) => {
    let p = { ...defaultParams };
    if (presetName === 'surge') {
      p = {
        ...defaultParams,
        arrivalVolumeMultiplier: 1.45,
        diagnosticUptimePercent: 90,
      };
    } else if (presetName === 'radiology_outage') {
      p = {
        ...defaultParams,
        diagnosticUptimePercent: 60,
      };
    } else if (presetName === 'insurance_delay') {
      p = {
        ...defaultParams,
        insuranceQueryDelayMinutes: 90,
        billingDelayMinutes: 50,
      };
    } else if (presetName === 'staff_shortage') {
      p = {
        ...defaultParams,
        staffAvailabilityPercent: 70,
        cleaningDurationMinutes: 65,
      };
    } else if (presetName === 'discharge_accelerator') {
      p = {
        ...defaultParams,
        dischargeEfficiencyMultiplier: 1.6,
        pharmacyDelayMinutes: 10,
        billingDelayMinutes: 10,
        insuranceQueryDelayMinutes: 10,
        availableBedsOffset: 4,
      };
    }

    setParams(p);
    setSimulationResult(runHospitalSimulation(p));
  };

  const { baseline, scenario, comparisonNotes, departmentForecast } = simulationResult;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Resilience & Scenario Stress Testing
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hospital Resilience & What-If Operations Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Stress-test emergency boarding risk, discharge velocity, and clinical equipment disruptions before they happen in practice.
            Simulations preserve historical baselines for transparent side-by-side comparison.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run Simulation</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Preset Crisis Buttons */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Pre-Configured Stress Scenarios:
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => applyPreset('surge')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-800 font-medium cursor-pointer"
          >
            Mass Casualty Surge Event (+45% arrivals)
          </button>
          <button
            onClick={() => applyPreset('radiology_outage')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-800 font-medium cursor-pointer"
          >
            CT Scanner Unscheduled Outage (60% uptime)
          </button>
          <button
            onClick={() => applyPreset('insurance_delay')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-800 font-medium cursor-pointer"
          >
            Insurer Pre-Auth Clearinghouse Latency (+90m)
          </button>
          <button
            onClick={() => applyPreset('staff_shortage')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-800 font-medium cursor-pointer"
          >
            Nursing & EVS Turnover Shortage (70% staffing)
          </button>
          <button
            onClick={() => applyPreset('discharge_accelerator')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-md font-semibold cursor-pointer"
          >
            ★ SmartFlow Discharge Accelerator (+60% flow)
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Control Sliders */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
            Scenario Operational Levers
          </h3>

          {/* Slider 1: Arrival Volume */}
          <div>
            <div className="flex justify-between font-semibold text-slate-800 mb-1">
              <span>Patient Intake Multiplier:</span>
              <span className="font-mono text-sky-800">{Math.round((params.arrivalVolumeMultiplier - 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={params.arrivalVolumeMultiplier}
              onChange={(e) => setParams({ ...params, arrivalVolumeMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-sky-700 cursor-pointer"
            />
          </div>

          {/* Slider 2: Bed Offset */}
          <div>
            <div className="flex justify-between font-semibold text-slate-800 mb-1">
              <span>Active Bed Availability Offset:</span>
              <span className="font-mono text-sky-800">{params.availableBedsOffset > 0 ? `+${params.availableBedsOffset}` : params.availableBedsOffset} beds</span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={params.availableBedsOffset}
              onChange={(e) => setParams({ ...params, availableBedsOffset: parseInt(e.target.value) })}
              className="w-full accent-sky-700 cursor-pointer"
            />
          </div>

          {/* Slider 3: Staffing % */}
          <div>
            <div className="flex justify-between font-semibold text-slate-800 mb-1">
              <span>Floor Staffing Coverage:</span>
              <span className="font-mono text-sky-800">{params.staffAvailabilityPercent}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="5"
              value={params.staffAvailabilityPercent}
              onChange={(e) => setParams({ ...params, staffAvailabilityPercent: parseInt(e.target.value) })}
              className="w-full accent-sky-700 cursor-pointer"
            />
          </div>

          {/* Slider 4: Diagnostic Uptime */}
          <div>
            <div className="flex justify-between font-semibold text-slate-800 mb-1">
              <span>Radiology Equipment Uptime:</span>
              <span className="font-mono text-sky-800">{params.diagnosticUptimePercent}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={params.diagnosticUptimePercent}
              onChange={(e) => setParams({ ...params, diagnosticUptimePercent: parseInt(e.target.value) })}
              className="w-full accent-sky-700 cursor-pointer"
            />
          </div>

          {/* Slider 5: Discharge Efficiency */}
          <div>
            <div className="flex justify-between font-semibold text-slate-800 mb-1">
              <span>Discharge Flow Velocity:</span>
              <span className="font-mono text-sky-800">{params.dischargeEfficiencyMultiplier.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={params.dischargeEfficiencyMultiplier}
              onChange={(e) => setParams({ ...params, dischargeEfficiencyMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-sky-700 cursor-pointer"
            />
          </div>

          {/* Slider 6: Pharmacy Delay */}
          <div>
            <div className="flex justify-between font-semibold text-slate-800 mb-1">
              <span>Discharge Pharmacy Delay:</span>
              <span className="font-mono text-sky-800">{params.pharmacyDelayMinutes} mins</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={params.pharmacyDelayMinutes}
              onChange={(e) => setParams({ ...params, pharmacyDelayMinutes: parseInt(e.target.value) })}
              className="w-full accent-sky-700 cursor-pointer"
            />
          </div>

          {/* Slider 7: Insurance Latency */}
          <div>
            <div className="flex justify-between font-semibold text-slate-800 mb-1">
              <span>Insurance Query Latency:</span>
              <span className="font-mono text-sky-800">{params.insuranceQueryDelayMinutes} mins</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="10"
              value={params.insuranceQueryDelayMinutes}
              onChange={(e) => setParams({ ...params, insuranceQueryDelayMinutes: parseInt(e.target.value) })}
              className="w-full accent-sky-700 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleRun}
              className="w-full py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs"
            >
              Recalculate Scenario Model
            </button>
          </div>
        </div>

        {/* Right (2 spans): Dual Comparative Results & Department Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comparative Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Metric 1: Avg Wait */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs">
              <div className="text-slate-500 font-medium">Avg Admission Wait</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{scenario.avgWaitMinutes}m</span>
                <span className="text-[11px] text-slate-400 font-mono">({baseline.avgWaitMinutes}m base)</span>
              </div>
              <div className={`mt-1 font-semibold text-[11px] ${scenario.avgWaitMinutes > baseline.avgWaitMinutes ? 'text-rose-700' : 'text-emerald-700'}`}>
                {scenario.avgWaitMinutes >= baseline.avgWaitMinutes ? `+${scenario.avgWaitMinutes - baseline.avgWaitMinutes}m` : `-${baseline.avgWaitMinutes - scenario.avgWaitMinutes}m`}
              </div>
            </div>

            {/* Metric 2: ED Boarding */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs">
              <div className="text-slate-500 font-medium">ED Boarding Count</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">{scenario.edBoardingCount}</span>
                <span className="text-[11px] text-slate-400 font-mono">({baseline.edBoardingCount} base)</span>
              </div>
              <div className={`mt-1 font-semibold text-[11px] ${scenario.edBoardingCount > baseline.edBoardingCount ? 'text-rose-700' : 'text-emerald-700'}`}>
                {scenario.edBoardingCount >= baseline.edBoardingCount ? `+${scenario.edBoardingCount - baseline.edBoardingCount} patients` : `-${baseline.edBoardingCount - scenario.edBoardingCount} relieved`}
              </div>
            </div>

            {/* Metric 3: Occupancy */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs">
              <div className="text-slate-500 font-medium">Bed Occupancy Rate</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{scenario.bedOccupancyRate}%</span>
                <span className="text-[11px] text-slate-400 font-mono">({baseline.bedOccupancyRate}%)</span>
              </div>
              <div className={`mt-1 font-semibold text-[11px] ${scenario.bedOccupancyRate > 90 ? 'text-rose-700' : 'text-slate-700'}`}>
                {scenario.bedOccupancyRate > 90 ? 'Critical Capacity' : 'Nominal Band'}
              </div>
            </div>

            {/* Metric 4: Diagnostic Backlog */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs">
              <div className="text-slate-500 font-medium">Diagnostic Backlog</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{scenario.diagnosticBacklogCount}</span>
                <span className="text-[11px] text-slate-400 font-mono">({baseline.diagnosticBacklogCount} base)</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Turnaround: {params.diagnosticUptimePercent < 80 ? 'Delayed' : 'Nominal'}
              </div>
            </div>
          </div>

          {/* Department Comparison Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Department Waiting Time Comparison (Baseline vs Scenario)
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Estimated admission and intake wait times across key acute care clinical services
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentForecast} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
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
                  <Bar dataKey="baselineWait" name="Baseline Wait (mins)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="scenarioWait" name="Scenario Wait (mins)" fill="#0284c7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operational Impact Analysis Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Simulator Deductions & Insights:
            </div>
            <ul className="space-y-1 text-slate-700 list-disc pl-5 leading-relaxed">
              {comparisonNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
