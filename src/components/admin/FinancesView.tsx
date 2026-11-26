import React from 'react';
import { useGym } from '../../context/GymContext';
import { IndianRupee, Download, CreditCard, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const FinancesView: React.FC = () => {
  const { payments } = useGym();
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-card p-6 border border-cloud-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-graphite tracking-tight">
            Revenue, Invoicing & Billing
          </h1>
          <p className="text-xs text-graphite-muted mt-1">
            Subscription receipts, automatic renewals, and merchant settlement logs.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={<Download className="w-4 h-4" />}
          onClick={() => alert('Exporting monthly statement to CSV...')}
        >
          Export Statement (CSV)
        </Button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card rounded-panel p-5 border border-cloud-border">
          <span className="text-xs font-bold text-graphite-muted uppercase">Gross Revenue (Nov 2026)</span>
          <div className="text-3xl font-black text-graphite mt-2 tracking-tight">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-status-success font-semibold mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% compared to October
          </div>
        </div>

        <div className="glass-card rounded-panel p-5 border border-cloud-border">
          <span className="text-xs font-bold text-graphite-muted uppercase">Active Paying Subscriptions</span>
          <div className="text-3xl font-black text-graphite mt-2 tracking-tight">
            6 Accounts
          </div>
          <div className="text-xs text-graphite-muted mt-2">
            Average transaction value: ₹{Math.round(totalRevenue / payments.length).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="glass-card rounded-panel p-5 border border-cloud-border">
          <span className="text-xs font-bold text-graphite-muted uppercase">Payment Gateway Health</span>
          <div className="text-3xl font-black text-status-success mt-2 tracking-tight">
            99.9%
          </div>
          <div className="text-xs text-graphite-muted mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> UPI & POS Terminals Online
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-panel border border-cloud-border shadow-card-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-cloud-border bg-white/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-graphite">Recent Billing Ledger</h2>
          <span className="text-xs text-graphite-muted font-medium">All amounts settled in INR (₹)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-cloud-grey/60 border-b border-cloud-border text-[11px] font-bold text-graphite-muted uppercase tracking-wider">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Plan Item</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-border/70">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-graphite">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-graphite">
                    {p.memberName}
                  </td>
                  <td className="py-3 px-4 text-graphite-muted font-medium">
                    {p.planName}
                  </td>
                  <td className="py-3 px-4 font-black text-graphite">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-graphite-muted">
                    {p.date}
                  </td>
                  <td className="py-3 px-4 text-graphite-muted font-mono text-[11px]">
                    {p.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
