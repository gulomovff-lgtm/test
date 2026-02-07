// ============================================
// App.jsx - Part 1/5
// Copy all parts sequentially into one file
// ============================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  User,
  Users,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Printer,
  Eye,
  EyeOff,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Briefcase,
  FileText,
  Clock,
  Menu,
  Phone,
  Mail,
  MapPin,
  Building
} from 'lucide-react';

// ============================================
// Styles
// ============================================

const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

// ============================================
// Translations
// ============================================

const TRANSLATIONS = {
  ru: {
    dashboard: 'Панель управления',
    rooms: 'Комнаты',
    calendar: 'Календарь',
    guests: 'Гости',
    clients: 'Клиенты',
    staff: 'Персонал',
    reports: 'Отчеты',
    debts: 'Долги',
    tasks: 'Задачи',
    shifts: 'Смены',
    settings: 'Настройки',
    logout: 'Выход'
  },
  uz: {
    dashboard: 'Boshqaruv paneli',
    rooms: 'Xonalar',
    calendar: 'Kalendar',
    guests: 'Mehmonlar',
    clients: 'Mijozlar',
    staff: 'Xodimlar',
    reports: "Hisobotlar",
    debts: 'Qarzlar',
    tasks: 'Vazifalar',
    shifts: 'Smenalar',
    settings: 'Sozlamalar',
    logout: 'Chiqish'
  }
};

// ============================================
// Telegram Configuration
// ============================================

const TG_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

const sendTelegramMessage = async (message) => {
  const chatId = 'YOUR_CHAT_ID';
  const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('Telegram send error:', error);
  }
};

// ============================================
// Firebase Configuration
// ============================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// ============================================
// Constants
// ============================================

const APP_ID = 'hostel-management-v1';
const PUBLIC_DATA_PATH = '/public-data';
const DAILY_SALARY = 150000;

const DEFAULT_USERS = [
  { login: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { login: 'fazliddin', password: 'fazl2024', role: 'manager', name: 'Fazliddin' },
  { login: 'staff1', password: 'staff123', role: 'staff', name: 'Staff Member' }
];

const COUNTRY_MAP = {
  'РФ': 'Россия',
  'РУЗ': 'Узбекистан',
  'UZB': 'Узбекистан',
  'RUS': 'Россия',
  'KAZ': 'Казахстан',
  'KGZ': 'Кыргызстан',
  'TJK': 'Таджикистан',
  'TKM': 'Туркменистан'
};

const COUNTRIES = [
  'Россия',
  'Узбекистан',
  'Казахстан',
  'Кыргызстан',
  'Таджикистан',
  'Туркменистан',
  'Украина',
  'Беларусь',
  'Азербайджан',
  'Армения',
  'Грузия',
  'Молдова',
  'Другая'
];

const HOSTELS = [
  {
    id: 'hostel1',
    name: 'Хостел 1',
    address: 'ул. Пушкина, д. 10',
    phone: '+7 (999) 123-45-67',
    email: 'hostel1@example.com'
  },
  {
    id: 'hostel2',
    name: 'Хостел 2',
    address: 'пр. Ленина, д. 25',
    phone: '+7 (999) 765-43-21',
    email: 'hostel2@example.com'
  }
];

// ============================================
// Utility Functions
// ============================================

const getTotalPaid = (guest) => {
  if (!guest.payments || !Array.isArray(guest.payments)) return 0;
  return guest.payments.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);
};

const pluralize = (count, one, few, many) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
};

const getLocalDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU');
};

const getLocalDatetimeString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('ru-RU');
};

const getStayDetails = (guest) => {
  if (!guest) return { daysStayed: 0, daysRemaining: 0 };
  
  const checkIn = new Date(guest.checkInDate || guest.checkInDateTime || guest.checkIn);
  const now = new Date();
  const totalDays = parseInt(guest.days) || 0;
  
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysStayed = Math.floor((now - checkIn) / msPerDay);
  const daysRemaining = Math.max(0, totalDays - daysStayed);
  
  return { daysStayed, daysRemaining };
};

const checkCollision = (guests, roomNumber, bedId, guestId = null) => {
  return guests.some(g => 
    g.roomNumber === roomNumber && 
    g.bedId === bedId && 
    g.status === 'checked_in' && 
    g.id !== guestId
  );
};

const calculateSalary = (staff, shifts) => {
  const staffShifts = shifts.filter(s => s.staffId === staff.id && s.status === 'closed');
  const totalHours = staffShifts.reduce((sum, s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return sum + (end - start) / (1000 * 60 * 60);
  }, 0);
  
  const dailySalary = staff.salary || DAILY_SALARY;
  const hourlyRate = dailySalary / 24;
  
  return Math.round(totalHours * hourlyRate);
};

const getNormalizedCountry = (countryCode) => {
  return COUNTRY_MAP[countryCode] || countryCode;
};

// ============================================
// FIXED: Export to Excel Function
// ============================================

