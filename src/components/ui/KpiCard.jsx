import GlassCard from './GlassCard';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function KpiCard({ label, value, icon: Icon, trend, trendLabel, subtitle, accentColor = 'primary', delay = 0, span = false, children }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    tertiary: 'bg-tertiary/10 text-on-tertiary-fixed',
    success: 'bg-success/10 text-success',
  };

  return (
    <GlassCard
      className={`p-6 flex flex-col justify-between h-32 ${span ? 'lg:col-span-2' : ''}`}
      delay={delay}
    >
      <div className="flex justify-between items-start">
        <span className="font-label text-body-sm text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-md ${colorMap[accentColor] || colorMap.primary}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {children ? children : (
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="font-headline text-headline-lg text-on-surface">{value}</span>
            {subtitle && (
              <span className="font-body text-body-sm text-on-surface-variant mt-0.5">
                {subtitle}
              </span>
            )}
          </div>

          {trend != null && (
            <span className={trend >= 0 ? 'kpi-trend-up' : 'kpi-trend-down'}>
              {trend >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span className="ml-0.5 text-xs font-medium">{Math.abs(trend)}%</span>
            </span>
          )}

          {trendLabel && !trend && (
            <span className="font-body text-body-sm text-on-surface-variant">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}
