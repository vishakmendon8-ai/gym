import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, doc as clientDoc, setDoc as clientSetDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

const firebaseConfig = {
  apiKey: "AIzaSyArQaxLDvpf2bqbR2WoQt1L0iYRLjzd_uM",
  authDomain: "gym001-50a97.firebaseapp.com",
  projectId: "gym001-50a97",
  storageBucket: "gym001-50a97.firebasestorage.app",
  messagingSenderId: "472731970744",
  appId: "1:472731970744:web:4378f96d486e15cd41d84d",
  measurementId: "G-LXT3FWS21Y"
};

// 1. Membership Plans
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
    originalPrice: 11999,
    offerTag: 'SAVE ₹2,000 (17% OFF)',
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

// 2. Members Directory
const MEMBERS = [
  {
    id: 'mem-001',
    name: 'Alex Vance',
    email: 'alex.vance@gympro.club',
    phone: '+91 98765 43210',
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
    emergencyContact: 'Sarah Vance (+91 98765 00001)'
  },
  {
    id: 'mem-002',
    name: 'Marcus Sterling',
    email: 'm.sterling@investor.io',
    phone: '+91 98111 22334',
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
    emergencyContact: 'Elena Sterling (+91 98111 99999)'
  },
  {
    id: 'mem-003',
    name: 'Elena Rostova',
    email: 'elena.rostova@design.co',
    phone: '+91 99887 76655',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-pro',
    planName: 'Elite Performance',
    status: 'expiring',
    joinDate: '2026-05-20',
    expiryDate: '2026-11-20',
    biometricId: 'BIO-FP-8803',
    daysLeft: 4,
    totalCheckIns: 64,
    lastCheckIn: 'Yesterday at 07:45 PM',
    emergencyContact: 'Dmitri Rostov (+91 99887 00000)'
  },
  {
    id: 'mem-004',
    name: 'Jordan Hayes',
    email: 'jordan.h@athletics.org',
    phone: '+91 97654 32109',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-basic',
    planName: 'Flex Standard',
    status: 'expired',
    joinDate: '2025-11-01',
    expiryDate: '2026-03-01',
    biometricId: 'BIO-FP-8804',
    daysLeft: 0,
    totalCheckIns: 19,
    lastCheckIn: 'Oct 14 at 10:20 AM',
    emergencyContact: 'Taylor Hayes (+91 97654 00000)'
  },
  {
    id: 'mem-005',
    name: 'Sophia Martinez',
    email: 'sophia.m@wellness.com',
    phone: '+91 96543 21098',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-black',
    planName: 'Obsidian VIP',
    status: 'active',
    joinDate: '2026-07-01',
    expiryDate: '2027-07-01',
    biometricId: 'BIO-FP-8805',
    daysLeft: 219,
    totalCheckIns: 89,
    lastCheckIn: 'Today at 09:12 AM',
    emergencyContact: 'Carlos Martinez (+91 96543 00000)'
  },
  {
    id: 'mem-006',
    name: 'Liam Chen',
    email: 'liam.chen@techventures.io',
    phone: '+91 95432 10987',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    planId: 'plan-basic',
    planName: 'Flex Standard',
    status: 'pending',
    joinDate: '2026-11-20',
    expiryDate: 'Pending Activation',
    biometricId: 'BIO-FP-8806',
    daysLeft: 0,
    totalCheckIns: 0,
    emergencyContact: 'Mei Chen (+91 95432 00000)'
  }
];

// 3. Attendance Records
const ATTENDANCE = [
  {
    id: 'att-01',
    memberId: 'mem-005',
    memberName: 'Sophia Martinez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    timestamp: 'Today at 09:12 AM',
    method: 'biometric',
    status: 'granted',
    terminalId: 'Gate-01 (Turnstile Alpha)'
  },
  {
    id: 'att-02',
    memberId: 'mem-001',
    memberName: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    timestamp: 'Today at 08:30 AM',
    method: 'biometric',
    status: 'granted',
    terminalId: 'Gate-02 (Turnstile Beta)'
  },
  {
    id: 'att-03',
    memberId: 'mem-004',
    memberName: 'Jordan Hayes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    timestamp: 'Today at 08:14 AM',
    method: 'biometric',
    status: 'denied',
    reason: 'Membership expired on 2026-03-01',
    terminalId: 'Gate-01 (Turnstile Alpha)'
  },
  {
    id: 'att-04',
    memberId: 'mem-002',
    memberName: 'Marcus Sterling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    timestamp: 'Today at 06:15 AM',
    method: 'biometric',
    status: 'granted',
    terminalId: 'Gate-VIP (Obsidian Lounge)'
  }
];

