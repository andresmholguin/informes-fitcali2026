import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Buscar...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm 
                   focus:ring-1 focus:ring-primary w-full text-on-surface placeholder:text-outline
                   transition-all duration-200"
      />
    </div>
  );
}
