import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.8125rem',
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          {label}
        </p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.15rem' }}>
            <span>{entry.name}:</span>
            <span style={{ fontWeight: 700 }}>{formatCurrency(entry.value, currency)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CashFlowChart = ({ data = [], currency = 'INR' }) => {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 280,
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        textAlign: 'center',
      }}>
        <p>No cash flow history available yet</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
          Income and expenses recorded over time will appear here
        </span>
      </div>
    );
  }

  return (
    <div style={{ height: 280, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="monthName"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '0.8125rem', paddingTop: '0.75rem' }}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="expense"
            name="Expense"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;
