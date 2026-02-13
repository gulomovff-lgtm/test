import { User, Client, Guest, Room, Payment, GuestHistoryItem } from '../types';
import { getTotalPaid } from '../utils/helpers';

// Mock data storage
let mockGuests: Guest[] = [];
let mockClients: Client[] = [];
let mockPayments: Payment[] = [];
let mockRooms: Room[] = [];

// Initialize mock data
function initMockData() {
  // Create rooms
  mockRooms = Array.from({ length: 10 }, (_, i) => ({
    id: `room-${i + 1}`,
    number: `${i + 1}`,
    beds: i < 5 ? 4 : 2,
    floor: Math.floor(i / 5) + 1,
  }));

  // Create sample clients
  mockClients = [
    {
      id: 'client-1',
      firstName: 'Ivan',
      lastName: 'Petrov',
      passportNumber: 'AA1234567',
      phoneNumber: '+998901234567',
      country: 'Russia',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'client-2',
      firstName: 'John',
      lastName: 'Smith',
      passportNumber: 'BB7654321',
      phoneNumber: '+998901234568',
      country: 'USA',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    },
    {
      id: 'client-3',
      firstName: 'Ali',
      lastName: 'Karimov',
      passportNumber: 'CC9876543',
      phoneNumber: '+998901234569',
      country: 'Uzbekistan',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
    },
  ];

  // Create sample guests - including checked-out guests (some recent, some old)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const tenDaysAgo = new Date(today);
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  mockGuests = [
    // Current guest (checked in)
    {
      id: 'guest-1',
      clientId: 'client-1',
      roomId: 'room-1',
      bedId: 'bed-1-1',
      checkInDate: fiveDaysAgo,
      plannedCheckOutDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      days: 7,
      pricePerNight: 100000,
      totalPrice: 700000,
      status: 'checked_in',
      staffId: 'staff-1',
      staffName: 'Admin User',
      createdAt: fiveDaysAgo,
    },
    // Checked out yesterday - should still show
    {
      id: 'guest-2',
      clientId: 'client-2',
      roomId: 'room-1',
      bedId: 'bed-1-2',
      checkInDate: tenDaysAgo,
      checkOutDate: yesterday,
      plannedCheckOutDate: yesterday,
      days: 9,
      pricePerNight: 120000,
      totalPrice: 1080000,
      status: 'checked_out',
      staffId: 'staff-1',
      staffName: 'Admin User',
      createdAt: tenDaysAgo,
    },
    // Checked out 5 days ago - should STILL show (no 2-day filter)
    {
      id: 'guest-3',
      clientId: 'client-3',
      roomId: 'room-2',
      bedId: 'bed-2-1',
      checkInDate: new Date('2024-01-10'),
      checkOutDate: fiveDaysAgo,
      plannedCheckOutDate: fiveDaysAgo,
      days: 3,
      pricePerNight: 90000,
      totalPrice: 270000,
      status: 'checked_out',
      staffId: 'staff-2',
      staffName: 'Cashier User',
      createdAt: new Date('2024-01-10'),
    },
    // Old checked out guest from client-1 (for history)
    {
      id: 'guest-4',
      clientId: 'client-1',
      roomId: 'room-3',
      bedId: 'bed-3-1',
      checkInDate: new Date('2023-12-01'),
      checkOutDate: new Date('2023-12-05'),
      plannedCheckOutDate: new Date('2023-12-05'),
      days: 4,
      pricePerNight: 100000,
      totalPrice: 400000,
      status: 'checked_out',
      staffId: 'staff-1',
      staffName: 'Admin User',
      createdAt: new Date('2023-12-01'),
    },
  ];

  // Create sample payments
  mockPayments = [
    // Full payment for guest-1
    { id: 'pay-1', guestId: 'guest-1', amount: 700000, date: fiveDaysAgo, method: 'cash', staffId: 'staff-1' },
    // Partial payment for guest-2 (has debt)
    { id: 'pay-2', guestId: 'guest-2', amount: 500000, date: tenDaysAgo, method: 'cash', staffId: 'staff-1' },
    // Full payment for guest-4
    { id: 'pay-3', guestId: 'guest-4', amount: 400000, date: new Date('2023-12-05'), method: 'card', staffId: 'staff-1' },
    // No payment for guest-3 (has full debt)
  ];
}

initMockData();

// Mock current user
export const mockCurrentUser: User = {
  id: 'user-1',
  email: 'admin@hostel.com',
  name: 'Admin User',
  role: 'admin',
};

// Service functions
export const dataService = {
  // Guests
  getGuests: async (): Promise<Guest[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockGuests;
  },

  getGuestsByClient: async (clientId: string): Promise<Guest[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockGuests.filter(g => g.clientId === clientId);
  },

  addGuest: async (guest: Omit<Guest, 'id' | 'createdAt'>): Promise<Guest> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newGuest: Guest = {
      ...guest,
      id: `guest-${Date.now()}`,
      createdAt: new Date(),
    };
    mockGuests.push(newGuest);
    return newGuest;
  },

  updateGuest: async (id: string, updates: Partial<Guest>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockGuests.findIndex(g => g.id === id);
    if (index !== -1) {
      mockGuests[index] = { ...mockGuests[index], ...updates };
    }
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockClients;
  },

  getClientById: async (id: string): Promise<Client | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockClients.find(c => c.id === id) || null;
  },

  addClient: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockClients.push(newClient);
    return newClient;
  },

  updateClient: async (id: string, updates: Partial<Client>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockClients.findIndex(c => c.id === id);
    if (index !== -1) {
      mockClients[index] = { ...mockClients[index], ...updates, updatedAt: new Date() };
    }
  },

  deleteClients: async (ids: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    mockClients = mockClients.filter(c => !ids.includes(c.id));
  },

  // Rooms
  getRooms: async (): Promise<Room[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockRooms;
  },

  // Payments
  getPayments: async (): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPayments;
  },

  getPaymentsByGuest: async (guestId: string): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPayments.filter(p => p.guestId === guestId);
  },

  addPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
    };
    mockPayments.push(newPayment);
    return newPayment;
  },

  // Client history
  getClientHistory: async (clientId: string): Promise<GuestHistoryItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const clientGuests = mockGuests.filter(g => g.clientId === clientId);
    const client = mockClients.find(c => c.id === clientId);
    
    if (!client) return [];

    const history: GuestHistoryItem[] = [];
    
    for (const guest of clientGuests) {
      const room = mockRooms.find(r => r.id === guest.roomId);
      const guestPayments = mockPayments.filter(p => p.guestId === guest.id);
      const totalPaid = getTotalPaid(guest, guestPayments);
      const debt = guest.totalPrice - totalPaid;
      
      history.push({
        guest,
        client,
        room: room || { id: '', number: 'N/A', beds: 0, floor: 0 },
        payments: guestPayments,
        totalPaid,
        debt,
        refunds: 0, // Could calculate from negative payments
      });
    }
    
    // Sort by check-in date, newest first
    return history.sort((a, b) => 
      new Date(b.guest.checkInDate).getTime() - new Date(a.guest.checkInDate).getTime()
    );
  },
};
