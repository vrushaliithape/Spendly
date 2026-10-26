import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  Download,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Wallet
} from 'lucide-react';
import TopNav from '../components/common/TopNav';
import TransactionModal from '../components/transactions/TransactionModal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { transactionService } from '../services/transactionService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { useAuth } from '../context/AuthContext';

const allCategories = Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]));

const Transactions = () => {
  const { openMobileNav, refreshTrigger } = useOutletContext();
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  // Transaction list state
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters and pagination state
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortDir, setSortDir] = useState('desc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTx, setDeletingTx] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy,
        sortDir,
      };
      if (type) params.type = type;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      const res = await transactionService.getTransactions(params);
      setTransactions(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, size, type, category, startDate, endDate, search, sortBy, sortDir]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (formData) => {
    if (editingTx) {
      await transactionService.updateTransaction(editingTx.id, formData);
    } else {
      await transactionService.createTransaction(formData);
    }
    fetchTransactions();
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      await transactionService.deleteTransaction(deletingTx.id);
      setDeletingTx(null);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const params = {};
      if (type) params.type = type;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      await transactionService.exportCsv(params);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(0);
  };

  const clearFilters = () => {
    setType('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(0);
  };

  const hasActiveFilters = type || category || startDate || endDate || search;

  return (
    <>
      <TopNav
        title="Transactions"
        subtitle="Manage and analyze your income and expense records with filtering and CSV export."
        onOpenMobileMenu={openMobileNav}
        onOpenAddModal={handleOpenAdd}
      />

      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls & Filter Bar */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.875rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: 240, flex: '1 1 240px' }}>
                <input
                  type="text"
                  placeholder="Search description or category..."
                  className="form-input"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  style={{ paddingLeft: '2.5rem', fontSize: '0.8125rem' }}
                />
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)',
                  }}
                />
              </div>

              {/* Type Filter */}
              <select
                className="form-select"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(0);
                }}
                style={{ width: 'auto', minWidth: 120, fontSize: '0.8125rem' }}
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>

              {/* Category Filter */}
              <select
                className="form-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(0);
                }}
                style={{ width: 'auto', minWidth: 140, fontSize: '0.8125rem' }}
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Date Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                  style={{ width: 'auto', fontSize: '0.8125rem' }}
                  title="From Date"
                />
                <span style={{ color: 'var(--text-light)' }}>-</span>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(0);
                  }}
                  style={{ width: 'auto', fontSize: '0.8125rem' }}
                  title="To Date"
                />
              </div>

              {/* Export & Clear Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={handleExportCsv}
                  className="btn btn-secondary btn-sm"
                  disabled={isExporting || totalElements === 0}
                  title="Export filtered records to CSV"
                >
                  <Download size={15} />
                  <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={15} />
                  <span>New Transaction</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table Card */}
          <div className="card" style={{ padding: '0' }}>
            {loading ? (
              <LoadingSpinner message="Loading transactions..." />
            ) : transactions.length === 0 ? (
              <div style={{ padding: '2rem' }}>
                <EmptyState
                  icon={Wallet}
                  title={hasActiveFilters ? 'No matching transactions' : 'No transactions recorded'}
                  description={
                    hasActiveFilters
                      ? 'Try clearing or modifying your filter criteria.'
                      : 'Add your first income or expense transaction to see it listed here.'
                  }
                  actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add Transaction'}
                  onAction={hasActiveFilters ? clearFilters : handleOpenAdd}
                />
              </div>
            ) : (
              <>
                <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleSort('transactionDate')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span>Date</span>
                            <ArrowUpDown size={12} />
                          </div>
                        </th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Payment Method</th>
                        <th
                          style={{ textAlign: 'right', cursor: 'pointer' }}
                          onClick={() => toggleSort('amount')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                            <span>Amount</span>
                            <ArrowUpDown size={12} />
                          </div>
                        </th>
                        <th style={{ textAlign: 'center', width: 90 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                            {formatDate(tx.transactionDate)}
                          </td>
                          <td>
                            <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{tx.category}</td>
                          <td style={{ color: 'var(--text-main)', maxWidth: 220 }}>
                            {tx.description || <span style={{ color: 'var(--text-light)' }}>—</span>}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                            {tx.paymentMethod || 'Cash'}
                          </td>
                          <td style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)',
                          }}>
                            {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                              <button
                                onClick={() => handleOpenEdit(tx)}
                                className="btn-icon"
                                title="Edit transaction"
                                aria-label="Edit transaction"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => setDeletingTx(tx)}
                                className="btn-icon"
                                title="Delete transaction"
                                aria-label="Delete transaction"
                                style={{ color: 'var(--danger)' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                }}>
                  <div>
                    Showing <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{transactions.length}</span> of{' '}
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{totalElements}</span> records
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        Page {page + 1} of {totalPages}
                      </span>

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={editingTx}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${deletingTx?.type.toLowerCase()} record of ${deletingTx ? formatCurrency(deletingTx.amount, currency) : ''}? This action cannot be undone.`}
        confirmText="Delete Transaction"
        isLoading={isDeleting}
      />
    </>
  );
};

export default Transactions;
