import axios from 'axios';
import * as XLSX from 'xlsx';
import { AUDIENCE_THRESHOLDS } from '@/utils/constants';
import { parseExcelDate } from '@/utils/formatters';
import catalogEventos from '@/utils/eventos';

// Flatten the catalog for easy lookup
const flatCatalog = [];
Object.values(catalogEventos).forEach(lista => {
  lista.forEach(ev => {
    flatCatalog.push(ev);
  });
});

/**
 * Find the group for a given event name and spectacle/date from the catalog
 */
export function obtenerGrupoTeatral(nombreEvento, espectaculoRow) {
  if (!nombreEvento) return 'Sin grupo';
  
  const lowerNombre = nombreEvento.toLowerCase().trim();
  
  // Find matching event(s) in catalog
  const candidates = flatCatalog.filter(ev => {
    const catalogName = ev.nombre_evento.toLowerCase().trim();
    return catalogName === lowerNombre || lowerNombre.includes(catalogName) || catalogName.includes(lowerNombre);
  });
  
  if (candidates.length > 0) {
    if (candidates.length === 1) {
      return candidates[0].grupo;
    }
    
    if (espectaculoRow) {
      const lowerEsp = espectaculoRow.toLowerCase().trim();
      const matchByEsp = candidates.find(c => {
        const catFecha = c.fecha_hora_evento.toLowerCase().trim();
        return catFecha === lowerEsp || lowerEsp.includes(catFecha) || catFecha.includes(lowerEsp);
      });
      if (matchByEsp) return matchByEsp.grupo;
    }
    
    return candidates[0].grupo;
  }
  
  // Fallback if not in catalog but row has something not looking like a date
  if (espectaculoRow && !espectaculoRow.includes(' de ') && !espectaculoRow.includes(' a las ')) {
    return espectaculoRow;
  }
  
  return 'Sin grupo';
}

/**
 * Find all scheduled dates/times for a given event name from the catalog
 */
export function obtenerFechasDeCatalogo(nombreEvento) {
  if (!nombreEvento) return [];
  const lowerNombre = nombreEvento.toLowerCase().trim();
  const matches = flatCatalog.filter(ev => {
    const catalogName = ev.nombre_evento.toLowerCase().trim();
    return catalogName === lowerNombre || lowerNombre.includes(catalogName) || catalogName.includes(lowerNombre);
  });
  if (matches.length > 0) {
    return [...new Set(matches.map(m => m.fecha_hora_evento))];
  }
  return [];
}


/**
 * Extract folder ID from a Google Drive folder URL
 */
export function obtenerIdCarpeta(url) {
  if (!url) return null;
  // Format 1 & 2: /folders/FOLDER_ID or /folders/FOLDER_ID?usp=...
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];

  // Format 3: id=FOLDER_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return null;
}

/**
 * Check if the URL is a Google Drive folder URL
 */
export function esUrlCarpeta(url) {
  if (!url) return false;
  return url.includes('/folders/') || (url.includes('drive.google.com') && url.includes('id=') && !url.includes('spreadsheets') && !url.includes('file'));
}

/**
 * Fetch the latest modified Excel or Google Sheet metadata from a Drive folder using the Drive API v3
 */
