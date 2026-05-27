import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import KpiCard from '@/components/ui/KpiCard';
import HorizontalBarChart from '@/components/charts/HorizontalBarChart';
import GlassCard from '@/components/ui/GlassCard';
import { KpiSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { MapPin, Ticket, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

export default function Salas() {
  const { metrics, loading } = useData();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-32 bg-surface-container-high rounded animate-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></div>
        <ChartSkeleton />
      </div>
    );
  }

  const salas = metrics?.ventasPorSala || [];
  const topSala = salas[0];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-display-lg text-on-surface">Salas</h2>
        <p className="font-body text-body-lg text-on-surface-variant mt-1">
          Rendimiento y ocupación por sala / lugar.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Total salas" value={formatNumber(salas.length)} icon={MapPin} delay={0} />
        <KpiCard label="Sala más rentable" value={topSala?.sala || '—'} icon={DollarSign} delay={1} />
        <KpiCard label="Boletos en top sala" value={formatNumber(topSala?.boletos || 0)} icon={Ticket} delay={2} />
      </div>

      <HorizontalBarChart data={salas} title="Ranking de Salas por Ingresos" nameKey="sala" delay={3} />

      {/* Detailed list */}
      <GlassCard className="overflow-hidden" delay={4}>
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
          <h3 className="font-headline text-title-md text-on-surface">Detalle por Sala</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="p-4 font-semibold">Sala</th>
                <th className="p-4 font-semibold text-right">Eventos</th>
                <th className="p-4 font-semibold text-right">Boletos</th>
                <th className="p-4 font-semibold text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {salas.map((s, i) => (
                <tr key={i} className="table-row">
                  <td className="p-4 font-body text-body-sm font-medium text-on-surface">{s.sala}</td>
                  <td className="p-4 text-right font-body text-body-sm">{s.totalEventos}</td>
                  <td className="p-4 text-right font-body text-body-sm">{formatNumber(s.boletos)}</td>
                  <td className="p-4 text-right font-body text-body-sm font-medium">{formatCurrency(s.ingresos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
