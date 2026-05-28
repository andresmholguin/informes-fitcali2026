import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { CHART_PALETTE } from '@/utils/constants';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 shadow-modal text-sm">
      <p className="font-medium text-on-surface">{d.name}</p>
      <p className="text-on-surface-variant">{formatNumber(d.boletos)} boletos</p>
      <p className="text-on-surface-variant">{formatCurrency(d.ingresos)}</p>
    </div>
  );
};

export default function HorizontalBarChart({ data = [], title, nameKey = 'name', valueKey = 'ingresos', delay = 0 }) {
  const chartData = data.slice(0, 8).map(d => ({
    name: d[nameKey] || d.evento || d.sala || d.grupo || d.canal || d.vendedor || '',
    boletos: d.boletos || 0,
    ingresos: d.ingresos || 0,
    [valueKey]: d[valueKey] || d.ingresos || 0,
  }));

  return (
    <GlassCard className="p-6 flex flex-col" delay={delay}>
      {title && (
        <h3 className="font-headline text-title-md text-on-surface mb-6">{title}</h3>
      )}
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e1f0" horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#444557' }}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              width={120}
              tick={{ fontSize: 12, fill: '#1a1b26' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,48,145,0.05)' }} />
            <Bar dataKey={valueKey} radius={[0, 4, 4, 0]} maxBarSize={24} isAnimationActive={false}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
