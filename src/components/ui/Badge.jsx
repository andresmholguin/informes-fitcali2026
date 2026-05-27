import clsx from 'clsx';

const variants = {
  success: 'status-badge status-success',
  active: 'status-badge status-active',
  primary: 'status-badge status-primary',
  error: 'status-badge status-error',
};

export default function Badge({ label, variant = 'primary', className }) {
  return (
    <span className={clsx(variants[variant] || variants.primary, className)}>
      {label}
    </span>
  );
}
