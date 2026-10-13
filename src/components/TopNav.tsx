import React from 'react';
import { Sparkles, RotateCcw, Shield, UserCheck, Bell } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

interface TopNavProps {
  currentTitle: string;
  onOpenAskDrawer: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentTitle, onOpenAskDrawer }) => {
  const { role, setRole, resetDemoData, activeAlertsCount } = useHospital();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 z-10 shrink-0">
      {/* Zone 1: Contextual Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:inline">
          Operations
        </span>
        <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
          /
        </span>
        <h1 className="text-base font-semibold text-slate-900 truncate tracking-tight">
          {currentTitle}
        </h1>
        <div className="hidden lg:flex items-center gap-2 ml-4 text-xs text-slate-500 border-l border-slate-200 pl-4">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span>Synthetic Simulation Mode Active</span>
          <span aria-hidden="true">·</span>
          <span>SYNESIS 26</span>
        </div>
      </div>

      {/* Zone 2 & 3: Actions & Role Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Ask SmartFlow Button */}
        <button
          onClick={onOpenAskDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded-md hover:bg-sky-100 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-700" />
          <span>Ask SmartFlow</span>
        </button>

        {/* Role Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <button
            onClick={() => setRole('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
              role === 'admin'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3 h-3 text-slate-700" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => setRole('staff')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
              role === 'staff'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3 h-3 text-slate-700" />
            <span>Staff</span>
          </button>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={resetDemoData}
          title="Reset Demo Data to Initial State"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md transition-colors bg-white cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src="/src/assets/images/avatar_operations_director_1791867936630.jpg"
            alt="Director Vance"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden xl:block text-left text-xs leading-tight">
            <div className="font-semibold text-slate-900">Dr. E. Vance</div>
            <div className="text-[11px] text-slate-500">Ops Director</div>
          </div>
        </div>
      </div>
    </header>
  );
};
