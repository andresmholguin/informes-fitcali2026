import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
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
          <span style={{ color: p.color }}>●</span> {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function RevenueBarChart({ data = [], title = 'Tendencia de Ingresos', delay = 0 }) {
  const chartData = data.slice(-14).map(d => ({
    ...d,
    label: formatDate(d.fecha, 'dd/MM'),
  }));

  return (
    <GlassCard className="p-6 flex flex-col" delay={delay}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline text-title-md text-on-surface">{title}</h3>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">Ingresos</span>
        </div>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height={250}>
          <RechartsBarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e1f0" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#444557', fontFamily: 'Inter' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#444557', fontFamily: 'Inter' }}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,48,145,0.05)' }} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#003091" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#003091" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <Bar
              dataKey="ingresos"
              name="Ingresos"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              isAnimationActive={false}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
