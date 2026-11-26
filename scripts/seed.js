import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArQaxLDvpf2bqbR2WoQt1L0iYRLjzd_uM",
  authDomain: "gym001-50a97.firebaseapp.com",
  projectId: "gym001-50a97",
  storageBucket: "gym001-50a97.firebasestorage.app",
  messagingSenderId: "472731970744",
  appId: "1:472731970744:web:4378f96d486e15cd41d84d",
  measurementId: "G-LXT3FWS21Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PLANS = [
  {
    id: 'plan-basic',
    name: 'Flex Standard',
    tagline: 'Essential access for disciplined fitness enthusiasts',
    price: 3999,
    durationMonths: 1,
    features: [
      'Full Gym Floor Access (6 AM - 11 PM)',
      'Locker room & Sauna amenities',
      '1 Free Body Composition scan',
      'Mobile App Workout Logging'
    ]
  },
  {
    id: 'plan-pro',
    name: 'Elite Performance',
    tagline: 'Our most popular all-inclusive fitness tier',
    price: 9999,
    durationMonths: 3,
    popular: true,
    features: [
      '24/7 Unlimited Gym Access',
      'All Group HIIT & Yoga Classes',
      'Biometric Quick Gate Access',
      'Monthly Personal Trainer Consultation',
      'Smoothie Bar 10% Discount'
    ]
  },
  {
    id: 'plan-black',
    name: 'Obsidian VIP',
    tagline: 'Private coaching & premium luxury wellness perks',
    price: 29999,
    durationMonths: 12,
    features: [
      '24/7 Priority VIP Gate Entry',
      'Unlimited Private Personal Training',
      'Full Spa, Cryotherapy & Hydro-massage',
      'Dedicated Private Locker & Towel Service',
      'Complimentary Guest Pass every month'
    ]
  }
];

const MEMBERS = [
  {
    id: 'mem-001',
    name: 'Alex Vance',
    email: 'alex.vance@gympro.club',
    phone: '+1 (555) 234-8921',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-pro',
    planName: 'Elite Performance',
    status: 'active',
    joinDate: '2026-08-15',
    expiryDate: '2027-02-15',
    biometricId: 'BIO-FP-8801',
    daysLeft: 83,
    totalCheckIns: 42,
    lastCheckIn: 'Today at 08:30 AM',
    emergencyContact: 'Sarah Vance (+1 555-0192)'
  },
  {
    id: 'mem-002',
    name: 'Marcus Sterling',
    email: 'm.sterling@investor.io',
    phone: '+1 (555) 912-3049',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-black',
    planName: 'Obsidian VIP',
    status: 'active',
    joinDate: '2026-01-10',
    expiryDate: '2027-01-10',
    biometricId: 'BIO-FP-8802',
    daysLeft: 47,
    totalCheckIns: 118,
    lastCheckIn: 'Today at 06:15 AM',
    emergencyContact: 'Elena Sterling (+1 555-4421)'
  },
  {
    id: 'mem-003',
    name: 'Elena Rostova',
    email: 'elena.rostova@design.co',
    phone: '+1 (555) 674-2201',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-pro',
    planName: 'Elite Performance',
    status: 'expiring',
    joinDate: '2026-08-28',
    expiryDate: '2026-11-28',
    biometricId: 'BIO-FP-8803',
    daysLeft: 4,
    totalCheckIns: 36,
    lastCheckIn: 'Yesterday at 05:45 PM',
    emergencyContact: 'Mikhail Rostova (+1 555-9923)'
  },
  {
    id: 'mem-004',
    name: 'Jordan Hayes',
    email: 'jordan.hayes@outlook.com',
    phone: '+1 (555) 482-1940',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    planId: 'pending',
    planName: 'No Active Plan',
    status: 'pending',
    joinDate: '2026-11-20',
    expiryDate: 'Not started',
    biometricId: 'BIO-FP-8804',
    daysLeft: 0,
    totalCheckIns: 29,
    lastCheckIn: '14 days ago',
    emergencyContact: 'Chloe Hayes (+1 555-1102)'
  },
  {
    id: 'mem-005',
    name: 'Sophia Martinez',
    email: 'sophia.m@wellness.org',
    phone: '+1 (555) 334-5829',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-pro',
    planName: 'Elite Performance',
    status: 'active',
    joinDate: '2026-09-01',
    expiryDate: '2027-03-01',
    biometricId: 'BIO-FP-8805',
    daysLeft: 97,
    totalCheckIns: 51,
    lastCheckIn: 'Today at 09:12 AM',
    emergencyContact: 'Carlos Martinez (+1 555-8832)'
  },
  {
    id: 'mem-006',
    name: 'David Chen',
    email: 'david.chen@techventures.com',
    phone: '+1 (555) 782-9901',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-black',
    planName: 'Obsidian VIP',
    status: 'expiring',
    joinDate: '2026-08-30',
    expiryDate: '2026-11-30',
    biometricId: 'BIO-FP-8806',
    daysLeft: 6,
    totalCheckIns: 64,
    lastCheckIn: '2 days ago',
    emergencyContact: 'Linda Chen (+1 555-4012)'
  }
];