const exportToExcel = (data, filename, totalIncome = 0, totalExpense = 0) => {
  const balance = totalIncome - totalExpense;
  
  let tableContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:x="urn:schemas-microsoft-com:office:excel" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000000; padding: 8px; text-align: left; }
        th { background-color: #4f46e5; color: #ffffff; }
      </style>
    </head>
    <body>
      <table>
        <thead><tr>
          <th>Дата</th><th>Тип</th><th>Хостел</th>
          <th>Кассир</th><th>Сумма</th><th>Метод</th>
        </tr></thead>
        <tbody>
  `;

  data.forEach(row => {
    tableContent += `<tr>
      <td>${row.date}</td>
      <td>${row.type === 'income' ? 'Приход' : 'Расход'}</td>
      <td>${row.hostel}</td>
      <td>${row.staff}</td>
      <td>${parseInt(row.amount).toLocaleString()}</td>
      <td>${row.method}</td>
    </tr>`;
  });

  tableContent += `
    <tr style="font-weight: bold;">
      <td colspan="4">ИТОГО ПРИХОД:</td>
      <td>${totalIncome.toLocaleString()}</td>
      <td></td>
    </tr>
    <tr style="font-weight: bold;">
      <td colspan="4">ИТОГО РАСХОД:</td>
      <td>${totalExpense.toLocaleString()}</td>
      <td></td>
    </tr>
    <tr style="font-weight: bold; background: #e0e7ff;">
      <td colspan="4">БАЛАНС:</td>
      <td>${balance.toLocaleString()}</td>
      <td></td>
    </tr>
  </tbody></table></body></html>`;

  const blob = new Blob([tableContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8' 
  });
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================================
// FIXED: Print Document Function
// ============================================

const printDocument = (type, guest, hostel) => {
  const w = window.open('', '', 'width=800,height=600');
  const dateStr = new Date().toLocaleDateString('ru-RU');
  
  let html = `
  <html>
  <head>
    <title>${type}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .header { text-align: center; margin-bottom: 30px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${hostel.name}</h1>
      <p>${hostel.address}</p>
      <p>Дата: ${dateStr}</p>
    </div>
  `;
  
  if (type === 'check') {
    html += `
      <h2>ЧЕК №${guest.id}</h2>
      <table>
        <tr><td><strong>Гость:</strong></td><td>${guest.fullName}</td></tr>
        <tr><td><strong>Паспорт:</strong></td><td>${guest.passport}</td></tr>
        <tr><td><strong>Комната:</strong></td><td>${guest.roomNumber}</td></tr>
        <tr><td><strong>Место:</strong></td><td>${guest.bedId}</td></tr>
        <tr><td><strong>Дней:</strong></td><td>${guest.days}</td></tr>
        <tr><td><strong>Цена за ночь:</strong></td><td>${guest.pricePerNight}</td></tr>
        <tr><td><strong>Итого:</strong></td><td><strong>${guest.totalPrice}</strong></td></tr>
        <tr><td><strong>Оплачено:</strong></td><td><strong>${getTotalPaid(guest)}</strong></td></tr>
      </table>
    `;
  } else if (type === 'regcard') {
    html += `
      <h2>РЕГИСТРАЦИОННАЯ АНКЕТА</h2>
      <table>
        <tr><td><strong>ФИО:</strong></td><td>${guest.fullName}</td></tr>
        <tr><td><strong>Паспорт:</strong></td><td>${guest.passport}</td></tr>
        <tr><td><strong>Дата рождения:</strong></td><td>${guest.birthDate || '-'}</td></tr>
        <tr><td><strong>Страна:</strong></td><td>${guest.country}</td></tr>
        <tr><td><strong>Дата заселения:</strong></td><td>${new Date(guest.checkInDate).toLocaleDateString()}</td></tr>
        <tr><td><strong>Комната:</strong></td><td>${guest.roomNumber}, место ${guest.bedId}</td></tr>
      </table>
    `;
  } else if (type === 'ref') {
    html += `
      <h2>СПРАВКА О ПРОЖИВАНИИ</h2>
      <p>Настоящая справка выдана ${guest.fullName}, паспорт ${guest.passport}, 
      в том, что он(а) проживал(а) в ${hostel.name} 
      с ${new Date(guest.checkInDate).toLocaleDateString()} 
      по ${new Date(guest.checkOutDate || Date.now()).toLocaleDateString()}.</p>
      <p style="margin-top: 50px;">Подпись: _________________</p>
    `;
  }
  
  html += '</body></html>';
  
  w.document.write(html);
  w.document.close();
  w.print();
};

// ============================================
// FIXED: Print Debts Function
// ============================================

const printDebts = (debts, hostel) => {
  const w = window.open('', '', 'width=800,height=600');
  const dateStr = new Date().toLocaleDateString('ru-RU');
  
  let html = `
  <html>
  <head>
    <title>Список должников</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .header { text-align: center; margin-bottom: 30px; }
      .total { font-weight: bold; background-color: #ffe0e0; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${hostel.name}</h1>
      <h2>СПИСОК ДОЛЖНИКОВ</h2>
      <p>Дата: ${dateStr}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>ФИО</th>
          <th>Паспорт</th>
          <th>Телефон</th>
          <th>Сумма долга</th>
          <th>Дата</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  let totalDebt = 0;
  debts.forEach((debt, index) => {
    totalDebt += parseInt(debt.amount) || 0;
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${debt.clientName}</td>
        <td>${debt.passport || '-'}</td>
        <td>${debt.phone || '-'}</td>
        <td>${parseInt(debt.amount).toLocaleString()} ₽</td>
        <td>${getLocalDateString(debt.date)}</td>
      </tr>
    `;
  });
  
  html += `
      <tr class="total">
        <td colspan="4">ИТОГО ДОЛГОВ:</td>
        <td>${totalDebt.toLocaleString()} ₽</td>
        <td></td>
      </tr>
    </tbody></table>
  </body></html>`;
  
  w.document.write(html);
  w.document.close();
  w.print();
};

// ============================================
// FIXED: Print Report Function
// ============================================

const printReport = (data, hostel, period, totalIncome, totalExpense) => {
  const w = window.open('', '', 'width=800,height=600');
  const dateStr = new Date().toLocaleDateString('ru-RU');
  const balance = totalIncome - totalExpense;
  
  let html = `
  <html>
  <head>
    <title>Финансовый отчет</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      th { background-color: #4f46e5; color: white; }
      .header { text-align: center; margin-bottom: 30px; }
      .summary { background-color: #f0f0f0; font-weight: bold; }
      .income { background-color: #d4edda; }
      .expense { background-color: #f8d7da; }
      .balance { background-color: #cfe2ff; font-size: 1.1em; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${hostel.name}</h1>
      <h2>ФИНАНСОВЫЙ ОТЧЕТ</h2>
      <p>Период: ${period}</p>
      <p>Дата формирования: ${dateStr}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Тип</th>
          <th>Кассир</th>
          <th>Сумма</th>
          <th>Метод</th>
          <th>Описание</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  data.forEach(row => {
    const rowClass = row.type === 'income' ? 'income' : 'expense';
    html += `
      <tr class="${rowClass}">
        <td>${row.date}</td>
        <td>${row.type === 'income' ? 'Приход' : 'Расход'}</td>
        <td>${row.staff}</td>
        <td>${parseInt(row.amount).toLocaleString()} ₽</td>
        <td>${row.method}</td>
        <td>${row.description || '-'}</td>
      </tr>
    `;
  });
  
  html += `
      <tr class="summary">
        <td colspan="3">ИТОГО ПРИХОД:</td>
        <td>${totalIncome.toLocaleString()} ₽</td>
        <td colspan="2"></td>
      </tr>
      <tr class="summary">
        <td colspan="3">ИТОГО РАСХОД:</td>
        <td>${totalExpense.toLocaleString()} ₽</td>
        <td colspan="2"></td>
      </tr>
      <tr class="balance">
        <td colspan="3">БАЛАНС:</td>
        <td>${balance.toLocaleString()} ₽</td>
        <td colspan="2"></td>
      </tr>
    </tbody></table>
  </body></html>`;
  
  w.document.write(html);
  w.document.close();
  w.print();
};

// ============================================
// End of Part 1/5
// Continue with Part 2/5
// ============================================
// ============================================
// App.jsx - Part 2/5
// UI Components
// ============================================

// Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

// Button Component
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  className = '',
  type = 'button'
}) => {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// NavItem Component
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-100 text-indigo-700' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

// Notification Component
const Notification = ({ message, type, onClose }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };
  
  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-75">
        <X size={20} />
      </button>
    </div>
  );
};

// Mobile Navigation Component
const MobileNavigation = ({ activeTab, setActiveTab, language }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: TRANSLATIONS[language].dashboard },
    { id: 'rooms', icon: Building, label: TRANSLATIONS[language].rooms },
    { id: 'calendar', icon: Calendar, label: TRANSLATIONS[language].calendar },
    { id: 'clients', icon: Users, label: TRANSLATIONS[language].clients },
    { id: 'reports', icon: FileText, label: TRANSLATIONS[language].reports }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-gray-600'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ activeTab, setActiveTab, onLogout, currentUser, language }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: TRANSLATIONS[language].dashboard },
    { id: 'rooms', icon: Building, label: TRANSLATIONS[language].rooms },
    { id: 'calendar', icon: Calendar, label: TRANSLATIONS[language].calendar },
    { id: 'guests', icon: User, label: TRANSLATIONS[language].guests },
    { id: 'clients', icon: Users, label: TRANSLATIONS[language].clients },
    { id: 'staff', icon: Briefcase, label: TRANSLATIONS[language].staff },
    { id: 'reports', icon: FileText, label: TRANSLATIONS[language].reports },
    { id: 'debts', icon: DollarSign, label: TRANSLATIONS[language].debts },
    { id: 'tasks', icon: Clock, label: TRANSLATIONS[language].tasks },
    { id: 'shifts', icon: Clock, label: TRANSLATIONS[language].shifts }
  ];
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-600">Hostel CRM</h1>
        <p className="text-sm text-gray-600">{currentUser?.name}</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
        
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
        >
          <LogOut size={20} />
          <span>{TRANSLATIONS[language].logout}</span>
        </button>
      </nav>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(login, password);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">Hostel CRM</h1>
          <p className="text-gray-600">Войдите в систему</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Логин</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className={inputClass}
              placeholder="Введите логин"
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Введите пароль"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>
      </Card>
    </div>
  );
};

// Dashboard Stats Component
const DashboardStats = ({ guests, rooms, debts, income }) => {
  const activeGuests = guests.filter(g => g.status === 'checked_in').length;
  const occupiedBeds = guests.filter(g => g.status === 'checked_in').length;
  const totalBeds = rooms.reduce((sum, r) => sum + (r.beds || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const totalDebt = debts.reduce((sum, d) => sum + parseInt(d.amount || 0), 0);
  
  const stats = [
    { label: 'Активные гости', value: activeGuests, icon: User, color: 'text-blue-600' },
    { label: 'Заполненность', value: `${occupancyRate}%`, icon: Building, color: 'text-green-600' },
    { label: 'Долги', value: `${totalDebt.toLocaleString()} ₽`, icon: DollarSign, color: 'text-red-600' },
    { label: 'Доход за месяц', value: `${income.toLocaleString()} ₽`, icon: DollarSign, color: 'text-indigo-600' }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <stat.icon className={`${stat.color}`} size={32} />
          </div>
        </Card>
      ))}
    </div>
  );
};

// Charts Section Component
const ChartsSection = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Заполненность за неделю</h3>
        <div className="h-64 flex items-end justify-around gap-2">
          {data.weekOccupancy?.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-indigo-500 rounded-t"
                style={{ height: `${day.percentage}%` }}
              />
              <span className="text-xs mt-2">{day.label}</span>
            </div>
          ))}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Доходы и расходы</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Доходы</span>
              <span className="font-semibold text-green-600">
                {data.income?.toLocaleString()} ₽
              </span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: '75%' }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Расходы</span>
              <span className="font-semibold text-red-600">
                {data.expense?.toLocaleString()} ₽
              </span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: '45%' }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft('Время истекло');
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${days}д ${hours}ч ${minutes}м`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  return <span className="text-sm text-gray-600">{timeLeft}</span>;
};

// FIXED: RoomCardChess Component with corrected guest display logic
const RoomCardChess = ({ room, guests, onBedClick }) => {
  const roomGuests = guests.filter(g => 
    g.roomNumber === room.number && g.status === 'checked_in'
  );
  
  const beds = [];
  for (let i = 1; i <= (room.beds || 4); i++) {
    const guest = roomGuests.find(g => g.bedId === i.toString());
    beds.push({ id: i, guest });
  }
  
  const occupiedCount = roomGuests.length;
  const totalBeds = room.beds || 4;
  const occupancyPercent = Math.round((occupiedCount / totalBeds) * 100);
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Комната {room.number}</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          occupancyPercent === 100 ? 'bg-red-100 text-red-700' :
          occupancyPercent > 50 ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {occupiedCount}/{totalBeds}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {beds.map(bed => (
          <button
            key={bed.id}
            onClick={() => onBedClick(room.number, bed.id, bed.guest)}
            className={`p-3 rounded-lg border-2 transition-colors ${
              bed.guest
                ? 'border-red-500 bg-red-50 hover:bg-red-100'
                : 'border-green-500 bg-green-50 hover:bg-green-100'
            }`}
          >
            <div className="text-sm font-medium mb-1">Место {bed.id}</div>
            {bed.guest ? (
              <div className="text-xs">
                <div className="font-semibold truncate">{bed.guest.fullName}</div>
                <div className="text-gray-600">{bed.guest.passport}</div>
                <CountdownTimer targetDate={
                  new Date(new Date(bed.guest.checkInDate).getTime() + 
                    parseInt(bed.guest.days) * 24 * 60 * 60 * 1000)
                } />
              </div>
            ) : (
              <div className="text-xs text-gray-500">Свободно</div>
            )}
          </button>
        ))}
      </div>
      
      {room.description && (
        <p className="text-sm text-gray-600 mt-3">{room.description}</p>
      )}
    </Card>
  );
};

// ============================================
// End of Part 2/5
// Continue with Part 3/5
// ============================================
// ============================================
// App.jsx - Part 3/5
// Modal Components
// ============================================

// Change Password Modal Component
const ChangePasswordModal = ({ user, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    onSubmit({ oldPassword, newPassword });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Смена пароля</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Старый пароль</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Подтверждение пароля</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Create Debt Modal Component
const CreateDebtModal = ({ onClose, onSubmit, clients }) => {
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    onSubmit({
      clientId,
      clientName: client?.fullName || '',
      amount: parseInt(amount),
      description,
      dueDate,
      status: 'unpaid',
      createdAt: new Date().toISOString()
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Создать долг</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Клиент</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Выберите клиента</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.fullName} - {client.passport}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Сумма долга</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              rows="3"
            />
          </div>
          
          <div>
            <label className={labelClass}>Срок погашения</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Создать</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Client Import Modal Component
const ClientImportModal = ({ onClose, onImport }) => {
  const [jsonData, setJsonData] = useState('');
  
  const handleImport = () => {
    try {
      const data = JSON.parse(jsonData);
      onImport(data);
      onClose();
    } catch (error) {
      alert('Ошибка парсинга JSON: ' + error.message);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Импорт клиентов</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={labelClass}>JSON данные</label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className={inputClass}
              rows="10"
              placeholder='[{"fullName":"Иван Иванов","passport":"1234567890",...}]'
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleImport} className="flex-1">Импортировать</Button>
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Client Edit Modal Component
const ClientEditModal = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: client?.fullName || '',
    passport: client?.passport || '',
    phone: client?.phone || '',
    email: client?.email || '',
    country: client?.country || '',
    birthDate: client?.birthDate || '',
    notes: client?.notes || ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...client, ...formData });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Редактировать клиента</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>ФИО</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Паспорт</label>
            <input
              type="text"
              value={formData.passport}
              onChange={(e) => setFormData({...formData, passport: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Страна</label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className={inputClass}
            >
              <option value="">Выберите страну</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Дата рождения</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Примечания</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className={inputClass}
              rows="3"
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Check-In Modal Component (with AI passport scanning)
const CheckInModal = ({ onClose, onSubmit, rooms, clients }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    phone: '',
    country: '',
    roomNumber: '',
    bedId: '',
    days: '1',
    pricePerNight: '',
    paymentMethod: 'cash',
    initialPayment: '0'
  });
  const [scanning, setScanning] = useState(false);
  
  const handleScan = async (file) => {
    setScanning(true);
    // Simulated AI scanning - in production, call actual AI service
    setTimeout(() => {
      setFormData({
        ...formData,
        fullName: 'Иванов Иван Иванович',
        passport: '1234 567890',
        country: 'Россия'
      });
      setScanning(false);
    }, 2000);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const totalPrice = parseInt(formData.days) * parseInt(formData.pricePerNight);
    onSubmit({
      ...formData,
      totalPrice,
      checkInDate: new Date().toISOString(),
      status: 'checked_in'
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Заселение гостя</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">
              Сканировать паспорт (AI)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleScan(e.target.files[0])}
              className="w-full"
              disabled={scanning}
            />
            {scanning && <p className="text-sm text-blue-600 mt-2">Сканирование...</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ФИО *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Паспорт *</label>
              <input
                type="text"
                value={formData.passport}
                onChange={(e) => setFormData({...formData, passport: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Страна *</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className={inputClass}
                required
              >
                <option value="">Выберите страну</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Комната *</label>
              <select
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                className={inputClass}
                required
              >
                <option value="">Выберите комнату</option>
                {rooms.map(r => (
                  <option key={r.number} value={r.number}>Комната {r.number}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Место *</label>
              <input
                type="number"
                value={formData.bedId}
                onChange={(e) => setFormData({...formData, bedId: e.target.value})}
                className={inputClass}
                min="1"
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Количество дней *</label>
              <input
                type="number"
                value={formData.days}
                onChange={(e) => setFormData({...formData, days: e.target.value})}
                className={inputClass}
                min="1"
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Цена за ночь *</label>
              <input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Начальный платеж</label>
              <input
                type="number"
                value={formData.initialPayment}
                onChange={(e) => setFormData({...formData, initialPayment: e.target.value})}
                className={inputClass}
                min="0"
              />
            </div>
            
            <div>
              <label className={labelClass}>Способ оплаты</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className={inputClass}
              >
                <option value="cash">Наличные</option>
                <option value="card">Карта</option>
                <option value="transfer">Перевод</option>
              </select>
            </div>
          </div>
          
          {formData.days && formData.pricePerNight && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-lg font-semibold">
                Итого: {parseInt(formData.days) * parseInt(formData.pricePerNight)} ₽
              </p>
              <p className="text-sm text-gray-600">
                К оплате: {parseInt(formData.days) * parseInt(formData.pricePerNight) - parseInt(formData.initialPayment)} ₽
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Заселить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// FIXED: Guest Details Modal with corrected checkout logic
const GuestDetailsModal = ({ guest, onClose, onCheckOut, onPayment, onExtend }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [checkoutManualRefund, setCheckoutManualRefund] = useState('');
  
  const totalPaid = getTotalPaid(guest);
  const actualCost = parseInt(guest.totalPrice) || 0;
  const balance = totalPaid - actualCost;
  const { daysStayed, daysRemaining } = getStayDetails(guest);
  
  const handlePayment = () => {
    if (!paymentAmount || parseInt(paymentAmount) <= 0) {
      alert('Введите корректную сумму');
      return;
    }
    onPayment(guest, {
      amount: parseInt(paymentAmount),
      method: paymentMethod,
      date: new Date().toISOString()
    });
    setShowPayment(false);
    setPaymentAmount('');
  };
  
  // FIXED: Checkout logic - removed balance check blocking
  const handleDoCheckout = () => {
    // OLD BLOCKING CODE REMOVED:
    // if (balance < 0) return notify(`Ошибка! Долг...`, 'error');
    
    // NEW LOGIC: Allow checkout with debt, calculate refund properly
    const refund = checkoutManualRefund ? parseInt(checkoutManualRefund) : Math.max(0, balance);
    
    const finalData = {
      totalPrice: actualCost,
      refundAmount: refund,
      checkOutDate: new Date().toISOString()
    };
    
    onCheckOut(guest, finalData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Детали гостя</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ФИО</p>
              <p className="font-semibold">{guest.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Паспорт</p>
              <p className="font-semibold">{guest.passport}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Комната / Место</p>
              <p className="font-semibold">{guest.roomNumber} / {guest.bedId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Страна</p>
              <p className="font-semibold">{guest.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Дата заселения</p>
              <p className="font-semibold">{getLocalDateString(guest.checkInDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Прожито / Осталось</p>
              <p className="font-semibold">{daysStayed} / {daysRemaining} дней</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Финансы</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Стоимость проживания:</span>
                <span className="font-semibold">{actualCost.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Оплачено:</span>
                <span className="font-semibold text-green-600">{totalPaid.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Баланс:</span>
                <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance >= 0 ? '+' : ''}{balance.toLocaleString()} ₽
                </span>
              </div>
            </div>
          </div>
          
          {guest.payments && guest.payments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">История платежей</h3>
              <div className="space-y-2">
                {guest.payments.map((payment, index) => (
                  <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{getLocalDatetimeString(payment.date)}</span>
                    <span>{payment.method}</span>
                    <span className="font-semibold">{parseInt(payment.amount).toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showPayment ? (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Принять оплату</h3>
              <div>
                <label className={labelClass}>Сумма</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={inputClass}
                  placeholder="Введите сумму"
                />
              </div>
              <div>
                <label className={labelClass}>Способ оплаты</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={inputClass}
                >
                  <option value="cash">Наличные</option>
                  <option value="card">Карта</option>
                  <option value="transfer">Перевод</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePayment} className="flex-1">Принять</Button>
                <Button variant="secondary" onClick={() => setShowPayment(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setShowPayment(true)} variant="success">
                Принять оплату
              </Button>
              <Button onClick={() => onExtend(guest)} variant="secondary">
                Продлить
              </Button>
              <Button onClick={handleDoCheckout} variant="danger">
                Выселить
              </Button>
            </div>
          )}
          
          {balance > 0 && (
            <div className="bg-yellow-50 p-3 rounded">
              <label className="block text-sm font-medium mb-2">
                Сумма возврата (по умолчанию {Math.max(0, balance)} ₽)
              </label>
              <input
                type="number"
                value={checkoutManualRefund}
                onChange={(e) => setCheckoutManualRefund(e.target.value)}
                className={inputClass}
                placeholder={Math.max(0, balance).toString()}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Move Guest Modal Component
const MoveGuestModal = ({ guest, rooms, onClose, onMove }) => {
  const [newRoom, setNewRoom] = useState('');
  const [newBed, setNewBed] = useState('');
  
  const handleMove = () => {
    if (!newRoom || !newBed) {
      alert('Выберите комнату и место');
      return;
    }
    onMove(guest, newRoom, newBed);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Переместить гостя</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Текущее размещение</p>
            <p className="font-semibold">Комната {guest.roomNumber}, место {guest.bedId}</p>
          </div>
          
          <div>
            <label className={labelClass}>Новая комната</label>
            <select
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className={inputClass}
            >
              <option value="">Выберите комнату</option>
              {rooms.map(r => (
                <option key={r.number} value={r.number}>Комната {r.number}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Новое место</label>
            <input
              type="number"
              value={newBed}
              onChange={(e) => setNewBed(e.target.value)}
              className={inputClass}
              min="1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleMove} className="flex-1">Переместить</Button>
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Expense Modal Component
const ExpenseModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'utilities',
    date: new Date().toISOString().split('T')[0]
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Добавить расход</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Описание</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Сумма</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={inputClass}
            >
              <option value="utilities">Коммунальные услуги</option>
              <option value="supplies">Хозяйственные товары</option>
              <option value="maintenance">Ремонт</option>
              <option value="salary">Зарплата</option>
              <option value="other">Другое</option>
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Дата</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Добавить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Room Form Modal Component
const RoomFormModal = ({ room, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    number: room?.number || '',
    beds: room?.beds || 4,
    description: room?.description || '',
    pricePerNight: room?.pricePerNight || ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {room ? 'Редактировать комнату' : 'Добавить комнату'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Номер комнаты</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Количество мест</label>
            <input
              type="number"
              value={formData.beds}
              onChange={(e) => setFormData({...formData, beds: parseInt(e.target.value)})}
              className={inputClass}
              min="1"
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Цена за ночь</label>
            <input
              type="number"
              value={formData.pricePerNight}
              onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={inputClass}
              rows="3"
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Shift Closing Modal Component
const ShiftClosingModal = ({ shift, onClose, onClose: onCloseShift }) => {
  const [cashCount, setCashCount] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleClose = () => {
    onCloseShift({
      ...shift,
      cashCount: parseInt(cashCount),
      notes,
      endTime: new Date().toISOString(),
      status: 'closed'
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Закрытие смены</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Смена начата</p>
            <p className="font-semibold">{getLocalDatetimeString(shift.startTime)}</p>
          </div>
          
          <div>
            <label className={labelClass}>Наличные в кассе</label>
            <input
              type="number"
              value={cashCount}
              onChange={(e) => setCashCount(e.target.value)}
              className={inputClass}
              placeholder="Подсчитайте и введите сумму"
            />
          </div>
          
          <div>
            <label className={labelClass}>Примечания</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              rows="3"
              placeholder="Особые замечания по смене..."
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleClose} className="flex-1">Закрыть смену</Button>
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Shift Block Screen Component
const ShiftBlockScreen = ({ message, onOpenShift }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md text-center">
        <AlertCircle className="mx-auto text-yellow-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-4">Смена не открыта</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button onClick={onOpenShift} className="w-full">
          Открыть смену
        </Button>
      </Card>
    </div>
  );
};

// ============================================
// End of Part 3/5
// Continue with Part 4/5
// ============================================
// ============================================
// App.jsx - Part 4/5
// View Components (Pages)
// ============================================

// FIXED: Calendar View with corrected checked-out guest display and color gradient
const CalendarView = ({ guests, rooms, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'week' or 'month'
  
  // Generate days for display
  const days = useMemo(() => {
    const result = [];
    const start = new Date(currentDate);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    
    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(start);
      day.setDate(i + 1);
      result.push({
        date: day,
        str: day.toISOString().split('T')[0],
        dayNum: i + 1
      });
    }
    
    return result;
  }, [currentDate]);
  
  // FIXED: Get guest block style with proper checkout date handling
  const getGuestBlockStyle = (guest) => {
    let checkInDate = new Date(guest.checkInDate || guest.checkInDateTime || guest.checkIn);
    checkInDate.setHours(12, 0, 0, 0);

    // FIXED: For checked-out guests, use actual checkOutDate from database
    let checkOutDate;
    if (guest.status === 'checked_out' && guest.checkOutDate) {
      checkOutDate = new Date(guest.checkOutDate);
      checkOutDate.setHours(12, 0, 0, 0);
    } else {
      // For active guests, calculate expected checkout
      const guestDurationMs = parseInt(guest.days) * 24 * 60 * 60 * 1000;
      checkOutDate = new Date(checkInDate.getTime() + guestDurationMs);
      checkOutDate.setHours(12, 0, 0, 0);
    }

    const calendarStart = new Date(days[0].str);
    calendarStart.setHours(0, 0, 0, 0);
    
    const calendarEnd = new Date(days[days.length - 1].str);
    calendarEnd.setHours(23, 59, 59, 999);

    // Don't show if completely outside calendar range
    if (checkOutDate < calendarStart || checkInDate > calendarEnd) return null;

    // Calculate visible portion
    const visibleStart = checkInDate < calendarStart ? calendarStart : checkInDate;
    const visibleEnd = checkOutDate > calendarEnd ? calendarEnd : checkOutDate;
    
    const totalDays = days.length;
    const startDay = Math.floor((visibleStart - calendarStart) / (24 * 60 * 60 * 1000));
    const endDay = Math.floor((visibleEnd - calendarStart) / (24 * 60 * 60 * 1000));
    
    const leftPercent = (startDay / totalDays) * 100;
    const widthPercent = ((endDay - startDay + 1) / totalDays) * 100;
    
    return {
      leftPercent,
      widthPercent,
      visibleStart,
      visibleEnd
    };
  };
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Календарь загруженности</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={goToPrevMonth}>
            <ChevronLeft size={20} />
          </Button>
          <span className="px-4 py-2 font-semibold">
            {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="secondary" onClick={goToNextMonth}>
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
      
      <Card>
        {/* Calendar header with dates */}
        <div className="flex border-b pb-2 mb-4">
          {days.map((day, i) => (
            <div key={i} className="flex-1 text-center text-xs">
              <div className="font-semibold">{day.dayNum}</div>
              <div className="text-gray-500">
                {day.date.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Rooms with guest bars */}
        <div className="space-y-3">
          {rooms.map(room => {
            const roomGuests = guests.filter(g => 
              g.roomNumber === room.number && 
              (g.status === 'checked_in' || g.status === 'checked_out')
            );
            
            return (
              <div key={room.number} className="relative">
                <div className="flex items-center mb-2">
                  <span className="w-24 font-semibold text-sm">
                    Комната {room.number}
                  </span>
                  <div className="flex-1 h-12 bg-gray-100 rounded relative">
                    {roomGuests.map((guest, gi) => {
                      const styleData = getGuestBlockStyle(guest);
                      if (!styleData) return null;
                      
                      // FIXED: Color gradient based on payment ratio
                      const totalPaid = getTotalPaid(guest);
                      const paidRatio = Math.min(1, totalPaid / (guest.totalPrice || 1));
                      
                      return (
                        <div
                          key={gi}
                          className="absolute h-10 top-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            left: `${styleData.leftPercent}%`,
                            width: `${styleData.widthPercent}%`,
                            background: `linear-gradient(to right, 
                              #10b981 0%, 
                              #10b981 ${paidRatio * 100}%, 
                              #ef4444 ${paidRatio * 100}%, 
                              #ef4444 100%)`,
                            zIndex: 10 + gi
                          }}
                          title={`${guest.fullName} - Место ${guest.bedId}`}
                          onClick={() => onDayClick && onDayClick(guest)}
                        >
                          <div className="px-2 py-1 text-white text-xs truncate">
                            <div className="font-semibold">{guest.fullName}</div>
                            <div className="text-[10px]">
                              Место {guest.bedId} • {totalPaid}/{guest.totalPrice} ₽
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Полностью оплачено</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Не оплачено</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded" style={{
              background: 'linear-gradient(to right, #10b981 0%, #10b981 50%, #ef4444 50%, #ef4444 100%)'
            }}></div>
            <span>Частично оплачено</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Staff View Component
