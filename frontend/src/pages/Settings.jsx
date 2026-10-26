import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  Lock,
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';
import TopNav from '../components/common/TopNav';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { settingsService } from '../services/settingsService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

const currencies = [
  { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
];

const Settings = () => {
  const { openAddTxModal, openMobileNav } = useOutletContext();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Profile Form
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsService.getSettings();
        setProfileData(data);
        setFullName(data.fullName || '');
        setCurrency(data.currency || 'INR');
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty');
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await settingsService.updateProfile({
        fullName: fullName.trim(),
        currency,
      });
      setProfileData(updated);
      updateUser({ fullName: updated.fullName, currency: updated.currency });
      setProfileSuccess('Profile and currency preferences updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      await settingsService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <TopNav
        title="Settings & Preferences"
        subtitle="Manage your profile information, currency preferences, account credentials, and database backups."
        onOpenMobileMenu={openMobileNav}
        onOpenAddModal={openAddTxModal}
      />

      <div className="page-body">
        {loading ? (
          <LoadingSpinner message="Loading account settings..." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Profile & Currency Card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <User size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Profile Information
                </h2>
              </div>

              {profileSuccess && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success-text)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '1rem',
                  fontWeight: 500,
                }}>
                  <CheckCircle2 size={16} flexShrink={0} />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger-text)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '1rem',
                  fontWeight: 500,
                }}>
                  <AlertCircle size={16} flexShrink={0} />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileData?.email || ''}
                    disabled
                    style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Currency Display Preference</label>
                  <select
                    className="form-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>
                    Note: Changing currency updates the display symbol for all dashboard numbers and reports.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Member Since</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {formatDate(profileData?.createdAt?.split('T')[0]) || 'Active'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={profileSaving}
                  style={{ marginTop: '0.5rem' }}
                >
                  <Save size={15} />
                  <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <Lock size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Security & Password
                </h2>
              </div>

              {passwordSuccess && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success-text)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '1rem',
                  fontWeight: 500,
                }}>
                  <CheckCircle2 size={16} flexShrink={0} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger-text)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '1rem',
                  fontWeight: 500,
                }}>
                  <AlertCircle size={16} flexShrink={0} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-input"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={passwordSaving}
                  style={{ marginTop: '0.5rem' }}
                >
                  <Lock size={15} />
                  <span>{passwordSaving ? 'Updating...' : 'Change Password'}</span>
                </button>
              </form>
            </div>

            {/* SQLite Database Backup Instructions Card */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                <Database size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Local SQLite Database & Backup Guide
                </h2>
              </div>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '0.75rem' }}>
                  Spendly stores all user accounts, transactions, category budgets, and savings goals in a single SQLite database file:
                </p>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem',
                }}>
                  spendly/backend/data/spendly.db
                </div>

                <h4 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  How to Backup Your Database:
                </h4>
                <ol style={{ paddingLeft: '1.25rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  <li>Stop the backend service or ensure no write transactions are active.</li>
                  <li>Copy <code>spendly/backend/data/spendly.db</code> to your backup destination (e.g. <code>spendly_backup_YYYYMMDD.db</code>).</li>
                </ol>

                <h4 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  How to Restore:
                </h4>
                <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                  <li>Stop the backend application.</li>
                  <li>Replace <code>spendly/backend/data/spendly.db</code> with your backup file.</li>
                  <li>Restart the backend application. All records will be automatically available.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;
