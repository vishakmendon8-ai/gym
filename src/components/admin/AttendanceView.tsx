import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Badge } from '../common/Badge';
import { Clock, Search, Fingerprint, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { AdminTab } from '../../types/gym';

interface AttendanceViewProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onNavigateTab }) => {
  const { attendance, setActiveView } = useGym();
  const [filterStatus, setFilterStatus] = useState<'all' | 'granted' | 'denied'>('all');

  const filteredLogs = attendance.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-card p-6 border border-cloud-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-ping" />
            <h1 className="text-xl lg:text-2xl font-black text-graphite tracking-tight">
              Live Gate Access & Attendance Stream
            </h1>
          </div>
          <p className="text-xs text-graphite-muted">
            Synchronized external hardware turnstile and optical fingerprint access events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => onNavigateTab ? onNavigateTab('biometric') : setActiveView('biometric')}
            icon={<Fingerprint className="w-4 h-4 text-graphite" />}
          >
            Open Biometric Device
          </Button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-control text-xs font-semibold transition-all ${
            filterStatus === 'all'
              ? 'bg-graphite text-white'
              : 'bg-white text-graphite-muted border border-cloud-border'
          }`}
        >
          All Activity ({attendance.length})
        </button>
        <button
          onClick={() => setFilterStatus('granted')}
          className={`px-3.5 py-1.5 rounded-control text-xs font-semibold transition-all ${
            filterStatus === 'granted'
              ? 'bg-status-success text-white'
              : 'bg-white text-graphite-muted border border-cloud-border'
          }`}
        >
          Granted Access ({attendance.filter(a => a.status === 'granted').length})
        </button>
        <button
          onClick={() => setFilterStatus('denied')}
          className={`px-3.5 py-1.5 rounded-control text-xs font-semibold transition-all ${
            filterStatus === 'denied'
              ? 'bg-status-error text-white'
              : 'bg-white text-graphite-muted border border-cloud-border'
          }`}
        >
          Access Denied ({attendance.filter(a => a.status === 'denied').length})
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-panel border border-cloud-border shadow-card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-cloud-grey/60 border-b border-cloud-border text-[11px] font-bold text-graphite-muted uppercase tracking-wider">
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Terminal & Gate</th>
                <th className="py-3.5 px-4">Authentication Method</th>
                <th className="py-3.5 px-4">Turnstile Verdict</th>
                <th className="py-3.5 px-4">Notes / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-border/70">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-graphite">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={log.avatar}
                        alt={log.memberName}
                        className="w-8 h-8 rounded-full object-cover border border-cloud-border"
                      />
                      <span className="font-bold text-graphite">{log.memberName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-graphite-muted font-medium">
                    {log.terminalId}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-control bg-cloud-grey text-graphite text-[11px] font-semibold">
                      <Fingerprint className="w-3 h-3 text-yellow-active" />
                      Biometric Optical
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={log.status} />
                  </td>
                  <td className="py-3 px-4 text-graphite-muted text-[11px]">
                    {log.reason || 'Turnstile unlocked • 1 Person Pass-through'}
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
