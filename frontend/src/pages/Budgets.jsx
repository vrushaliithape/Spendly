import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2
} from 'lucide-react';
import TopNav from '../components/common/TopNav';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { budgetService } from '../services/budgetService';
import { formatCurrency } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { useAuth } from '../context/AuthContext';

const Budgets = () => {
  const { openAddTxModal, openMobileNav, refreshTrigger } = useOutletContext();
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form state
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await budgetService.getBudgets(selectedMonth, selectedYear);
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets, refreshTrigger]);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setCategory(EXPENSE_CATEGORIES[0]);
    setMonthlyLimit('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setMonthlyLimit(budget.monthlyLimit.toString());
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setModalError('');

    const limitNum = parseFloat(monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setModalError('Please enter a valid monthly limit amount');
      return;
    }

    setModalLoading(true);
    try {
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget.id, {
          category,
          monthlyLimit: limitNum,
          month: selectedMonth,
          year: selectedYear,
        });
      } else {
        await budgetService.createBudget({
          category,
          monthlyLimit: limitNum,
          month: selectedMonth,
          year: selectedYear,
        });
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!deletingBudget) return;
    setIsDeleting(true);
    try {
      await budgetService.deleteBudget(deletingBudget.id);
      setDeletingBudget(null);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Summary figures
  const totalBudgeted = budgets.reduce((acc, b) => acc + (b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spentAmount || 0), 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <>
      <TopNav
        title="Budgets"
        subtitle="Set spending limits per category and track alerts to prevent overspending."
        onOpenMobileMenu={openMobileNav}
        onOpenAddModal={openAddTxModal}
        showMonthFilter={true}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Action & Top Overview */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Budgeted
                </span>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatCurrency(totalBudgeted, currency)}
                </p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Spent
                </span>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: totalSpent > totalBudgeted ? 'var(--danger)' : 'var(--text-main)' }}>
                  {formatCurrency(totalSpent, currency)}
                </p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Overall Consumption
                </span>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: overallPercentage >= 100 ? 'var(--danger)' : overallPercentage >= 80 ? 'var(--warning)' : 'var(--success)' }}>
                  {overallPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Create Category Budget</span>
            </button>
          </div>

          {/* Budget List */}
          {loading ? (
            <LoadingSpinner message="Calculating budget usage..." />
          ) : budgets.length === 0 ? (
            <EmptyState
              icon={PieChart}
              title="No budgets set for this month"
              description="Establish monthly spending limits on Food, Travel, Shopping, etc. to get warning alerts before overspending."
              actionLabel="Create First Budget"
              onAction={handleOpenAdd}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}>
              {budgets.map((b) => {
                const isExceeded = b.alertStatus === 'EXCEEDED';
                const isWarning = b.alertStatus === 'WARNING';
                const progressWidth = Math.min(100, b.percentageUsed);

                let progressColor = 'var(--primary)';
                if (isExceeded) progressColor = 'var(--danger)';
                else if (isWarning) progressColor = 'var(--warning)';

                return (
                  <div key={b.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {b.category}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Limit: {formatCurrency(b.monthlyLimit, currency)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="btn-icon"
                          title="Edit budget"
                          aria-label="Edit budget"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingBudget(b)}
                          className="btn-icon"
                          title="Delete budget"
                          aria-label="Delete budget"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        marginBottom: '0.375rem',
                      }}>
                        <span style={{ color: 'var(--text-main)' }}>
                          Spent: {formatCurrency(b.spentAmount, currency)}
                        </span>
                        <span style={{ color: isExceeded ? 'var(--danger)' : isWarning ? 'var(--warning-text)' : 'var(--text-muted)' }}>
                          {b.percentageUsed.toFixed(1)}%
                        </span>
                      </div>

                      <div style={{
                        height: 8,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#f1f5f9',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${progressWidth}%`,
                          backgroundColor: progressColor,
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>

                    {/* Bottom Alert Message */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isExceeded ? 'var(--danger-light)' : isWarning ? 'var(--warning-light)' : '#f8fafc',
                      color: isExceeded ? 'var(--danger-text)' : isWarning ? 'var(--warning-text)' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}>
                      {isExceeded ? (
                        <>
                          <AlertTriangle size={15} color="var(--danger)" flexShrink={0} />
                          <span>{b.alertMessage}</span>
                        </>
                      ) : isWarning ? (
                        <>
                          <AlertTriangle size={15} color="var(--warning)" flexShrink={0} />
                          <span>{b.alertMessage}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} color="var(--success)" flexShrink={0} />
                          <span>Remaining: {formatCurrency(b.remainingAmount, currency)}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Budget' : 'Create Category Budget'}
        maxWidth={440}
      >
        <form onSubmit={handleSaveBudget}>
          {modalError && (
            <div style={{
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              fontWeight: 500,
            }}>
              {modalError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit ({currency})</label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 5000"
              className="form-input"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary btn-sm"
              disabled={modalLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={modalLoading}
            >
              {modalLoading ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteBudget}
        title="Delete Budget"
        message={`Are you sure you want to delete the ${deletingBudget?.category} budget? Transactions in this category will not be deleted.`}
        confirmText="Delete Budget"
        isLoading={isDeleting}
      />
    </>
  );
};

export default Budgets;
