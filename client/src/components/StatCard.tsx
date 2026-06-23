import React from 'react';
import * as Lucide from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  iconName: keyof typeof Lucide;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'cyan' | 'blue' | 'green' | 'amber' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconName,
  trend,
  color = 'cyan'
}) => {
  // Get the Lucide icon dynamically
  const IconComponent = Lucide[iconName] as React.ComponentType<{ className?: string; size?: number }>;

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          iconBg: 'rgba(59, 130, 246, 0.1)',
          iconColor: '#3b82f6',
          glow: 'rgba(59, 130, 246, 0.1)'
        };
      case 'green':
        return {
          iconBg: 'rgba(16, 185, 129, 0.1)',
          iconColor: '#10b981',
          glow: 'rgba(16, 185, 129, 0.1)'
        };
      case 'amber':
        return {
          iconBg: 'rgba(245, 158, 11, 0.1)',
          iconColor: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.1)'
        };
      case 'red':
        return {
          iconBg: 'rgba(239, 68, 68, 0.1)',
          iconColor: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.1)'
        };
      case 'cyan':
      default:
        return {
          iconBg: 'rgba(0, 210, 255, 0.1)',
          iconColor: '#0891b2',
          glow: 'rgba(0, 210, 255, 0.1)'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="card" style={{ flex: '1 1 200px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '14px'
      }}>
        <div>
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {title}
          </span>
          <h3 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginTop: '4px',
            lineHeight: 1.1,
            color: 'var(--text-primary)'
          }}>
            {value}
          </h3>
        </div>
        <div style={{
          backgroundColor: colors.iconBg,
          color: colors.iconColor,
          padding: '10px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 10px ${colors.glow}`
        }}>
          {IconComponent && <IconComponent size={20} />}
        </div>
      </div>
      
      {trend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px'
        }}>
          <span style={{
            color: trend.isPositive ? 'var(--status-active-text)' : 'var(--status-aog-text)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            vs last week
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
