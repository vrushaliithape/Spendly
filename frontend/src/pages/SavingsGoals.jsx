import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle,
  Coins,
  History,
  Edit2,
  Trash2,
  Clock
} from 'lucide-react';
import TopNav from '../components/common/TopNav';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { savingsService } from '../services/savingsService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const SavingsGoals = () => {
  const { openAddTxModal, openMobileNav } = useOutletContext();
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [goals, setGoals] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, IN_PROGRESS, COMPLETED
  const [loading, setLoading] = useState(true);

  // Goal Modal (Create / Edit)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalModalError, setGoalModalError] = useState('');
  const [goalModalLoading, setGoalModalLoading] = useState(false);

  // Contribution Modal
  const [contributingGoal, setContributingGoal] = useState(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribDate, setContribDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [contribNote, setContribNote] = useState('');
  const [contribError, setContribError] = useState('');
  const [contribLoading, setContribLoading] = useState(false);

  // Contribution History Modal
  const [historyGoal, setHistoryGoal] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Delete Modal
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'ALL' ? null : activeTab;
      const data = await savingsService.getGoals(statusParam);
      setGoals(data);
    } catch (err) {
      console.error('Failed to load savings goals:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setGoalName('');
    setTargetAmount('');
    setTargetDate('');
    setGoalDescription('');
    setGoalModalError('');
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setTargetDate(goal.targetDate || '');
    setGoalDescription(goal.description || '');
    setGoalModalError('');
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setGoalModalError('');

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      setGoalModalError('Please enter a valid target amount');
      return;
    }

    setGoalModalLoading(true);
    try {
      const payload = {
        name: goalName.trim(),
        targetAmount: targetNum,
        targetDate: targetDate || null,
        description: goalDescription.trim(),
      };

      if (editingGoal) {
        await savingsService.updateGoal(editingGoal.id, payload);
      } else {
        await savingsService.createGoal(payload);
      }
      setIsGoalModalOpen(false);
      fetchGoals();
    } catch (err) {
      setGoalModalError(err.response?.data?.message || 'Failed to save savings goal');
    } finally {
      setGoalModalLoading(false);
    }
  };

  const handleOpenContribute = (goal) => {
    setContributingGoal(goal);
    setContribAmount('');
    setContribDate(new Date().toISOString().split('T')[0]);
    setContribNote('');
    setContribError('');
  };

  const handleSaveContribution = async (e) => {
    e.preventDefault();
    setContribError('');

    const amountNum = parseFloat(contribAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setContribError('Please enter a valid contribution amount');
      return;
    }

    setContribLoading(true);
    try {
      await savingsService.addContribution(contributingGoal.id, {
        amount: amountNum,
        contributionDate: contribDate,
        note: contribNote.trim(),
      });
      setContributingGoal(null);
      fetchGoals();
    } catch (err) {
      setContribError(err.response?.data?.message || 'Failed to add contribution');
    } finally {
      setContribLoading(false);
    }
  };

  const handleOpenHistory = async (goal) => {
    setHistoryGoal(goal);
    setHistoryLoading(true);
    try {
      const list = await savingsService.getContributions(goal.id);
      setContributions(list);
    } catch (err) {
      console.error('Failed to load contributions:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoal) return;
    setIsDeleting(true);
    try {
      await savingsService.deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics
  const totalTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const overallPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <>
      <TopNav
        title="Savings Goals"
        subtitle="Set targets, deposit smart contributions, and watch your progress grow."
        onOpenMobileMenu={openMobileNav}
        onOpenAddModal={openAddTxModal}
      />

      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Overview & Action Banner */}
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
                  Total Goal Targets
                </span>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatCurrency(totalTarget, currency)}
                </p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Accumulated
                </span>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>
                  {formatCurrency(totalSaved, currency)}
                </p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Overall Progress
                </span>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {overallPercent.toFixed(1)}%
                </p>
              </div>
            </div>

            <button onClick={handleOpenAddGoal} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>New Savings Goal</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {['ALL', 'IN_PROGRESS', 'COMPLETED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.45rem 0.875rem',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {tab === 'ALL' ? 'All Goals' : tab === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>

          {/* Goals Grid */}
          {loading ? (
            <LoadingSpinner message="Loading savings goals..." />
          ) : goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No savings goals found"
              description="Create a savings target for an emergency fund, holiday trip, gadget purchase, or education."
              actionLabel="Create Your First Goal"
              onAction={handleOpenAddGoal}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}>
              {goals.map((g) => {
                const isCompleted = g.status === 'COMPLETED' || g.percentageCompleted >= 100;
                const progressWidth = Math.min(100, g.percentageCompleted);

                return (
                  <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {g.name}
                          </h3>
                          {isCompleted && (
                            <span className="badge badge-income" style={{ fontSize: '0.6875rem' }}>
                              Completed
                            </span>
                          )}
                        </div>
                        {g.description && (
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {g.description}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button
                          onClick={() => handleOpenEditGoal(g)}
                          className="btn-icon"
                          title="Edit goal"
                          aria-label="Edit goal"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingGoal(g)}
                          className="btn-icon"
                          title="Delete goal"
                          aria-label="Delete goal"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Amount Row */}
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '0.375rem',
                      }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {formatCurrency(g.currentAmount, currency)}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          of {formatCurrency(g.targetAmount, currency)} ({g.percentageCompleted.toFixed(1)}%)
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
                          backgroundColor: isCompleted ? 'var(--success)' : 'var(--primary)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>

                    {/* Target Date & Remaining Details */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '0.75rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} color="var(--text-light)" />
                        <span>
                          {g.targetDate ? `Target: ${formatDate(g.targetDate)}` : 'No deadline'}
                        </span>
                      </div>

                      <div>
                        {isCompleted ? (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                            Goal Achieved!
                          </span>
                        ) : (
                          <span>
                            Remaining: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(g.remainingAmount, currency)}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Add Contribution & View History */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button
                        onClick={() => handleOpenContribute(g)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Coins size={14} color="var(--primary)" />
                        <span>Contribute</span>
                      </button>

                      <button
                        onClick={() => handleOpenHistory(g)}
                        className="btn btn-secondary btn-sm"
                        title="View deposit history"
                      >
                        <History size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Goal Modal (Create / Edit) */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={editingGoal ? 'Edit Savings Goal' : 'New Savings Goal'}
        maxWidth={450}
      >
        <form onSubmit={handleSaveGoal}>
          {goalModalError && (
            <div style={{
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              fontWeight: 500,
            }}>
              {goalModalError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. Emergency Fund, New Laptop, Vacation"
              className="form-input"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Amount ({currency})</label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 50000"
              className="form-input"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Why are you saving for this?"
              className="form-textarea"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="btn btn-secondary btn-sm"
              disabled={goalModalLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={goalModalLoading}
            >
              {goalModalLoading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Contribution Modal */}
      <Modal
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        title={`Contribute to "${contributingGoal?.name}"`}
        maxWidth={420}
      >
        <form onSubmit={handleSaveContribution}>
          {contribError && (
            <div style={{
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              fontWeight: 500,
            }}>
              {contribError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Contribution Amount ({currency})</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="form-input"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contribution Date</label>
            <input
              type="date"
              className="form-input"
              value={contribDate}
              onChange={(e) => setContribDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Month-end bonus, Freelance savings"
              className="form-input"
              value={contribNote}
              onChange={(e) => setContribNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setContributingGoal(null)}
              className="btn btn-secondary btn-sm"
              disabled={contribLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={contribLoading}
            >
              {contribLoading ? 'Saving...' : 'Add Contribution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribution History Modal */}
      <Modal
        isOpen={!!historyGoal}
        onClose={() => setHistoryGoal(null)}
        title={`Contribution History: ${historyGoal?.name}`}
        maxWidth={480}
      >
        {historyLoading ? (
          <LoadingSpinner message="Fetching contributions..." />
        ) : contributions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem', fontSize: '0.875rem' }}>
            No contributions made towards this goal yet.
          </p>
        ) : (
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Note</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {formatDate(c.contributionDate)}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {c.note || <span style={{ color: 'var(--text-light)' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                      +{formatCurrency(c.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteGoal}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete the goal "${deletingGoal?.name}"? All associated contribution records will be permanently removed.`}
        confirmText="Delete Goal"
        isLoading={isDeleting}
      />
    </>
  );
};

export default SavingsGoals;
