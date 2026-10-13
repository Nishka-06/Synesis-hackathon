import React from 'react';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  TrendingUp,
  AlertOctagon,
  Cpu,
  Layers,
  FileText,
  ShieldCheck,
  Activity,
  Sliders,
  BarChart3,
  BellRing,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export type NavTabId =
  | 'command-center'
  | 'patient-flow'
  | 'bed-management'
  | 'arrival-forecast'
  | 'bottlenecks'
  | 'resource-utilization'
  | 'discharge'
  | 'billing'
  | 'insurance'
  | 'diagnostics'
  | 'autopilot'
  | 'simulator'
  | 'delay-analytics'
  | 'alerts';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const { activeAlertsCount, blockedDischargesCount, edBoardingCount, role } = useHospital();

  const navItems = [
    {
      id: 'command-center' as NavTabId,
      label: 'Command Centre',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'patient-flow' as NavTabId,
      label: 'Patient Flow & Queue',
      icon: Users,
      badge: edBoardingCount > 0 ? `${edBoardingCount} Boarding` : undefined,
      badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200',
    },
    {
      id: 'bed-management' as NavTabId,
      label: 'Bed Management',
      icon: BedDouble,
      badge: undefined,
    },
    {
      id: 'arrival-forecast' as NavTabId,
      label: 'Arrival Forecasts',
      icon: TrendingUp,
      badge: undefined,
    },
    {
      id: 'bottlenecks' as NavTabId,
      label: 'Bottleneck Analysis',
      icon: AlertOctagon,
      badge: '4 Active',
      badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'autopilot' as NavTabId,
      label: 'Flow Autopilot',
      icon: Cpu,
      badge: 'Action Plan',
      badgeColor: 'text-sky-700 bg-sky-50 border border-sky-200',
    },
    {
      id: 'discharge' as NavTabId,
      label: 'Discharge Coordination',
      icon: Layers,
      badge: blockedDischargesCount > 0 ? `${blockedDischargesCount} Blocked` : undefined,
      badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'billing' as NavTabId,
      label: 'SmartSettle Billing',
      icon: FileText,
      badge: undefined,
    },
    {
      id: 'insurance' as NavTabId,
      label: 'Insurance Coordination',
      icon: ShieldCheck,
      badge: '1 Query',
      badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200',
    },
    {
      id: 'diagnostics' as NavTabId,
      label: 'Diagnostic Operations',
      icon: Activity,
      badge: undefined,
    },
    {
      id: 'resource-utilization' as NavTabId,
      label: 'Resource Utilization',
      icon: Building2,
      badge: undefined,
    },
    {
      id: 'simulator' as NavTabId,
      label: 'What-If Simulator',
      icon: Sliders,
      badge: undefined,
    },
    {
      id: 'delay-analytics' as NavTabId,
      label: 'Delay & Cost Analytics',
      icon: BarChart3,
      badge: undefined,
    },
    {
      id: 'alerts' as NavTabId,
      label: 'Alerts & Tasks',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : undefined,
      badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 z-20 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              SF
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight leading-none">SmartFlow</div>
              <div className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">Hospital Operations</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            SF
          </div>
        )}
      </div>

      {/* Role Indicator Banner */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-medium">Active Mode</span>
            <span className="font-semibold text-sky-800">
              {role === 'admin' ? 'Administrator' : 'Authorized Staff'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-700' : 'text-slate-500'}`} />
              {!collapsed && (
                <>
                  <span className="truncate text-left flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold tracking-tight whitespace-nowrap shrink-0 ${
                        item.badgeColor || 'text-slate-600 bg-slate-100'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>SYNESIS 26 Hackathon</span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer text-[10px]"
            >
              Collapse
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Expand Sidebar"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
