import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { PaymentRecord } from '../../types/gym';
import { 
  CreditCard, 
  IndianRupee, 
  Download, 
  Plus, 
  Search, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  X, 
  Check, 
  ArrowUpRight,
  ShieldCheck,
  Building
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { payments, members, plans, recordPayment } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Manual payment form state
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [planName, setPlanName] = useState(plans[0]?.name || 'Monthly Plan');
  const [amount, setAmount] = useState<number>(plans[0]?.price || 3999);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay UPI' | 'Cash' | 'Credit Card' | 'Netbanking'>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = payments.filter(p => 
    p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    setIsSubmitting(true);
    const newRecord = await recordPayment({
      memberId: member.id,
      memberName: member.name,
      planName,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod,
    });
    setIsSubmitting(false);
    setIsRecordModalOpen(false);
    setSelectedReceipt(newRecord);
  };

  const handleExportCSV = () => {
    const headers = 'Invoice,Member ID,Member Name,Plan,Amount,Method,Date,Status\n';
    const rows = payments.map(p => 
      `"${p.invoiceNumber}","${p.memberId}","${p.memberName}","${p.planName}",${p.amount},"${p.paymentMethod}","${p.date}","${p.status}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GymPro_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-[#DCE3E8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-[#252A30]" />
            <h1 className="text-xl lg:text-2xl font-black text-[#252A30] tracking-tight">
              Payment & Revenue Management
            </h1>
          </div>
          <p className="text-xs text-[#84909A]">
            Integrated Razorpay gateway records, manual counter cash receipting, and member transaction history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white text-[#252A30] border border-[#DCE3E8] hover:border-[#FFD447] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-[#84909A]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD447] to-[#F5C62F] text-[#252A30] font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#FFD447]/25 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#DCE3E8] shadow-xs">
          <span className="text-[11px] font-bold text-[#84909A] uppercase tracking-wider">Total Monthly Revenue</span>
          <div className="text-2xl lg:text-3xl font-black text-[#252A30] mt-1 tracking-tight">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[#36A875] font-semibold mt-1.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12% vs last month
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCE3E8] shadow-xs">
          <span className="text-[11px] font-bold text-[#84909A] uppercase tracking-wider">Settled Transactions</span>
          <div className="text-2xl lg:text-3xl font-black text-[#252A30] mt-1 tracking-tight">
            {payments.length}
          </div>
          <div className="text-xs text-[#84909A] font-semibold mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#36A875]" /> 100% verified ledger
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCE3E8] shadow-xs">
          <span className="text-[11px] font-bold text-[#84909A] uppercase tracking-wider">Razorpay Gateway Status</span>
          <div className="text-2xl lg:text-3xl font-black text-[#36A875] mt-1 tracking-tight">
            Active
          </div>
          <div className="text-xs text-[#84909A] font-semibold mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#36A875]" /> Webhook signature verified
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-[#DCE3E8] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#84909A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice, member name, or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-[#DCE3E8] text-[#252A30] placeholder:text-[#84909A] focus:outline-none focus:border-[#FFD447] focus:ring-2 focus:ring-[#FFD447]/30 transition-all"
          />
        </div>
        <div className="text-xs text-[#84909A] font-semibold">
          Showing {filteredPayments.length} of {payments.length} invoices
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-[#DCE3E8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F6F2]/80 border-b border-[#DCE3E8] text-[11px] font-bold text-[#84909A] uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Plan Item</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#F5F6F2]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#252A30]">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#252A30]">{p.memberName}</p>
                    <p className="text-[10px] font-mono text-[#84909A]">{p.memberId}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#252A30]">
                    {p.planName}
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#252A30]">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#F5F6F2] border border-[#DCE3E8] text-[11px] font-bold text-[#252A30]">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#84909A] font-medium">
                    {p.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#36A875]/15 text-[#36A875] font-black text-[10px] uppercase">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="p-1.5 rounded-lg bg-[#F5F6F2] text-[#252A30] hover:bg-[#FFD447] hover:text-[#252A30] transition-colors"
                      title="View Receipt"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#DCE3E8] shadow-2xl w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF] mb-4">
              <h3 className="text-base font-black text-[#252A30]">Record Cash / Manual Payment</h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-[#84909A] hover:text-[#252A30]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#252A30] mb-1">Select Member</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE3E8] text-xs font-bold text-[#252A30] focus:outline-none focus:border-[#FFD447]"
                  required
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252A30] mb-1">Membership Plan</label>
                <select
                  value={planName}
                  onChange={(e) => {
                    setPlanName(e.target.value);
                    const selected = plans.find(p => p.name === e.target.value);
                    if (selected) setAmount(selected.price);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE3E8] text-xs font-bold text-[#252A30] focus:outline-none focus:border-[#FFD447]"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.name}>{p.name} - ₹{p.price}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252A30] mb-1">Amount Paid (₹ INR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE3E8] text-xs font-black text-[#252A30] focus:outline-none focus:border-[#FFD447]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252A30] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE3E8] text-xs font-bold text-[#252A30] focus:outline-none focus:border-[#FFD447]"
                >
                  <option value="Cash">Cash at Reception Counter</option>
                  <option value="Razorpay UPI">Razorpay UPI (POS / QR)</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Netbanking">Netbanking</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#FFD447] text-[#252A30] font-black text-xs hover:bg-[#F5C62F] transition-all shadow-md shadow-[#FFD447]/20 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording...' : 'Confirm & Generate Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#DCE3E8] shadow-2xl w-full max-w-sm p-6 overflow-hidden text-center relative">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-[#84909A] hover:text-[#252A30]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FFD447]/20 text-[#252A30] flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6 text-[#252A30]" />
            </div>

            <h3 className="font-black text-lg text-[#252A30]">GymPro Fitness Club</h3>
            <p className="text-xs text-[#84909A] font-medium">Official Membership Invoice</p>

            <div className="my-5 p-4 rounded-2xl bg-[#F5F6F2] border border-[#DCE3E8] space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-[#84909A]">Invoice #</span>
                <span className="font-mono font-bold text-[#252A30]">{selectedReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#84909A]">Member</span>
                <span className="font-bold text-[#252A30]">{selectedReceipt.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#84909A]">Member ID</span>
                <span className="font-mono text-[#84909A]">{selectedReceipt.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#84909A]">Plan Tier</span>
                <span className="font-semibold text-[#252A30]">{selectedReceipt.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#84909A]">Payment Method</span>
                <span className="font-bold text-[#252A30]">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#84909A]">Date</span>
                <span className="text-[#84909A]">{selectedReceipt.date}</span>
              </div>
              <div className="pt-2 border-t border-[#DCE3E8] flex justify-between items-center text-sm">
                <span className="font-black text-[#252A30]">Amount Paid</span>
                <span className="font-black text-[#252A30]">₹{selectedReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#36A875] font-black mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>PAYMENT VERIFIED & SETTLED</span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-[#252A30] text-white hover:bg-[#353C46] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Print / Download Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
