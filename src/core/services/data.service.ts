import { Card } from '@/core/models/card.model';
import { Contact } from '@/core/models/contact.model';
import { MonthlySpending, SpendingCategory } from '@/core/models/category.model';
import { AppNotification } from '@/core/models/notification.model';
import { SavingsGoal } from '@/core/models/savings-goal.model';
import { User } from '@/core/models/user.model';

// Datos de ejemplo (es-MX / MXN), portados de docs/design/prototipo/data.js.
// Facade: el resto de la app consume estos datos a través de este servicio, nunca
// del array crudo. Las transacciones viven en core/repositories/ (TransactionRepository,
// Strategy InMemory/Http, ver FASE 4) porque tienen su propio flujo de datos vía
// TanStack Query; el resto de entidades mock no necesita esa capa todavía (YAGNI).

const user: User = {
  id: 'u1',
  name: 'Andrea Salas',
  initials: 'AS',
  email: 'andrea.salas@correo.mx',
  balance: 48250.75,
  clabe: 'CLABE ·· 4821',
  verified: true,
};

const contacts: Contact[] = [
  { id: 'c1', name: 'Mariana López', sub: 'BBVA ·· 2291', initials: 'ML', recent: true },
  { id: 'c2', name: 'Carlos Ruiz', sub: 'Índigo ·· 7740', initials: 'CR', recent: true },
  { id: 'c3', name: 'Sofía Hernández', sub: 'Santander ·· 1188', initials: 'SH', recent: true },
  { id: 'c4', name: 'Diego Torres', sub: 'Índigo ·· 0912', initials: 'DT', recent: false },
  { id: 'c5', name: 'Renta · Depto 4B', sub: 'Banorte ·· 5520', initials: 'RD', recent: false },
];

const spendingCategories: SpendingCategory[] = [
  { name: 'Compras', pct: 32, color: '#A855F7', amount: 4180 },
  { name: 'Servicios', pct: 18, color: '#3FD1A0', amount: 2350 },
  { name: 'Transporte', pct: 15, color: '#F5A623', amount: 1960 },
  { name: 'Comida', pct: 13, color: '#C084FC', amount: 1700 },
  { name: 'Suscripciones', pct: 9, color: '#FF8A8A', amount: 1175 },
  { name: 'Otros', pct: 13, color: '#7C879A', amount: 1700 },
];

const monthlySpending: MonthlySpending[] = [
  { month: 'Ene', value: 0.55, current: false },
  { month: 'Feb', value: 0.72, current: false },
  { month: 'Mar', value: 0.48, current: false },
  { month: 'Abr', value: 0.84, current: false },
  { month: 'May', value: 0.66, current: false },
  { month: 'Jun', value: 0.93, current: true },
];

const cards: Card[] = [
  {
    id: 'card1',
    holder: 'Andrea Salas',
    last4: '4821',
    network: 'visa',
    type: 'debit',
    debitBalance: 48250.75,
    creditAvailable: 32000,
    frozen: false,
    onlinePurchasesEnabled: true,
  },
];

const notifications: AppNotification[] = [
  {
    id: 'n1',
    icon: 'payment',
    title: 'Pago recibido',
    description: 'Recibiste un depósito de $18,400.00 por Nómina · ACME S.A.',
    timestamp: 'Hoy · 08:02',
    read: false,
  },
  {
    id: 'n2',
    icon: 'security',
    title: 'Nuevo inicio de sesión',
    description: 'Detectamos un inicio de sesión desde un dispositivo nuevo en Ciudad de México.',
    timestamp: 'Ayer · 21:10',
    read: false,
  },
  {
    id: 'n3',
    icon: 'goal',
    title: 'Meta de ahorro',
    description: 'Vas al 62% de tu meta "Vacaciones · Oaxaca". ¡Sigue así!',
    timestamp: '3 jun · 09:00',
    read: true,
  },
  {
    id: 'n4',
    icon: 'statement',
    title: 'Estado de cuenta disponible',
    description: 'Tu estado de cuenta de mayo ya está listo para descargar.',
    timestamp: '1 jun · 07:30',
    read: true,
  },
];

const savingsGoal: SavingsGoal = {
  id: 'g1',
  title: 'Vacaciones · Oaxaca',
  current: 12400,
  target: 20000,
};

export const DataService = {
  getUser: (): User => user,
  getContacts: (): Contact[] => contacts,
  getSpendingCategories: (): SpendingCategory[] => spendingCategories,
  getMonthlySpending: (): MonthlySpending[] => monthlySpending,
  getCards: (): Card[] => cards,
  getNotifications: (): AppNotification[] => notifications,
  getSavingsGoal: (): SavingsGoal => savingsGoal,
};
