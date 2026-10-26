import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getCategoryColor } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.625rem 0.875rem',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.8125rem',
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
          {data.category}
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          Amount: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(data.amount, currency)}</span>
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          Share: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ data = [], currency = 'INR' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 260,
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        textAlign: 'center',
      }}>
        <p>No expense data for this month</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
          Record expenses to see category distribution
        </span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ height: 220, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={getCategoryColor(entry.category)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.625rem',
        marginTop: '0.75rem',
        maxHeight: 120,
        overflowY: 'auto',
        padding: '0.25rem',
      }}>
        {data.slice(0, 6).map((item) => (
          <div key={item.category} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: 'var(--radius-full)',
              backgroundColor: getCategoryColor(item.category),
              flexShrink: 0,
            }} />
            <span style={{
              color: 'var(--text-main)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {item.category}
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
