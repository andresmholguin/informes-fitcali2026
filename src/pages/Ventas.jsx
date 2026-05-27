import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import GlassCard from '@/components/ui/GlassCard';
import HorizontalBarChart from '@/components/charts/HorizontalBarChart';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import DonutChart from '@/components/charts/DonutChart';
import { KpiSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import KpiCard from '@/components/ui/KpiCard';
import { CreditCard, TrendingUp, ShoppingCart, Smartphone } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

export default function Ventas() {
  const { metrics, loading } = useData();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-48 bg-surface-container-high rounded animate-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  const m = metrics;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-display-lg text-on-surface">Ventas</h2>
        <p className="font-body text-body-lg text-on-surface-variant mt-1">
          Análisis detallado de canales, vendedores y métodos de pago.
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          label="Ventas totales"
          value={formatCurrency(m?.totalIngresos || 0)}
          icon={CreditCard}
          trend={8.2}
          delay={0}
        />
        <KpiCard
          label="Ticket promedio"
          value={formatCurrency(m?.totalBoletos > 0 ? m.totalIngresos / m.totalBoletos : 0)}
          icon={TrendingUp}
          delay={1}
        />
        <KpiCard
          label="Canales activos"
          value={formatNumber(m?.ventasPorCanal?.length || 0)}
          icon={Smartphone}
          trendLabel="En operación"
          delay={2}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart
          data={m?.ventasPorCanal || []}
          title="Ventas por Canal"
          nameKey="canal"
          delay={3}
        />
        <HorizontalBarChart
          data={m?.ventasPorVendedor || []}
          title="Ventas por Vendedor"
          nameKey="vendedor"
          delay={4}
        />
      </div>

      {/* Audience + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart data={m?.ventasPorPublico || []} delay={5} />
        <div className="lg:col-span-2">
          <AreaChartComponent
            data={m?.tendenciaIngresos || []}
            title="Tendencia de Ingresos"
            delay={6}
          />
        </div>
      </div>
    </div>
  );
}
