import {
  AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { formatCurrency, formatDate } from '@/utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 shadow-modal text-sm">
      <p className="font-medium text-on-surface mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-on-surface-variant">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function AreaChartComponent({ data = [], title, dataKey = 'ingresos', color = '#003091', delay = 0 }) {
  const chartData = data.map(d => ({
    ...d,
    label: formatDate(d.fecha, 'dd MMM'),
  }));

  return (
    <GlassCard className="p-6 flex flex-col" delay={delay}>
      {title && (
        <h3 className="font-headline text-title-md text-on-surface mb-6">{title}</h3>
      )}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height={200}>
          <RechartsAreaChart data={chartData}>
            <defs>
              <linearGradient id={`areaGrad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e1f0" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#444557' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#444557' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              name="Ingresos"
              stroke={color}
              strokeWidth={2}
              fill={`url(#areaGrad-${dataKey})`}
              isAnimationActive={false}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
