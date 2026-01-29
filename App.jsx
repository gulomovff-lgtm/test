import React, { useState, useEffect } from 'react';

// ============================================================================
// TRANSLATION SYSTEM
// ============================================================================
const translations = {
  ru: {
    save: 'Сохранить',
    checkIn: 'Заселить',
    checkingIn: 'Заселение...',
    pay: 'Оплатить',
    paying: 'Оплата...',
    cancel: 'Отмена',
    close: 'Закрыть',
    deduplicate: 'Дедупликация',
    normalizeCountries: 'Нормализовать страны',
    addClient: 'Добавить клиента',
    importCSV: 'Импорт CSV',
    clientHistory: 'История клиента',
    repeatLastStay: 'Повторить последнее заселение',
    totalSpent: 'Всего потрачено',
    totalPaid: 'Всего оплачено',
    currentDebt: 'Текущий долг',
    refunds: 'Возвраты',
    checkInDate: 'Дата заезда',
    checkOutDate: 'Дата выезда',
    room: 'Комната',
    bed: 'Место',
    days: 'Дней',
    amount: 'Сумма',
    paymentStatus: 'Статус оплаты',
    servedBy: 'Обслуживал',
    noVisits: 'Нет визитов',
    search: 'Поиск',
    fullName: 'ФИО',
    passport: 'Паспорт',
    country: 'Страна',
    phone: 'Телефон',
  },
  uz: {
    save: 'Saqlash',
    checkIn: 'Kirish',
    checkingIn: 'Kiritilmoqda...',
    pay: "To'lash",
    paying: "To'lanmoqda...",
    cancel: 'Bekor qilish',
    close: 'Yopish',
    deduplicate: 'Dublikatlarni olib tashlash',
    normalizeCountries: "Mamlakatlarni normalizatsiya qilish",
    addClient: 'Mijoz qo\'shish',
    importCSV: 'CSV import qilish',
    clientHistory: 'Mijoz tarixi',
    repeatLastStay: 'Oxirgi yashashni takrorlash',
    totalSpent: "Jami sarflangan",
    totalPaid: "Jami to'langan",
    currentDebt: 'Joriy qarz',
    refunds: 'Qaytarilganlar',
    checkInDate: 'Kirish sanasi',
    checkOutDate: 'Chiqish sanasi',
    room: 'Xona',
    bed: "O'rin",
    days: 'Kunlar',
    amount: 'Miqdor',
    paymentStatus: "To'lov holati",
    servedBy: 'Xizmat ko\'rsatgan',
    noVisits: 'Tashriflar yo\'q',
    search: 'Qidirish',
    fullName: 'FIO',
    passport: 'Pasport',
    country: 'Mamlakat',
    phone: 'Telefon',
  }
};

const useTranslation = (lang = 'ru') => {
  const t = (key) => translations[lang]?.[key] || key;
  return { t };
};

