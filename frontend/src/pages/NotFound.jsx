import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '1.5rem',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--danger-light)',
        color: 'var(--danger)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
      }}>
        <AlertCircle size={32} />
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', maxWidth: 400, marginBottom: '1.5rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-sm">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
