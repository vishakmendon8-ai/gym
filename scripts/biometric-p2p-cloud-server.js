/**
 * GymPro - P2P Cloud Biometric Gateway Server
 * 
 * This server receives real-time attendance punches from physical P2P / Cloud biometric devices
 * (ZKTeco ADMS, eSSL Cloud, Realtime Push, Hikvision MinMoe, Dahua, Anviz)
 * over the internet, verifies membership status in GymPro database, and updates attendance in real-time.
 * 
 * Usage:
 *   node scripts/biometric-p2p-cloud-server.js
 * Default Port: 8080 (or set PORT=8080)
 */

import http from 'http';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 8080;

// Initialize Firebase Admin if service account is available, or log in simulated bridge mode
let db = null;
const serviceAccountPath = path.resolve('./serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    const adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore(adminApp);
    console.log('✓ Connected to Firebase Firestore with Admin Privileges');
  } catch (err) {
    console.warn('! Firebase serviceAccountKey.json load failed. Running in Standalone Bridge Mode.', err.message);
  }
} else {
  console.log('ℹ No serviceAccountKey.json detected. Running P2P Cloud Gateway in Standalone Relay Mode.');
}

/**
 * Handle incoming punch and record attendance
 */
async function handlePunchRecord({ memberId, biometricId, timestamp, deviceSn, deviceModel, verifyMode }) {
  const punchTime = timestamp || new Date().toISOString();
  console.log(`\n[BIOMETRIC P2P PUNCH RECEIVED]`);
  console.log(`▸ Device SN    : ${deviceSn || 'P2P-CLOUD-DEVICE'}`);
  console.log(`▸ Member / Pin : ${memberId || biometricId}`);
  console.log(`▸ Time         : ${punchTime}`);
  console.log(`▸ Mode         : ${verifyMode || 'Fingerprint'}`);

  if (db) {
    try {
      // 1. Find member by memberId or biometricId
      const membersRef = db.collection('members');
      let querySnapshot = await membersRef.where('biometricId', '==', memberId || biometricId).get();
      
      if (querySnapshot.empty) {
        // Try matching by member ID directly
        const docDirect = await membersRef.doc(memberId).get();
        if (docDirect.exists) {
          querySnapshot = { docs: [docDirect], empty: false };
        }
      }

      if (!querySnapshot.empty) {
        const memberDoc = querySnapshot.docs[0];
        const memberData = memberDoc.data();
        const isActive = memberData.status === 'active';

        console.log(`▸ Member Name  : ${memberData.name} (${memberData.planName})`);
        console.log(`▸ Status       : ${isActive ? 'ACTIVE (ACCESS GRANTED)' : 'EXPIRED (ACCESS DENIED)'}`);

        // Record attendance log
        const attendanceRef = db.collection('attendance');
        await attendanceRef.add({
          memberId: memberDoc.id,
          memberName: memberData.name,
          planName: memberData.planName,
          checkIn: punchTime,
          date: punchTime.split('T')[0],
          status: isActive ? 'granted' : 'denied',
          gate: 'P2P Cloud Turnstile',
          deviceSn: deviceSn || 'P2P-CLOUD-01',
          createdAt: FieldValue.serverTimestamp()
        });

        // Update member check-in count and last visit if active
        if (isActive) {
          await memberDoc.ref.update({
            totalCheckIns: FieldValue.increment(1),
            lastVisit: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }

        return { success: true, granted: isActive, member: memberData.name };
      } else {
        console.warn(`! Unregistered Biometric Token: ${memberId || biometricId}`);
        return { success: false, reason: 'Unregistered Member' };
      }
    } catch (err) {
      console.error('Error writing to Firestore:', err);
      return { success: false, error: err.message };
    }
  }

  // Simulated relay success
  return { success: true, granted: true, simulated: true };
}

// Create HTTP Server for P2P Push Webhook
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. ZKTeco / eSSL ADMS Handshake (GET /iclock/cdata)
  if (method === 'GET' && pathname.includes('/iclock/cdata')) {
    const sn = parsedUrl.searchParams.get('SN') || 'UNKNOWN';
    console.log(`[ZKTeco ADMS Heartbeat] Handshake from device SN: ${sn}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GET OPTION FROM: ' + sn + '\nATTLOGStamp=None\nOPERLOGStamp=None\nATTPHOTOStamp=None\nErrorDelay=30\nDelay=10\nTransTimes=00:00;14:00\nTransInterval=1\nTransFlag=1111111111\nTimeZone=5.5\nRealtime=1\nEncrypt=None\n');
    return;
  }

  // 2. ZKTeco / eSSL ADMS Attendance Push (POST /iclock/cdata)
  if (method === 'POST' && pathname.includes('/iclock/cdata')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      const sn = parsedUrl.searchParams.get('SN') || 'UNKNOWN';
      // Raw ZKTeco tab-delimited log format: PIN \t Timestamp \t Status \t VerifyMode
      const lines = body.trim().split('\n');
      for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const pin = parts[0].trim();
          const time = parts[1].trim();
          await handlePunchRecord({
            memberId: pin,
            timestamp: time,
            deviceSn: sn,
            deviceModel: 'ZKTeco/eSSL ADMS',
            verifyMode: 'Fingerprint/Face'
          });
        }
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    });
    return;
  }

  // 3. Modern JSON Webhook for Realtime, Hikvision, Dahua, Anviz & Custom P2P (POST /api/biometric/push)
  if (method === 'POST' && pathname.includes('/api/biometric/push')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const memberId = data.memberId || data.userId || data.pin || data.employeeNoString || data.biometricId;
        const timestamp = data.timestamp || data.time || data.logTime || new Date().toISOString();
        const deviceSn = data.deviceSn || data.deviceSerial || data.sn || 'P2P-DEVICE';
        const verifyMode = data.verifyMode || data.type || 'Biometric';

        const result = await handlePunchRecord({
          memberId,
          timestamp,
          deviceSn,
          deviceModel: data.deviceModel || 'Cloud P2P Device',
          verifyMode
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'Punch recorded', result }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
    return;
  }

  // 4. Server Health Status (GET /health or GET /)
  if (pathname === '/' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      service: 'GymPro P2P Cloud Biometric Gateway',
      endpoints: {
        admsPush: '/iclock/cdata',
        jsonWebhook: '/api/biometric/push'
      },
      time: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 GymPro P2P Cloud Biometric Gateway Running!`);
  console.log(`📡 Listening on Port: ${PORT}`);
  console.log(`🌐 Local Webhook URL: http://localhost:${PORT}/api/biometric/push`);
  console.log(`🌐 ADMS ZK/eSSL URL : http://localhost:${PORT}/iclock/cdata`);
  console.log(`====================================================`);
});