// ============================================================================
// UI COMPONENTS
// ============================================================================
const Button = ({ children, onClick, icon: Icon, disabled, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500";

// Icons (simplified lucide-react alternatives)
const Plus = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const X = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const Merge = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>;
const Globe = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const FileSpreadsheet = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /><line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /><line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /><line x1="10" y1="9" x2="8" y2="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>;
const Loader2 = (props) => <svg {...props} className={`animate-spin ${props.className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>;

// ============================================================================
// CLIENT HISTORY MODAL
// ============================================================================
const ClientHistoryModal = ({ client, guests, users, rooms, onClose, onRepeatStay, lang = 'ru' }) => {
  const { t } = useTranslation(lang);
  
  // Filter visits by passport or name
  const clientGuests = guests
    .filter(g => g.passport === client.passport || g.fullName === client.fullName)
    .sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
  
  // Calculate statistics
  const getTotalPaid = (guest) => {
    return (guest.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  };
  
  const totalSpent = clientGuests.reduce((sum, g) => sum + (g.totalPrice || 0), 0);
  const totalPaid = clientGuests.reduce((sum, g) => sum + getTotalPaid(g), 0);
  const totalDebt = totalSpent - totalPaid;
  const totalRefunded = clientGuests
    .filter(g => g.status === 'checked_out')
    .reduce((sum, g) => sum + (g.refund || 0), 0);
  
  const handleRepeatStay = () => {
    if (clientGuests.length > 0) {
      const latestStay = clientGuests[0];
      onRepeatStay(latestStay);
      onClose();
    }
  };
  
  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : roomId;
  };
  
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} title={`${t('clientHistory')}: ${client.fullName}`} size="xl">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <div className="text-sm text-gray-600">{t('totalSpent')}</div>
            <div className="text-2xl font-bold">{totalSpent.toFixed(2)}</div>
          </Card>
          <Card className="bg-green-50">
            <div className="text-sm text-gray-600">{t('totalPaid')}</div>
            <div className="text-2xl font-bold">{totalPaid.toFixed(2)}</div>
          </Card>
          <Card className={totalDebt > 0 ? "bg-rose-50" : "bg-gray-50"}>
            <div className="text-sm text-gray-600">{t('currentDebt')}</div>
            <div className={`text-2xl font-bold ${totalDebt > 0 ? 'text-rose-600' : ''}`}>
              {totalDebt.toFixed(2)}
            </div>
          </Card>
          <Card className="bg-yellow-50">
            <div className="text-sm text-gray-600">{t('refunds')}</div>
            <div className="text-2xl font-bold">{totalRefunded.toFixed(2)}</div>
          </Card>
        </div>
        
        {/* Repeat Last Stay Button */}
        {clientGuests.length > 0 && (
          <Button onClick={handleRepeatStay} className="w-full">
            {t('repeatLastStay')}
          </Button>
        )}
        
        {/* Visits List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Visits ({clientGuests.length})</h3>
          {clientGuests.length === 0 ? (
            <p className="text-gray-500">{t('noVisits')}</p>
          ) : (
            <div className="space-y-2">
              {clientGuests.map((guest, idx) => {
                const paid = getTotalPaid(guest);
                const debt = (guest.totalPrice || 0) - paid;
                const days = Math.ceil((new Date(guest.checkOutDate) - new Date(guest.checkInDate)) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={idx} className={guest.status === 'checked_out' && debt > 0 ? 'bg-slate-50' : ''}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">{t('checkInDate')}</div>
                        <div className="font-semibold">{new Date(guest.checkInDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">{t('checkOutDate')}</div>
                        <div className="font-semibold">{new Date(guest.checkOutDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">{t('room')} / {t('bed')}</div>
                        <div className="font-semibold">{getRoomName(guest.roomId)} / {guest.bedId}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">{t('days')}</div>
                        <div className="font-semibold">{days}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">{t('amount')}</div>
                        <div className="font-semibold">{(guest.totalPrice || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">{t('paymentStatus')}</div>
                        <div className={`font-semibold ${debt > 0 ? 'text-rose-600 bg-rose-100 px-2 py-1 rounded inline-block' : 'text-green-600'}`}>
                          {debt > 0 ? `Debt: ${debt.toFixed(2)}` : 'Paid'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">{t('servedBy')}</div>
                        <div className="font-semibold">{getUserName(guest.cashierId)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Status</div>
                        <div className="font-semibold capitalize">{guest.status}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// CHECK-IN MODAL (with double-click protection)
// ============================================================================
const CheckInModal = ({ isOpen, onClose, onSubmit, initialData = {}, lang = 'ru' }) => {
  const { t } = useTranslation(lang);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: initialData.fullName || '',
    passport: initialData.passport || '',
    checkInDate: initialData.checkInDate || new Date().toISOString().split('T')[0],
    checkOutDate: initialData.checkOutDate || '',
    roomId: initialData.roomId || '',
    bedId: initialData.bedId || '',
    totalPrice: initialData.totalPrice || 0,
    pricePerDay: initialData.pricePerDay || 0,
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Block double clicks
    
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('checkIn')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('fullName')}</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('passport')}</label>
          <input
            type="text"
            value={form.passport}
            onChange={(e) => setForm({ ...form, passport: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('checkInDate')}</label>
            <input
              type="date"
              value={form.checkInDate}
              onChange={(e) => setForm({ ...form, checkInDate: e.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('checkOutDate')}</label>
            <input
              type="date"
              value={form.checkOutDate}
              onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })}
              className={inputClass}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('room')}</label>
            <input
              type="text"
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('bed')}</label>
            <input
              type="text"
              value={form.bedId}
              onChange={(e) => setForm({ ...form, bedId: e.target.value })}
              className={inputClass}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('amount')}</label>
          <input
            type="number"
            value={form.totalPrice}
            onChange={(e) => setForm({ ...form, totalPrice: parseFloat(e.target.value) || 0 })}
            className={inputClass}
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4" />
                {t('checkingIn')}
              </>
            ) : (
              t('checkIn')
            )}
          </Button>
          <Button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
            {t('cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ============================================================================
// PAYMENT MODAL (with double-click protection)
// ============================================================================
const PaymentModal = ({ isOpen, onClose, onSubmit, guest, lang = 'ru' }) => {
  const { t } = useTranslation(lang);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(0);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Block double clicks
    
    setIsSubmitting(true);
    try {
      await onSubmit(guest, amount);
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pay')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('amount')}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className={inputClass}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4" />
                {t('paying')}
              </>
            ) : (
              t('pay')
            )}
          </Button>
          <Button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
            {t('cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ============================================================================
// CLIENTS VIEW
// ============================================================================
const ClientsView = ({ 
  clients, 
  guests, 
  users, 
  rooms, 
  currentUser, 
  onDeduplicate, 
  onNormalizeCountries,
  onAddClient,
  onImportCSV,
  lang = 'ru' 
}) => {
  const { t } = useTranslation(lang);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInData, setCheckInData] = useState({});
  
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super';
  
  const filteredClients = clients.filter(c =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.passport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRepeatBooking = (client, lastStay) => {
    const days = Math.ceil((new Date(lastStay.checkOutDate) - new Date(lastStay.checkInDate)) / (1000 * 60 * 60 * 24));
    const pricePerDay = days > 0 ? lastStay.totalPrice / days : lastStay.pricePerDay || 0;
    
    setCheckInData({
      fullName: client.fullName,
      passport: client.passport,
      country: client.country,
      phone: client.phone,
      totalPrice: lastStay.totalPrice,
      pricePerDay: pricePerDay,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsCheckInModalOpen(true);
  };
  
  const handleCheckIn = async (formData) => {
    // Simulate saving to database
    console.log('Check in guest:', formData);
    // In real app: await saveGuest(formData);
  };
  
  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        {/* Admin-only buttons */}
        {isAdmin && (
          <>
            <Button icon={Merge} onClick={onDeduplicate}>
              {t('deduplicate')}
            </Button>
            <Button icon={Globe} onClick={onNormalizeCountries}>
              {t('normalizeCountries')}
            </Button>
            <Button icon={FileSpreadsheet} onClick={() => setIsImportModalOpen(true)}>
              {t('importCSV')}
            </Button>
          </>
        )}
        
        {/* Button for all users */}
        <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          {t('addClient')}
        </Button>
      </div>
      
      {/* Search */}
      <input
        type="text"
        placeholder={t('search')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={inputClass}
      />
      
      {/* Clients Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left">{t('fullName')}</th>
              <th className="p-4 text-left">{t('passport')}</th>
              <th className="p-4 text-left">{t('country')}</th>
              <th className="p-4 text-left">{t('phone')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td 
                  className="p-4 font-bold cursor-pointer hover:text-indigo-600"
                  onClick={() => setSelectedClient(client)}
                >
                  {client.fullName}
                </td>
                <td className="p-4">{client.passport}</td>
                <td className="p-4">{client.country}</td>
                <td className="p-4">{client.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Client History Modal */}
      {selectedClient && (
        <ClientHistoryModal
          client={selectedClient}
          guests={guests}
          users={users}
          rooms={rooms}
          onClose={() => setSelectedClient(null)}
          onRepeatStay={(lastStay) => {
            handleRepeatBooking(selectedClient, lastStay);
          }}
          lang={lang}
        />
      )}
      
      {/* Check-in Modal */}
      {isCheckInModalOpen && (
        <CheckInModal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          onSubmit={handleCheckIn}
          initialData={checkInData}
          lang={lang}
        />
      )}
    </div>
  );
};

// ============================================================================
// ROOM CARD CHESS (with fixed ghost guest display)
// ============================================================================
const RoomCardChess = ({ room, guests, onCheckIn, lang = 'ru' }) => {
  const { t } = useTranslation(lang);
  
  const getTotalPaid = (guest) => {
    return (guest.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  };
  
  const getBedGuest = (bedId) => {
    return guests.find(g =>
      String(g.roomId) === String(room.id) &&
      String(g.bedId) === String(bedId) &&
      (g.status === 'checked_in' || g.status === 'booked')
    );
  };
  
  const getGhostGuest = (bedId) => {
    // FIXED: Remove date filtering, show ALL checked-out guests
    const recent = guests
      .filter(g =>
        String(g.roomId) === String(room.id) &&
        String(g.bedId) === String(bedId) &&
        g.status === 'checked_out'
      )
      .sort((a, b) => new Date(b.checkOutDate) - new Date(a.checkOutDate));
    
    return recent.length > 0 ? recent[0] : null;
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-4">{room.name}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {room.beds?.map((bedId, idx) => {
          const guest = getBedGuest(bedId);
          const ghostGuest = getGhostGuest(bedId);
          const ghostDebt = ghostGuest ? (ghostGuest.totalPrice || 0) - getTotalPaid(ghostGuest) : 0;
          const isBooking = guest?.status === 'booked';
          
          return (
            <div
              key={idx}
              className={`p-3 rounded border-2 ${
                guest
                  ? isBooking
                    ? 'bg-yellow-100 border-yellow-400'
                    : 'bg-green-100 border-green-400'
                  : ghostGuest && ghostDebt > 0
                  ? 'bg-slate-50 border-gray-300'
                  : 'bg-white border-gray-300'
              }`}
            >
              <div className="font-semibold text-sm mb-1">Bed {bedId}</div>
              {guest ? (
                <div className="text-xs">
                  <div className="font-bold">{guest.fullName}</div>
                  <div className="text-gray-600">
                    {new Date(guest.checkInDate).toLocaleDateString()} - 
                    {new Date(guest.checkOutDate).toLocaleDateString()}
                  </div>
                </div>
              ) : ghostGuest ? (
                <div className="text-xs text-gray-500">
                  <div className="font-bold">{ghostGuest.fullName}</div>
                  <div>Out: {new Date(ghostGuest.checkOutDate).toLocaleDateString()}</div>
                  {ghostDebt > 0 && (
                    <div className="text-rose-600 bg-rose-100 px-2 py-1 rounded mt-1 font-bold">
                      Debt: {ghostDebt.toFixed(2)}
                    </div>
                  )}
                  <button
                    onClick={() => onCheckIn(room.id, bedId)}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs underline"
                  >
                    Check in new guest
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onCheckIn(room.id, bedId)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs underline"
                >
                  Available
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ============================================================================
// DEBTS VIEW (with double-click protection)
// ============================================================================
const DebtsView = ({ guests, onPayment, lang = 'ru' }) => {
  const { t } = useTranslation(lang);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const getTotalPaid = (guest) => {
    return (guest.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  };
  
  const guestsWithDebt = guests
    .map(g => ({
      ...g,
      paid: getTotalPaid(g),
      debt: (g.totalPrice || 0) - getTotalPaid(g)
    }))
    .filter(g => g.debt > 0)
    .sort((a, b) => b.debt - a.debt);
  
  const handlePayment = async (guest, amount) => {
    await onPayment(guest, amount);
    setIsPaymentModalOpen(false);
    setSelectedGuest(null);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Debts</h2>
      <div className="space-y-2">
        {guestsWithDebt.map((guest, idx) => (
          <Card key={idx} className={guest.status === 'checked_out' ? 'bg-slate-50' : ''}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{guest.fullName}</div>
                <div className="text-sm text-gray-600">
                  {new Date(guest.checkInDate).toLocaleDateString()} - 
                  {new Date(guest.checkOutDate).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  Total: {guest.totalPrice.toFixed(2)} | 
                  Paid: {guest.paid.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  guest.status === 'checked_out' ? 'text-rose-600 bg-rose-100 px-3 py-1 rounded' : 'text-rose-600'
                }`}>
                  {guest.debt.toFixed(2)}
                </div>
                <Button
                  onClick={() => {
                    setSelectedGuest(guest);
                    setIsPaymentModalOpen(true);
                  }}
                  className="mt-2"
                >
                  {t('pay')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Payment Modal */}
      {isPaymentModalOpen && selectedGuest && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedGuest(null);
          }}
          onSubmit={handlePayment}
          guest={selectedGuest}
          lang={lang}
        />
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================
const App = () => {
  const [lang, setLang] = useState('ru');
  const [currentUser, setCurrentUser] = useState({ id: '1', name: 'Admin', role: 'admin' });
  
  // Sample data
  const [clients, setClients] = useState([
    { id: '1', fullName: 'Иван Петров', passport: 'AB123456', country: 'Россия', phone: '+7 900 123 4567' },
    { id: '2', fullName: 'Мария Сидорова', passport: 'CD789012', country: 'Россия', phone: '+7 900 987 6543' },
    { id: '3', fullName: 'John Smith', passport: 'US123456', country: 'США', phone: '+1 555 123 4567' },
  ]);
  
  const [guests, setGuests] = useState([
    {
      id: '1',
      fullName: 'Иван Петров',
      passport: 'AB123456',
      roomId: '101',
      bedId: '1',
      checkInDate: '2026-01-20',
      checkOutDate: '2026-01-25',
      status: 'checked_in',
      totalPrice: 500,
      pricePerDay: 100,
      cashierId: '1',
      payments: [{ amount: 300, date: '2026-01-20' }]
    },
    {
      id: '2',
      fullName: 'Мария Сидорова',
      passport: 'CD789012',
      roomId: '101',
      bedId: '2',
      checkInDate: '2026-01-15',
      checkOutDate: '2026-01-28',
      status: 'checked_out',
      totalPrice: 600,
      pricePerDay: 100,
      cashierId: '1',
      payments: [{ amount: 400, date: '2026-01-15' }]
    },
    {
      id: '3',
      fullName: 'John Smith',
      passport: 'US123456',
      roomId: '102',
      bedId: '1',
      checkInDate: '2026-01-10',
      checkOutDate: '2026-01-20',
      status: 'checked_out',
      totalPrice: 800,
      pricePerDay: 80,
      cashierId: '1',
      payments: [{ amount: 800, date: '2026-01-10' }]
    },
  ]);
  
  const [rooms, setRooms] = useState([
    { id: '101', name: 'Room 101', beds: ['1', '2', '3', '4'] },
    { id: '102', name: 'Room 102', beds: ['1', '2', '3', '4'] },
    { id: '103', name: 'Room 103', beds: ['1', '2'] },
  ]);
  
  const [users, setUsers] = useState([
    { id: '1', name: 'Admin User', role: 'admin' },
    { id: '2', name: 'Cashier User', role: 'cashier' },
  ]);
  
  const [activeView, setActiveView] = useState('clients'); // 'clients', 'rooms', 'debts'
  
  const handleDeduplicate = () => {
    console.log('Deduplicating clients...');
    // Implementation for deduplication
  };
  
  const handleNormalizeCountries = () => {
    console.log('Normalizing countries...');
    // Implementation for country normalization
  };
  
  const handleAddClient = () => {
    console.log('Adding new client...');
    // Implementation for adding client
  };
  
  const handleImportCSV = () => {
    console.log('Importing CSV...');
    // Implementation for CSV import
  };
  
  const handleCheckIn = (roomId, bedId) => {
    console.log('Check in to room:', roomId, 'bed:', bedId);
    // Implementation for check-in
  };
  
  const handlePayment = async (guest, amount) => {
    console.log('Payment for guest:', guest.id, 'amount:', amount);
    // Implementation for payment
    // Update guest payments
    setGuests(guests.map(g =>
      g.id === guest.id
        ? { ...g, payments: [...(g.payments || []), { amount, date: new Date().toISOString() }] }
        : g
    ));
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hostel Management System</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setLang('ru')}
              className={`px-3 py-1 rounded ${lang === 'ru' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              RU
            </button>
            <button
              onClick={() => setLang('uz')}
              className={`px-3 py-1 rounded ${lang === 'uz' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              UZ
            </button>
            <select
              value={currentUser.role}
              onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
              className="px-3 py-1 border rounded"
            >
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex gap-2">
          <button
            onClick={() => setActiveView('clients')}
            className={`px-4 py-2 rounded ${activeView === 'clients' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Clients
          </button>
          <button
            onClick={() => setActiveView('rooms')}
            className={`px-4 py-2 rounded ${activeView === 'rooms' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveView('debts')}
            className={`px-4 py-2 rounded ${activeView === 'debts' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Debts
          </button>
        </div>
        
        {/* Content */}
        <div>
          {activeView === 'clients' && (
            <ClientsView
              clients={clients}
              guests={guests}
              users={users}
              rooms={rooms}
              currentUser={currentUser}
              onDeduplicate={handleDeduplicate}
              onNormalizeCountries={handleNormalizeCountries}
              onAddClient={handleAddClient}
              onImportCSV={handleImportCSV}
              lang={lang}
            />
          )}
          
          {activeView === 'rooms' && (
            <div className="space-y-4">
              {rooms.map(room => (
                <RoomCardChess
                  key={room.id}
                  room={room}
                  guests={guests}
                  onCheckIn={handleCheckIn}
                  lang={lang}
                />
              ))}
            </div>
          )}
          
          {activeView === 'debts' && (
            <DebtsView
              guests={guests}
              onPayment={handlePayment}
              lang={lang}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
