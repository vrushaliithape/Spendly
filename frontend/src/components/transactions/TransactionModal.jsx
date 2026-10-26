import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../utils/categories';

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'EXPENSE');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setCategory(initialData.category || '');
      setDescription(initialData.description || '');
      setTransactionDate(initialData.transactionDate || new Date().toISOString().split('T')[0]);
      setPaymentMethod(initialData.paymentMethod || 'UPI');
    } else {
      setType('EXPENSE');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
    }
    setError('');
  }, [initialData, isOpen]);

  // When type changes, ensure valid default category
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'EXPENSE') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!category.trim()) {
      setError('Please select a category');
      return;
    }

    if (!transactionDate) {
      setError('Please choose a valid transaction date');
      return;
    }

    try {
      await onSubmit({
        type,
        amount: parsedAmount,
        category: category.trim(),
        description: description.trim(),
        transactionDate,
        paymentMethod,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const categoryList = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Add Transaction'}
      maxWidth={480}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* Type Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-subtle)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
        }}>
          <button
            type="button"
            onClick={() => handleTypeChange('EXPENSE')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: type === 'EXPENSE' ? 'var(--danger)' : 'transparent',
              color: type === 'EXPENSE' ? '#ffffff' : 'var(--text-muted)',
              transition: 'var(--transition)',
            }}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('INCOME')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: type === 'INCOME' ? 'var(--success)' : 'transparent',
              color: type === 'INCOME' ? '#ffffff' : 'var(--text-muted)',
              transition: 'var(--transition)',
            }}
          >
            Income
          </button>
        </div>

        {/* Amount Field */}
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Category Field */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date and Payment Method in 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Dinner with colleagues, Freelance project"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
