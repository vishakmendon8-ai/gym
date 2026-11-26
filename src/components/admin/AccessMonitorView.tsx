import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { useUsbBiometric } from '../../hooks/useUsbBiometric';
import { 
  MonitorPlay, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Fingerprint, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX,
  Play
} from 'lucide-react';

export const AccessMonitorView: React.FC = () => {
  const { 
    members, 
    accessLogs, 
    simulateAccessScan, 
    soundEnabled, 
    setSoundEnabled 
  } = useGym();

  const [inputToken, setInputToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentVerdict, setCurrentVerdict] = useState<{
    status: 'granted' | 'denied' | 'unknown' | 'idle';
    member?: any;
    message: string;
    timestamp: string;
  }>({
    status: 'idle',
    message: 'Scanner Standby: Place finger on optical sensor or enter token.',
    timestamp: '--:--:--'
  });

  const { isSensorConnected, sensorName, isReadingData, detectUsbDevice, lastDataRead } = useUsbBiometric();

  const handleScan = async (tokenOrId: string) => {
    if (!tokenOrId.trim()) return;
    setIsScanning(true);

    const result = await simulateAccessScan(tokenOrId.trim());
    setIsScanning(false);
    setInputToken('');

    setCurrentVerdict({
      status: result.status,
      member: result.member,
      message: result.message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  // If physical USB scanner streams token data, automatically evaluate scan
  useEffect(() => {
    if (lastDataRead) {
      handleScan(lastDataRead);
    }
  }, [lastDataRead]);

  const activeMembers = members.filter(m => m.status === 'active' && m.biometricRegistered);
  const expiredMembers = members.filter(m => m.status === 'expired');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-[#DCE3E8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#36A875] animate-ping" />
            <h1 className="text-xl lg:text-2xl font-black text-[#252A30] tracking-tight">
              Live Access Monitoring & Turnstile Kiosk
            </h1>
          </div>
          <p className="text-xs text-[#84909A]">
            Real-time biometric entrance controller, active turnstiles telemetry, audio verdicts, and visitor logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* USB Sensor Status Pill */}
          <div 
            onClick={!isSensorConnected ? detectUsbDevice : undefined}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 transition-all ${
              isSensorConnected || isReadingData
                ? 'bg-[#36A875]/10 border-[#36A875]/30 text-[#36A875]'
                : 'bg-white border-[#DCE3E8] text-[#84909A] hover:border-[#FFD447] cursor-pointer'
            }`}
            title={isSensorConnected ? `${sensorName} connected` : 'Click to detect USB sensor'}
          >
            <span className={`w-2 h-2 rounded-full ${
              isReadingData ? 'bg-[#FFD447] animate-ping' : isSensorConnected ? 'bg-[#36A875]' : 'bg-[#84909A]'
            }`} />
            <span>
              {isReadingData ? 'Reading USB...' : isSensorConnected ? 'Sensor Connected' : 'Sensor Not Detected'}
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#36A875]/10 border border-[#36A875]/30 text-[#36A875] text-xs font-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#36A875]" />
            <span>Turnstile Gates Online</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              soundEnabled 
                ? 'bg-white border-[#DCE3E8] text-[#252A30] hover:border-[#FFD447]' 
                : 'bg-[#F5F6F2] border-transparent text-[#84909A]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#36A875]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Main Kiosk Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Entrance Terminal Display */}
        <div className="lg:col-span-7 bg-[#252A30] rounded-3xl p-6 text-white shadow-xl border border-[#3E4550] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#3E4550]">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-[#FFD447]" />
              <span className="font-bold text-xs uppercase tracking-wider text-[#A0AEC0]">Entrance Gate A • Optical Sensor 500 DPI</span>
            </div>
            <span className="font-mono text-xs text-[#FFD447] font-black">
              {currentVerdict.timestamp}
            </span>
          </div>

          {/* Big Live Verdict Card */}
          <div className={`p-8 rounded-2xl border text-center transition-all ${
            currentVerdict.status === 'granted'
              ? 'bg-[#36A875]/15 border-[#36A875] shadow-lg shadow-[#36A875]/20'
              : currentVerdict.status === 'denied' || currentVerdict.status === 'unknown'
              ? 'bg-[#DC5555]/15 border-[#DC5555] shadow-lg shadow-[#DC5555]/20'
              : 'bg-[#2D333B] border-[#3E4550]'
          }`}>
            {currentVerdict.status === 'granted' ? (
              <div className="space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-[#36A875] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#36A875]/40 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#36A875] text-white font-black text-xs uppercase tracking-widest">
                    ACCESS GRANTED
                  </span>
                  <h2 className="text-2xl font-black text-white mt-3">
                    {currentVerdict.member?.name}
                  </h2>
                  <p className="text-sm text-[#FFD447] font-semibold mt-0.5">
                    {currentVerdict.member?.planName} • ID: {currentVerdict.member?.id}
                  </p>
                  <p className="text-xs text-[#A0AEC0] mt-2 font-mono">
                    {currentVerdict.message}
                  </p>
                </div>
              </div>
            ) : currentVerdict.status === 'denied' || currentVerdict.status === 'unknown' ? (
              <div className="space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-[#DC5555] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#DC5555]/40">
                  <XCircle className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#DC5555] text-white font-black text-xs uppercase tracking-widest">
                    ACCESS DENIED
                  </span>
                  <h2 className="text-2xl font-black text-white mt-3">
                    {currentVerdict.member ? currentVerdict.member.name : 'Unrecognized Member'}
                  </h2>
                  <p className="text-sm text-[#DC5555] font-bold mt-0.5">
                    {currentVerdict.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-20 h-20 rounded-full bg-[#353C46] text-[#FFD447] flex items-center justify-center mx-auto border-2 border-dashed border-[#FFD447]/40 animate-pulse">
                  <Fingerprint className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Turnstile Gate Ready</h3>
                  <p className="text-xs text-[#84909A] max-w-sm mx-auto mt-1">
                    {currentVerdict.message}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input / Wedge Token Reader */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider">
              Simulate External Scanner Token / USB-HID Input
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. BIO-FP-8801 or GYM0341..."
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan(inputToken)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D333B] border border-[#3E4550] text-white text-xs font-mono font-bold focus:outline-none focus:border-[#FFD447] placeholder:text-[#84909A]"
              />
              <button
                onClick={() => handleScan(inputToken)}
                disabled={isScanning || !inputToken.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#FFD447] text-[#252A30] font-black text-xs hover:bg-[#F5C62F] transition-all disabled:opacity-50"
              >
                Scan
              </button>
            </div>
          </div>
        </div>

        {/* Right: 1-Click Simulation Buttons & Recent Access Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Simulation Triggers */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE3E8] shadow-xs space-y-3">
            <h3 className="text-xs font-black text-[#252A30] uppercase tracking-wider">
              1-Click Hardware Test Simulations
            </h3>
            <p className="text-xs text-[#84909A]">
              Test realistic entrance decision logic with live audio feedback.
            </p>

            <div className="space-y-2 pt-1">
              {activeMembers.slice(0, 2).map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleScan(m.biometricId)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#36A875]/5 hover:bg-[#36A875]/15 border border-[#36A875]/30 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#36A875]" />
                    <div>
                      <p className="text-xs font-bold text-[#252A30] group-hover:text-[#36A875]">Scan Active Member ({m.name})</p>
                      <p className="text-[10px] font-mono text-[#84909A]">{m.biometricId} • {m.planName}</p>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-[#36A875]" />
                </button>
              ))}

              {expiredMembers.slice(0, 1).map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleScan(m.biometricId || m.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#DC5555]/5 hover:bg-[#DC5555]/15 border border-[#DC5555]/30 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC5555]" />
                    <div>
                      <p className="text-xs font-bold text-[#252A30] group-hover:text-[#DC5555]">Scan Expired Member ({m.name})</p>
                      <p className="text-[10px] font-mono text-[#84909A]">Plan Expired</p>
                    </div>
                  </div>
                  <UserX className="w-4 h-4 text-[#DC5555]" />
                </button>
              ))}

              <button
                onClick={() => handleScan('BIO-FP-UNKNOWN-999')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#EBAE43]/5 hover:bg-[#EBAE43]/15 border border-[#EBAE43]/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EBAE43]" />
                  <div>
                    <p className="text-xs font-bold text-[#252A30] group-hover:text-[#EBAE43]">Scan Unregistered Fingerprint</p>
                    <p className="text-[10px] font-mono text-[#84909A]">BIO-FP-UNKNOWN-999</p>
                  </div>
                </div>
                <AlertTriangle className="w-4 h-4 text-[#EBAE43]" />
              </button>
            </div>
          </div>

          {/* Recent Access Logs */}
          <div className="bg-white rounded-2xl p-5 border border-[#DCE3E8] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9ECEF]">
              <h3 className="text-xs font-black text-[#252A30] uppercase tracking-wider">
                Recent Access Logs
              </h3>
              <span className="text-[10px] font-mono text-[#84909A]">{accessLogs.length} Records</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {accessLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={log.avatar}
                      alt={log.memberName}
                      className="w-7 h-7 rounded-full object-cover border border-[#DCE3E8] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[#252A30] truncate leading-tight">{log.memberName}</p>
                      <p className="text-[10px] text-[#84909A] truncate">{log.time} • {log.terminalId}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase shrink-0 ${
                    log.status === 'granted'
                      ? 'bg-[#36A875]/15 text-[#36A875]'
                      : 'bg-[#DC5555]/15 text-[#DC5555]'
                  }`}>
                    {log.status === 'granted' ? 'Granted' : 'Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
