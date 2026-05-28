import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { CHART_PALETTE } from '@/utils/constants';
import { formatNumber } from '@/utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 shadow-modal text-sm">
      <p className="font-medium text-on-surface">{d.tipo}</p>
      <p className="text-on-surface-variant">{formatNumber(d.cantidad)} boletos · {d.porcentaje}%</p>
    </div>
  );
};

export default function DonutChart({ data = [], title = 'Ventas por procedencia', centerLabel = '', delay = 0 }) {
  const total = data.reduce((s, d) => s + d.cantidad, 0);

  return (
    <GlassCard className="p-6 flex flex-col" delay={delay}>
      <h3 className="font-headline text-title-md text-on-surface mb-6">
        {title}
      </h3>

      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="w-48 h-48 mx-auto relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="cantidad"
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="block font-headline text-headline-lg text-on-surface">100%</span>
              <span className="font-label text-label-caps text-on-surface-variant">{centerLabel}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 w-full">
          {data.map((d, i) => (
            <div key={d.tipo} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                <span className="font-body text-body-sm">{d.tipo}</span>
              </div>
              <span className="font-body text-body-sm font-medium">
                {d.porcentaje}% ({formatNumber(d.cantidad)})
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
