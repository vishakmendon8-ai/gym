import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { useUsbBiometric } from '../../hooks/useUsbBiometric';
import { 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Save, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Check, 
  Cpu, 
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';

export const BiometricView: React.FC = () => {
  const { 
    members, 
    saveBiometricEnrollment, 
    deleteBiometricEnrollment, 
    soundEnabled, 
    setSoundEnabled, 
    playAccessTone 
  } = useGym();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [samples, setSamples] = useState({
    sample1: false,
    sample2: false,
    sample3: false
  });
  const [capturingStep, setCapturingStep] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [customToken, setCustomToken] = useState<string>('');
  const [searchMember, setSearchMember] = useState<string>('');

  const { isSensorConnected, sensorName, isReadingData, detectUsbDevice, lastDataRead } = useUsbBiometric();

  const currentMember = members.find(m => m.id === selectedMemberId) || members[0];

  // Auto-generate token if empty when member changes
  React.useEffect(() => {
    if (currentMember) {
      if (currentMember.biometricId && currentMember.biometricId !== 'NONE') {
        setCustomToken(currentMember.biometricId);
      } else {
        setCustomToken(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`);
      }
      setSamples({
        sample1: !!currentMember.biometricRegistered,
        sample2: !!currentMember.biometricRegistered,
        sample3: !!currentMember.biometricRegistered
      });
    }
  }, [selectedMemberId, currentMember]);

  const handleCaptureSample = (step: 1 | 2 | 3) => {
    setCapturingStep(step);
    playAccessTone('beep');

    setTimeout(() => {
      setSamples(prev => ({ ...prev, [`sample${step}`]: true }));
      setCapturingStep(null);
      playAccessTone('granted');
      setFeedbackMsg(`Sample ${step} captured with 99.4% ridge clarity (SIMULATED).`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }, 900);
  };

  const handleSaveEnrollment = async () => {
    if (!currentMember) return;
    const token = customToken || `BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`;
    await saveBiometricEnrollment(currentMember.id, token, samples);
    playAccessTone('granted');
    setFeedbackMsg(`Biometric profile for ${currentMember.name} successfully registered in database!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleDeleteEnrollment = async () => {
    if (!currentMember) return;
    await deleteBiometricEnrollment(currentMember.id);
    setSamples({ sample1: false, sample2: false, sample3: false });
    setCustomToken(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`);
    playAccessTone('denied');
    setFeedbackMsg(`Biometric registration revoked for ${currentMember.name}.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleResetSamples = () => {
    setSamples({ sample1: false, sample2: false, sample3: false });
    playAccessTone('beep');
  };

  // If USB scanner sends data, auto-capture next sample
  useEffect(() => {
    if (lastDataRead) {
      if (!samples.sample1) {
        handleCaptureSample(1);
      } else if (!samples.sample2) {
        handleCaptureSample(2);
      } else if (!samples.sample3) {
        handleCaptureSample(3);
      }
    }
  }, [lastDataRead]);

  const isAllCaptured = samples.sample1 && samples.sample2 && samples.sample3;

  return (
    <div className="space-y-6">
      {/* USB Sensor Status Banner */}
      <div className="bg-gradient-to-r from-[#FFF8E7] to-[#FFF0D0] border border-[#FFD447]/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFD447] text-[#252A30] flex items-center justify-center shrink-0">
            <Fingerprint className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs text-[#252A30] tracking-wider uppercase">
                {isReadingData ? 'READING USB DATA...' : isSensorConnected ? 'BIOMETRIC SENSOR CONNECTED' : 'BIOMETRIC SENSOR NOT DETECTED'}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                isSensorConnected || isReadingData
                  ? 'bg-[#36A875]/20 text-[#36A875]'
                  : 'bg-[#84909A]/15 text-[#84909A]'
              }`}>
                {isReadingData ? 'DATA STREAM ACTIVE' : isSensorConnected ? 'DEVICE READY' : 'SEARCHING USB'}
              </span>
            </div>
            <p className="text-xs text-[#84909A] mt-0.5">
              {isSensorConnected || isReadingData
                ? `${sensorName} optical scanner active. 3-sample validation ensures zero false-reject rates.`
                : 'Connect biometric sensor via USB or tap to scan. 3-sample optical validation active.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isSensorConnected && (
            <button
              onClick={detectUsbDevice}
              className="px-3 py-1.5 rounded-xl border border-[#FFD447] bg-white text-[#252A30] hover:bg-[#FFF8E7] text-xs font-bold transition-all"
            >
              Detect USB Sensor
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto ${
              soundEnabled 
                ? 'bg-white border-[#DCE3E8] text-[#252A30] hover:border-[#FFD447]' 
                : 'bg-[#F5F6F2] border-transparent text-[#84909A]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#36A875]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Audio Chime ON' : 'Audio Muted'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Member Directory Selector */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-[#DCE3E8] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E9ECEF]">
            <h2 className="text-xs font-black text-[#252A30] uppercase tracking-wider">Select Member</h2>
            <span className="text-[10px] font-bold text-[#84909A]">{members.length} Total</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#84909A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter members..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-xs font-semibold text-[#252A30] focus:outline-none focus:border-[#FFD447]"
            />
          </div>

          <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
            {members
              .filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase()) || m.id.toLowerCase().includes(searchMember.toLowerCase()))
              .map((m) => {
                const isSelected = m.id === currentMember?.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-[#252A30] text-white shadow-xs'
                        : 'hover:bg-[#F5F6F2] text-[#252A30]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#DCE3E8] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{m.name}</p>
                        <p className={`text-[10px] font-mono truncate ${isSelected ? 'text-[#FFD447]' : 'text-[#84909A]'}`}>
                          {m.id} • {m.planName}
                        </p>
                      </div>
                    </div>
                    {m.biometricRegistered ? (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                        isSelected ? 'bg-[#36A875] text-white' : 'bg-[#36A875]/15 text-[#36A875]'
                      }`}>
                        Enrolled
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#F5F6F2] text-[#84909A]'
                      }`}>
                        Pending
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right: 3-Sample Enrollment Station */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#DCE3E8] shadow-xs space-y-6">
          {/* Active Member Header Card */}
          {currentMember && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#F5F6F2] border border-[#DCE3E8] gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentMember.avatar}
                  alt={currentMember.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#252A30]">{currentMember.name}</h3>
                    <span className="font-mono text-xs font-bold text-[#84909A]">({currentMember.id})</span>
                  </div>
                  <p className="text-xs text-[#84909A] font-medium mt-0.5">
                    Plan: <span className="text-[#252A30] font-bold">{currentMember.planName}</span> • Status: <span className="font-bold text-[#36A875]">{currentMember.status.toUpperCase()}</span>
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-[#DCE3E8] sm:pl-4">
                <p className="text-[10px] font-bold text-[#84909A] uppercase tracking-wider">Hardware Token ID</p>
                <input
                  type="text"
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  className="font-mono text-xs font-black text-[#252A30] bg-white border border-[#DCE3E8] rounded-lg px-2.5 py-1 text-center mt-1 focus:outline-none focus:border-[#FFD447]"
                />
              </div>
            </div>
          )}

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-[#36A875]/10 border border-[#36A875]/30 text-xs font-bold text-[#36A875] flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* 3-Sample Simulated Capture Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-black text-[#252A30] uppercase tracking-wider">3-Sample Biometric Enrollment</h4>
                <p className="text-xs text-[#84909A]">Capture 3 independent optical finger impressions to build feature map.</p>
              </div>
              <button
                onClick={handleResetSamples}
                className="text-xs font-bold text-[#84909A] hover:text-[#252A30] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([1, 2, 3] as const).map((step) => {
                const isCaptured = samples[`sample${step}`];
                const isBusy = capturingStep === step;

                return (
                  <div
                    key={step}
                    className={`rounded-2xl p-5 border text-center transition-all flex flex-col justify-between items-center ${
                      isCaptured
                        ? 'bg-[#36A875]/5 border-[#36A875]/30 ring-1 ring-[#36A875]/20'
                        : isBusy
                        ? 'bg-[#FFF8E7] border-[#FFD447] animate-pulse'
                        : 'bg-[#F5F6F2]/60 border-[#DCE3E8]'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-[#84909A] uppercase tracking-wider mb-2">
                      Sample {step}
                    </span>

                    <div className={`w-16 h-16 rounded-full flex items-center justify-center my-2 transition-all ${
                      isCaptured
                        ? 'bg-[#36A875] text-white shadow-md shadow-[#36A875]/25'
                        : isBusy
                        ? 'bg-[#FFD447] text-[#252A30] animate-bounce'
                        : 'bg-white border-2 border-dashed border-[#DCE3E8] text-[#84909A]'
                    }`}>
                      <Fingerprint className="w-8 h-8" />
                    </div>

                    <div className="mt-2 w-full">
                      {isCaptured ? (
                        <div className="flex items-center justify-center gap-1 text-xs font-black text-[#36A875]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Captured (99.4%)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCaptureSample(step)}
                          disabled={capturingStep !== null}
                          className="w-full py-2 rounded-xl bg-white border border-[#DCE3E8] hover:border-[#FFD447] text-[#252A30] font-bold text-xs shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
                        >
                          {isBusy ? 'Scanning...' : `Scan Sample ${step}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enrollment Progress Indicator */}
          <div className="bg-[#F5F6F2] p-4 rounded-2xl border border-[#DCE3E8] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                isAllCaptured ? 'bg-[#36A875] text-white' : 'bg-[#FFD447] text-[#252A30]'
              }`}>
                {isAllCaptured ? '3/3' : `${[samples.sample1, samples.sample2, samples.sample3].filter(Boolean).length}/3`}
              </div>
              <div>
                <p className="text-xs font-bold text-[#252A30]">
                  {isAllCaptured ? 'All 3 samples verified and ready to save' : 'Capture remaining samples before registering'}
                </p>
                <p className="text-[11px] text-[#84909A]">
                  Simulated cryptographic hash will be bound to member ID <span className="font-mono text-[#252A30] font-bold">{currentMember?.id}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentMember?.biometricRegistered && (
                <button
                  onClick={handleDeleteEnrollment}
                  className="px-3 py-2 rounded-xl bg-white border border-[#DC5555]/30 text-[#DC5555] hover:bg-[#FFF0F0] font-bold text-xs flex items-center gap-1.5 transition-all"
                  title="Revoke biometric registration"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Registration</span>
                </button>
              )}

              <button
                onClick={handleSaveEnrollment}
                disabled={!isAllCaptured}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD447] to-[#F5C62F] text-[#252A30] font-black text-xs hover:shadow-md hover:shadow-[#FFD447]/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Save className="w-4 h-4" />
                <span>Save Biometric</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
