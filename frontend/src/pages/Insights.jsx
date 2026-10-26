import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Info,
  HelpCircle
} from 'lucide-react';
import TopNav from '../components/common/TopNav';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { insightService } from '../services/insightService';

const Insights = () => {
  const { openAddTxModal, openMobileNav } = useOutletContext();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const data = await insightService.getInsights(selectedMonth, selectedYear);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 size={22} color="var(--success)" />;
      case 'WARNING':
        return <AlertTriangle size={22} color="var(--danger)" />;
      case 'TIP':
        return <Lightbulb size={22} color="var(--warning)" />;
      default:
        return <Info size={22} color="var(--info)" />;
    }
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case 'SUCCESS':
        return 'badge-income';
      case 'WARNING':
        return 'badge-expense';
      case 'TIP':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  return (
    <>
      <TopNav
        title="Smart Insights"
        subtitle="Rule-based financial observations calculated strictly from your recorded cash flows and budgets."
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
          {/* Informative Header Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--primary-light)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #e0e7ff',
          }}>
            <Sparkles size={24} color="var(--primary)" flexShrink={0} />
            <div style={{ fontSize: '0.875rem', color: 'var(--primary-text)' }}>
              <strong>Transparent Financial Rules:</strong> These insights are computed deterministically from your actual monthly transactions, category limits, and goal milestones without using external AI or probabilistic models.
            </div>
          </div>

          {/* Insights List */}
          {loading ? (
            <LoadingSpinner message="Evaluating spending rules and trends..." />
          ) : insights.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No insights available"
              description="Add your income, expenses, and category budgets to generate smart spending recommendations."
              actionLabel="Add Transaction"
              onAction={openAddTxModal}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.25rem',
            }}>
              {insights.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    borderLeft: `4px solid ${
                      item.type === 'SUCCESS' ? 'var(--success)' :
                      item.type === 'WARNING' ? 'var(--danger)' :
                      item.type === 'TIP' ? 'var(--warning)' : 'var(--info)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {getInsightIcon(item.type)}
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.title}
                      </h3>
                    </div>
                    <span className={`badge ${getBadgeClass(item.type)}`}>
                      {item.type}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {item.message}
                  </p>

                  {/* Rule Transparency Box */}
                  <div style={{
                    marginTop: 'auto',
                    padding: '0.625rem 0.875rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #f1f5f9',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <HelpCircle size={14} color="var(--text-light)" flexShrink={0} />
                    <span>{item.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Insights;
