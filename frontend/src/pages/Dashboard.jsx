import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  PlusCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import TopNav from '../components/common/TopNav';
import SummaryCard from '../components/dashboard/SummaryCard';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { openAddTxModal, openMobileNav, refreshTrigger } = useOutletContext();
  const { user } = useAuth();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [cashflowData, setCashflowData] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, catRes, flowRes, recentRes] = await Promise.all([
        dashboardService.getSummary(selectedMonth, selectedYear),
        dashboardService.getCategoryBreakdown(selectedMonth, selectedYear),
        dashboardService.getMonthlyCashFlow(6),
        dashboardService.getRecentTransactions(),
      ]);

      setSummary(sumRes);
      setCategoryData(catRes);
      setCashflowData(flowRes);
      setRecentTx(recentRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  const currency = summary?.currency || user?.currency || 'INR';

  return (
    <>
      <TopNav
        title="Financial Overview"
        subtitle="Monitor monthly cash flow, category expenses, and smart savings."
        onOpenMobileMenu={openMobileNav}
        onOpenAddModal={openAddTxModal}
        showMonthFilter={true}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <div className="page-body">
        {loading ? (
          <LoadingSpinner message="Calculating dashboard analytics..." />
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Summary Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}>
              <SummaryCard
                title="Total Income"
                amount={summary?.totalIncome || 0}
                currency={currency}
                icon={ArrowUpRight}
                iconColor="var(--success)"
                iconBg="var(--success-light)"
                percentChange={summary?.incomeChangePercent}
                hasPreviousData={summary?.hasPreviousMonthData}
                isPositiveGood={true}
              />

              <SummaryCard
                title="Total Expenses"
                amount={summary?.totalExpenses || 0}
                currency={currency}
                icon={ArrowDownRight}
                iconColor="var(--danger)"
                iconBg="var(--danger-light)"
                percentChange={summary?.expenseChangePercent}
                hasPreviousData={summary?.hasPreviousMonthData}
                isPositiveGood={false}
              />

              <SummaryCard
                title="Net Remaining"
                amount={summary?.netRemaining || 0}
                currency={currency}
                icon={Wallet}
                iconColor="var(--primary)"
                iconBg="var(--primary-light)"
                percentChange={summary?.netChangePercent}
                hasPreviousData={summary?.hasPreviousMonthData}
                isPositiveGood={true}
              />

              <SummaryCard
                title="Savings Rate"
                amount={summary?.savingsRate || 0}
                currency={currency}
                icon={PiggyBank}
                iconColor="#8b5cf6"
                iconBg="#f5f3ff"
                helperText="Percentage of income saved"
              />
            </div>

            {/* Charts Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.25rem',
            }}>
              {/* Monthly Cash Flow Bar Chart */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Cash Flow History
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Comparison of income vs expenses across recent months
                    </p>
                  </div>
                </div>
                <CashFlowChart data={cashflowData} currency={currency} />
              </div>

              {/* Expense Category Donut Chart */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Expense by Category
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Distribution of expenses for the selected month
                    </p>
                  </div>
                </div>
                <CategoryPieChart data={categoryData} currency={currency} />
              </div>
            </div>

            {/* Recent Transactions & Quick Insights Row */}
            <div className="card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Recent Transactions
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Your latest recorded financial activities
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={openAddTxModal} className="btn btn-secondary btn-sm">
                    <PlusCircle size={15} />
                    <span>Add</span>
                  </button>
                  <Link to="/transactions" className="btn btn-secondary btn-sm">
                    <span>View All</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {recentTx.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="No transactions yet"
                  description="Start by adding your salary, groceries, bills, or any daily income and expense."
                  actionLabel="Add Your First Transaction"
                  onAction={openAddTxModal}
                />
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Payment Method</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTx.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                            {formatDate(tx.transactionDate)}
                          </td>
                          <td>
                            <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                              {tx.category}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
