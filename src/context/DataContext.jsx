import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { descargarExcel, parsearExcel, filtrarEntradas, generarMetricas } from '@/services/excelService';

const DataContext = createContext(null);

// Demo data for when no Excel URL is provided
function generateDemoData() {
  const eventos = [
    'Hamlet - Producción Nacional', 'El Rey Lear', 'Sinfonía No. 9',
    'Don Quijote', 'La Casa de Bernarda Alba', 'Romeo y Julieta',
    'El Lago de los Cisnes', 'Carmen', 'Las Bodas de Fígaro',
    'Macbeth', 'Esperando a Godot', 'Bodas de Sangre',
  ];
  const salas = ['Teatro Principal', 'Sala de Conciertos', 'Teatro al Aire Libre', 'Sala Experimental', 'Gran Teatro'];
  const grupos = ['Cía. Nacional', 'Orquesta Filarmónica', 'Teatro Libre', 'Grupo Experimental', 'Ballet Nacional', 'Compañía Internacional'];
  const canales = ['Web', 'Taquilla', 'App Móvil', 'Teléfono', 'Punto de Venta'];
  const vendedores = ['María López', 'Carlos Ruiz', 'Ana García', 'Pedro Martínez', 'Laura Díaz'];
  const precios = [20000, 30000, 40000];

  const data = [];
  const startDate = new Date(2024, 0, 1);

  for (let i = 0; i < 1200; i++) {
    const eventoIdx = Math.floor(Math.random() * eventos.length);
    const precio = precios[Math.floor(Math.random() * precios.length)];
    const cantidad = Math.floor(Math.random() * 4) + 1;
    const daysOffset = Math.floor(Math.random() * 150);
    const fecha = new Date(startDate);
    fecha.setDate(fecha.getDate() + daysOffset);

    data.push({
      pedido: `PED-${String(i + 1).padStart(5, '0')}`,
      fechaCompra: fecha,
      categoria: 'Entradas',
      responsable: vendedores[Math.floor(Math.random() * vendedores.length)],
      evento: eventos[eventoIdx],
      lugar: salas[Math.floor(Math.random() * salas.length)],
      espectaculo: grupos[Math.floor(Math.random() * grupos.length)],
      localidad: ['VIP', 'Preferencial', 'General', 'Palco'][Math.floor(Math.random() * 4)],
      metodoPago: ['Tarjeta de crédito', 'PSE', 'Efectivo', 'Nequi'][Math.floor(Math.random() * 4)],
      canal: canales[Math.floor(Math.random() * canales.length)],
      vendedor: vendedores[Math.floor(Math.random() * vendedores.length)],
      comprador: `Comprador ${i + 1}`,
      fechaTransaccion: fecha,
      moneda: 'COP',
      cantidad,
      valor: precio,
      estado: Math.random() > 0.1 ? 'Aprobada' : 'Pendiente',
      tipoPublico: precio <= 20000 ? 'Local' : precio <= 30000 ? 'Nacional' : 'Internacional',
    });
  }

  return data;
}

