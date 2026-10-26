import React from 'react';
import { Menu, Plus, Calendar, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TopNav = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onOpenAddModal,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  showMonthFilter = false,
}) => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Title & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenMobileMenu}
          className="btn-icon mobile-menu-btn"
          style={{ display: 'none' }}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Actions & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {showMonthFilter && onMonthChange && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <Calendar size={15} color="var(--text-muted)" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {months.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
            {onYearChange && (
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(parseInt(e.target.value))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Add Transaction Button */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="btn btn-primary btn-sm"
            style={{ boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)' }}
          >
            <Plus size={16} />
            <span className="add-tx-text">Add Transaction</span>
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          header {
            padding: 0.875rem 1.25rem;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (max-width: 640px) {
          .add-tx-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