const ATTENDANCE = [
  {
    id: 'att-101',
    memberId: 'mem-005',
    memberName: 'Sophia Martinez',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    timestamp: '09:12 AM',
    method: 'biometric',
    status: 'granted',
    terminalId: 'Gate-01 (Turnstile Alpha)'
  },
  {
    id: 'att-102',
    memberId: 'mem-001',
    memberName: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    timestamp: '08:30 AM',
    method: 'biometric',
    status: 'granted',
    terminalId: 'Gate-02 (Turnstile Beta)'
  },
  {
    id: 'att-103',
    memberId: 'mem-004',
    memberName: 'Jordan Hayes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    timestamp: '08:14 AM',
    method: 'biometric',
    status: 'denied',
    reason: 'Membership expired on 10 Nov 2026',
    terminalId: 'Gate-01 (Turnstile Alpha)'
  },
  {
    id: 'att-104',
    memberId: 'mem-002',
    memberName: 'Marcus Sterling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    timestamp: '06:15 AM',
    method: 'biometric',
    status: 'granted',
    terminalId: 'Gate-VIP (Obsidian Lounge)'
  }
];

const PAYMENTS = [
  {
    id: 'pay-501',
    memberId: 'mem-002',
    memberName: 'Marcus Sterling',
    planName: 'Obsidian VIP (12 Mo)',
    amount: 29999,
    date: '2026-11-20',
    status: 'completed',
    paymentMethod: 'Mastercard •••• 9210',
    invoiceNumber: 'INV-2026-8819'
  },
  {
    id: 'pay-502',
    memberId: 'mem-005',
    memberName: 'Sophia Martinez',
    planName: 'Elite Performance (3 Mo)',
    amount: 9999,
    date: '2026-11-18',
    status: 'completed',
    paymentMethod: 'UPI / GPay',
    invoiceNumber: 'INV-2026-8812'
  },
  {
    id: 'pay-503',
    memberId: 'mem-001',
    memberName: 'Alex Vance',
    planName: 'Elite Performance (3 Mo)',
    amount: 9999,
    date: '2026-11-15',
    status: 'completed',
    paymentMethod: 'Visa •••• 4421',
    invoiceNumber: 'INV-2026-8790'
  },
  {
    id: 'pay-504',
    memberId: 'mem-004',
    memberName: 'Jordan Hayes',
    planName: 'Flex Standard (Renewal)',
    amount: 3999,
    date: '2026-11-10',
    status: 'failed',
    paymentMethod: 'UPI / PhonePe',
    invoiceNumber: 'INV-2026-8742'
  }
];

const NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New Sauna & Steam Facility Open',
    message: 'The state-of-the-art Nordic recovery zone is now unlocked for all Pro and Obsidian members.',
    date: 'Today',
    time: '10:00 AM',
    category: 'announcement',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Membership Renewal Notice',
    message: 'Your Elite Performance subscription expires in 4 days. Renew early to lock in your preferential rate.',
    date: 'Yesterday',
    time: '04:30 PM',
    category: 'membership',
    isRead: false
  },
  {
    id: 'notif-3',
    title: 'Masterclass: Olympic Lifting',
    message: 'Guest coach Coach Andrei is hosting a 90-min technical workshop this Saturday at 11 AM.',
    date: '22 Nov',
    time: '02:15 PM',
    category: 'class',
    isRead: true
  }
];

async function seed() {
  console.log("Starting Firebase Firestore collection seeding for gym001-50a97...");

  console.log("1. Writing 'plans' collection...");
  for (const plan of PLANS) {
    await setDoc(doc(db, "plans", plan.id), plan);
    console.log(`  - Seeded plan: ${plan.id} (${plan.name})`);
  }

  console.log("2. Writing 'members' collection...");
  for (const member of MEMBERS) {
    await setDoc(doc(db, "members", member.id), member);
    console.log(`  - Seeded member: ${member.id} (${member.name})`);
  }

  console.log("3. Writing 'attendance' collection...");
  for (const att of ATTENDANCE) {
    await setDoc(doc(db, "attendance", att.id), att);
    console.log(`  - Seeded attendance log: ${att.id}`);
  }

  console.log("4. Writing 'payments' collection...");
  for (const pay of PAYMENTS) {
    await setDoc(doc(db, "payments", pay.id), pay);
    console.log(`  - Seeded payment: ${pay.id}`);
  }

  console.log("5. Writing 'notifications' collection...");
  for (const notif of NOTIFICATIONS) {
    await setDoc(doc(db, "notifications", notif.id), notif);
    console.log(`  - Seeded notification: ${notif.id}`);
  }

  console.log("✅ All collections successfully created and populated in Firestore!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error writing collections to Firestore:", err);
  process.exit(1);
});
