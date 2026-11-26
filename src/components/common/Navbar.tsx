import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Copy, Check } from 'lucide-react';

interface NavbarProps {
  onOpenAddMember: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddMember }) => {
  const { activeView, setActiveView, firebaseConnected } = useGym();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyUrl = (path: string, label: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';
    const fullUrl = `${origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-cloud-border/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-input bg-graphite flex items-center justify-center shadow-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-sunshine/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="font-extrabold text-lg text-yellow-sunshine tracking-tighter">G</span>
            <span className="font-extrabold text-sm text-cloud-light tracking-tighter -ml-0.5">P</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-graphite">GYMPRO</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-yellow-soft text-graphite tracking-wide uppercase">
                2.0
              </span>
            </div>
            <p className="text-[11px] text-graphite-muted hidden sm:block font-medium">
              Enterprise Fitness Management
            </p>
          </div>
        </div>

        {/* Facility Info Badge */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cloud-grey/70 border border-cloud-border text-xs text-graphite-muted shadow-xs">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          <span className="font-bold text-graphite">Management Console</span>
        </div>

        {/* Right Actions & Direct Links */}
        <div className="flex items-center gap-2.5">
          {/* Quick Copy Link Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-control bg-white/70 border border-cloud-border text-[11px] text-graphite-muted">
            <span className="font-medium">Link:</span>
            <button
              onClick={() => copyUrl('/admin', 'Admin')}
              className="font-bold text-graphite hover:text-yellow-active transition-colors flex items-center gap-0.5"
              title="Copy Admin Link"
            >
              {copiedLink === 'Admin' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-2.5 h-2.5" />}
              /admin
            </button>
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-control text-xs font-medium bg-white/90 border border-cloud-border shadow-sm">
            <div className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-status-success animate-pulse' : 'bg-status-warning'}`} />
            <span className="font-semibold text-graphite hidden sm:inline">System</span>
            <span className="text-[11px] text-graphite-muted hidden md:inline">{firebaseConnected ? 'Online' : 'Standby'}</span>
          </div>

          {activeView === 'admin' && (
            <button
              onClick={onOpenAddMember}
              className="btn-jelly-yellow px-3.5 py-1.5 text-xs font-semibold rounded-control hidden sm:inline-flex"
            >
              + Enroll Member
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