export function DataProvider({ children }) {
  const [rawData, setRawData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const excelUrl = import.meta.env.VITE_EXCEL_URL;

      if (!excelUrl) {
        // Use demo data
        const demoData = generateDemoData();
        setRawData(demoData);

        // Build metrics directly from pre-normalized demo data
        const metricsResult = buildMetricsFromNormalized(demoData);
        setMetrics(metricsResult);
        setFileInfo({ name: 'Datos de Demostración', modifiedTime: new Date().toISOString() });
        setIsDemo(true);
        setLoading(false);
        return;
      }

      const result = await descargarExcel();
      const buffer = result.buffer || result;
      const info = result.fileInfo || null;

      const allData = parsearExcel(buffer);
      const entradas = filtrarEntradas(allData);
      const metricsResult = generarMetricas(entradas);

      setRawData(metricsResult.data);
      setMetrics(metricsResult);
      setFileInfo(info);
      setIsDemo(false);
    } catch (err) {
      console.error('Error loading data:', err);
      // Fallback to demo data on error
      const demoData = generateDemoData();
      setRawData(demoData);
      const metricsResult = buildMetricsFromNormalized(demoData);
      setMetrics(metricsResult);
      setFileInfo({ name: 'Datos de Demostración (Error)', modifiedTime: new Date().toISOString() });
      setIsDemo(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ rawData, metrics, loading, error, isDemo, fileInfo, refetch: fetchData }}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Build metrics from pre-normalized demo data (same shape as generarMetricas output)
 */
function buildMetricsFromNormalized(data) {
  const totalBoletos = data.reduce((s, r) => s + r.cantidad, 0);
  const totalIngresos = data.reduce((s, r) => s + r.valor, 0);

  const eventosUnicos = [...new Set(data.map(r => r.evento).filter(Boolean))];
  const totalEventos = eventosUnicos.length;

  // Events
  const eventMap = {};
  data.forEach(r => {
    if (!r.evento) return;
    if (!eventMap[r.evento]) {
      eventMap[r.evento] = { evento: r.evento, lugar: r.lugar, espectaculo: r.espectaculo, boletos: 0, ingresos: 0, fechas: new Set(), estados: new Set() };
    }
    eventMap[r.evento].boletos += r.cantidad;
    eventMap[r.evento].ingresos += r.valor;
    if (r.fechaCompra) eventMap[r.evento].fechas.add(r.fechaCompra.toISOString().slice(0, 10));
    if (r.estado) eventMap[r.evento].estados.add(r.estado);
  });

  const ventasPorEvento = Object.values(eventMap)
    .map(e => ({ ...e, fechas: [...e.fechas].sort(), estados: [...e.estados], primeraFecha: [...e.fechas].sort()[0] || null }))
    .sort((a, b) => b.ingresos - a.ingresos);

  const eventoMasVendido = ventasPorEvento[0] || null;
  const totalFunciones = ventasPorEvento.reduce((s, e) => s + e.fechas.length, 0) || 1;
  const ocupacionPromedio = Math.min(Math.round((totalBoletos / (totalFunciones * 100)) * 100), 100);

  // Audience
  const publicoCount = { Local: 0, Nacional: 0, Internacional: 0 };
  const publicoIngresos = { Local: 0, Nacional: 0, Internacional: 0 };
  data.forEach(r => {
    publicoCount[r.tipoPublico] = (publicoCount[r.tipoPublico] || 0) + r.cantidad;
    publicoIngresos[r.tipoPublico] = (publicoIngresos[r.tipoPublico] || 0) + r.valor;
  });
  const ventasPorPublico = Object.entries(publicoCount).map(([tipo, count]) => ({
    tipo, cantidad: count, ingresos: publicoIngresos[tipo], porcentaje: totalBoletos > 0 ? Math.round((count / totalBoletos) * 100) : 0,
  }));

  // Channels
  const canalMap = {};
  data.forEach(r => {
    const key = r.canal || 'Desconocido';
    if (!canalMap[key]) canalMap[key] = { canal: key, boletos: 0, ingresos: 0 };
    canalMap[key].boletos += r.cantidad;
    canalMap[key].ingresos += r.valor;
  });
  const ventasPorCanal = Object.values(canalMap).sort((a, b) => b.ingresos - a.ingresos);

  // Vendors
  const vendedorMap = {};
  data.forEach(r => {
    const key = r.vendedor || 'Sin asignar';
    if (!vendedorMap[key]) vendedorMap[key] = { vendedor: key, boletos: 0, ingresos: 0 };
    vendedorMap[key].boletos += r.cantidad;
    vendedorMap[key].ingresos += r.valor;
  });
  const ventasPorVendedor = Object.values(vendedorMap).sort((a, b) => b.ingresos - a.ingresos);

  // Dates
  const fechaMap = {};
  data.forEach(r => {
    if (!r.fechaCompra) return;
    const key = r.fechaCompra.toISOString().slice(0, 10);
    if (!fechaMap[key]) fechaMap[key] = { fecha: key, boletos: 0, ingresos: 0 };
    fechaMap[key].boletos += r.cantidad;
    fechaMap[key].ingresos += r.valor;
  });
  const ventasPorFecha = Object.values(fechaMap).sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Venues
  const salaMap = {};
  data.forEach(r => {
    const key = r.lugar || 'Sin lugar';
    if (!salaMap[key]) salaMap[key] = { sala: key, boletos: 0, ingresos: 0, eventos: new Set() };
    salaMap[key].boletos += r.cantidad;
    salaMap[key].ingresos += r.valor;
    if (r.evento) salaMap[key].eventos.add(r.evento);
  });
  const ventasPorSala = Object.values(salaMap).map(s => ({ ...s, totalEventos: s.eventos.size, eventos: [...s.eventos] })).sort((a, b) => b.ingresos - a.ingresos);

  // Groups
  const grupoMap = {};
  data.forEach(r => {
    const key = r.espectaculo || r.evento || 'Sin grupo';
    if (!grupoMap[key]) grupoMap[key] = { grupo: key, boletos: 0, ingresos: 0, eventos: new Set() };
    grupoMap[key].boletos += r.cantidad;
    grupoMap[key].ingresos += r.valor;
    if (r.evento) grupoMap[key].eventos.add(r.evento);
  });
  const ventasPorGrupo = Object.values(grupoMap).map(g => ({ ...g, totalEventos: g.eventos.size, eventos: [...g.eventos] })).sort((a, b) => b.ingresos - a.ingresos);

  const eventos = ventasPorEvento.map((e, i) => ({
    id: i + 1, ...e,
    estado: e.estados.includes('Aprobada') ? 'active' : 'completed',
  }));

  return {
    data, totalBoletos, totalIngresos, totalEventos, totalFunciones, ocupacionPromedio,
    eventoMasVendido, ventasPorPublico, ventasPorEvento, ventasPorCanal, ventasPorVendedor,
    ventasPorFecha, ventasPorSala, ventasPorGrupo, tendenciaIngresos: ventasPorFecha, eventos,
  };
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

export default DataContext;
