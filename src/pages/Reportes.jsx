import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { useData } from '@/context/DataContext';
import GlassCard from '@/components/ui/GlassCard';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';
import { ChartSkeleton } from '@/components/ui/Skeleton';

export default function Reportes() {
  const { metrics, rawData, loading } = useData();
  const [exported, setExported] = useState(null);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-48 bg-surface-container-high rounded animate-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  const buildExportData = () =>
    (rawData || []).map(r => ({
      Pedido: r.pedido, Evento: r.evento, Lugar: r.lugar,
      Espectáculo: r.espectaculo, Localidad: r.localidad,
      Cantidad: r.cantidad, Valor: r.valor,
      'Tipo Público': r.tipoPublico, Canal: r.canal,
      Vendedor: r.vendedor, Estado: r.estado,
    }));

  const handleExport = (type) => {
    const data = buildExportData();
    if (type === 'csv') exportToCSV(data, 'reporte-completo');
    if (type === 'excel') exportToExcel(data, 'reporte-completo');
    if (type === 'print') window.print();
    setExported(type);
    setTimeout(() => setExported(null), 2000);
  };

  const reports = [
    {
      title: 'Reporte General',
      description: 'Exporta todos los datos filtrados de entradas con todas las métricas calculadas.',
      icon: FileSpreadsheet,
      actions: [
        { label: 'CSV', type: 'csv' },
        { label: 'Excel', type: 'excel' },
      ],
    },
    {
      title: 'Reporte por Eventos',
      description: 'Ranking de eventos con boletos vendidos, ingresos y estado.',
      icon: FileText,
      actions: [
        { label: 'CSV', type: 'csv', data: () => (metrics?.ventasPorEvento || []).map(e => ({ Evento: e.evento, Lugar: e.lugar, Boletos: e.boletos, Ingresos: e.ingresos })) },
        { label: 'Excel', type: 'excel', data: () => (metrics?.ventasPorEvento || []).map(e => ({ Evento: e.evento, Lugar: e.lugar, Boletos: e.boletos, Ingresos: e.ingresos })) },
      ],
    },
    {
      title: 'Reporte de Ventas por Canal',
      description: 'Desglose de ventas por cada canal de transacción.',
      icon: FileText,
      actions: [
        { label: 'CSV', type: 'csv', data: () => metrics?.ventasPorCanal || [] },
        { label: 'Excel', type: 'excel', data: () => metrics?.ventasPorCanal || [] },
      ],
    },
    {
      title: 'Reporte por Vendedor',
      description: 'Rendimiento individual de cada vendedor.',
      icon: FileText,
      actions: [
        { label: 'CSV', type: 'csv', data: () => metrics?.ventasPorVendedor || [] },
        { label: 'Excel', type: 'excel', data: () => metrics?.ventasPorVendedor || [] },
      ],
    },
    {
      title: 'Imprimir Dashboard',
      description: 'Imprime la vista actual del dashboard.',
      icon: Printer,
      actions: [{ label: 'Imprimir', type: 'print' }],
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-display-lg text-on-surface">Reportes</h2>
        <p className="font-body text-body-lg text-on-surface-variant mt-1">
          Genera y descarga reportes en diferentes formatos.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, i) => (
          <GlassCard key={i} className="p-6 flex flex-col gap-4" delay={i}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md text-primary">
                <report.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-title-md text-on-surface">{report.title}</h3>
                <p className="font-body text-body-sm text-on-surface-variant mt-1">{report.description}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              {report.actions.map((action, j) => (
                <button
                  key={j}
                  onClick={() => {
                    if (action.data) {
                      const d = action.data();
                      if (action.type === 'csv') exportToCSV(d, report.title.toLowerCase().replace(/\s/g, '-'));
                      if (action.type === 'excel') exportToExcel(d, report.title.toLowerCase().replace(/\s/g, '-'));
                    } else {
                      handleExport(action.type);
                    }
                  }}
                  className="btn-secondary text-xs flex-1"
                >
                  <Download size={14} /> {action.label}
                </button>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {exported && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 bg-success text-white px-4 py-3 rounded-lg shadow-modal text-sm font-medium z-50"
        >
          ✓ Reporte exportado correctamente
        </motion.div>
      )}
    </div>
  );
}
