import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No data available',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      textAlign: 'center',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border-color)',
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-full)',
        background: 'var(--bg-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 420, marginBottom: actionLabel ? '1.25rem' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
