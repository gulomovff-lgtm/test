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
