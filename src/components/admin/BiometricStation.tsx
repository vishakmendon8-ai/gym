import React, { useState, useEffect, useRef } from 'react';
import { useGym } from '../../context/GymContext';
import { Member } from '../../types/gym';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Fingerprint, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Usb, 
  Clock, 
  ShieldCheck, 
  Phone, 
  UserPlus, 
  Volume2,
  VolumeX,
  Link2,
  Check,
  X,
  ArrowRight,
  Shield,
  Activity,
  RotateCcw,
  Sparkles,
  Cloud
} from 'lucide-react';
import { P2PBiometricModal } from './P2PBiometricModal';

interface BiometricStationProps {
  onOpenAddMemberWithToken?: (token: string) => void;
}

export const BiometricStation: React.FC<BiometricStationProps> = ({ onOpenAddMemberWithToken }) => {
  const { members, recordBiometricScan, updateMemberStatus, updateMemberBiometric, attendance } = useGym();

  const [deviceStatus, setDeviceStatus] = useState<'idle' | 'reading' | 'matched' | 'denied' | 'unknown'>('idle');
  const [matchedMember, setMatchedMember] = useState<Member | null>(null);
  const [scannedToken, setScannedToken] = useState<string>('');
  const [inputToken, setInputToken] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastMatchTime, setLastMatchTime] = useState<string>('');

  // Target member for quick-linking an unregistered scanned token
  const [selectedMemberToLink, setSelectedMemberToLink] = useState<string>('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkSuccessBanner, setLinkSuccessBanner] = useState<string>('');

  // Dedicated Register Biometric Modal state
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isP2PModalOpen, setIsP2PModalOpen] = useState(false);
  const [regMemberId, setRegMemberId] = useState<string>(members[0]?.id || '');
  const [regToken, setRegToken] = useState<string>(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [regScanning, setRegScanning] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto select first member when members change
  useEffect(() => {
    if (members.length > 0 && !selectedMemberToLink) {
      setSelectedMemberToLink(members[0].id);
      setRegMemberId(members[0].id);
    }
  }, [members]);

  // Web Audio chime feedback
  const playTone = (type: 'beep' | 'success' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(750, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(164, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Process biometric token from reader or simulator
  const processBiometricScan = async (token: string) => {
    if (!token.trim()) return;

    setDeviceStatus('reading');
    setScannedToken(token.trim().toUpperCase());
    playTone('beep');

    // Simulate hardware read delay (500ms)
    setTimeout(async () => {
      const result = await recordBiometricScan(token.trim());
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastMatchTime(nowStr);

      if (result.status === 'granted') {
        playTone('success');
        setDeviceStatus('matched');
        setMatchedMember(result.member || null);
      } else if (result.status === 'denied') {
        playTone('error');
        setDeviceStatus('denied');
        setMatchedMember(result.member || null);
      } else {
        playTone('error');
        setDeviceStatus('unknown');
        setMatchedMember(null);
        if (members.length > 0 && !selectedMemberToLink) {
          setSelectedMemberToLink(members[0].id);
        }
      }
    }, 500);
  };

  // Connect scanned token directly to existing member profile
  const handleLinkBiometricToProfile = async () => {
    if (!selectedMemberToLink || !scannedToken) return;

    setIsLinking(true);
    const result = await updateMemberBiometric(selectedMemberToLink, scannedToken);
    setIsLinking(false);

    if (result.success && result.member) {
      playTone('success');
      setLinkSuccessBanner(`Biometric ${scannedToken} linked to ${result.member.name}!`);

      // Re-run scan verification
      setTimeout(async () => {
        const scanRes = await recordBiometricScan(scannedToken);
        setDeviceStatus(scanRes.status === 'granted' ? 'matched' : scanRes.status === 'denied' ? 'denied' : 'matched');
        setMatchedMember(result.member || null);
        setLinkSuccessBanner('');
      }, 1000);
    }
  };

  // Dedicated registration modal submission
  const handleSaveRegistrationModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regMemberId || !regToken.trim()) return;

    setRegScanning(true);
    playTone('beep');

    setTimeout(async () => {
      const result = await updateMemberBiometric(regMemberId, regToken.trim());
      setRegScanning(false);

      if (result.success && result.member) {
        playTone('success');
        setIsRegModalOpen(false);
        // Automatically scan and display newly registered profile
        await processBiometricScan(regToken.trim());
      }
    }, 450);
  };

  // Physical USB scanner keyboard wedge listener
  useEffect(() => {
    let keyBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 350) {
        keyBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (keyBuffer.length >= 4) {
          processBiometricScan(keyBuffer);
          keyBuffer = '';
        }
      } else if (e.key.length === 1) {
        keyBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken) {
      processBiometricScan(inputToken);
      setInputToken('');
    }
  };

  const handleResetScanner = () => {
    setDeviceStatus('idle');
    setMatchedMember(null);
    setScannedToken('');
    setLinkSuccessBanner('');
  };

  const membersWithBiometric = members.filter(m => m.biometricId && m.biometricId !== 'Pending').length;

  return (
    <div className="space-y-5">
      
      {/* Systematic Top Header */}
      <div className="glass-panel rounded-card p-4 lg:p-5 border border-cloud-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-control bg-graphite flex items-center justify-center text-yellow-sunshine shadow-md relative shrink-0">
            <Fingerprint className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-status-success border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg lg:text-xl font-black text-graphite tracking-tight leading-none">
                Biometric Access Station
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success/15 text-status-success font-bold text-[10px] tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                Optical Scanner Online
              </span>
            </div>
            <p className="text-xs text-graphite-muted mt-1">
              SecuGen Optical 500 DPI • Real-time turnstile gate authentication
            </p>
          </div>
        </div>

        {/* Clean Header Actions (Only required controls) */}
        <div className="flex items-center gap-2.5">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute turnstile audio chime' : 'Enable turnstile audio chime'}
            className={`px-3 py-2 rounded-control text-xs font-bold flex items-center gap-1.5 transition-all btn-jelly-secondary ${
              soundEnabled 
                ? 'bg-yellow-soft/80 text-graphite border border-yellow-sunshine/40' 
                : 'bg-cloud-grey text-graphite-muted border border-cloud-border'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-graphite" />
                <span>Chime ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-graphite-muted" />
                <span>Muted</span>
              </>
            )}
          </button>

          {/* P2P Cloud Device Setup Button */}
          <button
            onClick={() => setIsP2PModalOpen(true)}
            className="btn-jelly-secondary px-3.5 py-2 rounded-control text-xs font-bold flex items-center gap-1.5 bg-graphite text-yellow-sunshine border border-yellow-sunshine/40 hover:border-yellow-sunshine shadow-xs transition-all"
            title="Configure physical P2P / Cloud biometric machine (ZKTeco, eSSL, Realtime, Hikvision)"
          >
            <Cloud className="w-4 h-4 text-yellow-sunshine animate-pulse" />
            <span>P2P Cloud Setup</span>
          </button>

          {/* Primary Action: Register Biometric to Profile */}
          <button
            onClick={() => {
              setRegToken(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`);
              setIsRegModalOpen(true);
            }}
            className="btn-jelly-yellow px-4 py-2 rounded-control text-xs font-extrabold flex items-center gap-1.5 shadow-yellow-btn"
          >
            <Link2 className="w-4 h-4" />
            <span>+ Register Biometric to Profile</span>
          </button>
        </div>
      </div>

      {/* Systematic Dual Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Optical Reader Console & Simulation Controls (5 Cols) */}
        <div className="md:col-span-5 glass-panel rounded-card p-5 border border-cloud-border shadow-card-soft space-y-5">
          
          {/* Reader Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cloud-border">
            <span className="text-xs font-bold text-graphite uppercase tracking-wider flex items-center gap-1.5">
              <Usb className="w-3.5 h-3.5 text-yellow-active" /> Optical Sensor Pad
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-soft text-graphite flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping" />
              Ready for Finger
            </span>
          </div>

          {/* Visual Scanner Surface */}
          <div className="flex flex-col items-center justify-center py-6 px-4 rounded-card bg-graphite text-white relative overflow-hidden shadow-inner border border-graphite-light">
            
            {/* Scan beam animation when reading */}
            {deviceStatus === 'reading' && (
              <div className="absolute inset-x-0 h-1 bg-yellow-sunshine shadow-[0_0_15px_#FFD447] animate-scan-line z-20 pointer-events-none" />
            )}

            <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative border-2 ${
              deviceStatus === 'matched'
                ? 'border-status-success ring-4 ring-status-success/30 bg-status-success/20'
                : deviceStatus === 'denied' || deviceStatus === 'unknown'
                ? 'border-status-error ring-4 ring-status-error/30 bg-status-error/20'
                : deviceStatus === 'reading'
                ? 'border-yellow-sunshine ring-4 ring-yellow-sunshine/40 bg-white/5'
                : 'border-yellow-sunshine/30 hover:border-yellow-sunshine bg-white/5'
            }`}>
              {deviceStatus === 'matched' ? (
                <CheckCircle2 className="w-14 h-14 text-status-success animate-fade-in" />
              ) : deviceStatus === 'denied' ? (
                <XCircle className="w-14 h-14 text-status-error animate-fade-in" />
              ) : deviceStatus === 'unknown' ? (
                <AlertTriangle className="w-14 h-14 text-status-warning animate-fade-in" />
              ) : (
                <Fingerprint className={`w-14 h-14 text-yellow-sunshine transition-transform ${
                  deviceStatus === 'reading' ? 'scale-110 animate-pulse' : ''
                }`} />
              )}
            </div>

            <div className="mt-3.5 text-center">
              <p className={`text-xs font-bold ${
                deviceStatus === 'matched'
                  ? 'text-status-success'
                  : deviceStatus === 'denied'
                  ? 'text-status-error'
                  : deviceStatus === 'unknown'
                  ? 'text-status-warning'
                  : 'text-cloud-light'
              }`}>
                {deviceStatus === 'reading'
                  ? 'Analyzing fingerprint ridges...'
                  : deviceStatus === 'matched'
                  ? '✓ Fingerprint Match Confirmed!'
                  : deviceStatus === 'denied'
                  ? '✕ Access Denied: Membership Expired'
                  : deviceStatus === 'unknown'
                  ? '⚠ Unregistered Fingerprint'
                  : 'Ready: Place finger on external scanner'}
              </p>
              {scannedToken && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-graphite-dark text-[11px] font-mono text-yellow-sunshine font-bold border border-white/10">
                  Token: {scannedToken}
                </span>
              )}
            </div>
          </div>

          {/* Manual Token / Barcode Scanner Input */}
          <form onSubmit={handleManualScanSubmit} className="space-y-1.5">
            <label className="block text-[11px] font-bold text-graphite-muted uppercase">
              Manual Token / Barcode Wedge
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter or scan token (e.g. BIO-FP-8801)..."
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-input bg-white border border-cloud-border text-graphite font-mono font-bold focus:outline-none focus:border-yellow-sunshine transition-all"
              />
              <button 
                type="submit" 
                className="btn-jelly-secondary px-3.5 py-2 text-xs font-bold rounded-control bg-graphite text-white hover:bg-black transition-all"
              >
                Scan
              </button>
            </div>
          </form>

          {/* Systematic 1-Click Hardware Test Simulation */}
          <div className="pt-4 border-t border-cloud-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-graphite uppercase tracking-wider">
                1-Click Test Scenarios
              </span>
              <span className="text-[10px] text-graphite-muted">Quick Simulator</span>
            </div>

            <div className="space-y-2">
              {/* Option 1: Active Member */}
              <button
                type="button"
                onClick={() => processBiometricScan('BIO-FP-8801')}
                className="w-full p-2.5 rounded-control bg-status-success/10 border border-status-success/30 hover:bg-status-success/20 text-left transition-all btn-jelly-secondary flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-success shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-graphite leading-tight truncate">
                      Alex Vance
                    </p>
                    <p className="text-[10px] text-graphite-muted">Active Member • Gate Authorized</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white font-bold text-graphite border border-cloud-border">
                    BIO-FP-8801
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-graphite-muted group-hover:text-graphite group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Option 2: Expired Member */}
              <button
                type="button"
                onClick={() => processBiometricScan('BIO-FP-8804')}
                className="w-full p-2.5 rounded-control bg-status-error/10 border border-status-error/30 hover:bg-status-error/20 text-left transition-all btn-jelly-secondary flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-error shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-graphite leading-tight truncate">
                      Jordan Hayes
                    </p>
                    <p className="text-[10px] text-graphite-muted">Expired Member • Gate Denied</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white font-bold text-graphite border border-cloud-border">
                    BIO-FP-8804
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-graphite-muted group-hover:text-graphite group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Option 3: Unregistered Token */}
              <button
                type="button"
                onClick={() => processBiometricScan('BIO-FP-NEW-990')}
                className="w-full p-2.5 rounded-control bg-cloud-grey border border-cloud-border hover:bg-yellow-soft/40 hover:border-yellow-sunshine/40 text-left transition-all btn-jelly-secondary flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle className="w-3 h-3 text-status-warning shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-graphite leading-tight truncate">
                      Unregistered Fingerprint
                    </p>
                    <p className="text-[10px] text-graphite-muted">New Visitor • Triggers Profile Link</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white font-bold text-graphite border border-cloud-border">
                    BIO-FP-NEW-990
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-graphite-muted group-hover:text-graphite group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Match Intelligence & Member Profile Desk (7 Cols) */}
        <div className="md:col-span-7 glass-panel rounded-card p-5 lg:p-6 border border-cloud-border shadow-card-soft min-h-[460px] flex flex-col justify-between">
          <div>
            {/* Header with Title & Reset Button */}
            <div className="flex items-center justify-between pb-3.5 border-b border-cloud-border mb-4">
              <div>
                <h2 className="text-sm font-bold text-graphite">Biometric Match Intelligence</h2>
                <p className="text-xs text-graphite-muted">Real-time profile lookup retrieved from Secure Cloud Database</p>
              </div>

              {deviceStatus !== 'idle' && (
                <button
                  onClick={handleResetScanner}
                  className="px-2.5 py-1 text-xs font-bold text-graphite hover:bg-cloud-grey rounded-control transition-all flex items-center gap-1 btn-jelly-secondary border border-cloud-border"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset View</span>
                </button>
              )}
            </div>

            {/* Profile Content when Matched */}
            {matchedMember ? (
              <div className="space-y-4 animate-fade-in">
                
                {/* High-Visibility Turnstile Verdict Banner */}
                <div className={`p-4 rounded-card border flex items-center justify-between ${
                  matchedMember.status === 'active'
                    ? 'bg-status-success/15 border-status-success/30 text-status-success'
                    : 'bg-status-error/15 border-status-error/30 text-status-error'
                }`}>
                  <div className="flex items-center gap-3">
                    {matchedMember.status === 'active' ? (
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-black tracking-wide uppercase">
                        {matchedMember.status === 'active' ? 'Gate Unlocked • Access Granted' : 'Turnstile Locked • Access Denied'}
                      </p>
                      <p className="text-[11px] opacity-90 font-medium">
                        {matchedMember.status === 'active' 
                          ? 'Valid membership plan verified in Cloud Database.' 
                          : 'Membership expired. Renewal required for club floor entry.'}
                      </p>
                    </div>
                  </div>
                  {lastMatchTime && (
                    <span className="text-[11px] font-mono font-bold bg-white/70 px-2 py-1 rounded text-graphite border border-cloud-border shrink-0 ml-2">
                      {lastMatchTime}
                    </span>
                  )}
                </div>

                {/* Member Profile Identity Card */}
                <div className="p-4 rounded-card bg-white border border-cloud-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={matchedMember.avatar}
                      alt={matchedMember.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-yellow-sunshine shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-graphite">{matchedMember.name}</h3>
                        <Badge status={matchedMember.status} />
                      </div>
                      <p className="text-xs text-graphite-muted mt-0.5">{matchedMember.planName} Tier</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-cloud-grey font-bold text-graphite">
                          ID: {matchedMember.id}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-yellow-soft font-bold text-graphite flex items-center gap-1">
                          <Fingerprint className="w-3 h-3 text-yellow-active" />
                          <span>{matchedMember.biometricId}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right sm:border-l sm:border-cloud-border sm:pl-4">
                    <span className="text-[10px] font-bold text-graphite-muted uppercase block">Plan Expiry</span>
                    <span className="text-xs font-bold text-graphite block mt-0.5">{matchedMember.expiryDate}</span>
                    <span className="text-[10px] text-graphite-muted block">{matchedMember.email}</span>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-card bg-white border border-cloud-border">
                    <span className="text-graphite-muted text-[10px] font-bold uppercase block">Days Remaining</span>
                    <strong className={`text-base font-black ${matchedMember.status === 'expired' ? 'text-status-error' : 'text-graphite'}`}>
                      {matchedMember.status === 'expired' ? 'Expired' : `${matchedMember.daysLeft} Days`}
                    </strong>
                  </div>

                  <div className="p-3 rounded-card bg-white border border-cloud-border">
                    <span className="text-graphite-muted text-[10px] font-bold uppercase block">Total Visits</span>
                    <strong className="text-base font-black text-graphite">{matchedMember.totalCheckIns} Entries</strong>
                  </div>

                  <div className="p-3 rounded-card bg-white border border-cloud-border">
                    <span className="text-graphite-muted text-[10px] font-bold uppercase block">Emergency Phone</span>
                    <strong className="text-xs font-bold text-graphite truncate block mt-0.5">{matchedMember.phone}</strong>
                  </div>
                </div>

                {/* Quick Front-Desk Actions */}
                <div className="p-3.5 rounded-card bg-cloud-grey/70 border border-cloud-border flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-graphite flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-status-success" />
                    Front Desk Actions:
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRegMemberId(matchedMember.id);
                        setRegToken(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`);
                        setIsRegModalOpen(true);
                      }}
                      className="btn-jelly-secondary px-3 py-1.5 text-xs font-bold rounded-control bg-white border border-cloud-border text-graphite hover:border-yellow-sunshine transition-all flex items-center gap-1"
                      title="Re-register or update this member's fingerprint"
                    >
                      <Link2 className="w-3.5 h-3.5 text-yellow-active" />
                      <span>Re-link Token</span>
                    </button>

                    {matchedMember.status === 'expired' ? (
                      <button
                        onClick={() => updateMemberStatus(matchedMember.id, 'active', 30)}
                        className="btn-jelly-yellow px-4 py-1.5 text-xs font-bold rounded-control shadow-yellow-btn"
                      >
                        Renew (+30 Days)
                      </button>
                    ) : (
                      <button
                        onClick={() => updateMemberStatus(matchedMember.id, 'active', 30)}
                        className="btn-jelly-secondary px-3.5 py-1.5 text-xs font-bold rounded-control bg-white border border-cloud-border text-graphite hover:border-yellow-sunshine transition-all"
                      >
                        Extend +30 Days
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : deviceStatus === 'unknown' ? (
              /* Unregistered Fingerprint Detected & Profile Linking Desk */
              <div className="space-y-4 animate-fade-in text-xs">
                
                {/* Warning Alert */}
                <div className="p-4 rounded-card bg-amber-50 border border-status-warning/40 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-status-warning/20 text-[#B87D1A] flex items-center justify-center shrink-0 mt-0.5">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-graphite">Unregistered Fingerprint Detected</h3>
                    <p className="text-xs text-graphite-muted mt-0.5">
                      Hardware token <code className="font-mono font-bold text-graphite bg-white px-1.5 py-0.5 rounded border border-cloud-border">{scannedToken}</code> is not attached to any profile. Connect it below:
                    </p>
                  </div>
                </div>

                {linkSuccessBanner && (
                  <div className="p-3 rounded-card bg-status-success/15 border border-status-success/30 text-status-success font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{linkSuccessBanner}</span>
                  </div>
                )}

                {/* Option 1: Connect to Existing Member */}
                <div className="p-4 rounded-card bg-white border-2 border-yellow-sunshine/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-cloud-border pb-2">
                    <span className="font-extrabold text-xs text-graphite uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-yellow-active" />
                      Option 1: Connect to Existing Member Profile
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-sunshine text-graphite">
                      Recommended
                    </span>
                  </div>

                  <div>
                    <label className="block text-graphite font-bold mb-1.5 text-xs">
                      Select Member Profile to Attach Token:
                    </label>
                    <select
                      value={selectedMemberToLink}
                      onChange={(e) => setSelectedMemberToLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-input bg-white border border-cloud-border font-semibold text-graphite text-xs focus:outline-none focus:border-yellow-sunshine transition-all"
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.planName} ({m.status.toUpperCase()}) • Existing: {m.biometricId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleLinkBiometricToProfile}
                    disabled={isLinking || !selectedMemberToLink}
                    className="btn-jelly-yellow w-full py-2.5 rounded-control text-xs font-bold flex items-center justify-center gap-2 shadow-yellow-btn"
                  >
                    <Link2 className="w-4 h-4" />
                    <span>{isLinking ? 'Binding Hardware Token...' : `Connect ${scannedToken} to Selected Member`}</span>
                  </button>
                </div>

                {/* Option 2: Enroll New Member */}
                <div className="p-3.5 rounded-card bg-cloud-grey/70 border border-cloud-border flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-graphite text-xs">Option 2: Brand New Member?</h4>
                    <p className="text-[11px] text-graphite-muted">Create a new membership account pre-filled with this token.</p>
                  </div>

                  {onOpenAddMemberWithToken && (
                    <button
                      onClick={() => onOpenAddMemberWithToken(scannedToken)}
                      className="btn-jelly-secondary px-3.5 py-1.5 rounded-control bg-white border border-cloud-border text-graphite hover:border-yellow-sunshine text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-yellow-active" />
                      <span>Enroll Member</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              /* Idle Standby: Professional Gate Readiness Dashboard */
              <div className="space-y-5 animate-fade-in">
                
                {/* Gate Armed Status Card */}
                <div className="p-4 rounded-card bg-white border border-cloud-border shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-status-success/15 flex items-center justify-center text-status-success">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-graphite uppercase tracking-wide">
                        Gate Turnstiles Armed & Ready
                      </h3>
                      <p className="text-[11px] text-graphite-muted">
                        Listening for hardware USB sensor scans or 1-click test simulation.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-status-success/10 text-status-success text-[10px] font-black uppercase tracking-wider">
                    Online
                  </span>
                </div>

                {/* Key Biometric Station Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-card bg-white border border-cloud-border">
                    <span className="text-[10px] font-bold text-graphite-muted uppercase block">Linked Profiles</span>
                    <strong className="text-lg font-black text-graphite mt-0.5 block">{membersWithBiometric} Members</strong>
                    <span className="text-[10px] text-status-success font-semibold">Active credentials</span>
                  </div>

                  <div className="p-3.5 rounded-card bg-white border border-cloud-border">
                    <span className="text-[10px] font-bold text-graphite-muted uppercase block">Today's Scans</span>
                    <strong className="text-lg font-black text-graphite mt-0.5 block">{attendance.length} Verified</strong>
                    <span className="text-[10px] text-graphite-muted">Turnstile entries</span>
                  </div>

                  <div className="p-3.5 rounded-card bg-white border border-cloud-border">
                    <span className="text-[10px] font-bold text-graphite-muted uppercase block">Hardware Latency</span>
                    <strong className="text-lg font-black text-graphite mt-0.5 block">&lt; 0.3s</strong>
                    <span className="text-[10px] text-yellow-active font-semibold">High precision</span>
                  </div>
                </div>

                {/* Callout box */}
                <div className="p-6 rounded-card bg-cloud-grey/60 border border-cloud-border text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto text-yellow-active shadow-xs border border-cloud-border">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <p className="text-xs font-bold text-graphite">Awaiting Member Fingerprint</p>
                    <p className="text-[11px] text-graphite-muted mt-1">
                      Touch the external USB reader or click one of the test scenarios on the left to simulate active or expired entry verification.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRegToken(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`);
                      setIsRegModalOpen(true);
                    }}
                    className="btn-jelly-secondary px-3.5 py-1.5 rounded-control bg-white border border-cloud-border text-graphite hover:border-yellow-sunshine text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5 text-yellow-active" />
                    <span>Register Biometric Manually</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Gate Activity Footer */}
          <div className="pt-3.5 border-t border-cloud-border mt-5 flex items-center justify-between text-xs text-graphite-muted">
            <span className="font-semibold text-graphite flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-yellow-active" />
              <span>Turnstiles Alpha & Beta Activity</span>
            </span>
            <span className="font-mono text-[11px]">{attendance.length} total access events recorded</span>
          </div>
        </div>

      </div>

      {/* Dedicated "Register Biometric to Profile" Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="w-full max-w-md glass-panel rounded-card border border-cloud-border shadow-2xl overflow-hidden flex flex-col bg-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-border bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-control bg-yellow-sunshine flex items-center justify-center text-graphite font-bold shadow-sm">
                  <Fingerprint className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-graphite">Register Biometric to Member</h3>
                  <p className="text-[11px] text-graphite-muted">Connect optical fingerprint hardware token to profile</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRegModalOpen(false)}
                className="p-1.5 rounded-control text-graphite-muted hover:text-graphite hover:bg-cloud-grey transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRegistrationModal} className="p-5 space-y-4">
              
              {/* Member Selection */}
              <div>
                <label className="block text-graphite font-bold mb-1.5 text-xs">Select Member Profile</label>
                <select
                  value={regMemberId}
                  onChange={(e) => setRegMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-input bg-white border border-cloud-border text-graphite font-semibold focus:outline-none focus:border-yellow-sunshine text-xs"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.planName} • {m.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Member Preview Card */}
              {(() => {
                const selected = members.find(m => m.id === regMemberId);
                if (!selected) return null;
                return (
                  <div className="p-3 rounded-card bg-cloud-grey/80 border border-cloud-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={selected.avatar} alt={selected.name} className="w-9 h-9 rounded-full object-cover border border-white" />
                      <div>
                        <span className="font-bold text-graphite block text-xs">{selected.name}</span>
                        <span className="text-[10px] text-graphite-muted">{selected.email}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge status={selected.status} className="scale-90 origin-right" />
                      <span className="text-[10px] font-mono text-graphite-muted block mt-0.5">
                        Current: {selected.biometricId}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Fingerprint Capture / Token Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-graphite font-bold text-xs flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-yellow-active" />
                    Biometric Optical Token ID
                  </label>
                  <button
                    type="button"
                    onClick={() => setRegToken(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="text-[10px] font-bold text-yellow-active hover:underline"
                  >
                    Generate New Token
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={regToken}
                  onChange={(e) => setRegToken(e.target.value.toUpperCase())}
                  placeholder="e.g. BIO-FP-8809"
                  className="w-full px-3 py-2 rounded-input bg-white font-mono font-bold text-graphite border border-cloud-border focus:outline-none focus:border-yellow-sunshine text-xs"
                />
                <p className="text-[10px] text-graphite-muted mt-1">
                  Place finger on scanner, type manually, or use auto-generated token ID.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-cloud-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(false)}
                  disabled={regScanning}
                  className="btn-jelly-secondary px-3.5 py-2 rounded-control bg-cloud-grey border border-cloud-border text-graphite font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regScanning || !regToken.trim()}
                  className="btn-jelly-yellow px-4 py-2 rounded-control text-xs font-bold flex items-center gap-1.5 shadow-yellow-btn"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{regScanning ? 'Connecting...' : 'Connect to Member Profile'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* P2P Cloud Biometric Device Gateway Modal */}
      <P2PBiometricModal 
        isOpen={isP2PModalOpen} 
        onClose={() => setIsP2PModalOpen(false)} 
      />

    </div>
  );
};
