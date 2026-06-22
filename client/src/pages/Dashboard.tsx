import React from 'react';
import StatCard from '../components/StatCard';
import {
  mockAircrafts, mockCrew, mockPolicies,
  mockActivities, mockMaintenanceAlerts
} from '../data/mockData';
import {
  Plane, AlertTriangle,
  Clock, ShieldAlert, CheckCircle, Info,
  Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // KPI Calculations from mock data
  const totalAircraft = mockAircrafts.length;
  const activeCrew = mockCrew.filter(c => c.status === 'Active' || c.status === 'Flight Duty').length;
  const totalPolicies = mockPolicies.length;
  const openSnags = mockMaintenanceAlerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length;

  // Aircraft status breakdown for health overview
  const activeAircraft = mockAircrafts.filter(a => a.status === 'Active').length;
  const maintenanceAircraft = mockAircrafts.filter(a => a.status === 'Maintenance').length;
  const aogAircraft = mockAircrafts.filter(a => a.status === 'AOG').length;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle size={14} color="var(--status-aog-text)" />;
      case 'warning':  return <ShieldAlert size={14} color="var(--status-maint-text)" />;
      case 'success':  return <CheckCircle size={14} color="var(--status-active-text)" />;
      default:         return <Info size={14} color="var(--accent-cyan)" />;
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}
           className="kpi-grid">
        <StatCard
          title="Total Aircraft"
          value={totalAircraft}
          iconName="Plane"
          color="cyan"
          trend={{ value: '1 added', isPositive: true }}
        />
        <StatCard
          title="Active Crew"
          value={activeCrew}
          iconName="Users"
          color="blue"
          trend={{ value: '2 on duty', isPositive: true }}
        />
        <StatCard
          title="Policies Uploaded"
          value={totalPolicies}
          iconName="FileText"
          color="green"
          trend={{ value: '1 new', isPositive: true }}
        />
        <StatCard
          title="Open Snags"
          value={openSnags}
          iconName="AlertTriangle"
          color="red"
          trend={{ value: '1 critical', isPositive: false }}
        />
      </div>

      {/* Middle Row: Aircraft Health + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}
           className="mid-grid">

        {/* Aircraft Health Overview */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Plane size={16} className="card-title-icon" />
              Fleet Health Overview
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {totalAircraft} aircraft total
            </span>
          </div>

          {/* Stacked bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex', height: '10px', borderRadius: '6px', overflow: 'hidden', gap: '2px'
            }}>
              <div style={{
                flex: activeAircraft, backgroundColor: 'var(--status-active-text)',
                borderRadius: '6px 0 0 6px', transition: 'flex 0.6s ease'
              }} />
              <div style={{
                flex: maintenanceAircraft, backgroundColor: 'var(--status-maint-text)',
                transition: 'flex 0.6s ease'
              }} />
              <div style={{
                flex: aogAircraft, backgroundColor: 'var(--status-aog-text)',
                borderRadius: '0 6px 6px 0', transition: 'flex 0.6s ease'
              }} />
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Operational', count: activeAircraft, pct: Math.round(activeAircraft / totalAircraft * 100), colorClass: 'badge-active', color: 'var(--status-active-text)' },
              { label: 'In Maintenance', count: maintenanceAircraft, pct: Math.round(maintenanceAircraft / totalAircraft * 100), colorClass: 'badge-maintenance', color: 'var(--status-maint-text)' },
              { label: 'AOG (Grounded)', count: aogAircraft, pct: Math.round(aogAircraft / totalAircraft * 100), colorClass: 'badge-aog', color: 'var(--status-aog-text)' }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0
                  }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.pct}%</span>
                  <span className={`badge ${item.colorClass}`}>{item.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Individual aircraft */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            {mockAircrafts.map(ac => (
              <div key={ac.aircraftNumber} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ac.aircraftNumber}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {ac.model}
                  </div>
                </div>
                <span className={`badge ${
                  ac.status === 'Active' ? 'badge-active' :
                  ac.status === 'Maintenance' ? 'badge-maintenance' : 'badge-aog'
                }`}>
                  {ac.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Activity size={16} className="card-title-icon" />
              Recent Activity
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {mockActivities.map((act, idx) => (
              <div key={act.id} style={{
                display: 'flex', gap: '12px', position: 'relative',
                paddingBottom: idx < mockActivities.length - 1 ? '16px' : '0'
              }}>
                {/* Timeline line */}
                {idx < mockActivities.length - 1 && (
                  <div style={{
                    position: 'absolute', left: '11px', top: '28px', bottom: '0',
                    width: '1px', backgroundColor: 'var(--border-color)'
                  }} />
                )}
                {/* Dot */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: act.type === 'critical' ? 'var(--status-aog-bg)' :
                    act.type === 'warning' ? 'var(--status-maint-bg)' :
                    act.type === 'success' ? 'var(--status-active-bg)' : 'rgba(0,210,255,0.1)',
                  border: `1px solid ${
                    act.type === 'critical' ? 'var(--status-aog-border)' :
                    act.type === 'warning' ? 'var(--status-maint-border)' :
                    act.type === 'success' ? 'var(--status-active-border)' : 'rgba(0,210,255,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1
                }}>
                  {getActivityIcon(act.type)}
                </div>
                {/* Content */}
                <div style={{ paddingTop: '2px', flex: 1 }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.45 }}>
                    {act.message}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} />
                    {formatTime(act.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Alerts */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <ShieldAlert size={16} className="card-title-icon" style={{ color: 'var(--status-aog-text)' }} />
            Active Maintenance Alerts
          </span>
          <span className="badge badge-aog">{mockMaintenanceAlerts.length} open</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockMaintenanceAlerts.map(alert => (
            <div key={alert.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '14px 16px', borderRadius: '8px',
              backgroundColor: alert.severity === 'critical' ? 'var(--status-aog-bg)' :
                alert.severity === 'warning' ? 'var(--status-maint-bg)' : 'rgba(0,210,255,0.05)',
              border: `1px solid ${
                alert.severity === 'critical' ? 'var(--status-aog-border)' :
                alert.severity === 'warning' ? 'var(--status-maint-border)' : 'rgba(0,210,255,0.2)'}`
            }}>
              <ShieldAlert
                size={18}
                color={alert.severity === 'critical' ? 'var(--status-aog-text)' :
                  alert.severity === 'warning' ? 'var(--status-maint-text)' : 'var(--accent-cyan)'}
                style={{ flexShrink: 0, marginTop: '1px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{
                      fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginRight: '8px'
                    }}>
                      {alert.aircraftNumber}
                    </span>
                    <span className={`badge ${
                      alert.severity === 'critical' ? 'badge-aog' :
                      alert.severity === 'warning' ? 'badge-maintenance' : 'badge-active'
                    }`} style={{ fontSize: '10px' }}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{alert.reportedAt}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .mid-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;