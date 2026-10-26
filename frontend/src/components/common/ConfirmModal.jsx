import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={420}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{
          padding: '0.625rem',
          borderRadius: 'var(--radius-full)',
          background: isDanger ? 'var(--danger-light)' : 'var(--warning-light)',
          color: isDanger ? 'var(--danger)' : 'var(--warning)',
          flexShrink: 0,
        }}>
          <AlertTriangle size={24} />
        </div>
        <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.25rem' }}>
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'} btn-sm`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
