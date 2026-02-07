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
