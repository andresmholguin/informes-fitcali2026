import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, RefreshCw, Database, Palette } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useData } from '@/context/DataContext';

export default function Configuracion() {
  const { refetch, isDemo } = useData();
  const [darkMode, setDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-display-lg text-on-surface">Configuración</h2>
        <p className="font-body text-body-lg text-on-surface-variant mt-1">
          Personaliza la apariencia y comportamiento del dashboard.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Dark Mode */}
        <GlassCard className="p-6" delay={0}>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <Palette size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-headline text-title-md text-on-surface">Modo oscuro</h3>
              <p className="font-body text-body-sm text-on-surface-variant mt-1">
                Cambia entre tema claro y oscuro.
              </p>
              <button
                onClick={toggleDarkMode}
                className="mt-4 btn-secondary text-sm"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? 'Modo claro' : 'Modo oscuro'}
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Data Refresh */}
        <GlassCard className="p-6" delay={1}>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-secondary/10 rounded-md text-secondary">
              <Database size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-headline text-title-md text-on-surface">Fuente de datos</h3>
              <p className="font-body text-body-sm text-on-surface-variant mt-1">
                {isDemo
                  ? 'Usando datos de demostración. Configura VITE_EXCEL_URL para datos reales.'
                  : 'Conectado a Google Drive Excel.'}
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-4 btn-secondary text-sm"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Actualizando...' : 'Refrescar datos'}
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Info */}
        <GlassCard className="p-6 md:col-span-2" delay={2}>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <SettingsIcon size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-headline text-title-md text-on-surface">Acerca de</h3>
              <p className="font-body text-body-sm text-on-surface-variant mt-1">
                The Digital Stage — Proscenium Analytics v1.0
              </p>
              <div className="mt-4 space-y-2 text-body-sm text-on-surface-variant">
                <p>• Dashboard de analytics para festival cultural</p>
                <p>• Datos consumidos desde Excel en Google Drive</p>
                <p>• Clasificación de público: Local ($20K), Nacional ($30K), Internacional ($40K)</p>
                <p>• Solo procesa registros con Categoría = "Entradas"</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
