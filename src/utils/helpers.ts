import { Guest, Payment } from '../types';

export function getTotalPaid(guest: Guest | null, payments: Payment[] = []): number {
  if (!guest) return 0;
  
  const guestPayments = payments.filter(p => p.guestId === guest.id);
  return guestPayments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function calculateDebt(guest: Guest | null, payments: Payment[] = []): number {
  if (!guest) return 0;
  
  const totalPrice = guest.totalPrice || 0;
  const totalPaid = getTotalPaid(guest, payments);
  return totalPrice - totalPaid;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
