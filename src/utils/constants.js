// Audience classification by ticket price
export const AUDIENCE_THRESHOLDS = {
  LOCAL: 20000,
  NACIONAL: 30000,
  INTERNACIONAL: 40000,
};

// Chart color palette matching the Stitch design system
export const CHART_COLORS = {
  primary: '#003091',
  primaryContainer: '#0044c4',
  secondary: '#006a68',
  tertiary: '#3a3a3a',
  surfaceTint: '#0450e1',
  success: '#059669',
  error: '#ba1a1a',
};

export const AUDIENCE_COLORS = {
  Local: '#003091',
  Nacional: '#006a68',
  Internacional: '#3a3a3a',
};

export const CHART_PALETTE = [
  '#003091',
  '#006a68',
  '#3a3a3a',
  '#0450e1',
  '#0044c4',
  '#757589',
  '#b5c4ff',
  '#52dad6',
];

// Navigation items
export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', path: '/' },
  { id: 'ventas', label: 'Ventas', icon: 'CreditCard', path: '/ventas' },
  // { id: 'eventos', label: 'Eventos', icon: 'Drama', path: '/eventos' },
  { id: 'salas', label: 'Salas', icon: 'DoorOpen', path: '/salas' },
  { id: 'grupos', label: 'Grupos teatrales', icon: 'Users', path: '/grupos' },
  { id: 'reportes', label: 'Reportes', icon: 'BarChart3', path: '/reportes' },
  { id: 'insights', label: 'Insights', icon: 'Lightbulb', path: '/insights' },
];

export const NAV_BOTTOM = [
  { id: 'configuracion', label: 'Configuración', icon: 'Settings', path: '/configuracion' },
];

// Date format
export const DATE_FORMAT = 'dd MMM, yyyy';
export const DATE_FORMAT_SHORT = 'dd/MM';

// Pagination
export const PAGE_SIZE = 10;

// Status labels
export const STATUS_MAP = {
  completed: { label: 'Agotado', color: 'success' },
  active: { label: 'En Venta', color: 'secondary' },
  upcoming: { label: 'Próximo', color: 'primary' },
  cancelled: { label: 'Cancelado', color: 'error' },
};

// Excel column mappings
export const EXCEL_COLUMNS = {
  pedido: 'Pedido',
  fechaCompra: 'Fecha y hora de compra',
  categoria: 'Categoría',
  responsable: 'Responsable',
  evento: 'Evento',
  lugar: 'Lugar',
  espectaculo: 'Espectáculo',
  localidad: 'Localidad',
  metodoPago: 'Método de pago',
  canal: 'Canal de la transacción',
  vendedor: 'Vendedor',
  comprador: 'Comprador',
  fechaTransaccion: 'Fecha y hora de la transacción',
  moneda: 'Moneda',
  cantidad: 'Cantidad',
  valor: 'Valor',
  servicio: 'Servicio',
  total: 'Total',
  estado: 'Estado del pedido',
};
