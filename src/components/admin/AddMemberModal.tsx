import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { X, UserPlus, Check, User, Phone, Mail, Calendar, MapPin, ShieldAlert, Sparkles, Fingerprint, CheckCircle2, RotateCcw } from 'lucide-react';
import { useUsbBiometric } from '../../hooks/useUsbBiometric';

export const AddMemberModal: React.FC = () => {
  const { isAddMemberOpen, setIsAddMemberOpen, addMember, plans, playAccessTone } = useGym();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [dob, setDob] = useState('1998-05-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('Surathkal, Mangalore');
  const [planId, setPlanId] = useState('plan-monthly');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3-Sample Biometric Enrollment State
  const [bioToken, setBioToken] = useState<string>(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [samples, setSamples] = useState({
    sample1: false,
    sample2: false,
    sample3: false
  });
  const [capturingStep, setCapturingStep] = useState<1 | 2 | 3 | 'all' | null>(null);

  // USB Biometric Sensor Detection Hook
  const { isSensorConnected, sensorName, isReadingData, detectUsbDevice, lastDataRead } = useUsbBiometric();

  // Reset or regenerate token when modal opens
  useEffect(() => {
    if (isAddMemberOpen) {
      setBioToken(`BIO-FP-${Math.floor(1000 + Math.random() * 9000)}`);
      setSamples({ sample1: false, sample2: false, sample3: false });
      setCapturingStep(null);
    }
  }, [isAddMemberOpen]);

  // If USB scanner sends data while modal is open, auto-advance sample capture
  useEffect(() => {
    if (isAddMemberOpen && lastDataRead) {
      if (!samples.sample1) {
        handleCaptureSample(1);
      } else if (!samples.sample2) {
        handleCaptureSample(2);
      } else if (!samples.sample3) {
        handleCaptureSample(3);
      }
    }
  }, [lastDataRead, isAddMemberOpen]);

  if (!isAddMemberOpen) return null;

  const handleCaptureSample = (step: 1 | 2 | 3) => {
    setCapturingStep(step);
    playAccessTone('beep');

    setTimeout(() => {
      setSamples(prev => ({ ...prev, [`sample${step}`]: true }));
      setCapturingStep(null);
      playAccessTone('granted');
    }, 600);
  };

  const handleCaptureAll = () => {
    setCapturingStep('all');
    playAccessTone('beep');

    setTimeout(() => {
      setSamples({ sample1: true, sample2: true, sample3: true });
      setCapturingStep(null);
      playAccessTone('granted');
    }, 900);
  };

  const handleResetSamples = () => {
    setSamples({ sample1: false, sample2: false, sample3: false });
    playAccessTone('beep');
  };

  const capturedCount = [samples.sample1, samples.sample2, samples.sample3].filter(Boolean).length;
  const isAllCaptured = capturedCount === 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    const selectedPlan = plans.find(p => p.id === planId) || plans[0];
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(now.getMonth() + selectedPlan.durationMonths);

    // Save member connected to the 3-sample biometric template
    await addMember({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dob,
      gender,
      address,
      avatar: gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      status: 'active',
      joinDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiryDate: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      biometricId: bioToken,
      biometricRegistered: isAllCaptured || capturedCount > 0,
      biometricSamples: samples,
      daysLeft: selectedPlan.durationMonths * 30,
      totalCheckIns: 1,
      emergencyContact: emergencyContact || 'Contact (+91 98765 00000)'
    });

    setIsSubmitting(false);
    setIsAddMemberOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252A30]/65 backdrop-blur-sm animate-fade-in text-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#DCE3E8] overflow-hidden flex flex-col my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9ECEF] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#FFD447] to-[#F5C62F] text-[#252A30] flex items-center justify-center font-black shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#252A30] leading-none">Add New Member</h2>
              <p className="text-[11px] text-[#84909A] font-medium mt-0.5">Enroll athlete and assign initial membership</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddMemberOpen(false)}
            className="p-1.5 rounded-lg text-[#84909A] hover:text-[#252A30] hover:bg-[#F5F6F2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#252A30] font-bold mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-[#252A30] font-semibold focus:outline-none focus:border-[#FFD447] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[#252A30] font-bold mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="athlete@gympro.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-[#252A30] font-semibold focus:outline-none focus:border-[#FFD447] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[#252A30] font-bold mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-[#252A30] font-semibold focus:outline-none focus:border-[#FFD447] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[#252A30] font-bold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-[#252A30] font-semibold focus:outline-none focus:border-[#FFD447] focus:bg-white transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[#252A30] font-bold mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-[#252A30] font-semibold focus:outline-none focus:border-[#FFD447] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Membership Plan Assignment */}
          <div>
            <label className="block text-[#252A30] font-bold mb-1">Membership Plan</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-[#252A30] font-bold focus:outline-none focus:border-[#FFD447] focus:bg-white transition-all"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.price.toLocaleString('en-IN')} / {p.durationMonths} Mo {p.offerTag ? `(${p.offerTag})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#252A30] font-bold mb-1">Residential Address</label>
              <input
                type="text"
                placeholder="Street, City, Postal Code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-[#252A30] font-semibold focus:outline-none focus:border-[#FFD447] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[#252A30] font-bold mb-1">Emergency Contact</label>
              <input
                type="text"
                placeholder="Name & Phone Number"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F6F2] border border-[#DCE3E8] text-[#252A30] font-semibold focus:outline-none focus:border-[#FFD447] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 3-Sample Biometric Enrollment & USB Sensor Module */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8E7]/50 border border-[#FFD447]/60 space-y-3">
            {/* Sensor Detection Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#FFD447]/30">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#252A30]" />
                <span className="font-extrabold text-xs text-[#252A30] uppercase tracking-wider">
                  3-Sample Biometric Enrollment
                </span>
              </div>

              {/* USB Sensor Status Pill */}
              <div 
                onClick={!isSensorConnected ? detectUsbDevice : undefined}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all ${
                  isSensorConnected || isReadingData
                    ? 'bg-[#36A875]/15 border border-[#36A875]/40 text-[#36A875]'
                    : 'bg-white border border-[#DCE3E8] text-[#84909A] hover:border-[#FFD447] cursor-pointer'
                }`}
                title={isSensorConnected ? `${sensorName} connected and active` : 'Click to detect USB sensor'}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  isReadingData 
                    ? 'bg-[#FFD447] animate-ping' 
                    : isSensorConnected 
                    ? 'bg-[#36A875] animate-pulse' 
                    : 'bg-[#84909A]'
                }`} />
                <span className="font-black text-[11px]">
                  {isReadingData
                    ? 'Reading USB Data...'
                    : isSensorConnected
                    ? 'Sensor Connected'
                    : 'Sensor Not Detected'}
                </span>
              </div>
            </div>

            {/* 3 Biometric Sample Slots */}
            <div className="grid grid-cols-3 gap-2.5">
              {([1, 2, 3] as const).map((step) => {
                const isCaptured = samples[`sample${step}`];
                const isBusy = capturingStep === step || capturingStep === 'all';

                return (
                  <div
                    key={step}
                    onClick={() => !isCaptured && handleCaptureSample(step)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                      isCaptured
                        ? 'bg-[#36A875]/10 border-[#36A875]/40 text-[#36A875]'
                        : isBusy
                        ? 'bg-[#FFF8E7] border-[#FFD447] ring-2 ring-[#FFD447]/50 animate-pulse'
                        : 'bg-white border-[#DCE3E8] hover:border-[#FFD447] hover:shadow-xs'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#84909A]">
                      Sample {step}
                    </span>

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center my-1.5 transition-all ${
                      isCaptured
                        ? 'bg-[#36A875] text-white shadow-xs'
                        : isBusy
                        ? 'bg-[#FFD447] text-[#252A30] animate-bounce'
                        : 'bg-[#F5F6F2] text-[#84909A]'
                    }`}>
                      <Fingerprint className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-extrabold">
                      {isCaptured ? '99.4% Verified' : isBusy ? 'Scanning...' : 'Tap to Scan'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Status & Quick Action Controls */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  isAllCaptured 
                    ? 'bg-[#36A875] text-white' 
                    : 'bg-[#252A30] text-white'
                }`}>
                  {isAllCaptured ? '3/3 Enrolled' : `${capturedCount}/3 Captured`}
                </span>
                <span className="font-mono text-[#84909A] text-[10px]">
                  Token: <strong className="text-[#252A30]">{bioToken}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isAllCaptured && (
                  <button
                    type="button"
                    onClick={handleCaptureAll}
                    disabled={capturingStep !== null}
                    className="text-[11px] font-bold text-[#252A30] hover:text-[#E5B82A] underline disabled:opacity-50"
                  >
                    Scan All 3 Samples
                  </button>
                )}
                {capturedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetSamples}
                    className="text-[11px] font-bold text-[#84909A] hover:text-[#DC5555]"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#E9ECEF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-[#F5F6F2] hover:bg-[#E9ECEF] text-[#252A30] font-bold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD447] to-[#F5C62F] text-[#252A30] font-black text-xs shadow-md shadow-[#FFD447]/30 btn-jelly-yellow flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.6]" />
              <span>{isSubmitting ? 'Registering...' : 'Save Member & Enroll'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