const StaffView = ({ staff, onAdd, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const filteredStaff = staff.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Персонал</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} className="mr-2" />
          Добавить сотрудника
        </Button>
      </div>
      
      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по имени или должности..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Имя</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Должность</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Телефон</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Зарплата</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3">{member.role}</td>
                  <td className="px-4 py-3">{member.phone}</td>
                  <td className="px-4 py-3">{member.salary?.toLocaleString()} ₽</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(member)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(member.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// FIXED: Clients View with pagination and country filters
const ClientsView = ({ clients, onAdd, onEdit, onDelete, onViewHistory }) => {
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, perPage: 25 });
  const [countryFilter, setCountryFilter] = useState('');
  const [showImport, setShowImport] = useState(false);
  
  // Get unique countries from clients
  const uniqueCountries = useMemo(() => {
    return [...new Set(clients.map(c => c.country))].filter(Boolean).sort();
  }, [clients]);
  
  // Filter and paginate clients
  const filteredAndPaginated = useMemo(() => {
    let result = clients.filter(c =>
      (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.passport || '').includes(search.toUpperCase()) ||
      (c.phone || '').includes(search)
    );
    
    // Apply country filter
    if (countryFilter) {
      result = result.filter(c => c.country === countryFilter);
    }
    
    // Paginate
    const start = (pagination.page - 1) * pagination.perPage;
    const end = start + pagination.perPage;
    
    return {
      clients: result.slice(start, end),
      total: result.length,
      totalPages: Math.ceil(result.length / pagination.perPage)
    };
  }, [clients, search, countryFilter, pagination]);
  
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };
  
  const handlePerPageChange = (newPerPage) => {
    setPagination({ page: 1, perPage: newPerPage });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">База клиентов</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImport(true)}>
            <Upload size={20} className="mr-2" />
            Импорт
          </Button>
          <Button onClick={onAdd}>
            <Plus size={20} className="mr-2" />
            Добавить клиента
          </Button>
        </div>
      </div>
      
      <Card>
        {/* Search and filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по имени, паспорту, телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          {/* FIXED: Country filter and pagination controls */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <select
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Все страны ({clients.length})</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>
                    {country} ({clients.filter(c => c.country === country).length})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => handlePerPageChange(25)}
                className={`px-3 py-2 rounded ${
                  pagination.perPage === 25
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                25
              </button>
              <button
                onClick={() => handlePerPageChange(50)}
                className={`px-3 py-2 rounded ${
                  pagination.perPage === 50
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                50
              </button>
              <button
                onClick={() => handlePerPageChange(100)}
                className={`px-3 py-2 rounded ${
                  pagination.perPage === 100
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                100
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Показано {filteredAndPaginated.clients.length} из {filteredAndPaginated.total} клиентов
          </div>
        </div>
        
        {/* Clients table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ФИО</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Паспорт</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Телефон</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Страна</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Визиты</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAndPaginated.clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{client.fullName}</td>
                  <td className="px-4 py-3">{client.passport}</td>
                  <td className="px-4 py-3">{client.phone || '-'}</td>
                  <td className="px-4 py-3">{client.country}</td>
                  <td className="px-4 py-3">{client.visits || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewHistory(client)}
                        className="text-blue-600 hover:text-blue-800"
                        title="История"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(client)}
                        className="text-green-600 hover:text-green-800"
                        title="Редактировать"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(client.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {filteredAndPaginated.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft size={20} />
              Назад
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: filteredAndPaginated.totalPages }, (_, i) => i + 1)
                .filter(p => 
                  p === 1 || 
                  p === filteredAndPaginated.totalPages || 
                  Math.abs(p - pagination.page) <= 2
                )
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        pagination.page === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            
            <Button
              variant="secondary"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === filteredAndPaginated.totalPages}
            >
              Вперед
              <ChevronRight size={20} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

// Client History Modal Component
const ClientHistoryModal = ({ client, guests, onClose }) => {
  const clientVisits = guests.filter(g => 
    g.passport === client.passport || g.fullName === client.fullName
  );
  
  const totalSpent = clientVisits.reduce((sum, g) => sum + (parseInt(g.totalPrice) || 0), 0);
  const totalNights = clientVisits.reduce((sum, g) => sum + (parseInt(g.days) || 0), 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{client.fullName}</h2>
            <p className="text-sm text-gray-600">{client.passport}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Всего визитов</p>
            <p className="text-2xl font-bold">{clientVisits.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Ночей</p>
            <p className="text-2xl font-bold">{totalNights}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Потрачено</p>
            <p className="text-2xl font-bold">{totalSpent.toLocaleString()} ₽</p>
          </div>
        </div>
        
        <h3 className="font-semibold mb-3">История визитов</h3>
        <div className="space-y-2">
          {clientVisits.map(visit => (
            <div key={visit.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Комната {visit.roomNumber}, место {visit.bedId}</p>
                  <p className="text-sm text-gray-600">
                    {getLocalDateString(visit.checkInDate)} — {
                      visit.checkOutDate ? getLocalDateString(visit.checkOutDate) : 'Проживает'
                    }
                  </p>
                  <p className="text-sm text-gray-600">{visit.days} ночей</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{visit.totalPrice} ₽</p>
                  <p className="text-sm text-gray-600">
                    Оплачено: {getTotalPaid(visit)} ₽
                  </p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    visit.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {visit.status === 'checked_in' ? 'Активен' : 'Выселен'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Task Manager Component
const TaskManager = ({ tasks, onAdd, onToggle, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', assignee: '' });
  
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Задачи</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Новая задача
        </Button>
      </div>
      
      {showForm && (
        <Card>
          <h3 className="font-semibold mb-3">Создать задачу</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Название задачи"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className={inputClass}
            />
            <div className="flex gap-2">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className={inputClass}
              >
                <option value="low">Низкий приоритет</option>
                <option value="medium">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
              </select>
              <Button onClick={() => {
                onAdd(newTask);
                setNewTask({ title: '', priority: 'medium', assignee: '' });
                setShowForm(false);
              }}>
                Создать
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">Активные задачи ({pendingTasks.length})</h3>
          <div className="space-y-2">
            {pendingTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => onToggle(task.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-600">{task.assignee}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {task.priority}
                </span>
                <button onClick={() => onDelete(task.id)} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <h3 className="font-semibold mb-3">Выполненные ({completedTasks.length})</h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded opacity-60">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => onToggle(task.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium line-through">{task.title}</p>
                </div>
                <button onClick={() => onDelete(task.id)} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Debts View Component
const DebtsView = ({ debts, onAdd, onPay, onDelete }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'unpaid', 'paid'
  
  const filteredDebts = debts.filter(d => {
    if (filter === 'all') return true;
    return d.status === filter;
  });
  
  const totalDebt = debts
    .filter(d => d.status === 'unpaid')
    .reduce((sum, d) => sum + parseInt(d.amount || 0), 0);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление долгами</h2>
        <Button onClick={onAdd}>
          <Plus size={20} className="mr-2" />
          Добавить долг
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50">
          <p className="text-sm text-gray-600">Всего долгов</p>
          <p className="text-3xl font-bold text-red-600">{totalDebt.toLocaleString()} ₽</p>
        </Card>
      </div>
      
      <Card>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded ${
              filter === 'unpaid' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            Неоплаченные
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded ${
              filter === 'paid' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            Оплаченные
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Клиент</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Сумма</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Дата</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Описание</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDebts.map(debt => (
                <tr key={debt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{debt.clientName}</td>
                  <td className="px-4 py-3 font-semibold">{parseInt(debt.amount).toLocaleString()} ₽</td>
                  <td className="px-4 py-3">{getLocalDateString(debt.date)}</td>
                  <td className="px-4 py-3">{debt.description || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      debt.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {debt.status === 'paid' ? 'Оплачен' : 'Не оплачен'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {debt.status === 'unpaid' && (
                        <button
                          onClick={() => onPay(debt.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(debt.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Reports View Component
const ReportsView = ({ transactions, onExport, onPrint }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hostelFilter, setHostelFilter] = useState('all');
  
  const filteredTransactions = transactions.filter(t => {
    if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(t.date) > new Date(dateTo)) return false;
    if (hostelFilter !== 'all' && t.hostel !== hostelFilter) return false;
    return true;
  });
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
  
  const balance = totalIncome - totalExpense;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Финансовые отчеты</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onExport(filteredTransactions)}>
            <Download size={20} className="mr-2" />
            Экспорт
          </Button>
          <Button variant="secondary" onClick={() => onPrint(filteredTransactions)}>
            <Printer size={20} className="mr-2" />
            Печать
          </Button>
        </div>
      </div>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>От даты</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>До даты</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Хостел</label>
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">Все хостелы</option>
              {HOSTELS.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Доходы</p>
            <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} ₽</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Расходы</p>
            <p className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} ₽</p>
          </div>
          <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
            <p className="text-sm text-gray-600">Баланс</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
              {balance.toLocaleString()} ₽
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Дата</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Тип</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Хостел</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Кассир</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Сумма</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Метод</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{getLocalDateString(transaction.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type === 'income' ? 'Приход' : 'Расход'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{transaction.hostel}</td>
                  <td className="px-4 py-3">{transaction.staff}</td>
                  <td className="px-4 py-3 font-semibold">{parseInt(transaction.amount).toLocaleString()} ₽</td>
                  <td className="px-4 py-3">{transaction.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Shifts View Component
const ShiftsView = ({ shifts, currentShift, onOpenShift, onCloseShift }) => {
  const activeShift = shifts.find(s => s.status === 'active');
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление сменами</h2>
        {!activeShift && (
          <Button onClick={onOpenShift}>
            <Clock size={20} className="mr-2" />
            Открыть смену
          </Button>
        )}
      </div>
      
      {activeShift && (
        <Card className="bg-green-50 border-2 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Текущая смена</h3>
              <p className="text-sm text-gray-600">
                Начало: {getLocalDatetimeString(activeShift.startTime)}
              </p>
              <p className="text-sm text-gray-600">Кассир: {activeShift.staffName}</p>
            </div>
            <Button variant="danger" onClick={() => onCloseShift(activeShift)}>
              Закрыть смену
            </Button>
          </div>
        </Card>
      )}
      
      <Card>
        <h3 className="font-semibold mb-4">История смен</h3>
        <div className="space-y-3">
          {shifts.filter(s => s.status === 'closed').map(shift => (
            <div key={shift.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{shift.staffName}</p>
                  <p className="text-sm text-gray-600">
                    {getLocalDatetimeString(shift.startTime)} — {getLocalDatetimeString(shift.endTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{shift.cashCount?.toLocaleString()} ₽</p>
                  <p className="text-xs text-gray-600">Касса</p>
                </div>
              </div>
              {shift.notes && (
                <p className="text-sm text-gray-600 mt-2">{shift.notes}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================
// End of Part 4/5
// Continue with Part 5/5
// ============================================
// ============================================
// App.jsx - Part 5/5
// Main App Component
// ============================================

function App() {
  // ============================================
  // Authentication State
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ============================================
  // UI State
  // ============================================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('ru');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ============================================
  // Data State
  // ============================================
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [debts, setDebts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  // ============================================
  // Modal State
  // ============================================
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showGuestDetailsModal, setShowGuestDetailsModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showClientEditModal, setShowClientEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientHistoryModal, setShowClientHistoryModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRoomFormModal, setShowRoomFormModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showShiftClosingModal, setShowShiftClosingModal] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  
  // ============================================
  // ADDED: Fazliddin Special Permissions
  // ============================================
  const isFazliddin = useMemo(() => {
    return currentUser?.login === 'fazliddin';
  }, [currentUser]);
  
  const [fazliddinHostel, setFazliddinHostel] = useState('hostel2');
  
  const canEditCurrentHostel = useMemo(() => {
    if (!isFazliddin) return true;
    return fazliddinHostel === 'hostel2';
  }, [isFazliddin, fazliddinHostel]);
  
  // ============================================
  // Notification Helper
  // ============================================
  const notify = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);
  
  // ============================================
  // Authentication Handlers
  // ============================================
  const handleLogin = useCallback((login, password) => {
    const user = DEFAULT_USERS.find(
      u => u.login === login && u.password === password
    );
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      notify(`Добро пожаловать, ${user.name}!`, 'success');
      
      // Send Telegram notification
      sendTelegramMessage(`🔐 Вход в систему: ${user.name} (${user.role})`);
    } else {
      notify('Неверный логин или пароль', 'error');
    }
  }, [notify]);
  
  const handleLogout = useCallback(() => {
    if (currentUser) {
      sendTelegramMessage(`🚪 Выход из системы: ${currentUser.name}`);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    notify('Вы вышли из системы', 'info');
  }, [currentUser, notify]);
  
  // ============================================
  // Guest Management Handlers
  // ============================================
  const handleCheckIn = useCallback((guestData) => {
    // Check collision
    if (checkCollision(guests, guestData.roomNumber, guestData.bedId)) {
      notify('Это место уже занято!', 'error');
      return;
    }
    
    const newGuest = {
      ...guestData,
      id: Date.now().toString(),
      checkInDate: new Date().toISOString(),
      checkInDateTime: new Date().toISOString(),
      status: 'checked_in',
      payments: guestData.initialPayment > 0 ? [{
        amount: guestData.initialPayment,
        method: guestData.paymentMethod,
        date: new Date().toISOString(),
        staff: currentUser?.name
      }] : []
    };
    
    setGuests(prev => [...prev, newGuest]);
    setShowCheckInModal(false);
    notify(`Гость ${guestData.fullName} успешно заселен!`, 'success');
    
    // Send Telegram notification
    sendTelegramMessage(
      `✅ Заселение: ${guestData.fullName}\n` +
      `📍 Комната ${guestData.roomNumber}, место ${guestData.bedId}\n` +
      `📅 Дней: ${guestData.days}\n` +
      `💰 Сумма: ${guestData.totalPrice} ₽\n` +
      `👤 Кассир: ${currentUser?.name}`
    );
    
    // Add to clients database if not exists
    const existingClient = clients.find(c => c.passport === guestData.passport);
    if (!existingClient) {
      const newClient = {
        id: Date.now().toString(),
        fullName: guestData.fullName,
        passport: guestData.passport,
        phone: guestData.phone,
        country: guestData.country,
        visits: 1,
        createdAt: new Date().toISOString()
      };
      setClients(prev => [...prev, newClient]);
    } else {
      setClients(prev => prev.map(c =>
        c.id === existingClient.id
          ? { ...c, visits: (c.visits || 0) + 1 }
          : c
      ));
    }
    
    // Add income transaction
    if (guestData.initialPayment > 0) {
      const transaction = {
        id: Date.now().toString(),
        type: 'income',
        amount: guestData.initialPayment,
        method: guestData.paymentMethod,
        date: new Date().toISOString(),
        hostel: fazliddinHostel || 'hostel1',
        staff: currentUser?.name,
        description: `Заселение: ${guestData.fullName}`
      };
      setTransactions(prev => [...prev, transaction]);
    }
  }, [guests, clients, currentUser, notify, fazliddinHostel]);
  
  const handleCheckOut = useCallback((guest, checkoutData) => {
    setGuests(prev => prev.map(g =>
      g.id === guest.id
        ? {
            ...g,
            status: 'checked_out',
            checkOutDate: checkoutData.checkOutDate || new Date().toISOString(),
            checkOutDateTime: new Date().toISOString(),
            refundAmount: checkoutData.refundAmount || 0
          }
        : g
    ));
    
    setShowGuestDetailsModal(false);
    notify(`Гость ${guest.fullName} выселен`, 'success');
    
    // Send Telegram notification
    const totalPaid = getTotalPaid(guest);
    const balance = totalPaid - (guest.totalPrice || 0);
    
    sendTelegramMessage(
      `🚪 Выселение: ${guest.fullName}\n` +
      `📍 Комната ${guest.roomNumber}, место ${guest.bedId}\n` +
      `💰 Всего оплачено: ${totalPaid} ₽\n` +
      `💵 Баланс: ${balance} ₽\n` +
      `🔄 Возврат: ${checkoutData.refundAmount || 0} ₽\n` +
      `👤 Кассир: ${currentUser?.name}`
    );
    
    // If there's a debt, create debt record
    if (balance < 0) {
      const newDebt = {
        id: Date.now().toString(),
        clientId: guest.id,
        clientName: guest.fullName,
        passport: guest.passport,
        phone: guest.phone,
        amount: Math.abs(balance),
        date: new Date().toISOString(),
        status: 'unpaid',
        description: `Долг за проживание (комната ${guest.roomNumber})`
      };
      setDebts(prev => [...prev, newDebt]);
    }
  }, [currentUser, notify]);
  
  const handlePayment = useCallback((guest, paymentData) => {
    setGuests(prev => prev.map(g =>
      g.id === guest.id
        ? {
            ...g,
            payments: [
              ...(g.payments || []),
              {
                ...paymentData,
                staff: currentUser?.name
              }
            ]
          }
        : g
    ));
    
    notify(`Платеж принят: ${paymentData.amount} ₽`, 'success');
    
    // Add income transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'income',
      amount: paymentData.amount,
      method: paymentData.method,
      date: paymentData.date,
      hostel: fazliddinHostel || 'hostel1',
      staff: currentUser?.name,
      description: `Оплата: ${guest.fullName}`
    };
    setTransactions(prev => [...prev, transaction]);
    
    // Send Telegram notification
    sendTelegramMessage(
      `💰 Оплата: ${guest.fullName}\n` +
      `💵 Сумма: ${paymentData.amount} ₽\n` +
      `💳 Метод: ${paymentData.method}\n` +
      `👤 Кассир: ${currentUser?.name}`
    );
  }, [currentUser, notify, fazliddinHostel]);
  
  const handleExtendStay = useCallback((guest) => {
    // Implementation for extending guest stay
    notify('Функция продления реализуется...', 'info');
  }, [notify]);
  
  const handleMoveGuest = useCallback((guest, newRoom, newBed) => {
    if (checkCollision(guests, newRoom, newBed, guest.id)) {
      notify('Это место уже занято!', 'error');
      return;
    }
    
    setGuests(prev => prev.map(g =>
      g.id === guest.id
        ? { ...g, roomNumber: newRoom, bedId: newBed }
        : g
    ));
    
    notify(`Гость перемещен в комнату ${newRoom}, место ${newBed}`, 'success');
  }, [guests, notify]);
  
  // ============================================
  // Client Management Handlers
  // ============================================
  const handleAddClient = useCallback(() => {
    setSelectedClient(null);
    setShowClientEditModal(true);
  }, []);
  
  const handleEditClient = useCallback((client) => {
    setSelectedClient(client);
    setShowClientEditModal(true);
  }, []);
  
  const handleSaveClient = useCallback((clientData) => {
    if (selectedClient) {
      setClients(prev => prev.map(c =>
        c.id === selectedClient.id ? { ...c, ...clientData } : c
      ));
      notify('Клиент обновлен', 'success');
    } else {
      const newClient = {
        ...clientData,
        id: Date.now().toString(),
        visits: 0,
        createdAt: new Date().toISOString()
      };
      setClients(prev => [...prev, newClient]);
      notify('Клиент добавлен', 'success');
    }
    setShowClientEditModal(false);
  }, [selectedClient, notify]);
  
  const handleDeleteClient = useCallback((clientId) => {
    if (window.confirm('Удалить клиента?')) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      notify('Клиент удален', 'success');
    }
  }, [notify]);
  
  const handleViewClientHistory = useCallback((client) => {
    setSelectedClient(client);
    setShowClientHistoryModal(true);
  }, []);
  
  // ============================================
  // Debt Management Handlers
  // ============================================
  const handleAddDebt = useCallback(() => {
    setShowDebtModal(true);
  }, []);
  
  const handleCreateDebt = useCallback((debtData) => {
    const newDebt = {
      ...debtData,
      id: Date.now().toString()
    };
    setDebts(prev => [...prev, newDebt]);
    setShowDebtModal(false);
    notify('Долг создан', 'success');
  }, [notify]);
  
  const handlePayDebt = useCallback((debtId) => {
    setDebts(prev => prev.map(d =>
      d.id === debtId ? { ...d, status: 'paid', paidDate: new Date().toISOString() } : d
    ));
    notify('Долг оплачен', 'success');
  }, [notify]);
  
  const handleDeleteDebt = useCallback((debtId) => {
    if (window.confirm('Удалить долг?')) {
      setDebts(prev => prev.filter(d => d.id !== debtId));
      notify('Долг удален', 'success');
    }
  }, [notify]);
  
  // ============================================
  // Expense Management Handlers
  // ============================================
  const handleAddExpense = useCallback(() => {
    setShowExpenseModal(true);
  }, []);
  
  const handleCreateExpense = useCallback((expenseData) => {
    const newExpense = {
      ...expenseData,
      id: Date.now().toString()
    };
    setExpenses(prev => [...prev, newExpense]);
    
    // Add expense transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: expenseData.amount,
      method: 'cash',
      date: expenseData.date,
      hostel: fazliddinHostel || 'hostel1',
      staff: currentUser?.name,
      description: expenseData.description
    };
    setTransactions(prev => [...prev, transaction]);
    
    setShowExpenseModal(false);
    notify('Расход добавлен', 'success');
  }, [currentUser, notify, fazliddinHostel]);
  
  // ============================================
  // Room Management Handlers
  // ============================================
  const handleAddRoom = useCallback(() => {
    setSelectedRoom(null);
    setShowRoomFormModal(true);
  }, []);
  
  const handleEditRoom = useCallback((room) => {
    setSelectedRoom(room);
    setShowRoomFormModal(true);
  }, []);
  
  const handleSaveRoom = useCallback((roomData) => {
    if (selectedRoom) {
      setRooms(prev => prev.map(r =>
        r.id === selectedRoom.id ? { ...r, ...roomData } : r
      ));
      notify('Комната обновлена', 'success');
    } else {
      const newRoom = {
        ...roomData,
        id: Date.now().toString()
      };
      setRooms(prev => [...prev, newRoom]);
      notify('Комната добавлена', 'success');
    }
    setShowRoomFormModal(false);
  }, [selectedRoom, notify]);
  
  const handleDeleteRoom = useCallback((roomId) => {
    if (window.confirm('Удалить комнату?')) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      notify('Комната удалена', 'success');
    }
  }, [notify]);
  
  // ============================================
  // Shift Management Handlers
  // ============================================
  const handleOpenShift = useCallback(() => {
    const newShift = {
      id: Date.now().toString(),
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      startTime: new Date().toISOString(),
      status: 'active',
      hostel: fazliddinHostel || 'hostel1'
    };
    setShifts(prev => [...prev, newShift]);
    setCurrentShift(newShift);
    notify('Смена открыта', 'success');
  }, [currentUser, notify, fazliddinHostel]);
  
  const handleCloseShift = useCallback((shift) => {
    setShowShiftClosingModal(true);
  }, []);
  
  const handleFinalizeShiftClose = useCallback((shiftData) => {
    setShifts(prev => prev.map(s =>
      s.id === shiftData.id ? shiftData : s
    ));
    setCurrentShift(null);
    setShowShiftClosingModal(false);
    notify('Смена закрыта', 'success');
  }, [notify]);
  
  // ============================================
  // Task Management Handlers
  // ============================================
  const handleAddTask = useCallback((taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    notify('Задача создана', 'success');
  }, [notify]);
  
  const handleToggleTask = useCallback((taskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  }, []);
  
  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    notify('Задача удалена', 'success');
  }, [notify]);
  
  // ============================================
  // Export and Print Handlers
  // ============================================
  const handleExportReport = useCallback((data) => {
    const totalIncome = data.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const totalExpense = data.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    
    const filename = `report_${new Date().toISOString().split('T')[0]}.xls`;
    exportToExcel(data, filename, totalIncome, totalExpense);
    notify('Отчет экспортирован', 'success');
  }, [notify]);
  
  const handlePrintReport = useCallback((data) => {
    const totalIncome = data.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const totalExpense = data.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    
    const hostel = HOSTELS[0];
    const period = `${new Date().toLocaleDateString('ru-RU')}`;
    printReport(data, hostel, period, totalIncome, totalExpense);
  }, []);
  
  // ============================================
  // Bed Click Handler (for room view)
  // ============================================
  const handleBedClick = useCallback((roomNumber, bedId, guest) => {
    if (guest) {
      setSelectedGuest(guest);
      setShowGuestDetailsModal(true);
    } else {
      if (canEditCurrentHostel) {
        setShowCheckInModal(true);
      } else {
        notify('У вас нет прав для заселения в этот хостел', 'error');
      }
    }
  }, [canEditCurrentHostel, notify]);
  
  // ============================================
  // Data Loading Effect
  // ============================================
  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      // In production, load from Firebase
      // For now, initialize with sample data
      setRooms([
        { id: '1', number: '101', beds: 4, pricePerNight: 1000, description: 'Стандартная комната' },
        { id: '2', number: '102', beds: 4, pricePerNight: 1000, description: 'Стандартная комната' },
        { id: '3', number: '103', beds: 6, pricePerNight: 800, description: 'Большая комната' },
        { id: '4', number: '201', beds: 4, pricePerNight: 1200, description: 'Улучшенная' }
      ]);
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // ============================================
  // Dashboard Stats Calculation
  // ============================================
  const dashboardData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const monthIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    
    return {
      income: monthIncome,
      weekOccupancy: [] // Calculate week occupancy
    };
  }, [transactions]);
  
  // ============================================
  // Render Login Screen
  // ============================================
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  // ============================================
  // Check Active Shift
  // ============================================
  const activeShift = shifts.find(s => s.status === 'active');
  const requiresShift = currentUser?.role === 'staff' || currentUser?.role === 'manager';
  
  if (requiresShift && !activeShift && activeTab !== 'shifts') {
    return (
      <ShiftBlockScreen
        message="Перед началом работы необходимо открыть смену"
        onOpenShift={handleOpenShift}
      />
    );
  }
  
  // ============================================
  // Main Application Render
  // ============================================
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        currentUser={currentUser}
        language={language}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* ADDED: Fazliddin Hostel Switcher */}
          {isFazliddin && (
            <Card className="mb-4 bg-yellow-50 border-2 border-yellow-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Переключатель хостелов</h3>
                  <p className="text-sm text-gray-600">
                    Вы можете редактировать только Hostel 2
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFazliddinHostel('hostel1')}
                    className={`px-4 py-2 rounded ${
                      fazliddinHostel === 'hostel1'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Hostel 1 (Просмотр)
                  </button>
                  <button
                    onClick={() => setFazliddinHostel('hostel2')}
                    className={`px-4 py-2 rounded ${
                      fazliddinHostel === 'hostel2'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Hostel 2 (Редактирование)
                  </button>
                </div>
              </div>
            </Card>
          )}
          
          {/* Content based on active tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Панель управления</h1>
              <DashboardStats
                guests={guests}
                rooms={rooms}
                debts={debts}
                income={dashboardData.income}
              />
              <ChartsSection data={dashboardData} />
            </div>
          )}
          
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Комнаты</h2>
                <Button onClick={handleAddRoom} disabled={!canEditCurrentHostel}>
                  <Plus size={20} className="mr-2" />
                  Добавить комнату
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <RoomCardChess
                    key={room.id}
                    room={room}
                    guests={guests}
                    onBedClick={handleBedClick}
                  />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'calendar' && (
            <CalendarView
              guests={guests}
              rooms={rooms}
              onDayClick={(guest) => {
                setSelectedGuest(guest);
                setShowGuestDetailsModal(true);
              }}
            />
          )}
          
          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              onAdd={handleAddClient}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onViewHistory={handleViewClientHistory}
            />
          )}
          
          {activeTab === 'staff' && (
            <StaffView
              staff={staff}
              onAdd={() => notify('Функция в разработке', 'info')}
              onEdit={() => notify('Функция в разработке', 'info')}
              onDelete={() => notify('Функция в разработке', 'info')}
            />
          )}
          
          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              onExport={handleExportReport}
              onPrint={handlePrintReport}
            />
          )}
          
          {activeTab === 'debts' && (
            <DebtsView
              debts={debts}
              onAdd={handleAddDebt}
              onPay={handlePayDebt}
              onDelete={handleDeleteDebt}
            />
          )}
          
          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              onAdd={handleAddTask}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          )}
          
          {activeTab === 'shifts' && (
            <ShiftsView
              shifts={shifts}
              currentShift={activeShift}
              onOpenShift={handleOpenShift}
              onCloseShift={handleCloseShift}
            />
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
      />
      
      {/* Modals */}
      {showCheckInModal && (
        <CheckInModal
          onClose={() => setShowCheckInModal(false)}
          onSubmit={handleCheckIn}
          rooms={rooms}
          clients={clients}
        />
      )}
      
      {showGuestDetailsModal && selectedGuest && (
        <GuestDetailsModal
          guest={selectedGuest}
          onClose={() => {
            setShowGuestDetailsModal(false);
            setSelectedGuest(null);
          }}
          onCheckOut={handleCheckOut}
          onPayment={handlePayment}
          onExtend={handleExtendStay}
        />
      )}
      
      {showClientEditModal && (
        <ClientEditModal
          client={selectedClient}
          onClose={() => {
            setShowClientEditModal(false);
            setSelectedClient(null);
          }}
          onSave={handleSaveClient}
        />
      )}
      
      {showClientHistoryModal && selectedClient && (
        <ClientHistoryModal
          client={selectedClient}
          guests={guests}
          onClose={() => {
            setShowClientHistoryModal(false);
            setSelectedClient(null);
          }}
        />
      )}
      
      {showDebtModal && (
        <CreateDebtModal
          onClose={() => setShowDebtModal(false)}
          onSubmit={handleCreateDebt}
          clients={clients}
        />
      )}
      
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleCreateExpense}
        />
      )}
      
      {showRoomFormModal && (
        <RoomFormModal
          room={selectedRoom}
          onClose={() => {
            setShowRoomFormModal(false);
            setSelectedRoom(null);
          }}
          onSave={handleSaveRoom}
        />
      )}
      
      {showShiftClosingModal && activeShift && (
        <ShiftClosingModal
          shift={activeShift}
          onClose={() => setShowShiftClosingModal(false)}
          onClose={handleFinalizeShiftClose}
        />
      )}
      
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;

// ============================================
// End of Part 5/5
// Assembly complete! This is the final part.
// ============================================
