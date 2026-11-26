import React from 'react';
import { MemberStatus } from '../../types/gym';

interface BadgeProps {
  status: MemberStatus | 'granted' | 'denied' | 'pending' | 'completed' | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'granted':
      case 'completed':
        return 'bg-status-success/15 text-status-success border-status-success/30';
      case 'expiring':
      case 'warning':
      case 'pending':
        return 'bg-status-warning/15 text-[#B87D1A] border-status-warning/30';
      case 'expired':
      case 'denied':
      case 'failed':
        return 'bg-status-error/15 text-status-error border-status-error/30';
      default:
        return 'bg-cloud-grey text-graphite-muted border-cloud-border';
    }
  };

  const formatText = (text: string) => {
    if (text === 'expiring') return 'Expiring Soon';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formatText(status)}
    </span>
  );
};
