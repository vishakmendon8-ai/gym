import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { firebaseConfig } from '../../firebase';
import { X, Copy, Check, Database, Shield, Flame, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

interface FirebaseRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseRulesModal: React.FC<FirebaseRulesModalProps> = ({ isOpen, onClose }) => {
  const { firebaseConnected, isSyncing, seedFirestoreData } = useGym();
  const [copiedRules, setCopiedRules] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'config' | 'setup'>('rules');

  if (!isOpen) return null;

  const firestoreRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.admin == true ||
        request.auth.token.role == 'admin' ||
        request.auth.token.email.matches(".*@gympro\\\\.com$") ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // 1. Members Collection
    match /members/{memberId} {
      allow read: if isAdmin() || isOwner(memberId) || (isAuthenticated() && resource.data.email == request.auth.token.email);
      allow create: if isAdmin() || (isAuthenticated() && request.auth.uid == memberId);
      allow delete: if isAdmin();
      allow update: if isAdmin() || (
        isOwner(memberId) && 
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['status', 'expiryDate', 'planId', 'role'])
      );
    }

    // 2. Membership Plans
    match /plans/{planId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 3. Attendance Logs
    match /attendance/{recordId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.memberId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // 4. Payments and Invoices
    match /payments/{paymentId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.memberId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // 5. Notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && (
        resource.data.target == 'all' || 
        resource.data.targetUserId == request.auth.uid || 
        isAdmin()
      );
      allow write: if isAdmin();
    }

    // 6. Simulator & Terminals
    match /terminals/{terminalId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}`;

  const copyToClipboard = (text: string, type: 'rules' | 'config') => {
    navigator.clipboard.writeText(text);
    if (type === 'rules') {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2000);
    } else {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl glass-panel rounded-modal border border-cloud-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cloud-border bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-input bg-yellow-sunshine/20 border border-yellow-sunshine flex items-center justify-center text-graphite">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-graphite">Firebase & Firestore Configuration</h3>
              <p className="text-xs text-graphite-muted">Project ID: <code className="font-semibold text-graphite bg-cloud-grey px-1.5 py-0.5 rounded">gym001-50a97</code></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-control text-graphite-muted hover:text-graphite hover:bg-cloud-grey transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-cloud-border bg-cloud-grey/40 px-6">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'border-yellow-sunshine text-graphite'
                : 'border-transparent text-graphite-muted hover:text-graphite'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Firestore Security Rules
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-yellow-sunshine text-graphite'
                : 'border-transparent text-graphite-muted hover:text-graphite'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Connected SDK Config
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'setup'
                ? 'border-yellow-sunshine text-graphite'
                : 'border-transparent text-graphite-muted hover:text-graphite'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Deployment Instructions
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-graphite">Cloud Firestore Rules</h4>
                  <p className="text-xs text-graphite-muted">
                    Secure collection boundaries for members, biometric logs, plans, and payments.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(firestoreRulesText, 'rules')}
                  icon={copiedRules ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedRules ? 'Copied to Clipboard!' : 'Copy Rules'}
                </Button>
              </div>

              <div className="relative rounded-control bg-graphite text-cloud-light p-4 font-mono text-xs overflow-x-auto max-h-80 border border-graphite-light">
                <pre>{firestoreRulesText}</pre>
              </div>

              <div className="p-3 bg-yellow-pale border border-yellow-soft rounded-control flex items-start gap-2.5">
                <span className="text-yellow-600 font-bold text-sm">💡</span>
                <p className="text-xs text-graphite leading-relaxed">
                  <strong>How to deploy:</strong> In your Firebase Console, open <strong>Firestore Database → Rules</strong>, replace the default contents with the snippet above, and click <strong>Publish</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-graphite">Firebase JavaScript SDK Config</h4>
                  <p className="text-xs text-graphite-muted">Currently active and initialized in <code className="bg-cloud-grey px-1 rounded">src/firebase.ts</code>.</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(JSON.stringify(firebaseConfig, null, 2), 'config')}
                  icon={copiedConfig ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedConfig ? 'Copied!' : 'Copy Config'}
                </Button>
              </div>

              <div className="rounded-control bg-graphite text-cloud-light p-4 font-mono text-xs overflow-x-auto border border-graphite-light">
                <pre>{JSON.stringify(firebaseConfig, null, 2)}</pre>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-control border border-cloud-border">
                  <span className="text-graphite-muted block">Project Auth Domain</span>
                  <strong className="text-graphite">{firebaseConfig.authDomain}</strong>
                </div>
                <div className="p-3 bg-white rounded-control border border-cloud-border">
                  <span className="text-graphite-muted block">Storage Bucket</span>
                  <strong className="text-graphite">{firebaseConfig.storageBucket}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-graphite">Getting Started in Firebase Console</h4>
              <ol className="list-decimal pl-5 space-y-2 text-graphite-muted">
                <li>
                  <strong className="text-graphite">Enable Firestore:</strong> Visit <a href="https://console.firebase.google.com/project/gym001-50a97/firestore" target="_blank" rel="noreferrer" className="text-graphite font-bold underline">Firebase Console for gym001-50a97</a>, click <strong>Create Database</strong> and choose your location.
                </li>
                <li>
                  <strong className="text-graphite">Enable Authentication:</strong> Go to <strong>Build → Authentication → Get Started</strong> and enable <strong>Email/Password</strong> or <strong>Anonymous</strong>.
                </li>
                <li>
                  <strong className="text-graphite">Paste Security Rules:</strong> Switch to the <strong>Rules</strong> tab and paste the security rules provided.
                </li>
                <li>
                  <strong className="text-graphite">Seed Collections:</strong> Use the button below to automatically seed mock gym members, plans, attendance logs, and transactions into Firestore!
                </li>
              </ol>

              <div className="pt-2 border-t border-cloud-border">
                <div className="flex items-center justify-between p-4 bg-cloud-grey/60 rounded-btn border border-cloud-border">
                  <div>
                    <h5 className="font-bold text-graphite">Synchronize & Seed Initial Firestore Data</h5>
                    <p className="text-graphite-muted">Pushes initial GymPro members, plans, and attendance logs to your Firestore database.</p>
                  </div>
                  <Button
                    onClick={seedFirestoreData}
                    disabled={isSyncing}
                    icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
                  >
                    {isSyncing ? 'Writing to Firestore...' : 'Seed Data Now'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white/70 border-t border-cloud-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-graphite-muted">Connection status:</span>
            <span className="font-semibold text-graphite flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-status-success' : 'bg-status-warning'}`} />
              {firebaseConnected ? 'Firebase Ready' : 'Standby / Local Fallback Active'}
            </span>
          </div>
          <Button variant="dark" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>

      </div>
    </div>
  );
};
