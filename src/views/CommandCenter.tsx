import React from 'react';
import {
  BedDouble,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useHospital } from '../context/HospitalContext';
import { calculateArrivalForecast } from '../services/forecasting';
import { NavTabId } from '../components/Sidebar';

interface CommandCenterProps {
  setActiveTab: (tab: NavTabId) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ setActiveTab }) => {
  const {
    totalBeds,
    occupiedBeds,
    availableBeds,
    cleaningBeds,
    reservedBeds,
    occupancyRate,
    patientsWaitingAdmission,
    avgWaitTimeMinutes,
    patientsAwaitingDischarge,
    blockedDischargesCount,
    activeAlertsCount,
    edBoardingCount,
    departments,
    operationalAlerts,
    autopilotPlans,
    historicalArrivals,
    setSelectedPatientId,
  } = useHospital();

  // Arrival forecasts for next 8 hours
  const forecasts = calculateArrivalForecast(historicalArrivals, 'ED', 1.0, availableBeds).slice(0, 8);
  const totalPredictedArrivals = forecasts.reduce((sum, f) => sum + f.predictedArrivals, 0);

  // Department Occupancy Data for chart
  const deptOccupancyData = departments
    .filter((d) => d.totalBeds > 0)
    .map((d) => {
      // Calculate occupied in that dept
      const occPercent = Math.min(100, Math.round(((d.totalBeds - Math.max(0, d.totalBeds - d.currentQueue)) / d.totalBeds) * 100));
      return {
        name: d.shortName,
        beds: d.totalBeds,
        queue: d.currentQueue,
        wait: d.avgWaitMinutes,
        occupancy: d.id === 'MED' ? 92 : d.id === 'CARD' ? 88 : d.id === 'ED' ? 85 : d.id === 'SURG' ? 70 : 75,
      };
    });

  // Trend data
  const arrivalTrendData = [
    { time: '16:00', actual: 6, forecast: 5 },
    { time: '17:00', actual: 8, forecast: 7 },
    { time: '18:00', actual: 11, forecast: 9 },
    { time: '19:00', actual: 12, forecast: 11 },
    { time: '20:00', actual: 14, forecast: 13 },
    { time: '21:00', actual: 15, forecast: 14 },
    { time: '22:00 (Now)', actual: 13, forecast: 12 },
    { time: '23:00', actual: null, forecast: 10 },
    { time: '00:00', actual: null, forecast: 7 },
    { time: '01:00', actual: null, forecast: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Command Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
            Operations Command Centre · Live Telemetry
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Metropolitan Memorial Hospital — Operational Flow Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Real-time status across 44 acute beds, Emergency intake, Diagnostic Radiology, and discharge workflows.
            Elevated occupancy in General Medicine (92%) and 4 ED boarding patients requiring immediate release coordination.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('autopilot')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-800 text-white rounded-md text-xs font-semibold hover:bg-sky-900 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Flow Autopilot ({autopilotPlans.length} Plan)</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className="px-3.5 py-2 bg-white text-slate-700 border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Run What-If Simulation
          </button>
        </div>
      </div>

      {/* Top 6 Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Bed Occupancy */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Total Beds</span>
            <BedDouble className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {occupiedBeds}<span className="text-xs font-normal text-slate-400">/{totalBeds}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Occupancy Rate</span>
            <span className={`font-semibold tabular-nums ${occupancyRate > 85 ? 'text-rose-700' : 'text-slate-800'}`}>
              {occupancyRate}%
            </span>
          </div>
        </div>

        {/* KPI 2: Available Beds */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Available Beds</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums">
            {availableBeds}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Cleaning Turnover</span>
            <span className="font-medium text-amber-700 tabular-nums">{cleaningBeds} in progress</span>
          </div>
        </div>

        {/* KPI 3: ED Boarding Risk */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">ED Boarding Queue</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 tabular-nums">
            {edBoardingCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Holding Status</span>
            <span className="font-medium text-rose-700">Critical (&gt;90m)</span>
          </div>
        </div>

        {/* KPI 4: Admission Waiting Time */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Avg Admission Wait</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {avgWaitTimeMinutes}<span className="text-xs font-normal text-slate-400"> min</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Waiting Patients</span>
            <span className="font-medium text-slate-700 tabular-nums">{patientsWaitingAdmission} in queue</span>
          </div>
        </div>

        {/* KPI 5: Predicted Arrivals */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Arrival Forecast (8h)</span>
            <TrendingUp className="w-4 h-4 text-sky-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-900 tabular-nums">
            ~{totalPredictedArrivals}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Demand vs Capacity</span>
            <span className="font-medium text-amber-700">Deficit Projected</span>
          </div>
        </div>

        {/* KPI 6: Blocked Discharges */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Discharge Blockers</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800 tabular-nums">
            {blockedDischargesCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Awaiting Discharge</span>
            <span className="font-medium text-slate-700 tabular-nums">{patientsAwaitingDischarge} total</span>
          </div>
        </div>
      </div>

      {/* Main Command Grid: Charts and Priority Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Actual vs Forecast Arrivals */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Patient Intake & Forecast Trajectory (Emergency Medicine)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Observed historical arrivals vs moving-average diurnal forecast for upcoming shift
                </p>
              </div>
              <button
                onClick={() => setActiveTab('arrival-forecast')}
                className="text-xs text-sky-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Forecast</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={arrivalTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
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
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual Arrivals"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0284c7' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Statistical Forecast"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#94a3b8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Department-wise Occupancy */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Department Capacity & Occupancy Rates
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bed saturation thresholds across active inpatient wards
                </p>
              </div>
              <button
                onClick={() => setActiveTab('bed-management')}
                className="text-xs text-sky-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Beds</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptOccupancyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Occupancy']}
                  />
                  <Bar dataKey="occupancy" fill="#0369a1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Operational Priority Panel & Actions */}
        <div className="space-y-6">
          {/* Priority Panel */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Operational Priority Panel</h3>
              </div>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                Action Required
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* Issue 1 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">ED Inpatient Boarding Crisis</span>
                  <span className="text-[10px] text-rose-700 font-bold uppercase">Critical</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  4 admitted patients waiting &gt;90m for inpatient beds. Jonathan Brooks (Troponin+) holding for 109m awaiting Cardiology.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Trigger: Med/Card Beds At Capacity</span>
                  <button
                    onClick={() => setActiveTab('autopilot')}
                    className="text-sky-700 font-semibold hover:underline cursor-pointer"
                  >
                    Resolve in Autopilot →
                  </button>
                </div>
              </div>

              {/* Issue 2 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">Discharge Blocked: Pharmacy</span>
                  <span className="text-[10px] text-amber-700 font-bold uppercase">Delayed</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Marcus Thorne (Bed MED-101) cleared by Dr. Finch 55m ago. Inhaler med-reconciliation pending in dispensary.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Unblocks: Bed MED-101 for ED transfer</span>
                  <button
                    onClick={() => setActiveTab('discharge')}
                    className="text-sky-700 font-semibold hover:underline cursor-pointer"
                  >
                    View Discharge Task →
                  </button>
                </div>
              </div>

              {/* Issue 3 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">UHC Insurance Query Unanswered</span>
                  <span className="text-[10px] text-amber-700 font-bold uppercase">Query</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  David Chen (Bed CARD-401) cannot settle final bill. UnitedHealthcare requires Day 3 telemetry necessity addendum.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Unblocks: $20,370 claim clearance</span>
                  <button
                    onClick={() => setActiveTab('insurance')}
                    className="text-sky-700 font-semibold hover:underline cursor-pointer"
                  >
                    Open Insurance Portal →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Department Snapshot */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Active Department Queue Status</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {departments.slice(0, 5).map((d) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{d.name}</div>
                    <div className="text-[11px] text-slate-400">Head: {d.head}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900 tabular-nums">{d.currentQueue} patients</div>
                    <div className={`text-[11px] tabular-nums ${d.avgWaitMinutes > d.targetWaitMinutes ? 'text-amber-700' : 'text-slate-500'}`}>
                      {d.avgWaitMinutes}m wait (Target: {d.targetWaitMinutes}m)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
