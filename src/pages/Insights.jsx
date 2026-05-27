import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Award, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import { useData } from '@/context/DataContext';
import GlassCard from '@/components/ui/GlassCard';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';

export default function Insights() {
  const { metrics, loading } = useData();

  const insights = useMemo(() => {
    if (!metrics) return [];
    const m = metrics;
    const result = [];

    // Top event insight
    if (m.eventoMasVendido) {
      const pct = m.totalBoletos > 0 ? ((m.eventoMasVendido.boletos / m.totalBoletos) * 100).toFixed(1) : 0;
      result.push({
        type: 'success',
        icon: Award,
        title: 'Evento estrella',
        description: `"${m.eventoMasVendido.evento}" concentra el ${pct}% de todas las ventas con ${formatNumber(m.eventoMasVendido.boletos)} boletos vendidos.`,
      });
    }

    // Channel dominance
    if (m.ventasPorCanal?.length > 0) {
      const top = m.ventasPorCanal[0];
      const pct = m.totalIngresos > 0 ? ((top.ingresos / m.totalIngresos) * 100).toFixed(1) : 0;
      result.push({
        type: 'info',
        icon: Zap,
        title: 'Canal dominante',
        description: `El canal "${top.canal}" genera el ${pct}% de los ingresos totales (${formatCurrency(top.ingresos)}).`,
      });
    }

    // Audience distribution
    if (m.ventasPorPublico?.length > 0) {
      const local = m.ventasPorPublico.find(v => v.tipo === 'Local');
      const intl = m.ventasPorPublico.find(v => v.tipo === 'Internacional');
      if (local && intl) {
        result.push({
          type: local.porcentaje > 60 ? 'warning' : 'info',
          icon: local.porcentaje > 60 ? AlertTriangle : Lightbulb,
          title: 'Distribución de audiencia',
          description: `${local.porcentaje}% del público es local. El público internacional representa solo ${intl.porcentaje}%. ${local.porcentaje > 60 ? 'Considere estrategias para atraer más público nacional e internacional.' : 'Buena distribución de audiencia.'}`,
        });
      }
    }

    // Top vendor
    if (m.ventasPorVendedor?.length > 0) {
      const top = m.ventasPorVendedor[0];
      result.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Vendedor destacado',
        description: `"${top.vendedor}" lidera con ${formatNumber(top.boletos)} boletos y ${formatCurrency(top.ingresos)} en ingresos.`,
      });
    }

    // Revenue trend
    if (m.ventasPorFecha?.length > 7) {
      const recent = m.ventasPorFecha.slice(-7);
      const older = m.ventasPorFecha.slice(-14, -7);
      const recentSum = recent.reduce((s, d) => s + d.ingresos, 0);
      const olderSum = older.reduce((s, d) => s + d.ingresos, 0);
      const growth = olderSum > 0 ? ((recentSum - olderSum) / olderSum * 100) : 0;

      result.push({
        type: growth >= 0 ? 'success' : 'warning',
        icon: growth >= 0 ? TrendingUp : TrendingDown,
        title: 'Tendencia de ingresos',
        description: `Los ingresos de los últimos 7 días ${growth >= 0 ? 'crecieron' : 'disminuyeron'} un ${formatPercent(Math.abs(growth))} vs. la semana anterior.`,
      });
    }

    // Venue occupancy
    if (m.ventasPorSala?.length > 0) {
      const topSala = m.ventasPorSala[0];
      result.push({
        type: 'info',
        icon: Lightbulb,
        title: 'Sala más popular',
        description: `"${topSala.sala}" es la sala más popular con ${formatNumber(topSala.boletos)} boletos vendidos en ${topSala.totalEventos} evento(s).`,
      });
    }

    return result;
  }, [metrics]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-48 bg-surface-container-high rounded animate-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton /><ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  const typeStyles = {
    success: 'border-l-4 border-l-success',
    warning: 'border-l-4 border-l-[#d97706]',
    info: 'border-l-4 border-l-primary',
    error: 'border-l-4 border-l-error',
  };

  const iconBg = {
    success: 'bg-success/10 text-success',
    warning: 'bg-[#d97706]/10 text-[#d97706]',
    info: 'bg-primary/10 text-primary',
    error: 'bg-error/10 text-error',
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-display-lg text-on-surface">Insights</h2>
        <p className="font-body text-body-lg text-on-surface-variant mt-1">
          Análisis automático y tendencias detectadas en los datos.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, i) => (
          <GlassCard
            key={i}
            className={`p-6 ${typeStyles[insight.type]}`}
            delay={i}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-md ${iconBg[insight.type]}`}>
                <insight.icon size={20} />
              </div>
              <div>
                <h3 className="font-headline text-title-md text-on-surface mb-1">{insight.title}</h3>
                <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
