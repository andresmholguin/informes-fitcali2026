import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 shadow-modal text-sm">
      <p className="font-medium text-on-surface mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-on-surface-variant">
          {p.name}: {formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function LineChartComponent({ data = [], title, delay = 0 }) {
  const chartData = data.map(d => ({
    ...d,
    label: formatDate(d.fecha, 'dd/MM'),
  }));

  return (
    <GlassCard className="p-6 flex flex-col" delay={delay}>
      {title && (
        <h3 className="font-headline text-title-md text-on-surface mb-6">{title}</h3>
      )}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height={200}>
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e1f0" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#444557' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#444557' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="boletos"
              name="Boletos"
              stroke="#003091"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#003091' }}
            />
            <Line
              type="monotone"
              dataKey="ingresos"
              name="Ingresos"
              stroke="#006a68"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#006a68' }}
              yAxisId="right"
            />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#444557' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
