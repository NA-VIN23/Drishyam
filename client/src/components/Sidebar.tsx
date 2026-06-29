import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Plane, Users, FileText, LogOut, X, ClipboardList, AlertTriangle, Wrench, CalendarCheck } from 'lucide-react';
import { ROUTE_ACCESS, type RoleKey } from '../data/roles';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ROUTE_ACCESS['/dashboard'] },
    { name: 'Aircraft', path: '/aircraft', icon: Plane, roles: ROUTE_ACCESS['/aircraft'] },
    { name: 'Crew', path: '/crew', icon: Users, roles: ROUTE_ACCESS['/crew'] },
    { name: 'Crew Planning', path: '/crew-planning', icon: CalendarCheck, roles: ROUTE_ACCESS['/crew-planning'] },
    { name: 'Flight Logs', path: '/flight-logs', icon: ClipboardList, roles: ROUTE_ACCESS['/flight-logs'] },
    { name: 'Snags', path: '/snags', icon: AlertTriangle, roles: ROUTE_ACCESS['/snags'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ROUTE_ACCESS['/maintenance'] },
    { name: 'Policies', path: '/policies', icon: FileText, roles: ROUTE_ACCESS['/policies'] },
  ];

  const visibleNavItems = user ? navItems.filter((item) => item.roles.includes(user.roleKey as RoleKey)) : navItems;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 900,
            display: 'block'
          }}
          className="mobile-overlay-only"
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 950,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-normal)',
          height: '100vh',
          overflowY: 'auto'
        }}
        className="sidebar-aside"
      >
        {/* Sidebar Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Pulsing Radar Circle */}
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-cyan)',
              boxShadow: '0 0 10px var(--accent-cyan)',
              animation: 'pulseRadar 2s infinite'
            }} />
            <h1 style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              DRISHYAM
            </h1>
          </div>
          
          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'none'
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{
          flexGrow: 1,
          padding: '24px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => 
                  `nav-link-item ${isActive ? 'active' : ''}`
                }
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(8, 145, 178, 0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                })}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Info & Logout */}
        <div style={{
          padding: '20px 16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)'
                }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {user.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {user.roleLabel}
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="btn btn-danger"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Global CSS to override static styling on viewports and nav-links */}
      <style>{`
        /* Sidebar styles and responsiveness override */
        @media (min-width: 769px) {
          .sidebar-aside {
            transform: translateX(0) !important;
          }
          .mobile-close-btn {
            display: none !important;
          }
          .mobile-overlay-only {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .mobile-close-btn {
            display: block !important;
          }
        }
        .nav-link-item:hover {
          color: var(--text-primary) !important;
          background-color: rgba(8, 145, 178, 0.05) !important;
          padding-left: 20px !important;
        }
        .nav-link-item.active:hover {
          color: var(--accent-cyan) !important;
          background-color: rgba(8, 145, 178, 0.1) !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
