import React from 'react';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { mockActivities, mockAircrafts, mockCrew, mockPolicies } from '../data/mockData';
import { Plane, Users, Clock, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const aircraftCount = mockAircrafts.length;
  const crewCount = mockCrew.length;
  const policyCount = mockPolicies.length;
  const alertCount = mockActivities.filter((activity) => activity.type === 'critical' || activity.type === 'warning').length;

  const summaryCards = [
    { title: 'Aircraft', value: aircraftCount, iconName: 'Plane', color: 'cyan', trend: 'Static' },
    { title: 'Crew', value: crewCount, iconName: 'Users', color: 'blue', trend: 'Static' },
    { title: 'Policies', value: policyCount, iconName: 'FileText', color: 'green', trend: 'Static' },
    { title: 'Alerts', value: alertCount, iconName: 'ShieldAlert', color: 'red', trend: 'Static' },
  ] as const;

  return (
    <div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <span className="card-title">
            <Activity size={16} className="card-title-icon" />
            Operations Snapshot
          </span>
          <span className="badge badge-active">{user?.roleLabel ?? 'Operator'}</span>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
          This dashboard is intentionally static for the MVP. It gives a quick fleet, crew, and compliance overview without depending on live backend summaries.
        </p>
      </div>

      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {summaryCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            iconName={card.iconName}
            color={card.color}
            trend={{ value: card.trend, isPositive: true }}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }} className="mid-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Plane size={16} className="card-title-icon" />
              Fleet Highlights
            </span>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {mockAircrafts.slice(0, 4).map((aircraft) => (
              <div key={aircraft.aircraftNumber} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(148,163,184,0.06)', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{aircraft.aircraftNumber}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{aircraft.model}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{aircraft.manufacturer}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{aircraft.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Activity size={16} className="card-title-icon" />
              Recent Activity
            </span>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {mockActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{activity.message}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Clock size={10} />
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <span className="card-title">
            <Users size={16} className="card-title-icon" />
            Crew & Compliance
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="mid-grid">
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(8,145,178,0.06)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Active crew records</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{crewCount}</div>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Policies published</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{policyCount}</div>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Alerts requiring review</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{alertCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;