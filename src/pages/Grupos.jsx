import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import KpiCard from '@/components/ui/KpiCard';
import GlassCard from '@/components/ui/GlassCard';
import { KpiSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { Users, Trophy, Star } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const HorizontalBarChart = lazy(() => import('@/components/charts/HorizontalBarChart'));

export default function Grupos() {
  const { metrics, loading } = useData();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-48 bg-surface-container-high rounded animate-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></div>
        <ChartSkeleton />
      </div>
    );
  }

  const grupos = metrics?.ventasPorGrupo || [];
  const topGrupo = grupos[0];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-display-lg text-on-surface">Grupos Teatrales</h2>
        <p className="font-body text-body-lg text-on-surface-variant mt-1">
          Rendimiento por compañía, grupo teatral o espectáculo.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Total grupos" value={formatNumber(grupos.length)} icon={Users} delay={0} />
        <KpiCard label="Grupo más rentable" value={topGrupo?.grupo || '—'} icon={Trophy} delay={1} />
        <KpiCard label="Ingresos top grupo" value={formatCurrency(topGrupo?.ingresos || 0)} icon={Star} delay={2} />
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <HorizontalBarChart data={grupos} title="Ranking de Grupos por Ingresos" nameKey="grupo" delay={3} />
      </Suspense>

      <GlassCard className="overflow-hidden" delay={4}>
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
          <h3 className="font-headline text-title-md text-on-surface">Detalle por Grupo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="p-4 font-semibold">Grupo</th>
                <th className="p-4 font-semibold text-right">Eventos</th>
                <th className="p-4 font-semibold text-right">Boletos</th>
                <th className="p-4 font-semibold text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {grupos.map((g, i) => (
                <tr key={i} className="table-row">
                  <td className="p-4 font-body text-body-sm font-medium text-on-surface">{g.grupo}</td>
                  <td className="p-4 text-right font-body text-body-sm">{g.totalEventos}</td>
                  <td className="p-4 text-right font-body text-body-sm">{formatNumber(g.boletos)}</td>
                  <td className="p-4 text-right font-body text-body-sm font-medium">{formatCurrency(g.ingresos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
