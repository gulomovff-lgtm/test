// App.jsx - Part 1/5
// Copy all parts sequentially into one file to use

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Tailwind-like classes
const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

// Translations
const TRANSLATIONS = {
  en: {
    checkin: 'Check-in',
    checkout: 'Check-out',
    rooms: 'Rooms',
    calendar: 'Calendar',
    reports: 'Reports',
    debts: 'Debts',
    tasks: 'Tasks',
    clients: 'Clients',
    staff: 'Staff',
    shifts: 'Shifts',
    logout: 'Logout',
  },
  ru: {
    checkin: 'Заселение',
    checkout: 'Выселение',
    rooms: 'Комнаты',
    calendar: 'Календарь',
    reports: 'Отчёты',
    debts: 'Долги',
    tasks: 'Задачи',
    clients: 'Клиенты',
    staff: 'Сотрудники',
    shifts: 'Смены',
    logout: 'Выход',
  },
  uz: {
    checkin: 'Kirish',
    checkout: 'Chiqish',
    rooms: 'Xonalar',
    calendar: 'Kalendar',
    reports: 'Hisobotlar',
    debts: 'Qarzlar',
    tasks: 'Vazifalar',
    clients: 'Mijozlar',
    staff: 'Xodimlar',
    shifts: 'Smenalar',
    logout: 'Chiqish',
  },
};

// Telegram Bot Configuration
const TG_BOT_TOKEN = '7811788235:AAFDZNKgVWNpJ9HmjNbUTnlqvx-EONNQkbk';
const TELEGRAM_CHAT_IDS = ['909856851']; // Add more chat IDs as needed

const sendTelegramMessage = async (message) => {
  try {
    for (const chatId of TELEGRAM_CHAT_IDS) {
      await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    }
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
};

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyClVjmrSXzQA6otHqYwvDlX4gBjp6kjr5c",
  authDomain: "hostel-3fd46.firebaseapp.com",
  projectId: "hostel-3fd46",
  storageBucket: "hostel-3fd46.firebasestorage.app",
  messagingSenderId: "430990074883",
  appId: "1:430990074883:web:7c79f9a0c10e0f29ab1b7d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Default Users
const DEFAULT_USERS = [
  { login: 'admin', password: 'admin123', role: 'admin' },
  { login: 'kassir1', password: 'kassir123', role: 'cashier' },
  { login: 'kassir2', password: 'kassir456', role: 'cashier' },
  { login: 'fazliddin', password: 'fazliddin123', role: 'special' },
];

// Countries list
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia',
  'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China',
  'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland',
  'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Korea North', 'Korea South', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Lucia', 'Samoa', 'San Marino',
  'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone',
  'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

// Country mapping for normalization
const COUNTRY_MAP = {
  'rus': 'Russia',
  'russia': 'Russia',
  'russian': 'Russia',
  'rossiya': 'Russia',
  'usa': 'United States',
  'us': 'United States',
  'america': 'United States',
  'uk': 'United Kingdom',
  'england': 'United Kingdom',
  'britain': 'United Kingdom',
  'uzbekistan': 'Uzbekistan',
  'ozbekiston': 'Uzbekistan',
  'uz': 'Uzbekistan',
  'kazakhstan': 'Kazakhstan',
  'qozogiston': 'Kazakhstan',
  'kz': 'Kazakhstan',
  'tajikistan': 'Tajikistan',
  'tojikiston': 'Tajikistan',
  'tj': 'Tajikistan',
  'kyrgyzstan': 'Kyrgyzstan',
  'qirgiziston': 'Kyrgyzstan',
  'kg': 'Kyrgyzstan',
  'turkmenistan': 'Turkmenistan',
  'turkmaniston': 'Turkmenistan',
  'tm': 'Turkmenistan',
};

// Hostels configuration
const HOSTELS = [
  { id: 'hostel1', name: 'Hostel №1', address: 'Tashkent, 123 Street' },
  { id: 'hostel2', name: 'Hostel №2', address: 'Tashkent, 456 Avenue' },
];

// Utility Functions

// Get total paid amount for a guest
const getTotalPaid = (guest) => {
  if (!guest.payments || guest.payments.length === 0) return 0;
  return guest.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
};

// Pluralize helper
const pluralize = (count, singular, few, many) => {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return singular;
  return many;
};

// Get local date string
const getLocalDateString = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('ru-RU');
};

