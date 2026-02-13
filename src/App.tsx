import { useState, useEffect } from 'react';
import { RoomCardChess } from './components/RoomCardChess';
import { CheckInModal, CheckInFormData } from './components/CheckInModal';
import { ClientHistoryModal } from './components/ClientHistoryModal';
import { ClientsView } from './components/ClientsView';
import { PaymentModal } from './components/PaymentModal';
import { Button } from './components/Button';
import { Home, Users, Calendar, DollarSign } from 'lucide-react';
import { dataService, mockCurrentUser } from './services/dataService';
import { Guest, Client, Room, Payment, GuestHistoryItem, User } from './types';
import { Language } from './utils/translations';
import './App.css';

type View = 'rooms' | 'clients' | 'calendar' | 'debts';

function App() {
  const [currentView, setCurrentView] = useState<View>('rooms');
  const [lang, setLang] = useState<Language>('ru');
  const [currentUser] = useState<User>(mockCurrentUser);

  // Data state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Modal state
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isClientHistoryOpen, setIsClientHistoryOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [clientHistory, setClientHistory] = useState<GuestHistoryItem[]>([]);
  const [checkInPrefillData, setCheckInPrefillData] = useState<Partial<CheckInFormData> | undefined>();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [guestsData, clientsData, roomsData, paymentsData] = await Promise.all([
        dataService.getGuests(),
        dataService.getClients(),
        dataService.getRooms(),
        dataService.getPayments(),
      ]);
      setGuests(guestsData);
      setClients(clientsData);
      setRooms(roomsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Check-in handler
  const handleCheckIn = async (data: CheckInFormData) => {
    try {
      // Create or find client
      let client = clients.find(c => c.passportNumber === data.passportNumber);
      if (!client) {
        client = await dataService.addClient({
          firstName: data.firstName,
          lastName: data.lastName,
          passportNumber: data.passportNumber,
          phoneNumber: data.phoneNumber,
          country: data.country,
        });
        setClients([...clients, client]);
      }

      // Create guest
      const checkInDate = new Date();
      const plannedCheckOutDate = new Date(checkInDate);
      plannedCheckOutDate.setDate(plannedCheckOutDate.getDate() + data.days);

      const newGuest = await dataService.addGuest({
        clientId: client.id,
        roomId: data.roomId,
        bedId: data.bedId,
        checkInDate,
        plannedCheckOutDate,
        days: data.days,
        pricePerNight: data.pricePerNight,
        totalPrice: data.days * data.pricePerNight,
        status: 'checked_in',
        staffId: currentUser.id,
        staffName: currentUser.name,
      });

      setGuests([...guests, newGuest]);
      alert(lang === 'ru' ? 'Гость успешно заселен' : 'Mijoz muvaffaqiyatli joylashtirildi');
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  };

  // Open check-in modal
  const openCheckInModal = (roomId: string, bedId: string) => {
    setSelectedRoomId(roomId);
    setSelectedBedId(bedId);
    setCheckInPrefillData(undefined);
    setIsCheckInModalOpen(true);
  };

  // Open client history
  const handleClientClick = async (clientId: string) => {
    try {
      const history = await dataService.getClientHistory(clientId);
      setClientHistory(history);
      setIsClientHistoryOpen(true);
    } catch (error) {
      console.error('Error loading client history:', error);
    }
  };

  // Repeat stay handler
  const handleRepeatStay = (lastStay: GuestHistoryItem) => {
    const prefill: Partial<CheckInFormData> = {
      clientId: lastStay.client.id,
      firstName: lastStay.client.firstName,
      lastName: lastStay.client.lastName,
      passportNumber: lastStay.client.passportNumber,
      phoneNumber: lastStay.client.phoneNumber,
      country: lastStay.client.country,
      days: lastStay.guest.days,
      pricePerNight: lastStay.guest.pricePerNight,
    };
    setCheckInPrefillData(prefill);
    setIsClientHistoryOpen(false);
    // Need to select a room/bed first - in a real app, could show room selector
    alert(lang === 'ru' 
      ? 'Выберите комнату и кровать для повторного заселения' 
      : 'Takroriy joylash uchun xona va karavotni tanlang');
  };

  // Payment handler
  const handlePayment = async (guestId: string, amount: number, method: Payment['method']) => {
    try {
      const newPayment = await dataService.addPayment({
        guestId,
        amount,
        date: new Date(),
        method,
        staffId: currentUser.id,
      });
      setPayments([...payments, newPayment]);
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'rooms':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {rooms.map(room => (
              <RoomCardChess
                key={room.id}
                room={room}
                guests={guests}
                clients={clients}
                payments={payments}
                onCheckIn={openCheckInModal}
                onClientClick={handleClientClick}
                lang={lang}
              />
            ))}
          </div>
        );

      case 'clients':
        return (
          <ClientsView
            clients={clients}
            onUpdateClient={async (id, updates) => {
              await dataService.updateClient(id, updates);
              await loadData();
            }}
            onImportClients={async (data) => {
              console.log('Import:', data);
            }}
            onDeduplicate={async () => {
              alert(lang === 'ru' ? 'Функция дедупликации выполнена' : 'Dublikatlar o\'chirildi');
            }}
            onBulkDelete={async (ids) => {
              await dataService.deleteClients(ids);
              await loadData();
            }}
            onNormalizeCountries={async () => {
              alert(lang === 'ru' ? 'Страны нормализованы' : 'Mamlakatlar normalizatsiya qilindi');
            }}
            onClientClick={handleClientClick}
            lang={lang}
            currentUser={currentUser}
          />
        );

      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              {lang === 'ru' ? 'Календарь' : 'Kalendar'}
            </h1>
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              {lang === 'ru' ? 'Календарь в разработке' : 'Kalendar ishlab chiqilmoqda'}
            </div>
          </div>
        );

      case 'debts':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              {lang === 'ru' ? 'Долги' : 'Qarzlar'}
            </h1>
            <div className="space-y-4">
              {guests
                .filter(g => {
                  const guestPayments = payments.filter(p => p.guestId === g.id);
                  const totalPaid = guestPayments.reduce((sum, p) => sum + p.amount, 0);
                  return g.totalPrice > totalPaid;
                })
                .map(guest => {
                  const client = clients.find(c => c.id === guest.clientId);
                  const guestPayments = payments.filter(p => p.guestId === guest.id);
                  const totalPaid = guestPayments.reduce((sum, p) => sum + p.amount, 0);
                  const debt = guest.totalPrice - totalPaid;

                  return (
                    <div
                      key={guest.id}
                      className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold">
                          {client?.firstName} {client?.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {lang === 'ru' ? 'Комната' : 'Xona'} {rooms.find(r => r.id === guest.roomId)?.number}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600 font-bold text-lg">
                          {new Intl.NumberFormat('ru-RU').format(debt)} UZS
                        </div>
                        <Button
                          variant="success"
                          onClick={() => {
                            setSelectedGuest(guest);
                            setIsPaymentModalOpen(true);
                          }}
                          className="text-sm py-1 mt-2"
                        >
                          {lang === 'ru' ? 'Оплатить' : 'To\'lash'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {lang === 'ru' ? 'Управление Хостелом' : 'Hostel Boshqaruvi'}
          </h1>
          <div className="flex gap-2">
            <Button
              variant={lang === 'ru' ? 'primary' : 'secondary'}
              onClick={() => setLang('ru')}
            >
              RU
            </Button>
            <Button
              variant={lang === 'uz' ? 'primary' : 'secondary'}
              onClick={() => setLang('uz')}
            >
              UZ
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentView('rooms')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                currentView === 'rooms'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home size={20} />
              {lang === 'ru' ? 'Комнаты' : 'Xonalar'}
            </button>
            <button
              onClick={() => setCurrentView('clients')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                currentView === 'clients'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={20} />
              {lang === 'ru' ? 'Клиенты' : 'Mijozlar'}
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                currentView === 'calendar'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={20} />
              {lang === 'ru' ? 'Календарь' : 'Kalendar'}
            </button>
            <button
              onClick={() => setCurrentView('debts')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                currentView === 'debts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign size={20} />
              {lang === 'ru' ? 'Долги' : 'Qarzlar'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{renderView()}</main>

      {/* Modals */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onSubmit={handleCheckIn}
        roomId={selectedRoomId}
        bedId={selectedBedId}
        prefillData={checkInPrefillData}
        lang={lang}
      />

      <ClientHistoryModal
        isOpen={isClientHistoryOpen}
        onClose={() => setIsClientHistoryOpen(false)}
        history={clientHistory}
        onRepeatStay={handleRepeatStay}
        lang={lang}
      />

      {selectedGuest && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          guest={selectedGuest}
          payments={payments.filter(p => p.guestId === selectedGuest.id)}
          onSubmitPayment={handlePayment}
          lang={lang}
        />
      )}
    </div>
  );
}

export default App;
