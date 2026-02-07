// ============================================
// App.jsx - Part 1/5
// Copy all 5 parts sequentially into one file
// ============================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  where
} from 'firebase/firestore';

// ============================================
// TRANSLATIONS
// ============================================
const TRANSLATIONS = {
  ru: {
    appTitle: 'Система управления хостелом',
    dashboard: 'Панель',
    calendar: 'Календарь',
    staff: 'Персонал',
    clients: 'Клиенты',
    tasks: 'Задачи',
    debts: 'Долги',
    reports: 'Отчёты',
    shifts: 'Смены',
    settings: 'Настройки',
    logout: 'Выход',
    checkIn: 'Заселить',
    checkOut: 'Выселить',
    payment: 'Оплата',
    guest: 'Гость',
    room: 'Комната',
    bed: 'Место',
    price: 'Цена',
    paid: 'Оплачено',
    debt: 'Долг',
    total: 'Итого',
    save: 'Сохранить',
    cancel: 'Отмена',
    search: 'Поиск',
    filter: 'Фильтр',
    export: 'Экспорт',
    print: 'Печать',
  },
  en: {
    appTitle: 'Hostel Management System',
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    staff: 'Staff',
    clients: 'Clients',
    tasks: 'Tasks',
    debts: 'Debts',
    reports: 'Reports',
    shifts: 'Shifts',
    settings: 'Settings',
    logout: 'Logout',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    payment: 'Payment',
    guest: 'Guest',
    room: 'Room',
    bed: 'Bed',
    price: 'Price',
    paid: 'Paid',
    debt: 'Debt',
    total: 'Total',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    print: 'Print',
  }
};

// ============================================
// FIREBASE CONFIG
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyBxMXqL5K8FkZtVXQvN_YrHjDZmXqL5K8F",
  authDomain: "hostel-management.firebaseapp.com",
  projectId: "hostel-management",
  storageBucket: "hostel-management.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// CONSTANTS
// ============================================
const DEFAULT_USERS = [
  { login: 'admin', pass: 'admin123', name: 'Admin', role: 'admin', hostelId: null },
  { login: 'super', pass: 'super123', name: 'Super Admin', role: 'super', hostelId: null },
  { login: 'fazliddin', pass: '123', name: 'Fazliddin', role: 'cashier', hostelId: 'hostel2' },
  { login: 'manager1', pass: '123', name: 'Manager 1', role: 'manager', hostelId: 'hostel1' },
  { login: 'cashier1', pass: '123', name: 'Cashier 1', role: 'cashier', hostelId: 'hostel1' },
];

const COUNTRIES = [
  'Узбекистан', 'Россия', 'Казахстан', 'Таджикистан', 'Кыргызстан',
  'Туркменистан', 'Азербайджан', 'Армения', 'Грузия', 'Беларусь',
  'Украина', 'Молдова', 'США', 'Китай', 'Япония', 'Южная Корея',
  'Германия', 'Франция', 'Великобритания', 'Италия', 'Испания',
  'Турция', 'Иран', 'Индия', 'Пакистан', 'Афганистан', 'Другое'
];

const HOSTELS = [
  {
    id: 'hostel1',
    name: 'Хостел "Центральный"',
    address: 'г. Ташкент, ул. Навои, 15',
    rooms: [
      { number: '101', beds: ['A', 'B', 'C', 'D'], type: '4-bed' },
      { number: '102', beds: ['A', 'B', 'C', 'D', 'E', 'F'], type: '6-bed' },
      { number: '103', beds: ['A', 'B'], type: '2-bed' },
      { number: '104', beds: ['A', 'B', 'C', 'D'], type: '4-bed' },
      { number: '105', beds: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], type: '8-bed' },
    ]
  },
  {
    id: 'hostel2',
    name: 'Хостел "Восточный"',
    address: 'г. Ташкент, ул. Бабура, 22',
    rooms: [
      { number: '201', beds: ['A', 'B', 'C', 'D'], type: '4-bed' },
      { number: '202', beds: ['A', 'B', 'C', 'D', 'E', 'F'], type: '6-bed' },
      { number: '203', beds: ['A', 'B'], type: '2-bed' },
      { number: '204', beds: ['A', 'B', 'C', 'D'], type: '4-bed' },
    ]
  }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getTotalPaid = (guest) => {
  if (!guest || !guest.payments) return 0;
  return guest.payments.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);
};

const pluralize = (num, one, few, many) => {
  const mod10 = num % 10;
  const mod100 = num % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
};

const getStayDetails = (guest) => {
  const checkIn = new Date(guest.checkInDate || guest.checkInDateTime);
  const days = parseInt(guest.days) || 1;
  const checkOut = new Date(checkIn.getTime() + days * 24 * 60 * 60 * 1000);
  
  return {
    checkInDate: checkIn,
    checkOutDate: checkOut,
    totalDays: days
  };
};