// Get stay details
const getStayDetails = (checkInDate, checkOutDate) => {
  const start = checkInDate instanceof Date ? checkInDate : new Date(checkInDate);
  const end = checkOutDate instanceof Date ? checkOutDate : new Date(checkOutDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return { days, start, end };
};

// Check collision
const checkCollision = (roomId, checkIn, checkOut, guests, excludeGuestId = null) => {
  const newStart = new Date(checkIn);
  const newEnd = new Date(checkOut);
  
  return guests.some(g => {
    if (g.id === excludeGuestId) return false;
    if (g.roomId !== roomId) return false;
    if (g.status === 'checked_out') return false;
    
    const gStart = new Date(g.checkInDate);
    const gEnd = new Date(g.checkOutDate);
    
    return (newStart < gEnd && newEnd > gStart);
  });
};

// Calculate salary
const calculateSalary = (shifts, staffMember) => {
  const relevantShifts = shifts.filter(s => s.staffId === staffMember.id && s.status === 'closed');
  const totalEarned = relevantShifts.reduce((sum, s) => sum + (s.totalEarned || 0), 0);
  const salary = totalEarned * (staffMember.salaryPercent || 0) / 100;
  return { totalEarned, salary, shiftsCount: relevantShifts.length };
};

// Export to Excel function - FIXED
const exportToExcel = (data, filename, headers) => {
  let tableHtml = '<table border="1"><thead><tr>';
  
  // Add headers
  headers.forEach(h => {
    tableHtml += `<th>${h}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';
  
  // Add data rows
  data.forEach(row => {
    tableHtml += '<tr>';
    headers.forEach(h => {
      const value = row[h] || '';
      tableHtml += `<td>${value}</td>`;
    });
    tableHtml += '</tr>';
  });
  
  tableHtml += '</tbody></table>';
  
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Sheet1</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
    </head>
    <body>${tableHtml}</body>
    </html>
  `;
  
  const blob = new Blob([htmlContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8' 
  });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Print document function - FIXED
const printDocument = (type, guest, hostel) => {
  const w = window.open('', '', 'width=800,height=600');
  
  let html = `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${type === 'check' ? 'Чек' : type === 'regcard' ? 'Анкета' : 'Справка'}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          line-height: 1.6;
        }
        h2 { 
          text-align: center;
          margin-bottom: 20px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse;
          margin: 20px 0;
        }
        td, th { 
          border: 1px solid #000; 
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .info-block {
          margin: 10px 0;
        }
        .signature {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
  `;
  
  const totalPaid = getTotalPaid(guest);
  const balance = (guest.totalPrice || 0) - totalPaid;
  
  if (type === 'check') {
    html += `
      <h2>ЧЕК №${guest.id}</h2>
      <div class="info-block">
        <p><strong>Хостел:</strong> ${hostel?.name || 'N/A'}</p>
        <p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
      </div>
      <div class="info-block">
        <p><strong>Гость:</strong> ${guest.fullName || 'N/A'}</p>
        <p><strong>Паспорт:</strong> ${guest.passport || 'N/A'}</p>
        <p><strong>Комната:</strong> ${guest.roomId || 'N/A'}</p>
      </div>
      <table>
        <tr>
          <th>Описание</th>
          <th>Сумма</th>
        </tr>
        <tr>
          <td>Количество дней</td>
          <td>${guest.days || 0}</td>
        </tr>
        <tr>
          <td>Цена за день</td>
          <td>${guest.pricePerDay || 0} сум</td>
        </tr>
        <tr>
          <td>Общая стоимость</td>
          <td>${guest.totalPrice || 0} сум</td>
        </tr>
        <tr>
          <td>Оплачено</td>
          <td>${totalPaid} сум</td>
        </tr>
        <tr>
          <td><strong>Баланс</strong></td>
          <td><strong>${balance} сум</strong></td>
        </tr>
      </table>
      <div class="signature">
        <div>Кассир: _____________</div>
        <div>Гость: _____________</div>
      </div>
    `;
  } else if (type === 'regcard') {
    html += `
      <h2>АНКЕТА ГОСТЯ</h2>
      <div class="info-block">
        <p><strong>Хостел:</strong> ${hostel?.name || 'N/A'}</p>
        <p><strong>Дата заселения:</strong> ${getLocalDateString(guest.checkInDate)}</p>
      </div>
      <table>
        <tr>
          <th>Поле</th>
          <th>Значение</th>
        </tr>
        <tr>
          <td>ФИО</td>
          <td>${guest.fullName || ''}</td>
        </tr>
        <tr>
          <td>Паспорт</td>
          <td>${guest.passport || ''}</td>
        </tr>
        <tr>
          <td>Страна</td>
          <td>${guest.country || ''}</td>
        </tr>
        <tr>
          <td>Дата рождения</td>
          <td>${guest.birthDate || ''}</td>
        </tr>
        <tr>
          <td>Телефон</td>
          <td>${guest.phone || ''}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td>${guest.email || ''}</td>
        </tr>
        <tr>
          <td>Комната</td>
          <td>${guest.roomId || ''}</td>
        </tr>
        <tr>
          <td>Дата выезда</td>
          <td>${getLocalDateString(guest.checkOutDate)}</td>
        </tr>
        <tr>
          <td>Цена</td>
          <td>${guest.totalPrice || 0} сум</td>
        </tr>
      </table>
      <div class="signature">
        <div>Администратор: _____________</div>
        <div>Гость: _____________</div>
      </div>
    `;
  } else if (type === 'ref') {
    const stayDetails = getStayDetails(guest.checkInDate, guest.checkOutDate);
    html += `
      <h2>СПРАВКА О ПРОЖИВАНИИ</h2>
      <p style="text-align: center;">№${guest.id} от ${new Date().toLocaleDateString('ru-RU')}</p>
      <div class="info-block" style="margin-top: 30px;">
        <p>Настоящая справка выдана ${guest.fullName || 'N/A'}, 
        паспорт ${guest.passport || 'N/A'}, гражданину ${guest.country || 'N/A'}, 
        в том, что он(а) проживал(а) в ${hostel?.name || 'N/A'} 
        по адресу ${hostel?.address || 'N/A'}.</p>
        
        <p><strong>Период проживания:</strong> с ${getLocalDateString(guest.checkInDate)} 
        по ${getLocalDateString(guest.checkOutDate)} (${stayDetails.days} ${pluralize(stayDetails.days, 'день', 'дня', 'дней')}).</p>
        
        <p><strong>Комната:</strong> ${guest.roomId || 'N/A'}</p>
        
        <p style="margin-top: 30px;">Справка выдана для предъявления по месту требования.</p>
      </div>
      <div class="signature">
        <div>
          <p>Администратор</p>
          <p>_____________</p>
        </div>
        <div>
          <p>М.П.</p>
        </div>
      </div>
    `;
  }
  
  html += `
    <div style="text-align: center; margin-top: 20px;">
      <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
        Печать
      </button>
    </div>
    </body>
    </html>
  `;
  
  w.document.write(html);
  w.document.close();
};

// Normalize country name
const getNormalizedCountry = (country) => {
  if (!country) return '';
  const lower = country.toLowerCase().trim();
  return COUNTRY_MAP[lower] || country;
};

// ============================================
// End of Part 1/5
// Continue with Part 2/5
// ============================================
