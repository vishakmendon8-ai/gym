import React from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { TopNavbar } from './components/admin/TopNavbar';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { MembersView } from './components/admin/MembersView';
import { PlansView } from './components/admin/PlansView';
import { SubscriptionsView } from './components/admin/SubscriptionsView';
import { PaymentsView } from './components/admin/PaymentsView';
import { BiometricView } from './components/admin/BiometricView';
import { AccessMonitorView } from './components/admin/AccessMonitorView';
import { AttendanceView } from './components/admin/AttendanceView';
import { ReportsView } from './components/admin/ReportsView';
import { SettingsView } from './components/admin/SettingsView';
import { AddMemberModal } from './components/admin/AddMemberModal';
import { MemberApp } from './components/member/MemberApp';

const MainLayout: React.FC = () => {
  const { activeView, currentTab, setIsAddMemberOpen } = useGym();

  // If URL, hash, or state is set to Member App, render the Member App
  const isMember = activeView === 'member' || 
    (typeof window !== 'undefined' && (
      window.location.pathname.toLowerCase().includes('/member') ||
      window.location.search.toLowerCase().includes('member') ||
      window.location.hash.toLowerCase().includes('member')
    ));

  if (isMember) {
    return <MemberApp />;
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
      case 'overview':
        return <DashboardOverview />;
      case 'members':
        return <MembersView onOpenAddMember={() => setIsAddMemberOpen(true)} />;
      case 'plans':
        return <PlansView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'payments':
      case 'finances':
        return <PaymentsView />;
      case 'biometric':
        return <BiometricView />;
      case 'access-monitor':
        return <AccessMonitorView />;
      case 'attendance':
        return <AttendanceView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F6F2] text-[#252A30] font-sans antialiased selection:bg-[#FFD447] selection:text-[#252A30]">
      {/* Fixed Deep Graphite Left Sidebar */}
      <AdminSidebar />

      {/* Main Viewport: Scrollable Cloud White Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        {/* Top Navigation Bar with View Switcher */}
        <div className="sticky top-0 z-40 bg-[#F5F6F2]/90 backdrop-blur-md border-b border-[#DCE3E8]/60">
          <TopNavbar />
        </div>

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Global Add Member Modal */}
      <AddMemberModal />
    </div>
  );
};

export default function App() {
  return (
    <GymProvider>
      <MainLayout />
    </GymProvider>
  );
}
