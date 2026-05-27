import { useMemo } from 'react';
import eventos from '@/utils/eventos';

/**
 * Flatten the eventos object into a flat array with category info
 */
function flattenEventos() {
  const flat = [];
  let id = 1;
  Object.entries(eventos).forEach(([categoria, lista]) => {
    lista.forEach(ev => {
      flat.push({
        id: id++,
        categoria,
        nombre: ev.nombre_evento,
        fechaHora: ev.fecha_hora_evento,
        lugar: ev.lugar,
        grupo: ev.grupo,
        imgUrl: ev.imgUrl,
        urlEvent: ev.urlEvent,
      });
    });
  });
  return flat;
}

/**
 * Get all events flattened
 */
export function useEventosCatalog() {
  return useMemo(() => flattenEventos(), []);
}

/**
 * Get unique events (by nombre), preserving first occurrence image + link
 */
export function useEventosUnicos() {
  return useMemo(() => {
    const flat = flattenEventos();
    const map = new Map();
    flat.forEach(ev => {
      if (!map.has(ev.nombre)) {
        map.set(ev.nombre, {
          ...ev,
          funciones: [{ fechaHora: ev.fechaHora, lugar: ev.lugar, urlEvent: ev.urlEvent }],
        });
      } else {
        map.get(ev.nombre).funciones.push({
          fechaHora: ev.fechaHora,
          lugar: ev.lugar,
          urlEvent: ev.urlEvent,
        });
      }
    });
    return [...map.values()];
  }, []);
}

/**
 * Get categories with event counts
 */
export function useCategoriasFestival() {
  return useMemo(() => {
    return Object.entries(eventos).map(([categoria, lista]) => ({
      categoria,
      total: lista.length,
      eventos: lista,
    }));
  }, []);
}

/**
 * Find an event catalog entry by matching name against Excel data
 */
export function findCatalogEvent(nombreEvento, catalog) {
  if (!nombreEvento || !catalog) return null;
  const lower = nombreEvento.toLowerCase().trim();
  return catalog.find(ev => {
    const evName = ev.nombre.toLowerCase().trim();
    // Exact match
    if (evName === lower) return true;
    // Partial match (Excel names may be truncated or slightly different)
    if (lower.includes(evName) || evName.includes(lower)) return true;
    return false;
  }) || null;
}