const exportToExcel = (data, filename, totalIncome = 0, totalExpense = 0) => {
  const balance = totalIncome - totalExpense;
  
  let htmlTable = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:x="urn:schemas-microsoft-com:office:excel" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <style>
        body { font-family: Arial; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 8px; }
        th { background-color: #4f46e5; color: #fff; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип</th>
            <th>Хостел</th>
            <th>Кассир</th>
            <th>Сумма</th>
            <th>Метод</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach(row => {
    htmlTable += `
      <tr>
        <td>${row.date}</td>
        <td>${row.type === 'income' ? 'Приход' : 'Расход'}</td>
        <td>${row.hostel}</td>
        <td>${row.staff}</td>
        <td>${parseInt(row.amount).toLocaleString()}</td>
        <td>${row.method}</td>
        <td>${row.comment}</td>
      </tr>
    `;
  });

  htmlTable += `
        <tr style="background-color: #f3f4f6; font-weight: bold;">
          <td colspan="4">ИТОГО ПРИХОД:</td>
          <td>${totalIncome.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
        <tr style="background-color: #f3f4f6; font-weight: bold;">
          <td colspan="4">ИТОГО РАСХОД:</td>
          <td>${totalExpense.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
        <tr style="background-color: #e0e7ff; font-weight: bold;">
          <td colspan="4">БАЛАНС:</td>
          <td>${balance.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlTable], { 
    type: 'application/vnd.ms-excel;charset=utf-8' 
  });
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const printDocument = (type, guest, hostel) => {
  const w = window.open('', '', 'width=800,height=600');
  const totalPaid = getTotalPaid(guest);
  
  let html = `
    <html>
    <head>
      <title>${type}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial; padding: 40px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td, th { border: 1px solid #000; padding: 10px; text-align: left; }
        .header { font-weight: bold; background-color: #f0f0f0; }
      </style>
    </head>
    <body>
  `;
  
  if (type === 'Чек' || type === 'check') {
    html += `
      <h1>ЧЕК №${guest.id}</h1>
      <p><strong>Хостел:</strong> ${hostel?.name || 'N/A'}</p>
      <p><strong>Адрес:</strong> ${hostel?.address || 'N/A'}</p>
      <hr>
      <table>
        <tr><td class="header">Гость</td><td>${guest.fullName}</td></tr>
        <tr><td class="header">Паспорт</td><td>${guest.passport}</td></tr>
        <tr><td class="header">Комната/Место</td><td>${guest.roomNumber} / ${guest.bedId}</td></tr>
        <tr><td class="header">Дата заезда</td><td>${new Date(guest.checkInDate).toLocaleDateString()}</td></tr>
        <tr><td class="header">Дней</td><td>${guest.days}</td></tr>
        <tr><td class="header">Цена за ночь</td><td>${parseInt(guest.pricePerNight).toLocaleString()}</td></tr>
        <tr><td class="header">Итого</td><td>${parseInt(guest.totalPrice).toLocaleString()}</td></tr>
        <tr><td class="header">Оплачено</td><td>${totalPaid.toLocaleString()}</td></tr>
      </table>
      <p style="margin-top: 30px; text-align: center;">Спасибо за визит!</p>
    `;
  } else if (type === 'Анкета' || type === 'regcard') {
    html += `
      <h1>АНКЕТА ГОСТЯ</h1>
      <table>
        <tr><td class="header">ФИО</td><td>${guest.fullName}</td></tr>
        <tr><td class="header">Дата рождения</td><td>${guest.birthDate || 'N/A'}</td></tr>
        <tr><td class="header">Паспорт</td><td>${guest.passport}</td></tr>
        <tr><td class="header">Страна</td><td>${guest.country}</td></tr>
        <tr><td class="header">Комната</td><td>${guest.roomNumber}</td></tr>
        <tr><td class="header">Место</td><td>${guest.bedId}</td></tr>
        <tr><td class="header">Дата заезда</td><td>${new Date(guest.checkInDate).toLocaleString()}</td></tr>
        <tr><td class="header">Дата выезда</td><td>${new Date(guest.checkOutDate).toLocaleString()}</td></tr>
      </table>
    `;
  } else if (type === 'Справка' || type === 'ref') {
    html += `
      <h1>СПРАВКА О ПРОЖИВАНИИ</h1>
      <p>Настоящая справка выдана в том, что гражданин(ка):</p>
      <table>
        <tr><td class="header">ФИО</td><td>${guest.fullName}</td></tr>
        <tr><td class="header">Паспорт</td><td>${guest.passport}</td></tr>
        <tr><td class="header">Страна</td><td>${guest.country}</td></tr>
      </table>
      <p>Проживал(а) в ${hostel?.name || 'хостеле'} по адресу: ${hostel?.address || 'N/A'}</p>
      <p>Период проживания: с ${new Date(guest.checkInDate).toLocaleDateString()} по ${new Date(guest.checkOutDate).toLocaleDateString()}</p>
      <p style="margin-top: 50px;">Дата выдачи: ${new Date().toLocaleDateString()}</p>
      <p>___________________ (подпись)</p>
    `;
  }
  
  html += '</body></html>';
  
  w.document.write(html);
  w.document.close();
  w.print();
};

// ============================================
// End of Part 1/5
// ============================================
// ============================================
// App.jsx - Part 2/5
// UI Components
// ============================================

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
      active
        ? 'bg-indigo-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const Navigation = ({ 
  activeView, 
  setActiveView, 
  currentUser, 
  onLogout,
  selectedHostelFilter,
  setSelectedHostelFilter,
  hostels,
  lang,
  t
}) => {
  const canSwitchHostels = currentUser.role === 'admin' || 
                            currentUser.role === 'super' || 
                            currentUser.login === 'fazliddin';
  
  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-indigo-600">
          {t.appTitle}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {currentUser.name} ({currentUser.role})
        </p>
      </div>
      
      {canSwitchHostels && (
        <div className="p-4 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Хостел:
          </label>
          <select
            value={selectedHostelFilter}
            onChange={(e) => setSelectedHostelFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Все хостелы</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      )}
      
      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon="📊"
          label={t.dashboard}
          active={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />
        <NavItem
          icon="📅"
          label={t.calendar}
          active={activeView === 'calendar'}
          onClick={() => setActiveView('calendar')}
        />
        <NavItem
          icon="👥"
          label={t.staff}
          active={activeView === 'staff'}
          onClick={() => setActiveView('staff')}
        />
        <NavItem
          icon="🧳"
          label={t.clients}
          active={activeView === 'clients'}
          onClick={() => setActiveView('clients')}
        />
        <NavItem
          icon="✓"
          label={t.tasks}
          active={activeView === 'tasks'}
          onClick={() => setActiveView('tasks')}
        />
        <NavItem
          icon="💰"
          label={t.debts}
          active={activeView === 'debts'}
          onClick={() => setActiveView('debts')}
        />
        <NavItem
          icon="📈"
          label={t.reports}
          active={activeView === 'reports'}
          onClick={() => setActiveView('reports')}
        />
        <NavItem
          icon="⏰"
          label={t.shifts}
          active={activeView === 'shifts'}
          onClick={() => setActiveView('shifts')}
        />
      </nav>
      
      <div className="p-4 border-t">
        <Button
          onClick={onLogout}
          variant="secondary"
          className="w-full"
        >
          {t.logout}
        </Button>
      </div>
    </div>
  );
};

const DashboardStats = ({ guests, hostels, selectedHostelFilter }) => {
  const filteredGuests = guests.filter(g => 
    !selectedHostelFilter || g.hostelId === selectedHostelFilter
  );
  
  const activeGuests = filteredGuests.filter(g => g.status === 'active').length;
  const totalRevenue = filteredGuests.reduce((sum, g) => {
    const paid = getTotalPaid(g);
    return sum + paid;
  }, 0);
  
  const occupancyRate = useMemo(() => {
    const selectedHostels = selectedHostelFilter 
      ? hostels.filter(h => h.id === selectedHostelFilter)
      : hostels;
    
    const totalBeds = selectedHostels.reduce((sum, h) => {
      return sum + h.rooms.reduce((roomSum, r) => roomSum + r.beds.length, 0);
    }, 0);
    
    return totalBeds > 0 ? Math.round((activeGuests / totalBeds) * 100) : 0;
  }, [activeGuests, hostels, selectedHostelFilter]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Активные гости</p>
            <p className="text-3xl font-bold text-indigo-600">{activeGuests}</p>
          </div>
          <div className="text-4xl">🧳</div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Заполняемость</p>
            <p className="text-3xl font-bold text-green-600">{occupancyRate}%</p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Доход (всего)</p>
            <p className="text-3xl font-bold text-purple-600">
              {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-4xl">💰</div>
        </div>
      </Card>
    </div>
  );
};

const ChartsSection = ({ guests, selectedHostelFilter }) => {
  const chartData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      const dayGuests = guests.filter(g => {
        if (selectedHostelFilter && g.hostelId !== selectedHostelFilter) return false;
        const checkInDate = new Date(g.checkInDate);
        return checkInDate.toLocaleDateString() === dateStr;
      });
      
      last7Days.push({
        date: dateStr,
        count: dayGuests.length
      });
    }
    return last7Days;
  }, [guests, selectedHostelFilter]);
  
  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  
  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">Заезды за последние 7 дней</h2>
      <div className="flex items-end gap-2 h-48">
        {chartData.map((day, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-indigo-500 rounded-t transition-all"
              style={{ 
                height: `${(day.count / maxCount) * 100}%`,
                minHeight: day.count > 0 ? '20px' : '0'
              }}
            ></div>
            <p className="text-xs mt-2 text-center">{day.date.split('/')[0]}/{day.date.split('/')[1]}</p>
            <p className="text-sm font-bold">{day.count}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const RoomCardChess = ({ 
  hostel, 
  guests, 
  onBedClick, 
  canEdit 
}) => {
  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">{hostel.name}</h2>
      <div className="space-y-4">
        {hostel.rooms.map(room => {
          const roomGuests = guests.filter(g => 
            g.hostelId === hostel.id && 
            g.roomNumber === room.number && 
            g.status === 'active'
          );
          
          return (
            <div key={room.number} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                Комната {room.number} ({room.type})
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {room.beds.map(bedId => {
                  const guest = roomGuests.find(g => g.bedId === bedId);
                  const isOccupied = !!guest;
                  
                  return (
                    <button
                      key={bedId}
                      onClick={() => canEdit && onBedClick(hostel.id, room.number, bedId, guest)}
                      disabled={!canEdit}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${isOccupied 
                          ? 'bg-red-100 border-red-400 hover:bg-red-200' 
                          : 'bg-green-100 border-green-400 hover:bg-green-200'
                        }
                        ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="text-center">
                        <div className="font-bold">{bedId}</div>
                        {isOccupied && (
                          <div className="text-xs mt-1 truncate">
                            {guest.fullName.split(' ')[0]}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ============================================
// End of Part 2/5
// ============================================
// ============================================
// App.jsx - Part 3/5
// Modals
// ============================================

const CheckInModal = ({ 
  isOpen, 
  onClose, 
  hostelId, 
  roomNumber, 
  bedId, 
  onCheckIn,
  hostel 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    country: 'Узбекистан',
    birthDate: '',
    phone: '',
    days: '1',
    pricePerNight: '',
    prepayment: '0',
    paymentMethod: 'cash'
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.fullName || !formData.passport || !formData.pricePerNight) {
      alert('Заполните обязательные поля!');
      return;
    }
    
    const totalPrice = parseInt(formData.days) * parseInt(formData.pricePerNight);
    const checkInDate = new Date();
    
    const guestData = {
      ...formData,
      hostelId,
      roomNumber,
      bedId,
      totalPrice,
      checkInDate: checkInDate.toISOString(),
      checkInDateTime: checkInDate.toISOString(),
      status: 'active',
      payments: formData.prepayment > 0 ? [{
        amount: formData.prepayment,
        method: formData.paymentMethod,
        date: new Date().toISOString(),
        type: 'checkin'
      }] : []
    };
    
    onCheckIn(guestData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          Заселение - {hostel?.name}
        </h2>
        <p className="text-gray-600 mb-4">
          Комната: {roomNumber}, Место: {bedId}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ФИО *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Паспорт *</label>
              <input
                type="text"
                value={formData.passport}
                onChange={(e) => setFormData({...formData, passport: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Страна</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Дата рождения</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Дней *</label>
              <input
                type="number"
                min="1"
                value={formData.days}
                onChange={(e) => setFormData({...formData, days: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Цена/ночь *</label>
              <input
                type="number"
                min="0"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Предоплата</label>
              <input
                type="number"
                min="0"
                value={formData.prepayment}
                onChange={(e) => setFormData({...formData, prepayment: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Метод оплаты</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="transfer">Перевод</option>
            </select>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">
              Итого к оплате: {(parseInt(formData.days) * parseInt(formData.pricePerNight) || 0).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSubmit} variant="primary">
            Заселить
          </Button>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

const GuestDetailsModal = ({ 
  isOpen, 
  onClose, 
  guest, 
  onCheckOut, 
  onAddPayment,
  hostel
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [checkoutManualRefund, setCheckoutManualRefund] = useState('');

  if (!isOpen || !guest) return null;

  const totalPaid = getTotalPaid(guest);
  const totalPrice = parseInt(guest.totalPrice) || 0;
  const balance = totalPaid - totalPrice;

  const handleAddPayment = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Введите сумму оплаты');
      return;
    }
    
    onAddPayment(guest, {
      amount: paymentAmount,
      method: paymentMethod,
      date: new Date().toISOString()
    });
    
    setPaymentAmount('');
    setShowPayment(false);
  };

  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убрана проверка долга при выселении
  const handleDoCheckout = () => { 
    // Разрешаем выселение всегда, если balance >= 0
    const refund = checkoutManualRefund ? parseInt(checkoutManualRefund) : Math.max(0, balance);
    
    const finalData = { 
      totalPrice: totalPrice,
      refundAmount: refund,
      checkOutDate: new Date().toISOString()
    }; 
    
    onCheckOut(guest, finalData); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">Информация о госте</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">ФИО</p>
            <p className="font-semibold">{guest.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Паспорт</p>
            <p className="font-semibold">{guest.passport}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Страна</p>
            <p className="font-semibold">{guest.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Телефон</p>
            <p className="font-semibold">{guest.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Комната / Место</p>
            <p className="font-semibold">{guest.roomNumber} / {guest.bedId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Дата заезда</p>
            <p className="font-semibold">
              {new Date(guest.checkInDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Дней</p>
            <p className="font-semibold">{guest.days}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Цена за ночь</p>
            <p className="font-semibold">{parseInt(guest.pricePerNight).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Итого</p>
              <p className="text-xl font-bold">{totalPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Оплачено</p>
              <p className="text-xl font-bold text-green-600">{totalPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {balance >= 0 ? 'Переплата' : 'Долг'}
              </p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(balance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        {guest.payments && guest.payments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">История платежей</h3>
            <div className="space-y-2">
              {guest.payments.map((payment, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <span>{new Date(payment.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{parseInt(payment.amount).toLocaleString()}</span>
                  <span className="text-sm text-gray-600">{payment.method}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!showPayment ? (
          <div className="flex gap-3">
            <Button onClick={() => setShowPayment(true)} variant="success">
              Добавить оплату
            </Button>
            <Button 
              onClick={handleDoCheckout} 
              variant="danger"
            >
              Выселить
            </Button>
            <Button onClick={() => printDocument('Чек', guest, hostel)} variant="secondary">
              Печать чека
            </Button>
            <Button onClick={() => printDocument('Анкета', guest, hostel)} variant="secondary">
              Анкета
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Сумма</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Метод</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="cash">Наличные</option>
                  <option value="card">Карта</option>
                  <option value="transfer">Перевод</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddPayment} variant="success">
                Подтвердить
              </Button>
              <Button onClick={() => setShowPayment(false)} variant="secondary">
                Отмена
              </Button>
            </div>
          </div>
        )}
        
        {balance > 0 && (
          <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm mb-2">Сумма возврата при выселении:</p>
            <input
              type="number"
              value={checkoutManualRefund}
              onChange={(e) => setCheckoutManualRefund(e.target.value)}
              placeholder={balance.toString()}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const MoveGuestModal = ({ 
  isOpen, 
  onClose, 
  guest, 
  hostels, 
  onMove 
}) => {
  const [newHostelId, setNewHostelId] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newBedId, setNewBedId] = useState('');

  if (!isOpen || !guest) return null;

  const selectedHostel = hostels.find(h => h.id === newHostelId);
  const availableRooms = selectedHostel ? selectedHostel.rooms : [];
  const selectedRoom = availableRooms.find(r => r.number === newRoomNumber);
  const availableBeds = selectedRoom ? selectedRoom.beds : [];

  const handleMove = () => {
    if (!newHostelId || !newRoomNumber || !newBedId) {
      alert('Выберите новое место');
      return;
    }
    
    onMove(guest, {
      hostelId: newHostelId,
      roomNumber: newRoomNumber,
      bedId: newBedId
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Переместить гостя</h2>
        <p className="mb-4">
          {guest.fullName} - {guest.roomNumber}/{guest.bedId}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Хостел</label>
            <select
              value={newHostelId}
              onChange={(e) => {
                setNewHostelId(e.target.value);
                setNewRoomNumber('');
                setNewBedId('');
              }}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Выберите хостел</option>
              {hostels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          
          {newHostelId && (
            <div>
              <label className="block text-sm font-medium mb-1">Комната</label>
              <select
                value={newRoomNumber}
                onChange={(e) => {
                  setNewRoomNumber(e.target.value);
                  setNewBedId('');
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Выберите комнату</option>
                {availableRooms.map(r => (
                  <option key={r.number} value={r.number}>
                    {r.number} ({r.type})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {newRoomNumber && (
            <div>
              <label className="block text-sm font-medium mb-1">Место</label>
              <select
                value={newBedId}
                onChange={(e) => setNewBedId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Выберите место</option>
                {availableBeds.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={handleMove} variant="primary">
            Переместить
          </Button>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  guest, 
  onAddPayment 
}) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');

  if (!isOpen || !guest) return null;

  const handleSubmit = () => {
    if (!amount || amount <= 0) {
      alert('Введите сумму');
      return;
    }
    
    onAddPayment(guest, {
      amount,
      method,
      date: new Date().toISOString()
    });
    
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Добавить оплату</h2>
        <p className="mb-4">{guest.fullName}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Сумма</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Метод оплаты</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="transfer">Перевод</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSubmit} variant="success">
            Добавить
          </Button>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

const AddExpenseModal = ({ 
  isOpen, 
  onClose, 
  onAddExpense,
  currentUser,
  selectedHostelFilter,
  hostels
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Коммунальные',
    description: '',
    method: 'cash'
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.amount || formData.amount <= 0) {
      alert('Введите сумму');
      return;
    }
    
    const hostel = hostels.find(h => h.id === selectedHostelFilter);
    
    onAddExpense({
      ...formData,
      date: new Date().toISOString(),
      staff: currentUser.name,
      hostelId: selectedHostelFilter,
      hostelName: hostel?.name || 'N/A'
    });
    
    setFormData({
      amount: '',
      category: 'Коммунальные',
      description: '',
      method: 'cash'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Добавить расход</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Сумма</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option>Коммунальные</option>
              <option>Зарплата</option>
              <option>Закупки</option>
              <option>Ремонт</option>
              <option>Прочее</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Метод оплаты</label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({...formData, method: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="transfer">Перевод</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSubmit} variant="primary">
            Добавить
          </Button>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// End of Part 3/5
// ============================================
// ============================================
// App.jsx - Part 4/5
// Views (Pages)
// ============================================

const CalendarView = ({ guests, hostels, selectedHostelFilter, onGuestClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const result = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      result.push({
        date: i,
        str: date.toISOString().split('T')[0]
      });
    }
    return result;
  }, [currentMonth]);
  
  const filteredGuests = guests.filter(g => {
    if (selectedHostelFilter && g.hostelId !== selectedHostelFilter) return false;
    return true;
  });
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Правильный расчет позиции для выселенных гостей
  const getGuestBlockStyle = (guest) => {
    let checkInDate = new Date(guest.checkInDate || guest.checkInDateTime || guest.checkIn);
    checkInDate.setHours(12, 0, 0, 0);

    const calendarStart = new Date(days[0].str);
    calendarStart.setHours(0, 0, 0, 0);
    
    // ✅ ДЛЯ ВЫСЕЛЕННЫХ ИСПОЛЬЗУЕМ checkOutDate ИЗ БД
    let checkOutDate;
    if (guest.status === 'checked_out' && guest.checkOutDate) {
      checkOutDate = new Date(guest.checkOutDate);
      checkOutDate.setHours(12, 0, 0, 0);
    } else {
      const guestDurationMs = parseInt(guest.days) * 24 * 60 * 60 * 1000;
      checkOutDate = new Date(checkInDate.getTime() + guestDurationMs);
      checkOutDate.setHours(12, 0, 0, 0);
    }

    const startDayIndex = Math.floor((checkInDate - calendarStart) / (24 * 60 * 60 * 1000));
    const endDayIndex = Math.floor((checkOutDate - calendarStart) / (24 * 60 * 60 * 1000));
    
    const left = Math.max(0, startDayIndex);
    const width = Math.max(1, endDayIndex - startDayIndex);
    
    // ✅ Цветовое кодирование: зелёный=оплачено, красный=долг
    const totalPaid = getTotalPaid(guest);
    const totalPrice = guest.totalPrice || 0;
    const paidRatio = totalPrice > 0 ? Math.min(totalPaid / totalPrice, 1) : 0;
    
    return {
      left: `${(left / days.length) * 100}%`,
      width: `${(width / days.length) * 100}%`,
      background: `linear-gradient(90deg, 
        #10b981 0%, 
        #10b981 ${paidRatio * 100}%, 
        #ef4444 ${paidRatio * 100}%, 
        #ef4444 100%
      )`
    };
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Календарь</h1>
        <div className="flex gap-2 items-center">
          <Button onClick={prevMonth} variant="secondary">←</Button>
          <span className="text-xl font-semibold px-4">
            {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </span>
          <Button onClick={nextMonth} variant="secondary">→</Button>
        </div>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex border-b pb-2 mb-4">
              {days.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 text-center text-sm font-semibold"
                >
                  {day.date}
                </div>
              ))}
            </div>
            
            <div className="space-y-1">
              {filteredGuests.map((guest) => {
                const styleData = getGuestBlockStyle(guest);
                
                return (
                  <div
                    key={guest.id}
                    className="relative h-12 cursor-pointer"
                    onClick={() => onGuestClick(guest)}
                  >
                    <div
                      className="absolute h-10 rounded flex items-center px-2 text-white text-sm overflow-hidden"
                      style={styleData}
                    >
                      <span className="font-semibold truncate">
                        {guest.fullName} - {guest.roomNumber}/{guest.bedId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
      
      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded"></div>
          <span className="text-sm">Оплачено</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded"></div>
          <span className="text-sm">Долг</span>
        </div>
      </div>
    </div>
  );
};

const StaffView = ({ currentUser }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Персонал</h1>
      <Card>
        <div className="space-y-4">
          {DEFAULT_USERS.map((user, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.login}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{user.role}</p>
                {user.hostelId && (
                  <p className="text-sm text-gray-600">
                    {HOSTELS.find(h => h.id === user.hostelId)?.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const ClientsView = ({ guests }) => {
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [countryFilter, setCountryFilter] = useState('');
  
  const clients = useMemo(() => {
    const uniqueClients = new Map();
    guests.forEach(g => {
      if (!uniqueClients.has(g.passport)) {
        uniqueClients.set(g.passport, {
          fullName: g.fullName,
          passport: g.passport,
          country: g.country,
          phone: g.phone,
          lastVisit: g.checkInDate,
          visits: 1
        });
      } else {
        const existing = uniqueClients.get(g.passport);
        existing.visits += 1;
        if (new Date(g.checkInDate) > new Date(existing.lastVisit)) {
          existing.lastVisit = g.checkInDate;
        }
      }
    });
    return Array.from(uniqueClients.values());
  }, [guests]);
  
  // ✅ Уникальные страны для фильтра
  const uniqueCountries = useMemo(() => {
    return [...new Set(clients.map(c => c.country))].sort();
  }, [clients]);
  
  // ✅ Фильтрация + пагинация
  const filteredClients = useMemo(() => {
    let result = clients.filter(c => {
      const matchSearch = (c.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
                         (c.passport || '').includes(search.toUpperCase());
      const matchCountry = !countryFilter || c.country === countryFilter;
      return matchSearch && matchCountry;
    });
    
    return result.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [clients, search, countryFilter, currentPage, perPage]);
  
  const totalPages = Math.ceil(
    clients.filter(c => !countryFilter || c.country === countryFilter).length / perPage
  );
  
  useEffect(() => {
    setCurrentPage(1);
  }, [search, countryFilter, perPage]);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Клиенты</h1>
      
      <Card className="mb-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Поиск по имени или паспорту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <select 
            value={perPage} 
            onChange={e => setPerPage(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value={25}>25 на странице</option>
            <option value={50}>50 на странице</option>
            <option value={100}>100 на странице</option>
          </select>
          
          <select 
            value={countryFilter} 
            onChange={e => setCountryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Все страны</option>
            {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <div className="flex gap-2 items-center">
            <Button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              variant="secondary"
            >
              ←
            </Button>
            <span className="px-3 font-semibold">
              {currentPage} / {totalPages || 1}
            </span>
            <Button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(p => p + 1)}
              variant="secondary"
            >
              →
            </Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">ФИО</th>
                <th className="text-left p-3">Паспорт</th>
                <th className="text-left p-3">Страна</th>
                <th className="text-left p-3">Телефон</th>
                <th className="text-left p-3">Посещений</th>
                <th className="text-left p-3">Последний визит</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{client.fullName}</td>
                  <td className="p-3">{client.passport}</td>
                  <td className="p-3">{client.country}</td>
                  <td className="p-3">{client.phone || '-'}</td>
                  <td className="p-3">{client.visits}</td>
                  <td className="p-3">
                    {new Date(client.lastVisit).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Клиенты не найдены
          </div>
        )}
      </Card>
    </div>
  );
};

const TaskManager = ({ tasks, onAddTask, onToggleTask, currentUser }) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    
    onAddTask({
      text: newTaskText,
      priority: newTaskPriority,
      completed: false,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString()
    });
    
    setNewTaskText('');
    setShowAddTask(false);
  };
  
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Задачи</h1>
        <Button onClick={() => setShowAddTask(!showAddTask)} variant="primary">
          + Добавить задачу
        </Button>
      </div>
      
      {showAddTask && (
        <Card className="mb-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Описание задачи..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <div className="flex gap-4">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="low">Низкий приоритет</option>
                <option value="medium">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
              </select>
              <Button onClick={handleAddTask} variant="success">
                Сохранить
              </Button>
              <Button onClick={() => setShowAddTask(false)} variant="secondary">
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.text}
                </p>
                <p className="text-sm text-gray-500">
                  {task.createdBy} - {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>
          </Card>
        ))}
      </div>
      
      {tasks.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 py-8">Нет задач</p>
        </Card>
      )}
    </div>
  );
};

const DebtsView = ({ guests }) => {
  const debts = useMemo(() => {
    return guests
      .filter(g => g.status === 'active')
      .map(g => {
        const totalPaid = getTotalPaid(g);
        const totalPrice = parseInt(g.totalPrice) || 0;
        const debt = totalPrice - totalPaid;
        return { ...g, debt };
      })
      .filter(g => g.debt > 0)
      .sort((a, b) => b.debt - a.debt);
  }, [guests]);
  
  const totalDebt = debts.reduce((sum, g) => sum + g.debt, 0);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Долги</h1>
      
      <Card className="mb-6">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Общая сумма долгов</p>
          <p className="text-4xl font-bold text-red-600">
            {totalDebt.toLocaleString()}
          </p>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Гость</th>
                <th className="text-left p-3">Комната/Место</th>
                <th className="text-left p-3">Дата заезда</th>
                <th className="text-left p-3">Итого</th>
                <th className="text-left p-3">Оплачено</th>
                <th className="text-left p-3">Долг</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((guest) => {
                const totalPaid = getTotalPaid(guest);
                return (
                  <tr key={guest.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{guest.fullName}</td>
                    <td className="p-3">{guest.roomNumber}/{guest.bedId}</td>
                    <td className="p-3">
                      {new Date(guest.checkInDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{parseInt(guest.totalPrice).toLocaleString()}</td>
                    <td className="p-3 text-green-600">{totalPaid.toLocaleString()}</td>
                    <td className="p-3 font-bold text-red-600">
                      {guest.debt.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {debts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет долгов
          </div>
        )}
      </Card>
    </div>
  );
};

const ReportsView = ({ guests, expenses, selectedHostelFilter, hostels }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const reportData = useMemo(() => {
    const income = guests
      .filter(g => {
        if (selectedHostelFilter && g.hostelId !== selectedHostelFilter) return false;
        if (!g.payments) return false;
        return true;
      })
      .flatMap(g => 
        (g.payments || []).map(p => ({
          date: new Date(p.date).toLocaleDateString(),
          type: 'income',
          amount: p.amount,
          method: p.method,
          hostel: HOSTELS.find(h => h.id === g.hostelId)?.name || 'N/A',
          staff: 'N/A',
          comment: `Оплата от ${g.fullName}`
        }))
      );
    
    const expenseData = expenses
      .filter(e => {
        if (selectedHostelFilter && e.hostelId !== selectedHostelFilter) return false;
        return true;
      })
      .map(e => ({
        date: new Date(e.date).toLocaleDateString(),
        type: 'expense',
        amount: e.amount,
        method: e.method,
        hostel: e.hostelName,
        staff: e.staff,
        comment: `${e.category}: ${e.description}`
      }));
    
    return [...income, ...expenseData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [guests, expenses, selectedHostelFilter]);
  
  const filteredData = useMemo(() => {
    if (!dateFrom && !dateTo) return reportData;
    
    return reportData.filter(item => {
      const itemDate = new Date(item.date);
      if (dateFrom && itemDate < new Date(dateFrom)) return false;
      if (dateTo && itemDate > new Date(dateTo)) return false;
      return true;
    });
  }, [reportData, dateFrom, dateTo]);
  
  const totalIncome = filteredData
    .filter(d => d.type === 'income')
    .reduce((sum, d) => sum + parseInt(d.amount), 0);
  
  const totalExpense = filteredData
    .filter(d => d.type === 'expense')
    .reduce((sum, d) => sum + parseInt(d.amount), 0);
  
  const balance = totalIncome - totalExpense;
  
  const handleExport = () => {
    const filename = `report_${new Date().toLocaleDateString()}.xls`;
    exportToExcel(filteredData, filename, totalIncome, totalExpense);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Отчёты</h1>
      
      <Card className="mb-6">
        <div className="flex gap-4 items-center flex-wrap mb-4">
          <div>
            <label className="block text-sm mb-1">От:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">До:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex-1"></div>
          <Button onClick={handleExport} variant="success">
            📊 Экспорт в Excel
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Приход</p>
            <p className="text-2xl font-bold text-green-600">
              {totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Расход</p>
            <p className="text-2xl font-bold text-red-600">
              {totalExpense.toLocaleString()}
            </p>
          </div>
          <div className={`${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg text-center`}>
            <p className="text-sm text-gray-600">Баланс</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {balance.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Дата</th>
                <th className="text-left p-3">Тип</th>
                <th className="text-left p-3">Хостел</th>
                <th className="text-left p-3">Кассир</th>
                <th className="text-left p-3">Сумма</th>
                <th className="text-left p-3">Метод</th>
                <th className="text-left p-3">Описание</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.type === 'income' ? 'Приход' : 'Расход'}
                    </span>
                  </td>
                  <td className="p-3">{item.hostel}</td>
                  <td className="p-3">{item.staff}</td>
                  <td className="p-3 font-semibold">
                    {parseInt(item.amount).toLocaleString()}
                  </td>
                  <td className="p-3">{item.method}</td>
                  <td className="p-3 text-sm">{item.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const ShiftsView = ({ currentUser }) => {
  const [shifts, setShifts] = useState([]);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Смены</h1>
      <Card>
        <p className="text-center text-gray-500 py-8">
          Функция в разработке
        </p>
      </Card>
    </div>
  );
};

// ============================================
// End of Part 4/5
// ============================================
// ============================================
// App.jsx - Part 5/5
// Main App Component
// ============================================

function App() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ login: '', pass: '' });
  const [activeView, setActiveView] = useState('dashboard');
  const [lang, setLang] = useState('ru');
  const [guests, setGuests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('');
  
  // Modal states
  const [checkInModal, setCheckInModal] = useState({ 
    isOpen: false, 
    hostelId: null, 
    roomNumber: null, 
    bedId: null 
  });
  const [guestDetailsModal, setGuestDetailsModal] = useState({ 
    isOpen: false, 
    guest: null 
  });
  const [moveGuestModal, setMoveGuestModal] = useState({ 
    isOpen: false, 
    guest: null 
  });
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  
  const t = TRANSLATIONS[lang];
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Особые права для Fazliddin
  const canEdit = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'super') return true;
    if (currentUser.login === 'fazliddin') {
      return selectedHostelFilter === 'hostel2';
    }
    return true;
  }, [currentUser, selectedHostelFilter]);
  
  // ============================================
  // FIREBASE / DATA LOADING
  // ============================================
  useEffect(() => {
    // Load mock data for demo
    const mockGuests = [
      {
        id: '1',
        fullName: 'Иван Иванов',
        passport: 'AB1234567',
        country: 'Россия',
        phone: '+79001234567',
        hostelId: 'hostel1',
        roomNumber: '101',
        bedId: 'A',
        days: '3',
        pricePerNight: '50000',
        totalPrice: '150000',
        checkInDate: new Date().toISOString(),
        checkInDateTime: new Date().toISOString(),
        status: 'active',
        payments: [{
          amount: '100000',
          method: 'cash',
          date: new Date().toISOString()
        }]
      }
    ];
    
    setGuests(mockGuests);
  }, []);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleLogin = () => {
    const user = DEFAULT_USERS.find(
      u => u.login === loginForm.login && u.pass === loginForm.pass
    );
    
    if (user) {
      setCurrentUser(user);
      if (user.hostelId) {
        setSelectedHostelFilter(user.hostelId);
      }
    } else {
      alert('Неверный логин или пароль');
    }
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ login: '', pass: '' });
    setActiveView('dashboard');
    setSelectedHostelFilter('');
  };
  
  const handleBedClick = (hostelId, roomNumber, bedId, guest) => {
    if (!canEdit) {
      alert('У вас нет прав для этого действия');
      return;
    }
    
    if (guest) {
      setGuestDetailsModal({ isOpen: true, guest });
    } else {
      setCheckInModal({ isOpen: true, hostelId, roomNumber, bedId });
    }
  };
  
  const handleCheckIn = (guestData) => {
    const newGuest = {
      ...guestData,
      id: Date.now().toString(),
    };
    
    setGuests(prev => [...prev, newGuest]);
    setCheckInModal({ isOpen: false, hostelId: null, roomNumber: null, bedId: null });
    
    // Add income record
    const hostel = HOSTELS.find(h => h.id === guestData.hostelId);
    if (guestData.payments && guestData.payments.length > 0) {
      const payment = guestData.payments[0];
      setExpenses(prev => [...prev, {
        id: Date.now().toString(),
        type: 'income',
        amount: payment.amount,
        method: payment.method,
        date: payment.date,
        hostelId: guestData.hostelId,
        hostelName: hostel?.name || 'N/A',
        staff: currentUser.name,
        category: 'Проживание',
        description: `Заселение ${guestData.fullName}`
      }]);
    }
  };
  
  const handleCheckOut = (guest, finalData) => {
    setGuests(prev =>
      prev.map(g =>
        g.id === guest.id
          ? { 
              ...g, 
              status: 'checked_out', 
              checkOutDate: finalData.checkOutDate,
              refundAmount: finalData.refundAmount 
            }
          : g
      )
    );
    
    setGuestDetailsModal({ isOpen: false, guest: null });
  };
  
  const handleAddPayment = (guest, paymentData) => {
    setGuests(prev =>
      prev.map(g =>
        g.id === guest.id
          ? { ...g, payments: [...(g.payments || []), paymentData] }
          : g
      )
    );
    
    // Add income record
    const hostel = HOSTELS.find(h => h.id === guest.hostelId);
    setExpenses(prev => [...prev, {
      id: Date.now().toString(),
      type: 'income',
      amount: paymentData.amount,
      method: paymentData.method,
      date: paymentData.date,
      hostelId: guest.hostelId,
      hostelName: hostel?.name || 'N/A',
      staff: currentUser.name,
      category: 'Проживание',
      description: `Оплата от ${guest.fullName}`
    }]);
  };
  
  const handleMoveGuest = (guest, newLocation) => {
    setGuests(prev =>
      prev.map(g =>
        g.id === guest.id
          ? { ...g, ...newLocation }
          : g
      )
    );
    
    setMoveGuestModal({ isOpen: false, guest: null });
  };
  
  const handleAddTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
    };
    
    setTasks(prev => [...prev, newTask]);
  };
  
  const handleToggleTask = (taskId) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };
  
  const handleAddExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: Date.now().toString(),
      type: 'expense'
    };
    
    setExpenses(prev => [...prev, newExpense]);
  };
  
  const handleGuestClick = (guest) => {
    setGuestDetailsModal({ isOpen: true, guest });
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  // Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t.appTitle}
            </h1>
            <p className="text-gray-600">Авторизация</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <input
                type="text"
                value={loginForm.login}
                onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите логин"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={loginForm.pass}
                onChange={(e) => setLoginForm({ ...loginForm, pass: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите пароль"
              />
            </div>
            
            <Button
              onClick={handleLogin}
              variant="primary"
              className="w-full py-3 text-lg"
            >
              Войти
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Тестовые аккаунты:</p>
            <div className="text-xs space-y-1">
              <p>admin/admin123 (Администратор)</p>
              <p>fazliddin/123 (Кассир - Хостел 2)</p>
              <p>manager1/123 (Менеджер)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main app
  const filteredHostels = selectedHostelFilter
    ? HOSTELS.filter(h => h.id === selectedHostelFilter)
    : HOSTELS;
  
  const filteredGuests = guests.filter(g =>
    !selectedHostelFilter || g.hostelId === selectedHostelFilter
  );
  
  const selectedHostel = HOSTELS.find(h => h.id === checkInModal.hostelId);
  const detailsGuest = guestDetailsModal.guest;
  const detailsHostel = detailsGuest ? HOSTELS.find(h => h.id === detailsGuest.hostelId) : null;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navigation
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
        selectedHostelFilter={selectedHostelFilter}
        setSelectedHostelFilter={setSelectedHostelFilter}
        hostels={HOSTELS}
        lang={lang}
        t={t}
      />
      
      <main className="flex-1 p-8 overflow-auto">
        {activeView === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
            <DashboardStats 
              guests={guests} 
              hostels={HOSTELS} 
              selectedHostelFilter={selectedHostelFilter}
            />
            <ChartsSection 
              guests={guests} 
              selectedHostelFilter={selectedHostelFilter}
            />
            
            {filteredHostels.map(hostel => (
              <RoomCardChess
                key={hostel.id}
                hostel={hostel}
                guests={filteredGuests}
                onBedClick={handleBedClick}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
        
        {activeView === 'calendar' && (
          <CalendarView
            guests={filteredGuests}
            hostels={HOSTELS}
            selectedHostelFilter={selectedHostelFilter}
            onGuestClick={handleGuestClick}
          />
        )}
        
        {activeView === 'staff' && (
          <StaffView currentUser={currentUser} />
        )}
        
        {activeView === 'clients' && (
          <ClientsView guests={guests} />
        )}
        
        {activeView === 'tasks' && (
          <TaskManager
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            currentUser={currentUser}
          />
        )}
        
        {activeView === 'debts' && (
          <DebtsView guests={guests} />
        )}
        
        {activeView === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Отчёты</h1>
              {canEdit && (
                <Button 
                  onClick={() => setAddExpenseModal(true)} 
                  variant="danger"
                >
                  + Добавить расход
                </Button>
              )}
            </div>
            <ReportsView
              guests={guests}
              expenses={expenses}
              selectedHostelFilter={selectedHostelFilter}
              hostels={HOSTELS}
            />
          </div>
        )}
        
        {activeView === 'shifts' && (
          <ShiftsView currentUser={currentUser} />
        )}
      </main>
      
      {/* Modals */}
      <CheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => setCheckInModal({ isOpen: false, hostelId: null, roomNumber: null, bedId: null })}
        hostelId={checkInModal.hostelId}
        roomNumber={checkInModal.roomNumber}
        bedId={checkInModal.bedId}
        onCheckIn={handleCheckIn}
        hostel={selectedHostel}
      />
      
      <GuestDetailsModal
        isOpen={guestDetailsModal.isOpen}
        onClose={() => setGuestDetailsModal({ isOpen: false, guest: null })}
        guest={detailsGuest}
        onCheckOut={handleCheckOut}
        onAddPayment={handleAddPayment}
        hostel={detailsHostel}
      />
      
      <MoveGuestModal
        isOpen={moveGuestModal.isOpen}
        onClose={() => setMoveGuestModal({ isOpen: false, guest: null })}
        guest={moveGuestModal.guest}
        hostels={HOSTELS}
        onMove={handleMoveGuest}
      />
      
      <AddExpenseModal
        isOpen={addExpenseModal}
        onClose={() => setAddExpenseModal(false)}
        onAddExpense={handleAddExpense}
        currentUser={currentUser}
        selectedHostelFilter={selectedHostelFilter}
        hostels={HOSTELS}
      />
    </div>
  );
}

export default App;

// ============================================
// End of Part 5/5 - Ready to use!
// ============================================
