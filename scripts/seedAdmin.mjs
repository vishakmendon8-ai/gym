import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve('serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.log('⚠️ serviceAccountKey.json was not found in project root.');
  console.log('To seed with Firebase Admin SDK without changing rules:');
  console.log('1. Go to Firebase Console -> Project Settings -> Service accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save file as "serviceAccountKey.json" in this directory');
  console.log('4. Run: node scripts/seedAdmin.mjs\n');
  console.log('OR simply update your Firestore Security Rules in Firebase Console to:');
  console.log('match /{document=**} { allow read, write: if true; }');
  console.log('and run: npm run seed');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'gym001-50a97'
});

const db = admin.firestore();

// Import initial data
import { INITIAL_MEMBERS, INITIAL_PLANS, INITIAL_ATTENDANCE, INITIAL_PAYMENTS, INITIAL_NOTIFICATIONS } from '../src/data/initialData.js';

async function seedAdmin() {
  console.log('🚀 Seeding Firestore collections via Admin SDK for gym001-50a97...');

  for (const m of INITIAL_MEMBERS) {
    await db.collection('members').doc(m.id).set(m);
    console.log(`   ✓ members/${m.id} (${m.name})`);
  }

  for (const p of INITIAL_PLANS) {
    await db.collection('plans').doc(p.id).set(p);
    console.log(`   ✓ plans/${p.id} (${p.name})`);
  }

  for (const a of INITIAL_ATTENDANCE) {
    await db.collection('attendance').doc(a.id).set(a);
    console.log(`   ✓ attendance/${a.id}`);
  }

  for (const pay of INITIAL_PAYMENTS) {
    await db.collection('payments').doc(pay.id).set(pay);
    console.log(`   ✓ payments/${pay.id}`);
  }

  for (const n of INITIAL_NOTIFICATIONS) {
    await db.collection('notifications').doc(n.id).set(n);
    console.log(`   ✓ notifications/${n.id}`);
  }

  console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY SEEDED IN FIRESTORE VIA ADMIN SDK!');
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
