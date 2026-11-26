import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { 
  Cloud, 
  Wifi, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Server, 
  ShieldCheck, 
  Cpu, 
  Fingerprint, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  HelpCircle,
  Radio,
  X
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface P2PBiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const P2PBiometricModal: React.FC<P2PBiometricModalProps> = ({ isOpen, onClose }) => {
  const { members, recordBiometricScan } = useGym();

  const [deviceBrand, setDeviceBrand] = useState<'zkteco' | 'essl' | 'realtime' | 'hikvision' | 'dahua' | 'other'>('zkteco');
  const [deviceSn, setDeviceSn] = useState('BIO-P2P-884920');
  const [connectionMode, setConnectionMode] = useState<'adms' | 'cloud_p2p' | 'local_bridge'>('adms');
  const [serverPort, setServerPort] = useState('443');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'guide' | 'simulator'>('settings');

  // Test Punch Simulator state
  const [testMemberId, setTestMemberId] = useState<string>(members[0]?.id || '');
  const [simulating, setSimulating] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'granted' | 'denied' | 'unknown';
    message?: string;
    timestamp?: string;
    member?: any;
  }>({ status: 'idle' });

  // Webhook URL (Dynamic based on current origin or production cloud)
  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/biometric/p2p-push` 
    : 'https://api.gympro.com/webhook/biometric/p2p-push';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleRunTestPunch = async () => {
    const member = members.find(m => m.id === testMemberId) || members[0];
    if (!member) return;

    setSimulating(true);
    setTestResult({ status: 'idle' });

    // Use member's registered biometricId or their Member ID token
    const token = member.biometricId || member.id;

    setTimeout(async () => {
      const res = await recordBiometricScan(token);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setTestResult({
        status: res.status,
        message: res.message,
        timestamp: timeStr,
        member: res.member
      });
      setSimulating(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-graphite/75 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-cloud-border flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-graphite text-white flex items-center justify-between border-b border-graphite-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-sunshine flex items-center justify-center text-graphite shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">P2P Cloud Biometric Gateway</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success/20 text-status-success font-bold text-[10px] tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping" />
                  Cloud Online
                </span>
              </div>
              <p className="text-xs text-white/70">Connect physical biometric attendance machines over P2P / Internet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cloud-border bg-cloud-grey/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-yellow-sunshine text-graphite font-black'
                : 'border-transparent text-graphite-muted hover:text-graphite'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connection Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-yellow-sunshine text-graphite font-black'
                : 'border-transparent text-graphite-muted hover:text-graphite'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Physical Device Setup Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-yellow-sunshine text-graphite font-black'
                : 'border-transparent text-graphite-muted hover:text-graphite'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Cloud Punch Test</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-graphite">
          
          {/* TAB 1: CONNECTION SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              
              {/* Webhook Push URL (Most Important for P2P/Cloud Devices) */}
              <div className="p-4 rounded-2xl bg-yellow-soft/50 border border-yellow-sunshine/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-graphite text-xs flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-yellow-active" />
                    Your Gym P2P Webhook Server URL:
                  </span>
                  <span className="text-[10px] font-bold text-graphite-muted">Enter this in machine network menu</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full px-3 py-2 rounded-xl bg-white font-mono font-bold text-xs border border-cloud-border select-all"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3.5 py-2 rounded-xl bg-graphite text-yellow-sunshine font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm hover:bg-graphite-light transition-all"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-graphite-muted">
                  Physical devices send instant HTTP/HTTPS POST notifications to this endpoint whenever a member scans their fingerprint, face, or RFID badge.
                </p>
              </div>

              {/* Hardware Device Configuration Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Device Brand */}
                <div>
                  <label className="block font-bold text-graphite mb-1">Device Manufacturer</label>
                  <select
                    value={deviceBrand}
                    onChange={(e: any) => setDeviceBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cloud-grey border border-cloud-border font-semibold focus:outline-none focus:border-yellow-sunshine"
                  >
                    <option value="zkteco">ZKTeco (ADMS / Cloud Push)</option>
                    <option value="essl">eSSL (Cloud P2P / eTimeTrack)</option>
                    <option value="realtime">Realtime (Push Server / Cloud)</option>
                    <option value="hikvision">Hikvision (MinMoe / ISAPI Push)</option>
                    <option value="dahua">Dahua (Access Controller Event)</option>
                    <option value="other">Anviz / Matrix / Other P2P Device</option>
                  </select>
                </div>

                {/* Device Serial Number / P2P Cloud ID */}
                <div>
                  <label className="block font-bold text-graphite mb-1">Device Serial Number (P2P Cloud ID)</label>
                  <input
                    type="text"
                    value={deviceSn}
                    onChange={(e) => setDeviceSn(e.target.value.toUpperCase())}
                    placeholder="e.g. SN-884920-CLOUD"
                    className="w-full px-3 py-2 rounded-xl bg-cloud-grey font-mono font-bold border border-cloud-border focus:outline-none focus:border-yellow-sunshine"
                  />
                </div>

                {/* Connection Protocol */}
                <div>
                  <label className="block font-bold text-graphite mb-1">Cloud Communication Mode</label>
                  <select
                    value={connectionMode}
                    onChange={(e: any) => setConnectionMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cloud-grey border border-cloud-border font-semibold focus:outline-none focus:border-yellow-sunshine"
                  >
                    <option value="adms">ADMS / HTTP Webhook Push (Recommended)</option>
                    <option value="cloud_p2p">Manufacturer Cloud P2P Bridge (Via Cloud ID)</option>
                    <option value="local_bridge">Local Reception Gateway Agent (LAN Bridge)</option>
                  </select>
                </div>

                {/* Server Port */}
                <div>
                  <label className="block font-bold text-graphite mb-1">Server Communication Port</label>
                  <input
                    type="text"
                    value={serverPort}
                    onChange={(e) => setServerPort(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cloud-grey font-mono font-bold border border-cloud-border focus:outline-none focus:border-yellow-sunshine"
                  />
                </div>

              </div>

              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl bg-cloud-grey/70 border border-cloud-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-status-success/20 text-status-success flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-graphite block">Gateway Listening For Punches</span>
                    <span className="text-[10px] text-graphite-muted font-mono">Device SN: {deviceSn} • Port {serverPort}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-status-success text-white">
                  Active
                </span>
              </div>

            </div>
          )}

          {/* TAB 2: STEP-BY-STEP PHYSICAL DEVICE GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cloud-grey/80 border border-cloud-border">
                <h3 className="font-extrabold text-graphite mb-1 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-status-success" />
                  How Physical P2P / Cloud Biometrics Work With GymPro
                </h3>
                <p className="text-xs text-graphite-muted leading-relaxed">
                  Your device connects to the internet via Wi-Fi or Ethernet. It does <strong>not</strong> require a static IP or port forwarding. Whenever a member punches their finger or face, the device automatically sends an outbound cloud webhook to GymPro.
                </p>
              </div>

              {/* Step-by-Step for selected brand */}
              <div className="space-y-3">
                <h4 className="font-bold text-graphite uppercase tracking-wider text-[11px]">
                  Physical Setup for {deviceBrand.toUpperCase()} Machine:
                </h4>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white border border-cloud-border flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-graphite text-yellow-sunshine font-black text-xs flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="block text-graphite">Connect to Network</strong>
                      <p className="text-graphite-muted text-[11px] mt-0.5">Plug an Ethernet cable into the biometric machine or connect it to the gym Wi-Fi network.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-cloud-border flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-graphite text-yellow-sunshine font-black text-xs flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="block text-graphite">Open Machine Menu & Cloud Settings</strong>
                      <p className="text-graphite-muted text-[11px] mt-0.5">
                        Press <strong>Menu / M-OK</strong> on the keypad → Go to <strong>Comm. (Communication)</strong> → Select <strong>Cloud Server Setting</strong> (or <strong>ADMS</strong> / <strong>Webserver</strong>).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-cloud-border flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-graphite text-yellow-sunshine font-black text-xs flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="block text-graphite">Enter Server Address & Port</strong>
                      <p className="text-graphite-muted text-[11px] mt-0.5">
                        Enable Domain Name: <strong>ON</strong>. Enter your server domain or IP address. Set Port to <strong>{serverPort}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-cloud-border flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-graphite text-yellow-sunshine font-black text-xs flex items-center justify-center shrink-0">4</span>
                    <div>
                      <strong className="block text-graphite">Save & Verify Cloud Icon</strong>
                      <p className="text-graphite-muted text-[11px] mt-0.5">
                        Press Save / OK. On the device home screen, the Cloud / Globe icon will turn Green, confirming P2P connection to GymPro.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: LIVE CLOUD PUNCH TEST */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cloud-grey/80 border border-cloud-border">
                <h3 className="font-extrabold text-graphite mb-1 text-sm flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-yellow-active" />
                  Live P2P Cloud Punch Test
                </h3>
                <p className="text-xs text-graphite-muted">
                  Verify the end-to-end integration: Simulate an incoming punch from the physical P2P device and watch GymPro verify active membership and log attendance in real time.
                </p>
              </div>

              {/* Selector & Trigger */}
              <div className="p-4 rounded-2xl bg-white border border-cloud-border space-y-3">
                <label className="block font-bold text-graphite">Select Member To Punch In (Simulating Device):</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={testMemberId}
                    onChange={(e) => setTestMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cloud-grey border border-cloud-border font-semibold text-xs"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.planName} • {m.status.toUpperCase()} • Token: {m.biometricId})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleRunTestPunch}
                    disabled={simulating}
                    className="btn-jelly-yellow px-5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shrink-0 shadow-yellow-btn"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{simulating ? 'Sending Punch...' : 'Simulate P2P Punch'}</span>
                  </button>
                </div>
              </div>

              {/* Test Result Display */}
              {testResult.status !== 'idle' && (
                <div className={`p-4 rounded-2xl border transition-all animate-fade-in ${
                  testResult.status === 'granted'
                    ? 'bg-status-success/10 border-status-success/40 text-graphite'
                    : 'bg-status-error/10 border-status-error/40 text-graphite'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm flex items-center gap-1.5">
                      {testResult.status === 'granted' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-status-success" />
                          <span className="text-status-success">Turnstile Unlocked • Access Granted</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-status-error" />
                          <span className="text-status-error">Access Denied • Membership Inactive</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-cloud-border">
                      {testResult.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-graphite-muted">
                    {testResult.message}
                  </p>

                  {testResult.member && (
                    <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={testResult.member.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-bold text-graphite">{testResult.member.name}</span>
                      </div>
                      <Badge status={testResult.member.status} />
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-cloud-grey/70 border-t border-cloud-border flex items-center justify-between">
          <span className="text-[11px] text-graphite-muted font-medium">
            Protocol: P2P Cloud Push / Webhook API • No static IP required
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-graphite text-white font-bold text-xs hover:bg-graphite-light transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