export async function obtenerUltimoArchivoDeCarpeta(folderId, apiKey) {
  if (!apiKey) {
    throw new Error(
      'Para descargar desde una carpeta de Google Drive, debes configurar VITE_GOOGLE_API_KEY en tu archivo .env. ' +
      'De lo contrario, puedes usar un enlace directo a un archivo Excel en VITE_EXCEL_URL.'
    );
  }

  const mimeSheets = 'application/vnd.google-apps.spreadsheet';
  const mimeXlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const query = `'${folderId}' in parents and trashed = false and (mimeType = '${mimeSheets}' or mimeType = '${mimeXlsx}')`;
  
  const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&pageSize=1&fields=files(id,name,mimeType,modifiedTime)&key=${apiKey}`;

  const response = await axios.get(driveApiUrl);
  const files = response.data.files;
  
  if (!files || files.length === 0) {
    throw new Error('No se encontraron archivos de tipo Excel o Google Sheets en la carpeta de Google Drive especificada.');
  }

  return files[0];
}

/**
 * Convert Google Drive share link to direct download link
 */
function getDirectDownloadUrl(url) {
  if (!url) return null;
  // Handle various Google Drive URL formats
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`;
  }
  // If it's already a direct link or export link
  if (url.includes('export?format=xlsx') || url.includes('output=xlsx')) {
    return url;
  }
  // Try spreadsheets export format
  const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=xlsx`;
  }
  return url;
}

/**
 * Download Excel file from Google Drive (supporting folders or direct links)
 */
export async function descargarExcel() {
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  
  // If Google Apps Script proxy is defined, fetch from it
  if (appsScriptUrl) {
    const response = await axios.get(appsScriptUrl, {
      responseType: 'text',
      timeout: 30000,
    });
    
    const base64Data = response.data.trim();
    
    // Check if it's an error page or HTML response
    if (!base64Data || base64Data.startsWith('<!DOCTYPE') || base64Data.startsWith('<html') || base64Data.includes('Error')) {
      throw new Error('La respuesta del script de Google Apps no es válida. Asegúrate de haber publicado la implementación para "Cualquiera" (Anyone) y de haber colocado la URL correcta.');
    }
    
    // Decode Base64 string to ArrayBuffer
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const rawUrl = import.meta.env.VITE_EXCEL_URL;
  if (!rawUrl) {
    throw new Error('VITE_EXCEL_URL no está configurada en .env');
  }

  // 1. If it's a Google Drive folder
  if (esUrlCarpeta(rawUrl)) {
    const folderId = obtenerIdCarpeta(rawUrl);
    if (!folderId) {
      throw new Error('No se pudo extraer el ID de la carpeta desde la URL de Google Drive proporcionada.');
    }

    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const latestFile = await obtenerUltimoArchivoDeCarpeta(folderId, apiKey);
    
    console.log(`Descargando el archivo más reciente: "${latestFile.name}" (ID: ${latestFile.id})`);

    let downloadUrl;
    if (latestFile.mimeType === 'application/vnd.google-apps.spreadsheet') {
      // It's a Google Sheet, export as XLSX
      downloadUrl = `https://docs.google.com/spreadsheets/d/${latestFile.id}/export?format=xlsx`;
    } else {
      // It's a binary XLSX file uploaded to Drive, download via API alt=media
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${latestFile.id}?alt=media&key=${apiKey}`;
    }

    const response = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    return response.data;
  }

  // 2. If it's a direct file link (backwards-compatibility)
  const url = getDirectDownloadUrl(rawUrl);
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });

  return response.data;
}

/**
 * Parse Excel buffer to JSON array
 */
export function parsearExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  return data;
}

/**
 * Filter only rows where Categoría = 'Entradas'
 */
export function filtrarEntradas(data) {
  return data.filter(row => {
    const cat = (row['Categoría'] || row['Categoria'] || '').toString().trim().toLowerCase();
    return cat === 'entradas';
  });
}

/**
 * Classify group origin based on its city/country name in the group string from eventos.js
 */
export function clasificarPorOrigenGrupo(grupoStr) {
  if (!grupoStr || grupoStr === 'Sin grupo') return 'Local'; // Fallback
  
  const lower = grupoStr.toLowerCase().trim();
  
  // 1. If it has Cali, it is Local
  if (lower.includes('cali')) {
    return 'Local';
  }
  
  // 2. If it is international (contains known international countries)
  const paisesInternacionales = [
    'argentina', 'brasil', 'bolivia', 'españa', 'espana', 'francia', 
    'uruguay', 'méxico', 'mexico', 'chile', 'ecuador', 'perú', 'peru',
    'alemania', 'italia', 'eeuu', 'estados unidos', 'cuba', 'venezuela'
  ];
  
  const tienePaisInter = paisesInternacionales.some(pais => lower.includes(pais));
  if (tienePaisInter) {
    return 'Internacional';
  }
  
  // 3. If it has known Colombian locations
  const ubicacionesNacionales = [
    'bogotá', 'bogota', 'valledupar', 'armenia', 'mariquita', 'tolima',
    'medellín', 'medellin', 'barranquilla', 'cartagena', 'manizales', 
    'pereira', 'bucaramanga', 'quindio', 'quindío', 'colombia'
  ];
  
  const tieneUbiNac = ubicacionesNacionales.some(ubi => lower.includes(ubi));
  if (tieneUbiNac) {
    return 'Nacional';
  }
  
  // 4. Smart fallback if it has a dash: check the last component
  if (grupoStr.includes(' - ')) {
    const parts = grupoStr.split(' - ');
    const lastPart = parts[parts.length - 1].trim().toLowerCase();
    
    if (lastPart === 'cali') return 'Local';
    
    if (['bogota', 'bogotá', 'valledupar', 'armenia', 'mariquita', 'tolima', 'colombia'].includes(lastPart)) {
      return 'Nacional';
    }
    
    return 'Internacional';
  }
  
  // 5. General fallback if no clues
  return 'Local';
}

/**
 * Classify audience type based on group origin
 */
export function clasificarPublico(row) {
  const rawEspectaculo = row['Espectáculo'] || row['Espectaculo'] || '';
  const grupo = obtenerGrupoTeatral(row['Evento'] || '', rawEspectaculo);
  return clasificarPorOrigenGrupo(grupo);
}

/**
 * Normalize a row with consistent field names and audience classification
 */
function normalizeRow(row) {
  const fecha = parseExcelDate(
    row['Fecha y hora de compra'] || row['Fecha y hora de la transacción']
  );
  
  const rawEspectaculo = row['Espectáculo'] || row['Espectaculo'] || '';
  const grupo = obtenerGrupoTeatral(row['Evento'] || '', rawEspectaculo);

  return {
    pedido: row['Pedido'] || '',
    fechaCompra: fecha,
    categoria: row['Categoría'] || row['Categoria'] || '',
    responsable: row['Responsable'] || '',
    evento: row['Evento'] || '',
    lugar: row['Lugar'] || '',
    espectaculo: grupo,
    fechaEvento: rawEspectaculo,
    localidad: row['Localidad'] || '',
    metodoPago: row['Método de pago'] || row['Metodo de pago'] || '',
    canal: row['Canal de la transacción'] || row['Canal de la transaccion'] || '',
    vendedor: row['Vendedor'] || '',
    comprador: row['Comprador'] || '',
    fechaTransaccion: parseExcelDate(row['Fecha y hora de la transacción'] || row['Fecha y hora de la transaccion']),
    moneda: row['Moneda'] || 'COP',
    cantidad: Number(row['Cantidad']) || 1,
    valor: Number(row['Valor']) || 0,
    estado: row['Estado del pedido'] || '',
    tipoPublico: clasificarPublico(row),
  };
}

/**
 * Generate all dashboard metrics from filtered data
 */
export function generarMetricas(rawEntradas) {
  const data = rawEntradas.map(normalizeRow);

  if (data.length === 0) {
    return {
      data: [],
      totalBoletos: 0,
      totalIngresos: 0,
      totalEventos: 0,
      ocupacionPromedio: 0,
      eventoMasVendido: null,
      ventasPorPublico: [],
      ventasPorEvento: [],
      ventasPorCanal: [],
      ventasPorVendedor: [],
      ventasPorFecha: [],
      ventasPorSala: [],
      ventasPorGrupo: [],
      tendenciaIngresos: [],
      eventos: [],
    };
  }

  // Total tickets = sum of Cantidad
  const totalBoletos = data.reduce((sum, r) => sum + r.cantidad, 0);

  // Total revenue = sum of Valor (already final, do NOT multiply)
  const totalIngresos = data.reduce((sum, r) => sum + r.valor, 0);

  // Unique events
  const eventosUnicos = [...new Set(data.map(r => r.evento).filter(Boolean))];
  const totalEventos = eventosUnicos.length;

  // Sales by event + specific function date/time (item)
  const eventMap = {};
  data.forEach(r => {
    if (!r.evento) return;
    const key = `${r.evento} | ${r.fechaEvento || ''}`;
    if (!eventMap[key]) {
      eventMap[key] = {
        evento: r.evento,
        lugar: r.lugar,
        espectaculo: r.espectaculo,
        boletos: 0,
        ingresos: 0,
        fechas: [r.fechaEvento || ''],
        estados: new Set(),
      };
    }
    eventMap[key].boletos += r.cantidad;
    eventMap[key].ingresos += r.valor;
    if (r.estado) eventMap[key].estados.add(r.estado);
  });

  const ventasPorEvento = Object.values(eventMap)
    .map(e => ({
      ...e,
      estados: [...e.estados],
      primeraFecha: e.fechas[0] || null,
    }))
    .sort((a, b) => b.ingresos - a.ingresos);

  // Best-selling event
  const eventoMasVendido = ventasPorEvento[0] || null;

  // Occupancy average (approximate: boletos per unique event-date)
  const totalFunciones = ventasPorEvento.reduce((sum, e) => sum + e.fechas.length, 0) || 1;
  const ocupacionPromedio = Math.round((totalBoletos / (totalFunciones * 100)) * 100); // Approx percentage

  // Sales by audience type
  const publicoMap = { Local: 0, Nacional: 0, Internacional: 0 };
  const publicoCount = { Local: 0, Nacional: 0, Internacional: 0 };
  data.forEach(r => {
    publicoMap[r.tipoPublico] = (publicoMap[r.tipoPublico] || 0) + r.valor;
    publicoCount[r.tipoPublico] = (publicoCount[r.tipoPublico] || 0) + r.cantidad;
  });
  const ventasPorPublico = Object.entries(publicoCount).map(([tipo, count]) => ({
    tipo,
    cantidad: count,
    ingresos: publicoMap[tipo] || 0,
    porcentaje: totalBoletos > 0 ? Math.round((count / totalBoletos) * 100) : 0,
  }));

  // Sales by channel
  const canalMap = {};
  data.forEach(r => {
    const key = r.canal || 'Desconocido';
    if (!canalMap[key]) canalMap[key] = { canal: key, boletos: 0, ingresos: 0 };
    canalMap[key].boletos += r.cantidad;
    canalMap[key].ingresos += r.valor;
  });
  const ventasPorCanal = Object.values(canalMap).sort((a, b) => b.ingresos - a.ingresos);

  // Sales by vendor
  const vendedorMap = {};
  data.forEach(r => {
    const key = r.vendedor || 'Sin asignar';
    if (!vendedorMap[key]) vendedorMap[key] = { vendedor: key, boletos: 0, ingresos: 0 };
    vendedorMap[key].boletos += r.cantidad;
    vendedorMap[key].ingresos += r.valor;
  });
  const ventasPorVendedor = Object.values(vendedorMap).sort((a, b) => b.ingresos - a.ingresos);

  // Sales by date (trend)
  const fechaMap = {};
  data.forEach(r => {
    if (!r.fechaCompra) return;
    const key = r.fechaCompra.toISOString().slice(0, 10);
    if (!fechaMap[key]) fechaMap[key] = { fecha: key, boletos: 0, ingresos: 0 };
    fechaMap[key].boletos += r.cantidad;
    fechaMap[key].ingresos += r.valor;
  });
  const ventasPorFecha = Object.values(fechaMap).sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Sales by venue (sala)
  const salaMap = {};
  data.forEach(r => {
    const key = r.lugar || 'Sin lugar';
    if (!salaMap[key]) salaMap[key] = { sala: key, boletos: 0, ingresos: 0, eventos: new Set() };
    salaMap[key].boletos += r.cantidad;
    salaMap[key].ingresos += r.valor;
    if (r.evento) salaMap[key].eventos.add(r.evento);
  });
  const ventasPorSala = Object.values(salaMap)
    .map(s => ({ ...s, totalEventos: s.eventos.size, eventos: [...s.eventos] }))
    .sort((a, b) => b.ingresos - a.ingresos);

  // Sales by theater group (espectáculo)
  const grupoMap = {};
  data.forEach(r => {
    const key = r.espectaculo || r.evento || 'Sin grupo';
    if (!grupoMap[key]) grupoMap[key] = { grupo: key, boletos: 0, ingresos: 0, eventos: new Set() };
    grupoMap[key].boletos += r.cantidad;
    grupoMap[key].ingresos += r.valor;
    if (r.evento) grupoMap[key].eventos.add(r.evento);
  });
  const ventasPorGrupo = Object.values(grupoMap)
    .map(g => ({ ...g, totalEventos: g.eventos.size, eventos: [...g.eventos] }))
    .sort((a, b) => b.ingresos - a.ingresos);

  // Revenue trend (accumulated by week for charts)
  const tendenciaIngresos = ventasPorFecha;

  // Detailed events list for table
  const eventos = ventasPorEvento.map((e, i) => ({
    id: i + 1,
    ...e,
    estado: e.estados.length > 0
      ? (e.estados.includes('Aprobada') || e.estados.includes('Aprobado') ? 'active' : 'completed')
      : 'active',
  }));

  return {
    data,
    totalBoletos,
    totalIngresos,
    totalEventos,
    totalFunciones,
    ocupacionPromedio: Math.min(ocupacionPromedio, 100),
    eventoMasVendido,
    ventasPorPublico,
    ventasPorEvento,
    ventasPorCanal,
    ventasPorVendedor,
    ventasPorFecha,
    ventasPorSala,
    ventasPorGrupo,
    tendenciaIngresos,
    eventos,
  };
}
