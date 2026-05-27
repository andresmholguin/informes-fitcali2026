import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Ticket, Wallet, Armchair, Users, Star, Download, Calendar, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useEventosCatalog } from '@/hooks/useEventosCatalog';
import KpiCard from '@/components/ui/KpiCard';
import DonutChart from '@/components/charts/DonutChart';
import RevenueBarChart from '@/components/charts/RevenueBarChart';
import DataTable from '@/components/tables/DataTable';
import { KpiSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import GlassCard from '@/components/ui/GlassCard';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { exportToExcel } from '@/utils/exportUtils';

export default function Overview() {
  const { metrics, loading, isDemo } = useData();
  const catalog = useEventosCatalog();

  // Get first 6 unique events for the highlight section
  const highlightEvents = useMemo(() => {
    const seen = new Set();
    return catalog.filter(ev => {
      if (seen.has(ev.nombre)) return false;
      seen.add(ev.nombre);
      return true;
    }).slice(0, 6);
  }, [catalog]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-12 w-48 bg-surface-container-high rounded animate-skeleton mb-2" />
          <div className="h-5 w-80 bg-surface-container-high rounded animate-skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartSkeleton />
          <div className="lg:col-span-2"><ChartSkeleton /></div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  const m = metrics;

  const handleExport = () => {
    if (!m?.data?.length) return;
    const exportData = m.data.map(r => ({
      Pedido: r.pedido, Evento: r.evento, Lugar: r.lugar,
      Espectáculo: r.espectaculo, Cantidad: r.cantidad,
      Valor: r.valor, 'Tipo Público': r.tipoPublico,
      Canal: r.canal, Vendedor: r.vendedor,
    }));
    exportToExcel(exportData, 'reporte-general');
  };

  return (
    <div className="space-y-8">
      {/* Demo banner */}
      {isDemo && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/10 border border-secondary/20 rounded-lg px-4 py-3 text-sm text-on-secondary-container"
        >
          📊 Mostrando datos de demostración. Configura <code className="bg-surface-container px-1 rounded">VITE_EXCEL_URL</code> en <code className="bg-surface-container px-1 rounded">.env</code> para conectar con datos reales.
        </motion.div>
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-display text-display-lg text-on-surface">Overview</h2>
          <p className="font-body text-body-lg text-on-surface-variant mt-1">
            Rendimiento general de la temporada actual.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2"
        >
          <button onClick={handleExport} className="btn-secondary">
            <Download size={16} /> Exportar
          </button>
          <select className="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-lg font-body text-body-sm focus:ring-1 focus:ring-primary">
            <option>Últimos 30 días</option>
            <option>Este trimestre</option>
            <option>Año actual</option>
          </select>
        </motion.div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          label="Total boletos vendidos"
          value={formatNumber(m?.totalBoletos || 0)}
          icon={Ticket}
          trend={12.5}
          delay={0}
        />
        <KpiCard
          label="Ingresos totales"
          value={formatCurrency(m?.totalIngresos || 0)}
          icon={Wallet}
          trend={8.2}
          delay={1}
        />
        <KpiCard
          label="Funciones realizadas"
          value={formatNumber(m?.totalFunciones || 0)}
          icon={Armchair}
          trendLabel="Esta temporada"
          delay={2}
        />
        <KpiCard
          label="Ocupación promedio"
          value={formatPercent(m?.ocupacionPromedio || 0, 0)}
          icon={Users}
          trend={4.1}
          delay={3}
        />
        <KpiCard
          label="Evento más vendido"
          value=""
          icon={Star}
          accentColor="secondary"
          delay={4}
          span={true}
        >
          <div className="flex flex-col mt-1">
            <span className="font-headline text-title-md text-on-surface">
              {m?.eventoMasVendido?.evento || '—'}
            </span>
            <div className="flex items-center gap-4 mt-1">
              <span className="font-body text-body-sm text-on-surface-variant">
                {formatNumber(m?.eventoMasVendido?.boletos || 0)} tickets
              </span>
              <div className="w-32 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '95%' }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className="h-full bg-secondary rounded-full"
                />
              </div>
            </div>
          </div>
        </KpiCard>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart data={m?.ventasPorPublico || []} title="Ventas por procedencia de grupos" delay={5} />
        <div className="lg:col-span-2">
          <RevenueBarChart data={m?.tendenciaIngresos || []} delay={6} />
        </div>
      </div>

      {/* Upcoming Events Highlight */}
      {/* <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-title-md text-on-surface">Programación FIT Cali 2026</h3>
          <Link to="/eventos" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {highlightEvents.map((ev, i) => (
            <a
              key={`${ev.nombre}-${i}`}
              href={ev.urlEvent}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-lg overflow-hidden aspect-[3/4] shadow-sm border border-outline-variant hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={ev.imgUrl}
                alt={ev.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-white text-xs font-semibold leading-tight line-clamp-2">{ev.nombre}</h4>
                <p className="text-white/70 text-[10px] mt-1 flex items-center gap-1">
                  <Calendar size={9} /> {ev.fechaHora.split(' a ')[0]}
                </p>
              </div>
            </a>
          ))}
        </div>
      </motion.div> */}

      {/* Events Performance Table */}
      <DataTable data={m?.eventos || []} />
    </div>
  );
}
