import clsx from 'clsx';

export default function Skeleton({ className, variant = 'rect', ...props }) {
  const baseClasses = 'animate-skeleton bg-surface-container-high rounded';
  
  const variants = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-4 w-3/4',
    title: 'h-8 w-1/2',
    card: 'h-32 w-full rounded-lg',
    chart: 'h-64 w-full rounded-lg',
  };

  return (
    <div
      className={clsx(baseClasses, variants[variant], className)}
      {...props}
    />
  );
}

export function KpiSkeleton() {
  return (
    <div className="glass-card rounded-lg p-6 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card rounded-lg p-6">
      <Skeleton className="h-5 w-48 mb-6" />
      <Skeleton variant="chart" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="p-6 border-b border-outline-variant">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
