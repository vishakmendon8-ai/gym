import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Button } from '../common/Button';
import { Bell, X, Send, Sparkles, Check } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose }) => {
  const { notifications } = useGym();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'announcement' | 'class' | 'alert' | 'membership'>('announcement');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    // Push new notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category,
      isRead: false
    };

    notifications.unshift(newNotif as any);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setTitle('');
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-modal border border-cloud-border shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-cloud-border bg-white/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-control bg-yellow-soft flex items-center justify-center text-graphite font-bold">
              <Bell className="w-4 h-4 text-graphite" />
            </div>
            <div>
              <h3 className="font-black text-sm text-graphite">Broadcast Push Announcement</h3>
              <p className="text-[11px] text-graphite-muted">Broadcast instant alert to all member mobile apps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-control text-graphite-muted hover:text-graphite hover:bg-cloud-grey transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {sent ? (
            <div className="p-6 text-center space-y-2 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-status-success/15 text-status-success flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-bold text-base text-graphite">Announcement Broadcasted!</h4>
              <p className="text-graphite-muted text-xs">Notification delivered to all active member mobile devices.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block font-bold text-graphite mb-1">Target Category</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['announcement', 'class', 'alert', 'membership'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 px-2 rounded-control text-[11px] font-bold capitalize transition-all border ${
                        category === cat
                          ? 'bg-graphite text-white border-graphite'
                          : 'bg-white text-graphite-muted border-cloud-border hover:border-yellow-sunshine'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-graphite mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass: Technical Deadlifts this Saturday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-input bg-white border border-cloud-border text-graphite focus:outline-none focus:border-yellow-sunshine"
                />
              </div>

              <div>
                <label className="block font-bold text-graphite mb-1">Notification Body</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide concise details for your members..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-input bg-white border border-cloud-border text-graphite focus:outline-none focus:border-yellow-sunshine resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                  Send Push Alert
                </Button>
              </div>
            </>
          )}
        </form>

      </div>
    </div>
  );
};
