import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Sparkles,
  Settings,
  LogOut,
  Wallet,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Savings Goals', path: '/savings', icon: Target },
  { name: 'Insights', path: '/insights', icon: Sparkles },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 90,
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform 0.25s ease-in-out',
          transform: isMobileOpen ? 'translateX(0)' : undefined,
        }}
        className={isMobileOpen ? 'mobile-open' : ''}
      >
        {/* Brand Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
            }}>
              <Wallet size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Spendly
              </span>
              <span style={{
                display: 'block',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: -3,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Smart Finance
              </span>
            </div>
          </div>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="btn-icon mobile-close-btn"
              style={{ display: 'none' }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1.25rem 1rem', overflowY: 'auto' }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--text-light)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 0.75rem 0.5rem 0.75rem',
          }}>
            Menu
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={onMobileClose}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '0.65rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      transition: 'var(--transition)',
                      textDecoration: 'none',
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Card & Logout */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#fafbfc',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-full)',
                background: '#e0e7ff',
                color: '#4338ca',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {getInitials(user?.fullName)}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {user?.fullName || 'User'}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-icon"
              title="Sign out"
              aria-label="Sign out"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          aside {
            transform: translateX(-100%);
          }
          aside.mobile-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
