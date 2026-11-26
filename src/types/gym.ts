export type MemberStatus = 'active' | 'expiring' | 'expired' | 'pending' | 'inactive';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  avatar: string;
  planId: string;
  planName: string;
  status: MemberStatus;
  joinDate: string;
  expiryDate: string;
  biometricId: string; // Fingerprint ID token
  biometricRegistered?: boolean;
  biometricSamples?: {
    sample1: boolean;
    sample2: boolean;
    sample3: boolean;
  };
  daysLeft: number;
  totalCheckIns: number;
  attendanceCount?: number;
  lastCheckIn?: string;
  lastVisit?: string;
  startDate?: string;
  biometricEnrolled?: boolean;
  healthNotes?: string;
  emergencyContact: string;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  offerTag?: string;
  joiningFee?: number;
  durationMonths: number;
  popular?: boolean;
  active?: boolean;
  features: string[];
}

export interface Subscription {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: MemberStatus;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  avatar: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  timestamp: string;
  method: 'biometric' | 'nfc' | 'manual' | 'reception';
  status: 'granted' | 'denied' | 'flagged';
  reason?: string;
  terminalId: string;
}

export interface AccessLog {
  id: string;
  memberId: string;
  memberName: string;
  avatar: string;
  time: string;
  status: 'granted' | 'denied';
  reason?: string;
  terminalId: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  planName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  invoiceNumber: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  category: 'announcement' | 'membership' | 'class' | 'alert' | 'payment';
  isRead: boolean;
}

export interface AdminProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
  facilityName: string;
}

export type AdminTab = 
  | 'dashboard'
  | 'overview'
  | 'members'
  | 'plans'
  | 'subscriptions'
  | 'payments'
  | 'finances'
  | 'biometric'
  | 'access-monitor'
  | 'attendance'
  | 'reports'
  | 'settings';
