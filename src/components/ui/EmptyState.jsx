import { FileSpreadsheet } from 'lucide-react';

export default function EmptyState({ title = 'Sin datos disponibles', description = 'No hay información para mostrar en este momento.', icon: Icon = FileSpreadsheet }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-surface-container-low rounded-full mb-4">
        <Icon size={32} className="text-outline" />
      </div>
      <h3 className="font-headline text-title-md text-on-surface mb-2">{title}</h3>
      <p className="font-body text-body-sm text-on-surface-variant max-w-sm">{description}</p>
    </div>
  );
}