// 4. Financial Records
const PAYMENTS = [
  {
    id: 'pay-01',
    memberId: 'mem-001',
    memberName: 'Alex Vance',
    planName: 'Elite Performance (3 Mo)',
    amount: 9999,
    date: '2026-08-15',
    status: 'completed',
    paymentMethod: 'UPI / Online',
    invoiceNumber: 'INV-2026-8821'
  },
  {
    id: 'pay-02',
    memberId: 'mem-002',
    memberName: 'Marcus Sterling',
    planName: 'Obsidian VIP (12 Mo)',
    amount: 29999,
    date: '2026-01-10',
    status: 'completed',
    paymentMethod: 'Corporate Card',
    invoiceNumber: 'INV-2026-1049'
  },
  {
    id: 'pay-03',
    memberId: 'mem-005',
    memberName: 'Sophia Martinez',
    planName: 'Flex Standard (1 Mo)',
    amount: 3999,
    date: '2026-07-01',
    status: 'completed',
    paymentMethod: 'Credit Card',
    invoiceNumber: 'INV-2026-7732'
  },
  {
    id: 'pay-04',
    memberId: 'mem-003',
    memberName: 'Elena Rostova',
    planName: 'Elite Performance (3 Mo)',
    amount: 9999,
    date: '2026-05-20',
    status: 'completed',
    paymentMethod: 'UPI / Online',
    invoiceNumber: 'INV-2026-5519'
  }
];

// 5. Notifications
const NOTIFICATIONS = [
  {
    id: 'notif-01',
    title: 'Biometric Gateway Synchronized',
    message: 'SecuGen optical scanner linked to Turnstiles Alpha & Beta.',
    date: 'Today',
    time: '08:00 AM',
    category: 'alert',
    isRead: false
  },
  {
    id: 'notif-02',
    title: 'Special Offer Live',
    message: 'Elite Performance plan offer SAVE ₹2,000 (17% OFF) published.',
    date: 'Today',
    time: '09:00 AM',
    category: 'announcement',
    isRead: false
  }
];

// 6. Settings
const SETTINGS = [
  {
    id: 'facility-config',
    gymName: 'Olympus Elite Club',
    address: '450 Fitness Ave, Metro Core',
    operatingHours: '24/7 Unlimited Access',
    turnstileTimeout: 5,
    opticalThreshold: 95,
    autoRevokeOnExpiry: true,
    currency: 'INR',
    symbol: '₹'
  }
];

// 7. Terminals
const TERMINALS = [
  {
    id: 'term-01',
    name: 'Turnstile Gateway #01 (Alpha)',
    type: 'optical-turnstile',
    status: 'online',
    location: 'Main Reception Entrance'
  },
  {
    id: 'term-02',
    name: 'Turnstile Gateway #02 (Beta)',
    type: 'optical-turnstile',
    status: 'online',
    location: 'Member Express Gate'
  }
];

async function seed() {
  console.log('🚀 Checking Firebase credentials for project: gym001-50a97 ...');

  // Check if service account key is available in project root
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  let adminDb = null;

  if (fs.existsSync(serviceAccountPath)) {
    console.log('🔑 Found serviceAccountKey.json! Initializing Firebase Admin SDK (Bypasses rules)...');
    try {
      const admin = await import('firebase-admin');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      if (admin.default.apps.length === 0) {
        admin.default.initializeApp({
          credential: admin.default.credential.cert(serviceAccount),
          projectId: 'gym001-50a97'
        });
      }
      adminDb = admin.default.firestore();
      console.log('✓ Firebase Admin SDK connected with full root permissions.');
    } catch (e) {
      console.warn('Admin SDK init error:', e.message);
    }
  }

  const collections = [
    { name: 'members', data: MEMBERS },
    { name: 'plans', data: PLANS },
    { name: 'attendance', data: ATTENDANCE },
    { name: 'payments', data: PAYMENTS },
    { name: 'notifications', data: NOTIFICATIONS },
    { name: 'settings', data: SETTINGS },
    { name: 'terminals', data: TERMINALS }
  ];

  if (adminDb) {
    try {
      console.log('\n📦 Creating all 7 collections via Admin SDK...');
      for (const col of collections) {
        for (const item of col.data) {
          await adminDb.collection(col.name).doc(item.id).set(item);
        }
        console.log(`   ✓ Collection '${col.name}' created with ${col.data.length} documents.`);
      }
      console.log('\n🎉 ALL 7 COLLECTIONS CREATED AND INITIALIZED IN FIRESTORE SUCCESSFULLY!');
      process.exit(0);
    } catch (err) {
      console.error('Admin SDK write error:', err);
      process.exit(1);
    }
  }

  // Fallback to Web Client SDK
  console.log('🌐 Connecting via Firebase Web SDK...');
  const app = initClientApp(firebaseConfig);
  const db = getClientFirestore(app);

  try {
    for (const col of collections) {
      for (const item of col.data) {
        await clientSetDoc(clientDoc(db, col.name, item.id), item);
      }
      console.log(`   ✓ Collection '${col.name}' created (${col.data.length} docs)`);
    }
    console.log('\n🎉 ALL 7 COLLECTIONS CREATED SUCCESSFULLY IN FIRESTORE!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Firestore Permission Denied:', error.message);
    console.log('\n📋 TO ALLOW FIRESTORE TO ACCEPT COLLECTIONS:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/gym001-50a97/firestore/rules');
    console.log('2. Replace the rules with:\n');
    console.log(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`);
    console.log('\n3. Click "Publish", then re-run this script: npm run seed');
    console.log('   OR download serviceAccountKey.json from Project Settings -> Service accounts and place it in the gym folder.\n');
    process.exit(1);
  }
}

seed();
