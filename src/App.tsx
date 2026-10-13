import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Sidebar, NavTabId } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { AskSmartFlowDrawer } from './components/AskSmartFlowDrawer';
import { PatientDetailModal } from './components/PatientDetailModal';

// Views
import { CommandCenter } from './views/CommandCenter';
import { PatientFlowView } from './views/PatientFlowView';
import { BedManagementView } from './views/BedManagementView';
import { ArrivalForecastView } from './views/ArrivalForecastView';
import { BottleneckAnalysisView } from './views/BottleneckAnalysisView';
import { ResourceUtilizationView } from './views/ResourceUtilizationView';
import { DischargeCoordinationView } from './views/DischargeCoordinationView';
import { SmartSettleView } from './views/SmartSettleView';
import { InsuranceCoordinationView } from './views/InsuranceCoordinationView';
import { DiagnosticOperationsView } from './views/DiagnosticOperationsView';
import { AutopilotView } from './views/AutopilotView';
import { ResilienceSimulatorView } from './views/ResilienceSimulatorView';
import { DelayAnalyticsView } from './views/DelayAnalyticsView';
import { AlertsTasksView } from './views/AlertsTasksView';

const tabTitles: Record<NavTabId, string> = {
  'command-center': 'Operations Command Centre',
  'patient-flow': 'Patient Flow & Queue Monitoring',
  'bed-management': 'Smart Bed Management & Allocation',
  'arrival-forecast': 'Patient Arrival Forecasting',
  'bottlenecks': 'Operational Bottleneck Detection',
  'resource-utilization': 'Resource Utilization & Balancing',
  'discharge': 'Intelligent Discharge Coordination',
  'billing': 'SmartSettle Live Billing & Audit',
  'insurance': 'Insurance Claim Readiness & Pre-Auth',
  'diagnostics': 'Diagnostic Operations & Backlog Balancer',
  'autopilot': 'Hospital Flow Autopilot Planner',
  'simulator': 'Hospital Resilience & What-If Simulator',
  'delay-analytics': 'Delay Diagnostics & Operational Cost Analytics',
  'alerts': 'Unified Alerts & Operational Incident Queue',
};

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('command-center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    isAskDrawerOpen,
    setIsAskDrawerOpen,
    selectedPatientId,
    setSelectedPatientId,
  } = useHospital();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'command-center':
        return <CommandCenter setActiveTab={setActiveTab} />;
      case 'patient-flow':
        return <PatientFlowView setActiveTab={setActiveTab} />;
      case 'bed-management':
        return <BedManagementView />;
      case 'arrival-forecast':
        return <ArrivalForecastView />;
      case 'bottlenecks':
        return <BottleneckAnalysisView setActiveTab={setActiveTab} />;
      case 'resource-utilization':
        return <ResourceUtilizationView />;
      case 'discharge':
        return <DischargeCoordinationView />;
      case 'billing':
        return <SmartSettleView />;
      case 'insurance':
        return <InsuranceCoordinationView />;
      case 'diagnostics':
        return <DiagnosticOperationsView />;
      case 'autopilot':
        return <AutopilotView setActiveTab={setActiveTab} />;
      case 'simulator':
        return <ResilienceSimulatorView />;
      case 'delay-analytics':
        return <DelayAnalyticsView />;
      case 'alerts':
        return <AlertsTasksView />;
      default:
        return <CommandCenter setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav
          currentTitle={tabTitles[activeTab]}
          onOpenAskDrawer={() => setIsAskDrawerOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Grounded Operations Assistant Slide-Over Drawer */}
      <AskSmartFlowDrawer
        isOpen={isAskDrawerOpen}
        onClose={() => setIsAskDrawerOpen(false)}
      />

      {/* Full Patient Profile Drilldown Modal */}
      {selectedPatientId && (
        <PatientDetailModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <MainLayout />
    </HospitalProvider>
  );
}
