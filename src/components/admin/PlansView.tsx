import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Plan } from '../../types/gym';
import { Check, Zap, Award, Edit3, Flame, Plus, ExternalLink, Sparkles } from 'lucide-react';
import { EditPlanModal } from './EditPlanModal';

export const PlansView: React.FC = () => {
  const { plans, setActiveView } = useGym();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-card p-5 lg:p-6 border border-cloud-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-graphite tracking-tight">
              Membership Tiers & Subscriptions
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-yellow-sunshine/30 text-graphite font-bold text-[10px] uppercase">
              {plans.length} Tiers Active
            </span>
          </div>
          <p className="text-xs text-graphite-muted mt-1">
            Configure club access packages, seasonal discounts, promotional offers, and biometric permissions.
          </p>
        </div>

        <button
          onClick={handleCreatePlan}
          className="btn-jelly-yellow px-4 py-2.5 rounded-control text-xs font-black flex items-center gap-2 shadow-yellow-btn shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add New Plan Tier</span>
        </button>
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const hasDiscount = plan.originalPrice && plan.originalPrice > plan.price;
          const savings = hasDiscount ? plan.originalPrice! - plan.price : 0;

          return (
            <div
              key={plan.id}
              className={`glass-panel rounded-panel p-6 border transition-all duration-300 relative flex flex-col justify-between hover:shadow-glass-hover bg-white ${
                plan.popular
                  ? 'border-yellow-sunshine shadow-yellow-btn/30 ring-2 ring-yellow-sunshine/30'
                  : 'border-cloud-border'
              }`}
            >
              {/* Badges Bar (Most Popular & Promotional Offer) */}
              <div className="absolute -top-3 inset-x-4 flex items-center justify-between pointer-events-none">
                {plan.popular ? (
                  <span className="px-3 py-0.5 rounded-full bg-yellow-sunshine text-graphite font-black text-[10px] tracking-wider uppercase shadow-sm flex items-center gap-1 pointer-events-auto">
                    <Zap className="w-3 h-3 fill-graphite text-graphite" />
                    Most Popular
                  </span>
                ) : <span />}

                {plan.offerTag && (
                  <span className="px-3 py-0.5 rounded-full bg-graphite text-yellow-sunshine font-black text-[10px] tracking-wider uppercase shadow-sm flex items-center gap-1 pointer-events-auto">
                    <Flame className="w-3 h-3 text-yellow-sunshine fill-yellow-sunshine" />
                    {plan.offerTag}
                  </span>
                )}
              </div>

              <div>
                {/* Header Details */}
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-graphite-muted">
                    Tier {plan.durationMonths === 1 ? 'Monthly' : plan.durationMonths === 3 ? 'Quarterly' : plan.durationMonths === 6 ? 'Half-Yearly' : 'Annual'}
                  </span>
                  {plan.popular ? (
                    <Zap className="w-4 h-4 text-yellow-active fill-yellow-sunshine" />
                  ) : (
                    <Award className="w-4 h-4 text-graphite-muted" />
                  )}
                </div>

                <h2 className="text-xl font-black text-graphite mb-1">{plan.name}</h2>
                <p className="text-xs text-graphite-muted mb-5 min-h-[32px]">{plan.tagline}</p>

                {/* Price Display with Offer Strikethrough & Savings */}
                <div className="p-4 rounded-card bg-cloud-grey/50 border border-cloud-border mb-6">
                  {hasDiscount && (
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs line-through text-graphite-muted font-bold">
                        ₹{plan.originalPrice!.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-black text-status-success uppercase bg-status-success/10 px-1.5 py-0.5 rounded">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-graphite tracking-tight">
                      <span className="text-yellow-active mr-0.5">₹</span>
                      {plan.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-graphite-muted font-semibold">
                      / {plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} months`}
                    </span>
                  </div>
                </div>

                {/* Amenities list */}
                <div className="space-y-2.5 mb-6">
                  <p className="text-[11px] font-bold text-graphite uppercase tracking-wider">Included Amenities</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-graphite">
                      <div className="w-4 h-4 rounded-full bg-yellow-soft text-graphite flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button: Edit Plan & Offers */}
              <div className="pt-4 border-t border-cloud-border">
                <button
                  type="button"
                  onClick={() => handleEditPlan(plan)}
                  className="btn-jelly-yellow w-full py-2.5 rounded-control text-xs font-black flex items-center justify-center gap-2 shadow-yellow-btn"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Plan & Offers</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit/Create Plan Modal */}
      <EditPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />

    </div>
  );
};
