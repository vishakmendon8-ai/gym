import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Badge } from '../common/Badge';
import { Search, Filter, RefreshCw, AlertTriangle, CalendarCheck, CheckCircle2, Clock, XCircle, ShieldAlert } from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const { subscriptions, members, plans, renewSubscription, deactivateSubscription } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'inactive'>('all');
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRenew = async (id: string) => {
    setRenewingId(id);
    await renewSubscription(id);
    setTimeout(() => setRenewingId(null), 500);
  };

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiringCount = subscriptions.filter(s => s.status === 'expiring').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-[#DCE3E8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="w-5 h-5 text-[#252A30]" />
            <h1 className="text-xl lg:text-2xl font-black text-[#252A30] tracking-tight">
              Subscription Management
            </h1>
          </div>
          <p className="text-xs text-[#84909A]">
            Server-side expiry verification, member billing terms, renewal tracking, and turnstile access policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F5F6F2] px-3.5 py-1.5 rounded-full border border-[#DCE3E8] text-xs font-bold text-[#252A30]">
            <span className="w-2 h-2 rounded-full bg-[#36A875]" />
            <span>{activeCount} Active</span>
            <span className="text-[#84909A]">•</span>
            <span className="w-2 h-2 rounded-full bg-[#EBAE43]" />
            <span>{expiringCount} Expiring</span>
            <span className="text-[#84909A]">•</span>
            <span className="w-2 h-2 rounded-full bg-[#DC5555]" />
            <span>{expiredCount} Expired</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-[#DCE3E8] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#84909A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by member, ID, or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-[#DCE3E8] text-[#252A30] placeholder:text-[#84909A] focus:outline-none focus:border-[#FFD447] focus:ring-2 focus:ring-[#FFD447]/30 transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'active', 'expiring', 'expired', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-[#252A30] text-white shadow-xs'
                  : 'bg-white text-[#84909A] border border-[#DCE3E8] hover:border-[#FFD447]'
              }`}
            >
              {status === 'all' ? 'All Subscriptions' : status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-1.5 opacity-70 text-[10px]">
                ({status === 'all' ? subscriptions.length : subscriptions.filter(s => s.status === status).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-[#DCE3E8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F6F2]/80 border-b border-[#DCE3E8] text-[11px] font-bold text-[#84909A] uppercase tracking-wider">
                <th className="py-3.5 px-4">Subscription ID</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Plan Name</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Access Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {filteredSubscriptions.map((sub) => {
                const member = members.find(m => m.id === sub.memberId);
                return (
                  <tr key={sub.id} className="hover:bg-[#F5F6F2]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#252A30]">
                      {sub.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={sub.memberAvatar || member?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                          alt={sub.memberName}
                          className="w-7 h-7 rounded-full object-cover border border-[#DCE3E8]"
                        />
                        <div>
                          <p className="font-bold text-[#252A30] leading-none">{sub.memberName}</p>
                          <p className="text-[10px] font-mono text-[#84909A] mt-0.5">{sub.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#252A30]">
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#252A30] border border-[#FFD447]/30 font-bold text-[11px]">
                        {sub.planName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#84909A] font-medium">
                      {sub.startDate}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#252A30]">
                      {sub.expiryDate}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#252A30]">
                      ₹{sub.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRenew(sub.id)}
                          disabled={renewingId === sub.id}
                          className="px-2.5 py-1 rounded-lg bg-[#FFD447] text-[#252A30] hover:bg-[#F5C62F] font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
                          title="Renew membership (+30 days)"
                        >
                          <RefreshCw className={`w-3 h-3 ${renewingId === sub.id ? 'animate-spin' : ''}`} />
                          <span>Renew</span>
                        </button>
                        {sub.status !== 'inactive' && (
                          <button
                            onClick={() => deactivateSubscription(sub.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#F5F6F2] text-[#84909A] hover:text-[#DC5555] hover:bg-[#FFF0F0] border border-[#DCE3E8] font-bold text-[11px] transition-all"
                            title="Deactivate subscription"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
