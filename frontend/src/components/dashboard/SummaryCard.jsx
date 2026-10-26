import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const SummaryCard = ({
  title,
  amount,
  currency = 'INR',
  icon: Icon,
  iconColor = 'var(--primary)',
  iconBg = 'var(--primary-light)',
  percentChange = null,
  hasPreviousData = false,
  isPositiveGood = true,
  helperText,
}) => {
  const isPositive = percentChange !== null && percentChange > 0;
  const isZero = percentChange !== null && percentChange === 0;
  const isNegative = percentChange !== null && percentChange < 0;

  // For expenses, a negative percentage change (spending less) is good!
  const isTrendGood = isPositiveGood ? isPositive : isNegative;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 'var(--radius-md)',
          backgroundColor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {Icon && <Icon size={20} />}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          {typeof amount === 'number' && title.includes('Rate')
            ? `${amount.toFixed(1)}%`
            : formatCurrency(amount, currency)}
        </div>
      </div>

      {/* Comparison trend indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 500 }}>
        {hasPreviousData && percentChange !== null ? (
          <>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontWeight: 700,
              color: isTrendGood ? 'var(--success)' : 'var(--danger)',
            }}>
              {isPositive && <TrendingUp size={14} />}
              {isNegative && <TrendingDown size={14} />}
              {isZero && <Minus size={14} />}
              {Math.abs(percentChange).toFixed(1)}%
            </span>
            <span style={{ color: 'var(--text-muted)' }}>vs previous month</span>
          </>
        ) : (
          <span style={{ color: 'var(--text-light)' }}>
            {helperText || 'Current month data'}
          </span>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
