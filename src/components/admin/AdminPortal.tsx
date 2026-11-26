import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTab } from '../../types/gym';
import { DashboardOverview } from './DashboardOverview';
import { MembersView } from './MembersView';
import { PlansView } from './PlansView';
import { AttendanceView } from './AttendanceView';
import { FinancesView } from './FinancesView';
import { SettingsView } from './SettingsView';
import { AddMemberModal } from './AddMemberModal';
import { BiometricStation } from './BiometricStation';
import { LayoutDashboard, Users, Clock, Fingerprint, CreditCard, IndianRupee, Settings, UserPlus } from 'lucide-react';

interface AdminPortalProps {
  onOpenAddMember: () => void;
  isAddMemberOpen: boolean;
  onCloseAddMember: () => void;
  initialTab?: AdminTab;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onOpenAddMember,
  isAddMemberOpen,
  onCloseAddMember,
  initialTab
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialTab || 'dashboard');
  const [enrollingToken, setEnrollingToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  const handleOpenEnrollWithToken = (token: string) => {
    setEnrollingToken(token);
    onOpenAddMember();
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'members':
        return <MembersView onOpenAddMember={onOpenAddMember} />;
      case 'biometric':
        return <BiometricStation onOpenAddMemberWithToken={handleOpenEnrollWithToken} />;
      case 'attendance':
        return <AttendanceView />;
      case 'plans':
        return <PlansView />;
      case 'payments':
        return <FinancesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Top Navigation & Quick Action (Only on small screens < md) */}
      <div className="md:hidden mb-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onOpenAddMember}
            className="btn-jelly-yellow px-3 py-1.5 text-xs font-bold rounded-control flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Enroll Member</span>
          </button>
          <span className="text-[11px] font-bold text-graphite-muted uppercase">Admin Menu</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {([
            { id: 'dashboard', label: 'Overview' },
            { id: 'members', label: 'Members' },
            { id: 'attendance', label: 'Gate Access' },
            { id: 'biometric', label: 'Biometrics' },
            { id: 'plans', label: 'Plans' },
            { id: 'payments', label: 'Revenue' },
            { id: 'settings', label: 'Settings' }
          ] as { id: AdminTab; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap btn-jelly-secondary transition-all ${
                currentTab === tab.id
                  ? 'bg-graphite text-white shadow-sm border-graphite'
                  : 'bg-white text-graphite-muted border-cloud-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout Grid: Left Sidebar + Right Content Area */}
      <div className="flex flex-col md:flex-row gap-6 w-full items-start">
        
        {/* Left Side Navigation & Action Hub (Always available on md+) */}
        <div className="hidden md:block shrink-0 sticky top-20">
          <AdminSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full">
          {renderContent()}
        </main>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal />
    </div>
  );
};