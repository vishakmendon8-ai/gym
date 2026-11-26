import React, { useState, useEffect } from 'react';
import { Plan } from '../../types/gym';
import { useGym } from '../../context/GymContext';
import { 
  X, 
  Tag, 
  Percent, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Zap, 
  Award, 
  IndianRupee,
  Calendar,
  Flame
} from 'lucide-react';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null; // null means adding a new plan
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({ isOpen, onClose, plan }) => {
  const { updatePlan, addPlan, deletePlan } = useGym();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [price, setPrice] = useState<number>(3999);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [popular, setPopular] = useState<boolean>(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  // Offer fields
  const [hasOffer, setHasOffer] = useState<boolean>(false);
  const [originalPrice, setOriginalPrice] = useState<number>(4999);
  const [offerTag, setOfferTag] = useState<string>('20% OFF');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setTagline(plan.tagline || '');
      setPrice(plan.price);
      setDurationMonths(plan.durationMonths || 1);
      setPopular(!!plan.popular);
      setFeatures([...plan.features]);
      if (plan.originalPrice && plan.originalPrice > plan.price) {
        setHasOffer(true);
        setOriginalPrice(plan.originalPrice);
        setOfferTag(plan.offerTag || 'SPECIAL OFFER');
      } else if (plan.offerTag) {
        setHasOffer(true);
        setOriginalPrice(Math.round(plan.price * 1.25));
        setOfferTag(plan.offerTag);
      } else {
        setHasOffer(false);
        setOriginalPrice(Math.round(plan.price * 1.25));
        setOfferTag('20% OFF');
      }
    } else {
      // New plan defaults
      setName('Pro Athlete Access');
      setTagline('All-inclusive fitness and functional training');
      setPrice(4999);
      setDurationMonths(1);
      setPopular(false);
      setFeatures([
        'Full 24/7 Gym Floor Access',
        'Locker Room & Sauna Amenities',
        'Biometric Quick Gate Access',
        'Mobile App Workout Logging'
      ]);
      setHasOffer(false);
      setOriginalPrice(5999);
      setOfferTag('SAVE ₹1,000');
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    setIsSubmitting(true);

    const planPayload = {
      name: name.trim(),
      tagline: tagline.trim(),
      price: Number(price),
      originalPrice: hasOffer && Number(originalPrice) > Number(price) ? Number(originalPrice) : undefined,
      offerTag: hasOffer && offerTag.trim() ? offerTag.trim() : undefined,
      durationMonths: Number(durationMonths),
      popular,
      features: features.filter(f => f.trim().length > 0)
    };

    if (plan) {
      await updatePlan(plan.id, planPayload);
    } else {
      await addPlan(planPayload);
    }

    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (plan && confirm(`Are you sure you want to delete "${plan.name}" plan tier?`)) {
      await deletePlan(plan.id);
      onClose();
    }
  };

  const quickOfferPresets = [
    '20% OFF',
    'SAVE ₹2,000',
    'SAVE ₹5,000',
    'FESTIVE OFFER',
    'DIWALI SPECIAL',
    'LIMITED DEAL'
  ];

  const savingsAmount = hasOffer && originalPrice > price ? originalPrice - price : 0;
  const savingsPercent = hasOffer && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/60 backdrop-blur-sm animate-fade-in text-xs overflow-y-auto">
      <div className="w-full max-w-xl glass-panel rounded-card border border-cloud-border shadow-2xl bg-white overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cloud-border bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-control bg-yellow-sunshine flex items-center justify-center text-graphite font-black shadow-sm">
              <Tag className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-graphite">
                {plan ? `Edit Plan Tier — ${plan.name}` : 'Create New Membership Plan'}
              </h2>
              <p className="text-[11px] text-graphite-muted">
                Configure pricing, billing duration, included amenities, and promotional offers.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-control text-graphite-muted hover:text-graphite hover:bg-cloud-grey transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Section 1: Plan Basics */}
          <div className="space-y-3">
            <span className="text-[11px] font-black text-graphite uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-yellow-active" /> Plan Identity & Cycle
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-graphite font-bold mb-1 text-[11px]">Plan Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elite Performance"
                  className="w-full px-3 py-2 rounded-input bg-white border border-cloud-border font-bold text-graphite text-xs focus:outline-none focus:border-yellow-sunshine transition-all"
                />
              </div>

              <div>
                <label className="block text-graphite font-bold mb-1 text-[11px]">Billing Cycle</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-input bg-white border border-cloud-border font-bold text-graphite text-xs focus:outline-none focus:border-yellow-sunshine transition-all"
                >
                  <option value={1}>1 Month (Monthly Access)</option>
                  <option value={3}>3 Months (Quarterly Season)</option>
                  <option value={6}>6 Months (Half-Yearly)</option>
                  <option value={12}>12 Months (Annual Elite)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-graphite font-bold mb-1 text-[11px]">Tagline / Short Description</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Essential access for disciplined fitness enthusiasts"
                className="w-full px-3 py-2 rounded-input bg-white border border-cloud-border text-graphite text-xs focus:outline-none focus:border-yellow-sunshine transition-all"
              />
            </div>
          </div>

          {/* Section 2: Promotional Offer & Pricing */}
          <div className="p-4 rounded-card bg-amber-50/60 border border-yellow-sunshine/50 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-yellow-active fill-yellow-sunshine" />
                <span className="text-xs font-black text-graphite uppercase tracking-wide">
                  Pricing & Promotional Offers
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasOffer}
                  onChange={(e) => setHasOffer(e.target.checked)}
                  className="w-4 h-4 text-yellow-sunshine rounded focus:ring-yellow-sunshine"
                />
                <span className="font-extrabold text-[11px] text-graphite">
                  Enable Special Offer
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Selling Price */}
              <div>
                <label className="block text-graphite font-bold mb-1 text-[11px]">
                  {hasOffer ? 'Special Offer Price (₹)' : 'Standard Plan Price (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-yellow-active text-xs">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-input bg-white border border-cloud-border font-black text-graphite text-xs focus:outline-none focus:border-yellow-sunshine transition-all"
                  />
                </div>
              </div>

              {/* Original Strikethrough Price (if offer enabled) */}
              {hasOffer && (
                <div>
                  <label className="block text-graphite font-bold mb-1 text-[11px]">
                    Original MRP (Strikethrough ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-graphite-muted text-xs">₹</span>
                    <input
                      type="number"
                      min={price + 1}
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      placeholder="e.g. 11999"
                      className="w-full pl-7 pr-3 py-2 rounded-input bg-white border border-cloud-border font-bold text-graphite-muted line-through text-xs focus:outline-none focus:border-yellow-sunshine transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Offer Tag and Quick Presets */}
            {hasOffer && (
              <div className="space-y-2 pt-1 border-t border-yellow-sunshine/30">
                <div className="flex items-center justify-between">
                  <label className="block text-graphite font-bold text-[11px]">
                    Offer Badge / Promo Text
                  </label>
                  {savingsAmount > 0 && (
                    <span className="text-[10px] font-bold text-status-success">
                      Saves ₹{savingsAmount.toLocaleString('en-IN')} ({savingsPercent}% OFF)
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={offerTag}
                  onChange={(e) => setOfferTag(e.target.value)}
                  placeholder="e.g. 20% OFF or SAVE ₹2,000"
                  className="w-full px-3 py-2 rounded-input bg-white border border-cloud-border font-black text-graphite text-xs focus:outline-none focus:border-yellow-sunshine transition-all"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-graphite-muted font-semibold mr-1">Presets:</span>
                  {quickOfferPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setOfferTag(preset)}
                      className="px-2 py-0.5 rounded-full bg-white border border-yellow-sunshine/60 text-graphite hover:bg-yellow-soft font-bold text-[10px] transition-all"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Live Offer Preview Card */}
                <div className="p-3 rounded-card bg-white border border-yellow-sunshine/50 flex items-center justify-between shadow-xs mt-2">
                  <span className="text-[10px] font-bold text-graphite-muted uppercase">Preview Card Pill</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-sunshine text-graphite font-black text-[10px] uppercase shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-graphite text-graphite" />
                      {offerTag || 'SPECIAL OFFER'}
                    </span>
                    <span className="text-xs line-through text-graphite-muted">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-black text-graphite">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Popular Badge Toggle */}
          <div className="p-3.5 rounded-card bg-cloud-grey/70 border border-cloud-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-yellow-active fill-yellow-sunshine" />
              <div>
                <span className="font-extrabold text-graphite block text-xs">Featured / "Most Popular" Tier</span>
                <span className="text-[11px] text-graphite-muted">Highlights this plan with a golden badge and glowing border</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="w-4 h-4 text-yellow-sunshine rounded focus:ring-yellow-sunshine cursor-pointer"
            />
          </div>

          {/* Section 4: Included Amenities / Features */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-graphite uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-status-success stroke-[3]" /> Included Club Amenities
              </span>
              <span className="text-[10px] text-graphite-muted">{features.length} amenities added</span>
            </div>

            {/* Existing Features List */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {features.map((feat, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-control bg-cloud-grey/70 border border-cloud-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-3 h-3 text-status-success shrink-0 stroke-[3]" />
                    <span className="text-xs font-semibold text-graphite truncate">{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="p-1 rounded text-graphite-muted hover:text-status-error transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Feature Row */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Type amenity and press Enter (e.g. 24/7 Sauna Access)..."
                className="flex-1 px-3 py-2 rounded-input bg-white border border-cloud-border text-graphite text-xs focus:outline-none focus:border-yellow-sunshine transition-all"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="btn-jelly-secondary px-3 py-2 rounded-control bg-graphite text-white font-bold text-xs flex items-center gap-1 hover:bg-black"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-cloud-border flex items-center justify-between gap-3 sticky bottom-0 bg-white">
            {plan ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-control text-status-error hover:bg-status-error/10 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Plan</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-jelly-secondary px-4 py-2 rounded-control bg-cloud-grey border border-cloud-border text-graphite font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="btn-jelly-yellow px-5 py-2 rounded-control text-xs font-black shadow-yellow-btn flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? 'Saving...' : plan ? 'Save Plan Changes' : 'Create Plan Tier'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
