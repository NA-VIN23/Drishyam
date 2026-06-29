import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, ShieldAlert } from 'lucide-react';
import { mockMaintenanceAlerts } from '../data/mockData';

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic Page Title
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Executive Overview & Control Dashboard';
      case '/aircraft':
        return 'Fleet Inventory & Operational Status';
      case '/crew':
        return 'Operations Crew & Flight Manifest';
      case '/crew-planning':
        return 'Crew Shift Planning & Certification Management';
      case '/policies':
        return 'Aviation Policies & Compliance Directives';
      default:
        return 'Drishyam Operations';
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-navbar)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 800,
        height: '70px'
      }}
    >
      {/* Page Title & Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'none'
          }}
          className="mobile-hamburger-btn"
        >
          <Menu size={22} />
        </button>
        
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          margin: 0
        }} className="navbar-title">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Action Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notification Icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative',
              padding: '6px',
              borderRadius: '50%',
              transition: 'background-color var(--transition-fast)'
            }}
            className="icon-hover-btn"
          >
            <Bell size={20} />
            {/* Glowing active notification alert dot */}
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-aog-text)',
              boxShadow: '0 0 6px var(--status-aog-text)'
            }} />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div 
                onClick={() => setShowNotifications(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 850
                }}
              />
              <div style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: '8px',
                padding: '12px 0',
                zIndex: 900,
                animation: 'slideUp 0.15s ease'
              }}>
                <div style={{
                  padding: '4px 16px 10px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Maintenance Warnings
                  </span>
                  <span className="badge badge-aog" style={{ fontSize: '10px', padding: '2px 6px' }}>
                    {mockMaintenanceAlerts.length} urgent
                  </span>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {mockMaintenanceAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        gap: '10px',
                        cursor: 'pointer'
                      }}
                      className="notification-item"
                    >
                      <ShieldAlert 
                        size={16} 
                        color={alert.severity === 'critical' ? 'var(--status-aog-text)' : 'var(--status-maint-text)'} 
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      />
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                          {alert.aircraftNumber}: {alert.message}
                        </p>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {alert.reportedAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '8px 16px 0', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                  <a href="/dashboard" onClick={() => setShowNotifications(false)} style={{ fontSize: '11px', fontWeight: 500 }}>
                    View all aircraft logs
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Separator line */}
        <div style={{
          height: '24px',
          width: '1px',
          backgroundColor: 'var(--border-color)'
        }} />

        {/* User Badge */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="navbar-user">
            <div style={{ textAlign: 'right', display: 'block' }} className="navbar-user-text">
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {user.roleLabel}
              </div>
            </div>
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)'
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-hamburger-btn {
            display: block !important;
          }
          .navbar-user-text {
            display: none !important;
          }
          .navbar-title {
            font-size: 15px !important;
          }
          header {
            padding: 16px !important;
          }
        }
        .icon-hover-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary) !important;
        }
        .notification-item:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </header>
  );
};

export default Navbar;
