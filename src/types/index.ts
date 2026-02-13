// User roles
export type UserRole = 'admin' | 'super' | 'cashier';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Client/Guest data
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  phoneNumber: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

// Room and Bed
export interface Room {
  id: string;
  number: string;
  beds: number;
  floor: number;
}

export interface Bed {
  id: string;
  roomId: string;
  number: number;
}

// Guest status
export type GuestStatus = 'checked_in' | 'checked_out';

export interface Guest {
  id: string;
  clientId: string;
  roomId: string;
  bedId: string;
  checkInDate: Date;
  checkOutDate?: Date;
  plannedCheckOutDate: Date;
  days: number;
  pricePerNight: number;
  totalPrice: number;
  status: GuestStatus;
  staffId: string;
  staffName: string;
  createdAt: Date;
}

// Payment
export interface Payment {
  id: string;
  guestId: string;
  amount: number;
  date: Date;
  method: 'cash' | 'card' | 'transfer';
  staffId: string;
  note?: string;
}

// Guest history item for display
export interface GuestHistoryItem {
  guest: Guest;
  client: Client;
  room: Room;
  payments: Payment[];
  totalPaid: number;
  debt: number;
  refunds: number;
}
