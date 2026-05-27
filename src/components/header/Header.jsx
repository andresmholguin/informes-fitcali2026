import { useState } from 'react';
import { Search, Calendar, SlidersHorizontal, Bell, Menu, Download } from 'lucide-react';

export default function Header({ onMenuClick }) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 border-b border-outline-variant flex justify-between items-center h-16 w-full px-gutter md:px-margin-page z-10">
      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="btn-ghost md:hidden"
        >
          <Menu size={20} />
        </button>

        <span className="font-headline font-semibold text-primary text-[20px] hidden md:block">
          FITCALI 2026
        </span>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Buscar..."
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm focus:ring-1 focus:ring-primary w-64 text-on-surface placeholder:text-outline"
          />
        </div>
      </div>

      {/* <div className="flex items-center gap-2 md:gap-4">
        <button className="btn-ghost" title="Calendario">
          <Calendar size={20} />
        </button>
        <button className="btn-ghost" title="Filtros">
          <SlidersHorizontal size={20} />
        </button>
        <button className="btn-ghost relative" title="Notificaciones">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-tertiary-container overflow-hidden border border-outline-variant flex items-center justify-center">
          <span className="text-on-tertiary-container text-xs font-medium">AD</span>
        </div>
      </div> */}
    </header>
  );
}
