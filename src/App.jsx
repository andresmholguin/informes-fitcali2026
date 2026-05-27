import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Overview, Ventas, Eventos, EventoDetalle,
  Salas, Grupos, Reportes, Insights, Configuracion,
} from '@/routes';

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-body-sm text-on-surface-variant">Cargando...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="evento/:id" element={<EventoDetalle />} />
          <Route path="salas" element={<Salas />} />
          <Route path="grupos" element={<Grupos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="insights" element={<Insights />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
