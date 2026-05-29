import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Search, Download, ArrowUpDown, Drama, Music } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';
import { PAGE_SIZE } from '@/utils/constants';

export default function DataTable({ data = [], title = 'Rendimiento de Eventos', showViewAll = true }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('ingresos');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        (r.evento || '').toLowerCase().includes(q) ||
        (r.lugar || '').toLowerCase().includes(q) ||
        (r.espectaculo || '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [data, search, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const handleExportCSV = () => {
    const exportData = filtered.map(r => ({
      Evento: r.evento, 'Sala / Grupo': `${r.lugar} / ${r.espectaculo}`,
      Fecha: r.primeraFecha || '', Boletos: r.boletos, Ingresos: r.ingresos,
    }));
    exportToCSV(exportData, 'rendimiento-eventos');
  };

  const handleExportExcel = () => {
    const exportData = filtered.map(r => ({
      Evento: r.evento, Sala: r.lugar, Grupo: r.espectaculo,
      Fecha: r.primeraFecha || '', Boletos: r.boletos, Ingresos: r.ingresos,
    }));
    exportToExcel(exportData, 'rendimiento-eventos');
  };

  const statusMap = {
    active: { label: 'En Venta', variant: 'active' },
    completed: { label: 'Agotado', variant: 'success' },
    upcoming: { label: 'Próximo', variant: 'primary' },
    cancelled: { label: 'Cancelado', variant: 'error' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest">
        <h3 className="font-headline text-title-md text-on-surface">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar evento..."
              className="pl-8 pr-3 py-1.5 bg-surface-container-low border-none rounded text-xs focus:ring-1 focus:ring-primary w-44 text-on-surface placeholder:text-outline"
            />
          </div>
          <button onClick={handleExportCSV} className="btn-ghost text-xs flex items-center gap-1" title="Exportar CSV">
            <Download size={14} /> CSV
          </button>
          <button onClick={handleExportExcel} className="btn-ghost text-xs flex items-center gap-1" title="Exportar Excel">
            <Download size={14} /> XLS
          </button>
          {showViewAll && (
            <button onClick={() => navigate('/eventos')} className="text-primary text-sm font-medium hover:underline">
              Ver todos
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="table-header">
              <th className="p-4 font-semibold w-12"></th>
              <th className="p-4 font-semibold cursor-pointer" onClick={() => toggleSort('evento')}>
                <span className="flex items-center gap-1">Evento <ArrowUpDown size={12} /></span>
              </th>
              <th className="p-4 font-semibold hidden sm:table-cell">Sala / Grupo</th>
              <th className="p-4 font-semibold hidden md:table-cell cursor-pointer" onClick={() => toggleSort('primeraFecha')}>
                <span className="flex items-center gap-1">Fecha <ArrowUpDown size={12} /></span>
              </th>
              <th className="p-4 font-semibold text-right cursor-pointer" onClick={() => toggleSort('boletos')}>
                <span className="flex items-center justify-end gap-1">Boletos <ArrowUpDown size={12} /></span>
              </th>
              <th className="p-4 font-semibold text-right cursor-pointer" onClick={() => toggleSort('aforo_venta')}>
                <span className="flex items-center justify-end gap-1">Aforo <ArrowUpDown size={12} /></span>
              </th>
              <th className="p-4 font-semibold text-right cursor-pointer" onClick={() => toggleSort('porcentaje_ocupacion')}>
                <span className="flex items-center justify-end gap-1">% Ocup. <ArrowUpDown size={12} /></span>
              </th>
              <th className="p-4 font-semibold text-right cursor-pointer" onClick={() => toggleSort('ingresos')}>
                <span className="flex items-center justify-end gap-1">Ingresos <ArrowUpDown size={12} /></span>
              </th>
              <th className="p-4 font-semibold text-center">Estado</th>
              <th className="p-4 font-semibold text-right w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {paginated.map((row, i) => {
              const st = statusMap[row.estado] || statusMap.active;
              return (
                <tr
                  key={row.id || i}
                  className="table-row group cursor-pointer"
                  onClick={() => navigate(`/evento/${row.id || i + 1}`)}
                >
                  <td className="p-4">
                    <div className="w-10 h-10 rounded bg-surface-variant border border-outline-variant flex items-center justify-center">
                      <Drama size={20} className="text-on-surface-variant" />
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-body text-body-lg font-medium text-on-surface">{row.evento}</p>
                    <p className="font-body text-body-sm text-on-surface-variant sm:hidden">{row.lugar}</p>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <p className="font-body text-body-sm text-on-surface">{row.lugar}</p>
                    <p className="font-body text-body-sm text-on-surface-variant text-xs">{row.espectaculo}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell font-body text-body-sm text-on-surface-variant">
                    {formatDate(row.primeraFecha)}
                  </td>
                  <td className="p-4 text-right font-body text-body-sm">
                    {formatNumber(row.boletos)}
                  </td>
                  <td className="p-4 text-right font-body text-body-sm text-on-surface-variant">
                    {row.aforo_venta > 0 ? formatNumber(row.aforo_venta) : '-'}
                  </td>
                  <td className="p-4 text-right font-body text-body-sm font-medium text-on-surface">
                    {row.aforo_venta > 0 ? `${row.porcentaje_ocupacion}%` : '-'}
                  </td>
                  <td className="p-4 text-right font-body text-body-sm font-medium text-on-surface">
                    {formatCurrency(row.ingresos)}
                  </td>
                  <td className="p-4 text-center">
                    <Badge label={st.label} variant={st.variant} />
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-outline-variant flex justify-between items-center">
          <span className="text-body-sm text-on-surface-variant">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
