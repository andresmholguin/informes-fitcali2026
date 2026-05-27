import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Ticket, Wallet, Calendar, MapPin, Users, ExternalLink, Clock } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useEventosCatalog, findCatalogEvent } from '@/hooks/useEventosCatalog';
import KpiCard from '@/components/ui/KpiCard';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import DonutChart from '@/components/charts/DonutChart';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { useMemo } from 'react';

export default function EventoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { metrics, rawData, loading } = useData();
  const catalog = useEventosCatalog();

  const evento = useMemo(() => {
    if (!metrics?.eventos) return null;
    return metrics.eventos.find(e => String(e.id) === String(id));
  }, [metrics, id]);

  // Find matching catalog entry for images/links
  const catalogEntry = useMemo(() => {
    if (!evento) return null;
    return findCatalogEvent(evento.evento, catalog);
  }, [evento, catalog]);

  // All catalog functions for this event name (multiple dates)
  const allFunctions = useMemo(() => {
    if (!evento) return [];
    const lower = evento.evento.toLowerCase().trim();
    return catalog.filter(ev => {
      const evName = ev.nombre.toLowerCase().trim();
      return evName === lower || lower.includes(evName) || evName.includes(lower);
    });
  }, [evento, catalog]);

  const eventoData = useMemo(() => {
    if (!evento || !rawData) return [];
    return rawData.filter(r => r.evento === evento.evento);
  }, [evento, rawData]);

  // Localities chart data for donut chart
  const localitiesChartData = useMemo(() => {
    const total = localities.reduce((s, l) => s + l.boletos, 0) || 1;
    return localities.map(l => ({
      tipo: l.localidad,
      cantidad: l.boletos,
      porcentaje: Math.round((l.boletos / total) * 100),
    }));
  }, [localities]);

  // Daily sales for this event
  const dailySales = useMemo(() => {
    const map = {};
    eventoData.forEach(r => {
      if (!r.fechaCompra) return;
      const key = r.fechaCompra.toISOString().slice(0, 10);
      if (!map[key]) map[key] = { fecha: key, boletos: 0, ingresos: 0 };
      map[key].boletos += r.cantidad;
      map[key].ingresos += r.valor;
    });
    return Object.values(map).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [eventoData]);

  // Localities breakdown
  const localities = useMemo(() => {
    const map = {};
    eventoData.forEach(r => {
      const key = r.localidad || 'General';
      if (!map[key]) map[key] = { localidad: key, boletos: 0, ingresos: 0 };
      map[key].boletos += r.cantidad;
      map[key].ingresos += r.valor;
    });
    return Object.values(map).sort((a, b) => b.ingresos - a.ingresos);
  }, [eventoData]);

  // Payment methods breakdown
  const paymentMethods = useMemo(() => {
    const map = {};
    eventoData.forEach(r => {
      const key = r.metodoPago || 'Otro';
      if (!map[key]) map[key] = { metodo: key, boletos: 0, ingresos: 0 };
      map[key].boletos += r.cantidad;
      map[key].ingresos += r.valor;
    });
    return Object.values(map).sort((a, b) => b.ingresos - a.ingresos);
  }, [eventoData]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!evento) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4 flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </button>
        <EmptyState title="Evento no encontrado" description="El evento solicitado no existe en los datos." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 text-sm">
        <ArrowLeft size={16} /> Volver a Eventos
      </button>

      {/* Hero section with image */}
      {catalogEntry && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl overflow-hidden h-56 md:h-72"
        >
          <img
            src={catalogEntry.imgUrl}
            alt={evento.evento}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
              {catalogEntry.categoria}
            </span>
            <h2 className="font-display text-2xl md:text-4xl text-white font-bold leading-tight">
              {evento.evento}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-white/80 text-sm">
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {evento.lugar}</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {catalogEntry.grupo}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Title for non-catalog events */}
      {!catalogEntry && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-display-lg text-on-surface">{evento.evento}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1"><MapPin size={14} /> {evento.lugar}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(evento.primeraFecha)}</span>
          </div>
        </motion.div>
      )}

      {/* Buy tickets CTA */}
      {catalogEntry && (
        <motion.a
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          href={catalogEntry.urlEvent}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-label text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
        >
          <Ticket size={18} />
          Comprar boletos
          <ExternalLink size={14} />
        </motion.a>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Boletos vendidos" value={formatNumber(evento.boletos)} icon={Ticket} delay={0} />
        <KpiCard label="Ingresos" value={formatCurrency(evento.ingresos)} icon={Wallet} delay={1} />
        <KpiCard label="Funciones programadas" value={formatNumber(allFunctions.length || evento.fechas?.length || 0)} icon={Calendar} delay={2} />
        <KpiCard label="Ticket promedio" value={formatCurrency(evento.boletos > 0 ? evento.ingresos / evento.boletos : 0)} icon={Users} delay={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart data={localitiesChartData} title="Ventas por localidad" centerLabel="LOCALIDAD" delay={4} />
        <div className="lg:col-span-2">
          <AreaChartComponent data={dailySales} title="Ventas por fecha" delay={5} />
        </div>
      </div>

      {/* Scheduled functions from catalog */}
      {allFunctions.length > 0 && (
        <GlassCard className="overflow-hidden" delay={6}>
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
            <h3 className="font-headline text-title-md text-on-surface">Funciones programadas</h3>
          </div>
          <div className="divide-y divide-outline-variant">
            {allFunctions.map((fn, i) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={fn.imgUrl} alt={fn.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Clock size={13} />
                    <span className="font-medium text-on-surface">{fn.fechaHora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                    <MapPin size={12} />
                    <span>{fn.lugar}</span>
                  </div>
                </div>
                <a
                  href={fn.urlEvent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all"
                >
                  <Ticket size={12} />
                  Boletos
                  <ExternalLink size={10} />
                </a>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Localities table */}
      {localities.length > 0 && (
        <GlassCard className="overflow-hidden" delay={7}>
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
            <h3 className="font-headline text-title-md text-on-surface">Localidades</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="p-4 font-semibold">Localidad</th>
                  <th className="p-4 font-semibold text-right">Boletos</th>
                  <th className="p-4 font-semibold text-right">Ingresos</th>
                  <th className="p-4 font-semibold text-right">% del total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {localities.map((loc, i) => (
                  <tr key={i} className="table-row">
                    <td className="p-4 font-body text-body-sm font-medium text-on-surface">{loc.localidad}</td>
                    <td className="p-4 text-right font-body text-body-sm">{formatNumber(loc.boletos)}</td>
                    <td className="p-4 text-right font-body text-body-sm font-medium">{formatCurrency(loc.ingresos)}</td>
                    <td className="p-4 text-right font-body text-body-sm text-on-surface-variant">
                      {evento.ingresos > 0 ? Math.round((loc.ingresos / evento.ingresos) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Payment methods */}
      {paymentMethods.length > 0 && (
        <GlassCard className="overflow-hidden" delay={8}>
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
            <h3 className="font-headline text-title-md text-on-surface">Métodos de pago</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="p-4 font-semibold">Método</th>
                  <th className="p-4 font-semibold text-right">Transacciones</th>
                  <th className="p-4 font-semibold text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {paymentMethods.map((pm, i) => (
                  <tr key={i} className="table-row">
                    <td className="p-4 font-body text-body-sm font-medium text-on-surface">{pm.metodo}</td>
                    <td className="p-4 text-right font-body text-body-sm">{formatNumber(pm.boletos)}</td>
                    <td className="p-4 text-right font-body text-body-sm font-medium">{formatCurrency(pm.ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
