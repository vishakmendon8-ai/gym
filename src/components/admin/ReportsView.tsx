import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Filter,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { members, payments, attendance, plans } = useGym();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '6m' | '1y'>('6m');

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const activeMembersCount = members.filter(m => m.status === 'active').length;
  const attendanceCount = attendance.length;

  const exportReport = (type: 'members' | 'revenue' | 'attendance') => {
    let filename = '';
    let csvContent = '';

    if (type === 'members') {
      filename = `GymPro_Members_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = 'ID,Name,Email,Phone,Plan,Status,Join Date,Expiry Date,Biometric Token\n';
      const rows = members.map(m => 
        `"${m.id}","${m.name}","${m.email}","${m.phone}","${m.planName}","${m.status}","${m.joinDate}","${m.expiryDate}","${m.biometricId}"`
      ).join('\n');
      csvContent = headers + rows;
    } else if (type === 'revenue') {
      filename = `GymPro_Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = 'Invoice Number,Member ID,Member Name,Plan,Amount (INR),Date,Method,Status\n';
      const rows = payments.map(p => 
        `"${p.invoiceNumber}","${p.memberId}","${p.memberName}","${p.planName}",${p.amount},"${p.date}","${p.paymentMethod}","${p.status}"`
      ).join('\n');
      csvContent = headers + rows;
    } else {
      filename = `GymPro_Attendance_Logs_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = 'Timestamp,Member ID,Member Name,Terminal,Method,Verdict,Reason\n';
      const rows = attendance.map(a => 
        `"${a.timestamp}","${a.memberId}","${a.memberName}","${a.terminalId}","${a.method}","${a.status}","${a.reason || ''}"`
      ).join('\n');
      csvContent = headers + rows;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
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
            <BarChart3 className="w-5 h-5 text-[#252A30]" />
            <h1 className="text-xl lg:text-2xl font-black text-[#252A30] tracking-tight">
              Reports & Operational Analytics
            </h1>
          </div>
          <p className="text-xs text-[#84909A]">
            Audit facility performance, membership growth curves, recurring revenue trends, and hardware turnover.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#F5F6F2] p-1 rounded-xl border border-[#DCE3E8]">
            {(['7d', '30d', '6m', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  dateRange === r
                    ? 'bg-white text-[#252A30] shadow-xs'
                    : 'text-[#84909A] hover:text-[#252A30]'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '6m' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-[#DCE3E8] shadow-xs">
          <span className="text-[11px] font-bold text-[#84909A] uppercase tracking-wider">Total Recorded Revenue</span>
          <div className="text-3xl font-black text-[#252A30] mt-1 tracking-tight">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[#36A875] font-semibold mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% MoM Growth
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCE3E8] shadow-xs">
          <span className="text-[11px] font-bold text-[#84909A] uppercase tracking-wider">Active Membership Ratio</span>
          <div className="text-3xl font-black text-[#252A30] mt-1 tracking-tight">
            {activeMembersCount} / {members.length}
          </div>
          <div className="text-xs text-[#84909A] font-semibold mt-1.5 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#FFD447]" /> {Math.round((activeMembersCount / (members.length || 1)) * 100)}% Active Retention
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCE3E8] shadow-xs">
          <span className="text-[11px] font-bold text-[#84909A] uppercase tracking-wider">Turnstile Scans Recorded</span>
          <div className="text-3xl font-black text-[#252A30] mt-1 tracking-tight">
            {attendanceCount}
          </div>
          <div className="text-xs text-[#36A875] font-semibold mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 98.7% Hardware Acceptance
          </div>
        </div>
      </div>

      {/* CSV Export Hub */}
      <div className="bg-white rounded-2xl p-6 border border-[#DCE3E8] shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-black text-[#252A30] uppercase tracking-wider">
            Export Production Data Sheets
          </h2>
          <p className="text-xs text-[#84909A] mt-0.5">
            Download standard RFC 4180 CSV spreadsheets directly compatible with Microsoft Excel, Google Sheets, or Tally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#F5F6F2] border border-[#DCE3E8] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#252A30] border border-[#DCE3E8] flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-[#252A30]">Member Master Directory</h3>
              <p className="text-[11px] text-[#84909A] mt-1 leading-snug">
                Complete roster with IDs, contact info, biometric tokens, plans and expiration dates.
              </p>
            </div>
            <button
              onClick={() => exportReport('members')}
              className="mt-4 w-full py-2 rounded-xl bg-white border border-[#DCE3E8] hover:border-[#FFD447] text-[#252A30] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Members CSV</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F6F2] border border-[#DCE3E8] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#252A30] border border-[#DCE3E8] flex items-center justify-center mb-3">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-[#252A30]">Financial Ledger & Invoices</h3>
              <p className="text-[11px] text-[#84909A] mt-1 leading-snug">
                Itemized transaction records in INR (₹) with invoice identifiers, payment modes, and dates.
              </p>
            </div>
            <button
              onClick={() => exportReport('revenue')}
              className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-[#FFD447] to-[#F5C62F] text-[#252A30] font-black text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Revenue CSV</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F6F2] border border-[#DCE3E8] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#252A30] border border-[#DCE3E8] flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-[#252A30]">Turnstile Attendance Audit</h3>
              <p className="text-[11px] text-[#84909A] mt-1 leading-snug">
                Chronological gate entries, timestamps, optical authentication verification and rejection notes.
              </p>
            </div>
            <button
              onClick={() => exportReport('attendance')}
              className="mt-4 w-full py-2 rounded-xl bg-white border border-[#DCE3E8] hover:border-[#FFD447] text-[#252A30] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Attendance CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
