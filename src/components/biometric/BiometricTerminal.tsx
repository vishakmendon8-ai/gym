import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member } from '../../types/gym';
import { 
  Fingerprint, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  ArrowLeft,
  RotateCcw,
  Volume2,
  HardDrive,
  UserCheck,
  UserX,
  ExternalLink
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AdminTab } from '../../types/gym';

interface BiometricTerminalProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

export const BiometricTerminal: React.FC<BiometricTerminalProps> = ({ onNavigateTab }) => {
  const { members, attendance, recordBiometricScan, setActiveView } = useGym();

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'granted' | 'denied' | 'unknown'>('idle');
  const [activeScannedMember, setActiveScannedMember] = useState<Member | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('Ready for Verification: Present Member Fingerprint');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Quick selection from gym directory
  const activeMember = members.find(m => m.status === 'active') || members[0];
  const expiredMember = members.find(m => m.status === 'expired') || members[3];
  const expiringMember = members.find(m => m.status === 'expiring') || members[2];
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMember?.id || '');

  // Play synthetic tone using web audio API
  const playTone = (type: 'beep' | 'success' | 'denied') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'denied') {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const handleSimulateScan = async (biometricId: string, customMember?: Member) => {
    if (scanState === 'scanning') return;

    setScanState('scanning');
    setFeedbackMessage('Optical ridge reading in progress • Verifying membership credentials...');
    playTone('beep');

    // Simulate hardware optical scan latency (1100ms)
    setTimeout(async () => {
      const result = await recordBiometricScan(biometricId);

      if (result.status === 'granted') {
        playTone('success');
        setScanState('granted');
        setActiveScannedMember(result.member || null);
        setFeedbackMessage(result.message);
      } else if (result.status === 'denied') {
        playTone('denied');
        setScanState('denied');
        setActiveScannedMember(result.member || null);
        setFeedbackMessage(result.message);
      } else {
        playTone('denied');
        setScanState('unknown');
        setActiveScannedMember(null);
        setFeedbackMessage(result.message);
      }

      // Automatically reset back to idle after 4.5 seconds
      setTimeout(() => {
        setScanState('idle');
        setActiveScannedMember(null);
        setFeedbackMessage('Ready for Verification: Present Member Fingerprint');
      }, 4500);
    }, 1100);
  };

  const handleVerifySelectedMember = () => {
    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      handleSimulateScan(member.biometricId, member);
    }
  };

  // Recent 4 device access events
  const recentDeviceLogs = attendance.slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* External Device Header Container */}
      <div className="bg-graphite rounded-panel p-5 md:p-6 text-cloud shadow-xl border border-graphite-light relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-sunshine/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-graphite-light/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('attendance') : setActiveView('admin')}
              className="p-2 rounded-control bg-graphite-light/60 hover:bg-graphite-light text-cloud transition-colors"
              title="Back to Gate Access Logs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-white text-base md:text-lg tracking-tight">
                  EXTERNAL BIOMETRIC SCANNER (ADMIN VERIFICATION)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-sunshine text-graphite font-black text-[10px] tracking-wider uppercase">
                  HARDWARE DEVICE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-status-success/20 text-status-success border border-status-success/30 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping" />
                  GATE #01 ONLINE
                </span>
              </div>
              <p className="text-xs text-cloud-grey/70 mt-1">
                External reception turnstile scanner connected to Admin Panel for member entry verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold flex items-center gap-1.5 transition-all ${
                soundEnabled ? 'bg-graphite-light text-yellow-sunshine' : 'bg-graphite-dark text-cloud-grey/40'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio Cue {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <div className="px-3 py-1.5 rounded-control bg-graphite-dark border border-graphite-light/50 flex items-center gap-2 text-xs">
              <HardDrive className="w-3.5 h-3.5 text-yellow-sunshine" />
              <span className="font-mono text-cloud-grey font-bold text-[11px]">USB-COM3 / IP:192.168.1.120</span>
            </div>
          </div>
        </div>

        {/* Member Selector Strip for Admin */}
        <div className="relative z-10 pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <label className="text-xs font-bold text-cloud-light shrink-0">
              Verify Registered Member:
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-graphite-dark border border-graphite-light rounded-control px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-sunshine flex-1 max-w-md"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.planName} ({m.status.toUpperCase()})
                </option>
              ))}
            </select>
            <button
              onClick={handleVerifySelectedMember}
              disabled={scanState === 'scanning'}
              className="btn-jelly-yellow px-4 py-2 text-xs font-bold rounded-control flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Fingerprint className="w-4 h-4 text-graphite" />
              Scan Member Token
            </button>
          </div>

          <div className="text-[11px] text-cloud-grey/60 hidden xl:block">
            Optical Sensor Model: Lumidigm V302 • Alpha Gate Lock
          </div>
        </div>
      </div>

      {/* Main Scanner Center Stage */}
      <div className="bg-graphite rounded-panel p-6 md:p-10 text-cloud flex flex-col items-center justify-center shadow-xl relative overflow-hidden border border-graphite-light min-h-[460px]">
        
        {/* Subtle concentric rings */}
        <div className="absolute inset-0 bg-radial-at-c from-graphite-light/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex flex-col items-center">
          
          {/* Animated pulse rings */}
          <div className={`absolute -inset-4 rounded-full border border-yellow-sunshine/20 pointer-events-none ${
            scanState === 'scanning' ? 'animate-pulse-ring' : ''
          }`} />

          {/* Main Round Scanner Platform */}
          <div
            onClick={() => handleSimulateScan(activeMember.biometricId, activeMember)}
            title="Tap to verify sample active member"
            className={`w-60 h-60 md:w-68 md:h-68 rounded-full glass-dark flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden select-none border-2 shadow-2xl ${
              scanState === 'granted'
                ? 'border-status-success ring-8 ring-status-success/20 bg-status-success/10'
                : scanState === 'denied' || scanState === 'unknown'
                ? 'border-status-error ring-8 ring-status-error/20 bg-status-error/10'
                : scanState === 'scanning'
                ? 'border-yellow-sunshine ring-8 ring-yellow-sunshine/20'
                : 'border-yellow-sunshine/40 hover:border-yellow-sunshine'
            }`}
          >
            {/* Scanning beam line */}
            {scanState === 'scanning' && (
              <div className="absolute inset-x-0 h-1 bg-yellow-sunshine shadow-[0_0_15px_#FFD447] animate-scan-line z-20 pointer-events-none" />
            )}

            {/* Fingerprint Illustration / Status Icon */}
            {scanState === 'granted' ? (
              <div className="flex flex-col items-center animate-fade-in">
                <CheckCircle2 className="w-24 h-24 text-status-success drop-shadow-md stroke-[2]" />
                <span className="font-black text-status-success text-sm tracking-wider uppercase mt-2">
                  Access Granted
                </span>
                <span className="text-[11px] font-bold text-status-success/90">
                  Turnstile Unlocked
                </span>
              </div>
            ) : scanState === 'denied' ? (
              <div className="flex flex-col items-center animate-fade-in">
                <XCircle className="w-24 h-24 text-status-error drop-shadow-md stroke-[2]" />
                <span className="font-black text-status-error text-sm tracking-wider uppercase mt-2">
                  Access Denied
                </span>
                <span className="text-[11px] font-bold text-status-error/90">
                  Turnstile Locked
                </span>
              </div>
            ) : scanState === 'unknown' ? (
              <div className="flex flex-col items-center animate-fade-in">
                <AlertTriangle className="w-24 h-24 text-status-error drop-shadow-md stroke-[2]" />
                <span className="font-black text-status-error text-sm tracking-wider uppercase mt-2">
                  Unknown Print
                </span>
                <span className="text-[11px] font-bold text-status-error/90">
                  Gate Locked • Alert
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Fingerprint className="w-28 h-28 text-yellow-sunshine drop-shadow-[0_4px_12px_rgba(255,212,71,0.35)]" />
                <span className="text-[11px] font-bold text-cloud-grey/70 tracking-wider uppercase mt-2">
                  Tap to Verify Entry
                </span>
              </div>
            )}
          </div>

          {/* Feedback Label underneath */}
          <div className="mt-6 text-center max-w-lg">
            <h3 className={`text-base md:text-lg font-bold tracking-tight ${
              scanState === 'granted'
                ? 'text-status-success'
                : scanState === 'denied' || scanState === 'unknown'
                ? 'text-status-error'
                : 'text-cloud-light'
            }`}>
              {feedbackMessage}
            </h3>
            
            {activeScannedMember && (
              <div className="mt-3 p-3.5 rounded-card bg-graphite-dark/90 border border-graphite-light flex items-center justify-center gap-3 animate-fade-in">
                <img
                  src={activeScannedMember.avatar}
                  alt={activeScannedMember.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-yellow-sunshine shadow-sm"
                />
                <div className="text-left text-xs">
                  <p className="font-black text-white text-sm">{activeScannedMember.name}</p>
                  <p className="text-cloud-grey/80 text-[11px]">
                    Plan: <span className="text-yellow-sunshine font-semibold">{activeScannedMember.planName}</span> • Status: <span className="capitalize font-semibold">{activeScannedMember.status}</span>
                  </p>
                  <p className="text-[10px] text-cloud-grey/60 mt-0.5">
                    Token: <span className="font-mono">{activeScannedMember.biometricId}</span> • Lifetime Entries: {activeScannedMember.totalCheckIns}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Quick Test Presets Strip */}
      <div className="glass-panel rounded-card p-5 border border-cloud-border bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-graphite block">Quick Hardware Simulation Presets</span>
          <span className="text-[11px] text-graphite-muted">
            Simulate realistic turnstile scenarios directly from the admin panel:
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Active Member Button */}
          <button
            onClick={() => handleSimulateScan(activeMember.biometricId, activeMember)}
            disabled={scanState === 'scanning'}
            className="px-3.5 py-2 rounded-control bg-status-success/15 border border-status-success/40 hover:bg-status-success/25 text-graphite text-xs font-bold transition-all flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span>Active: {activeMember.name}</span>
          </button>

          {/* Expired Member Button */}
          <button
            onClick={() => handleSimulateScan(expiredMember.biometricId, expiredMember)}
            disabled={scanState === 'scanning'}
            className="px-3.5 py-2 rounded-control bg-status-error/15 border border-status-error/40 hover:bg-status-error/25 text-graphite text-xs font-bold transition-all flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-status-error" />
            <span>Expired: {expiredMember.name}</span>
          </button>

          {/* Expiring Soon Button */}
          <button
            onClick={() => handleSimulateScan(expiringMember.biometricId, expiringMember)}
            disabled={scanState === 'scanning'}
            className="px-3.5 py-2 rounded-control bg-yellow-sunshine/20 border border-yellow-sunshine/50 hover:bg-yellow-sunshine/30 text-graphite text-xs font-bold transition-all flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Expiring: {expiringMember.name}</span>
          </button>

          {/* Unknown print button */}
          <button
            onClick={() => handleSimulateScan('BIO-FP-UNKNOWN-999')}
            disabled={scanState === 'scanning'}
            className="px-3.5 py-2 rounded-control bg-cloud-grey border border-cloud-border hover:bg-cloud-border text-graphite text-xs font-bold transition-all flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
            <span>Unregistered Finger</span>
          </button>
        </div>
      </div>

      {/* Live Recent Verification Feed */}
      <div className="glass-panel rounded-card p-5 border border-cloud-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-graphite-muted" />
            <h3 className="text-xs font-bold text-graphite uppercase tracking-wider">
              Recent Verifications from This Device
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab ? onNavigateTab('attendance') : null}
            className="text-xs font-bold text-graphite hover:text-yellow-active flex items-center gap-1"
          >
            Full Attendance Log <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentDeviceLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-card bg-white border border-cloud-border flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={log.avatar}
                  alt={log.memberName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-graphite truncate">{log.memberName}</p>
                  <p className="text-[10px] text-graphite-muted font-mono">{log.timestamp}</p>
                </div>
              </div>
              <Badge status={log.status} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
