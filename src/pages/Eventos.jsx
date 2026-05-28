import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Users, ExternalLink, Search,
  Filter, Ticket, ChevronDown, ChevronUp, Grid3X3, List,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useEventosCatalog, useCategoriasFestival, findCatalogEvent } from '@/hooks/useEventosCatalog';
import { lazy, Suspense } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import { ChartSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const HorizontalBarChart = lazy(() => import('@/components/charts/HorizontalBarChart'));
const DataTable = lazy(() => import('@/components/tables/DataTable'));

const categoryColors = {
  'Arte queer': 'bg-[#9333ea]/10 text-[#9333ea]',
  'Enfoque de género': 'bg-[#db2777]/10 text-[#db2777]',
  'Público general': 'bg-primary/10 text-primary',
  'Públicos especializados': 'bg-secondary/10 text-secondary',
  'Teatro infantil y familiar': 'bg-[#ea580c]/10 text-[#ea580c]',
};

export default function Eventos() {
  const { metrics, loading } = useData();
  const catalog = useEventosCatalog();
  const categorias = useCategoriasFestival();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid | list | data

  // Filter catalog events
  const filteredEvents = useMemo(() => {
    let result = catalog;
    if (selectedCategory !== 'all') {
      result = result.filter(ev => ev.categoria === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(ev =>
        ev.nombre.toLowerCase().includes(q) ||
        ev.grupo.toLowerCase().includes(q) ||
        ev.lugar.toLowerCase().includes(q)
      );
    }
    return result;
  }, [catalog, selectedCategory, search]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-48 bg-surface-container-high rounded animate-skeleton" />
        <ChartSkeleton />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-display-lg text-on-surface">Eventos</h2>
        <p className="font-body text-body-lg text-on-surface-variant mt-1">
          Programación completa FIT Cali 2026 — {catalog.length} funciones programadas
        </p>
      </motion.div>

      {/* Category filter pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant'
          }`}
        >
          Todos ({catalog.length})
        </button>
        {categorias.map(cat => (
          <button
            key={cat.categoria}
            onClick={() => setSelectedCategory(cat.categoria)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === cat.categoria
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant'
            }`}
          >
            {cat.categoria} ({cat.total})
          </button>
        ))}
      </motion.div>

      {/* Search + View toggles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar evento, grupo o sala..."
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary w-full text-on-surface placeholder:text-outline"
          />
        </div>
        <div className="flex gap-1 bg-surface-container-low rounded-lg p-1 border border-outline-variant">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('data')}
            className={`p-2 rounded transition-colors text-xs font-medium px-3 ${viewMode === 'data' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Datos
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((ev, i) => (
              <EventCard key={`${ev.nombre}-${ev.fechaHora}`} event={ev} index={i} metrics={metrics} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((ev, i) => (
              <EventListItem key={`${ev.nombre}-${ev.fechaHora}`} event={ev} index={i} metrics={metrics} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Data View (original table) */}
      {viewMode === 'data' && (
        <>
          <Suspense fallback={<ChartSkeleton />}>
            <HorizontalBarChart
              data={metrics?.ventasPorEvento?.slice(0, 10) || []}
              title="Ranking de Eventos por Ingresos"
              nameKey="evento"
              delay={0}
            />
          </Suspense>
          <Suspense fallback={<TableSkeleton />}>
            <DataTable
              data={metrics?.eventos || []}
              title="Rendimiento de Ventas por Evento"
              showViewAll={false}
            />
          </Suspense>
        </>
      )}

      {/* Empty state */}
      {filteredEvents.length === 0 && viewMode !== 'data' && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-surface-container-low rounded-full mb-4">
            <Search size={32} className="text-outline" />
          </div>
          <h3 className="font-headline text-title-md text-on-surface mb-2">Sin resultados</h3>
          <p className="font-body text-body-sm text-on-surface-variant">
            No se encontraron eventos con los filtros actuales.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Event card for grid view
 */
function EventCard({ event: ev, index, metrics }) {
  const salesData = useMemo(() => {
    if (!metrics?.ventasPorEvento) return null;
    return metrics.ventasPorEvento.find(e => {
      const eName = (e.evento || '').toLowerCase();
      const evName = ev.nombre.toLowerCase();
      return eName === evName || eName.includes(evName) || evName.includes(eName);
    });
  }, [metrics, ev.nombre]);

  const colorClass = categoryColors[ev.categoria] || 'bg-primary/10 text-primary';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="glass-card rounded-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={ev.imgUrl}
          alt={ev.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass} backdrop-blur-sm`}>
          {ev.categoria}
        </span>
        {salesData && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
            {formatNumber(salesData.boletos)} vendidos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-headline text-[15px] font-semibold text-on-surface leading-tight line-clamp-2 min-h-[40px]">
          {ev.nombre}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Calendar size={13} className="shrink-0" />
            <span className="text-xs truncate">{ev.fechaHora}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <MapPin size={13} className="shrink-0" />
            <span className="text-xs truncate">{ev.lugar}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Users size={13} className="shrink-0" />
            <span className="text-xs truncate">{ev.grupo}</span>
          </div>
        </div>

        {/* Sales info if available */}
        {salesData && (
          <div className="pt-2 border-t border-outline-variant flex justify-between items-center">
            <span className="text-xs text-on-surface-variant">{formatNumber(salesData.boletos)} boletos</span>
            <span className="text-xs font-semibold text-primary">{formatCurrency(salesData.ingresos)}</span>
          </div>
        )}

        {/* Action */}
        <a
          href={ev.urlEvent}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-primary/5 hover:bg-primary hover:text-on-primary text-primary rounded-lg text-xs font-semibold transition-all duration-200 border border-primary/20"
        >
          <Ticket size={14} />
          Comprar boletos
          <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
}

/**
 * Event row for list view
 */
function EventListItem({ event: ev, index, metrics }) {
  const salesData = useMemo(() => {
    if (!metrics?.ventasPorEvento) return null;
    return metrics.ventasPorEvento.find(e => {
      const eName = (e.evento || '').toLowerCase();
      const evName = ev.nombre.toLowerCase();
      return eName === evName || eName.includes(evName) || evName.includes(eName);
    });
  }, [metrics, ev.nombre]);

  const colorClass = categoryColors[ev.categoria] || 'bg-primary/10 text-primary';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="glass-card rounded-lg p-4 flex gap-4 items-center group hover:shadow-card-hover transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0">
        <img
          src={ev.imgUrl}
          alt={ev.nombre}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-headline text-sm font-semibold text-on-surface truncate">{ev.nombre}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${colorClass}`}>
            {ev.categoria}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1"><Calendar size={12} /> {ev.fechaHora}</span>
          <span className="flex items-center gap-1"><MapPin size={12} /> {ev.lugar}</span>
          <span className="flex items-center gap-1"><Users size={12} /> {ev.grupo}</span>
        </div>
      </div>

      {/* Sales */}
      {salesData && (
        <div className="hidden md:flex flex-col items-end shrink-0 text-right">
          <span className="text-sm font-semibold text-on-surface">{formatCurrency(salesData.ingresos)}</span>
          <span className="text-xs text-on-surface-variant">{formatNumber(salesData.boletos)} boletos</span>
        </div>
      )}

      {/* Buy button */}
      <a
        href={ev.urlEvent}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-on-primary-fixed-variant transition-colors"
      >
        <Ticket size={14} />
        <span className="hidden sm:inline">Boletos</span>
        <ExternalLink size={12} />
      </a>
    </motion.div>
  );
}
