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

// Format guest ID for display in documents
// Shows last 8 characters with zero padding for consistent formatting
// Note: Firebase IDs are typically 20+ character strings, so this creates
// a readable display ID while the full ID is preserved in the guest object
const formatGuestId = (id) => {
  return String(id || '').slice(-8).padStart(8, '0');
};

// Export to Excel function - FIXED
const exportToExcel = (data, filename, headers) => {
  // UTF-8 BOM for proper Cyrillic character encoding in Excel
  const BOM = '\uFEFF';
  
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
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Report</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Print><x:ValidPrinterInfo/></x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
    </head>
    <body>${tableHtml}</body>
    </html>
  `;
  
  const blob = new Blob([BOM + htmlContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8' 
  });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Print document function - ENHANCED
const printDocument = (type, guest, hostel) => {
  const totalPaid = getTotalPaid(guest);
  const balance = (guest.totalPrice || 0) - totalPaid;
  // debt = absolute value when balance is negative, 0 otherwise
  const debt = balance < 0 ? Math.abs(balance) : 0;
  
  if (type === 'check') {
    // ENHANCED Professional receipt with detailed breakdown
    const w = window.open('', '', 'width=400,height=750');
    
    // Prepare payment details
    const cashPaid = guest.cashPaid || 0;
    const cardPaid = guest.cardPaid || 0;
    const qrPaid = guest.qrPaid || 0;
    const totalPaidAmount = cashPaid + cardPaid + qrPaid;
    
    // Calculate accommodation details
    const numberOfDays = guest.days || 0;
    const pricePerNight = guest.pricePerDay || 0;
    const totalPrice = guest.totalPrice || 0;
    
    // Generate receipt number and date
    const receiptNumber = formatGuestId(guest.id);
    const receiptDate = new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Кассовый чек</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', monospace; 
            max-width: 350px; 
            padding: 20px;
            margin: 0 auto;
            font-size: 13px;
            line-height: 1.4;
            background: #f5f5f5;
          }
          .receipt {
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { 
            border-top: 1px dashed #000; 
            margin: 10px 0; 
          }
          .double-line { 
            border-top: 2px solid #000; 
            margin: 12px 0; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          td { 
            padding: 4px 0; 
            vertical-align: top;
          }
          .right { text-align: right; }
          .debt { color: #d32f2f; font-weight: bold; }
          .success { color: #2e7d32; font-weight: bold; }
          .header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subheader {
            font-size: 11px;
            color: #666;
            margin-bottom: 3px;
          }
          .receipt-title {
            font-size: 15px;
            font-weight: bold;
            margin: 10px 0;
          }
          .services-table {
            margin: 10px 0;
          }
          .services-table td {
            padding: 5px 0;
          }
          .total-row {
            font-size: 14px;
            font-weight: bold;
            padding-top: 8px !important;
          }
          .payment-method {
            font-size: 12px;
          }
          .signature-area {
            margin-top: 30px;
            text-align: center;
          }
          .signature-line {
            display: inline-block;
            width: 150px;
            border-bottom: 1px solid #000;
            margin: 20px auto 5px;
          }
          .thank-you {
            font-size: 12px;
            margin: 15px 0 10px;
          }
          @media print {
            body { 
              background: white;
              padding: 0;
            }
            .receipt {
              box-shadow: none;
              padding: 10px;
            }
            button { display: none; }
            @page {
              margin: 10mm;
              size: 80mm auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- Header with hostel name and address -->
          <div class="center header">${hostel?.name || 'ХОСТЕЛ'}</div>
          <div class="center subheader">${hostel?.address || 'Ташкент, Узбекистан'}</div>
          
          <div class="double-line"></div>
          
          <!-- Receipt title and number -->
          <div class="center receipt-title">КАССОВЫЙ ЧЕК №${receiptNumber}</div>
          <div class="center subheader">${receiptDate}</div>
          
          <div class="line"></div>
          
          <!-- Guest information -->
          <table>
            <tr>
              <td class="bold" colspan="2">ИНФОРМАЦИЯ О ГОСТЕ</td>
            </tr>
            <tr>
              <td>Гость:</td>
              <td class="right bold">${guest.fullName || 'N/A'}</td>
            </tr>
            <tr>
              <td>Паспорт:</td>
              <td class="right">${guest.passport || 'N/A'}</td>
            </tr>
            <tr>
              <td>Страна:</td>
              <td class="right">${guest.country || 'N/A'}</td>
            </tr>
            <tr>
              <td>Комната:</td>
              <td class="right">${guest.roomId || 'N/A'}, Место ${guest.bedId || '-'}</td>
            </tr>
          </table>
          
          <div class="line"></div>
          
          <!-- Services breakdown -->
          <table class="services-table">
            <tr>
              <td class="bold" colspan="2">УСЛУГИ</td>
            </tr>
            <tr>
              <td>Проживание (${numberOfDays} ${numberOfDays === 1 ? 'день' : numberOfDays < 5 ? 'дня' : 'дней'} x ${pricePerNight.toLocaleString('ru-RU')})</td>
              <td class="right bold">${totalPrice.toLocaleString('ru-RU')}</td>
            </tr>
          </table>
          
          <div class="line"></div>
          
          <!-- Total amount -->
          <table>
            <tr>
              <td class="total-row">ИТОГО:</td>
              <td class="total-row right">${totalPrice.toLocaleString('ru-RU')} сум</td>
            </tr>
          </table>
          
          <div class="double-line"></div>
          
          <!-- Payment breakdown -->
          <table class="payment-method">
            <tr>
              <td class="bold" colspan="2">ОПЛАЧЕНО:</td>
            </tr>
            <tr>
              <td>Наличные:</td>
              <td class="right">${cashPaid.toLocaleString('ru-RU')} сум</td>
            </tr>
            <tr>
              <td>Терминал (карта):</td>
              <td class="right">${cardPaid.toLocaleString('ru-RU')} сум</td>
            </tr>
            <tr>
              <td>QR-код:</td>
              <td class="right">${qrPaid.toLocaleString('ru-RU')} сум</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 5px;"><div class="line"></div></td>
            </tr>
            <tr>
              <td class="bold">Всего оплачено:</td>
              <td class="right bold">${totalPaidAmount.toLocaleString('ru-RU')} сум</td>
            </tr>
            ${debt > 0 ? `
            <tr>
              <td class="debt">ДОЛГ:</td>
              <td class="debt right">${debt.toLocaleString('ru-RU')} сум</td>
            </tr>
            ` : ''}
            ${balance > 0 ? `
            <tr>
              <td>К оплате:</td>
              <td class="bold right">${balance.toLocaleString('ru-RU')} сум</td>
            </tr>
            ` : ''}
            ${balance === 0 ? `
            <tr>
              <td colspan="2" class="center success" style="padding-top: 8px;">
                ✓ ПОЛНОСТЬЮ ОПЛАЧЕНО
              </td>
            </tr>
            ` : ''}
          </table>
          
          <div class="line"></div>
          
          <!-- Thank you message -->
          <div class="center thank-you bold">
            Спасибо за визит!
          </div>
          <div class="center thank-you">
            Welcome back! • Qaytib keling!
          </div>
          
          <!-- Signature area -->
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="subheader">(подпись администратора)</div>
          </div>
          
          <div class="center" style="margin-top: 25px;">
            <button onclick="window.print()" 
                    style="padding: 10px 25px; 
                           font-size: 14px; 
                           cursor: pointer; 
                           background: #2196F3; 
                           color: white; 
                           border: none; 
                           border-radius: 5px;
                           font-weight: bold;">
              🖨️ ПЕЧАТЬ
            </button>
          </div>
        </div>
      </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
  } else {
    // Standard format for registration card and certificate
    const w = window.open('', '', 'width=800,height=600');
    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${type === 'regcard' ? 'Анкета' : 'Справка'}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
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
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
            width: 40%;
          }
          .info-block {
            margin: 15px 0;
          }
          .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
          }
          .signature > div {
            text-align: center;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
    `;
    
    if (type === 'regcard') {
      html += `
        <h2>АНКЕТА ГОСТЯ</h2>
        <div class="info-block">
          <p><strong>Хостел:</strong> ${hostel?.name || 'N/A'}</p>
          <p><strong>Адрес:</strong> ${hostel?.address || 'N/A'}</p>
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
            <td>Комната / Место</td>
            <td>${guest.roomId || ''} / ${guest.bedId || ''}</td>
          </tr>
          <tr>
            <td>Дата выезда</td>
            <td>${getLocalDateString(guest.checkOutDate)}</td>
          </tr>
          <tr>
            <td>Продолжительность</td>
            <td>${guest.days || 0} дней</td>
          </tr>
          <tr>
            <td>Стоимость проживания</td>
            <td>${guest.totalPrice || 0} сум</td>
          </tr>
        </table>
        <div class="signature">
          <div>
            <p>Администратор</p>
            <p>_____________</p>
          </div>
          <div>
            <p>Гость</p>
            <p>_____________</p>
          </div>
        </div>
      `;
    } else if (type === 'ref') {
      const stayDetails = getStayDetails(guest.checkInDate, guest.checkOutDate);
      html += `
        <h2>СПРАВКА О ПРОЖИВАНИИ</h2>
        <p style="text-align: center; font-size: 14px;">№${formatGuestId(guest.id)} от ${new Date().toLocaleDateString('ru-RU')}</p>
        <div class="info-block" style="margin-top: 40px; text-align: justify;">
          <p style="text-indent: 30px;">Настоящая справка выдана <strong>${guest.fullName || 'N/A'}</strong>, 
          паспорт <strong>${guest.passport || 'N/A'}</strong>, гражданин(ка) <strong>${guest.country || 'N/A'}</strong>, 
          в том, что он(а) действительно проживал(а) в <strong>${hostel?.name || 'N/A'}</strong> 
          по адресу: <strong>${hostel?.address || 'N/A'}</strong>.</p>
          
          <p style="margin-top: 20px;"><strong>Период проживания:</strong> с ${getLocalDateString(guest.checkInDate)} 
          по ${getLocalDateString(guest.checkOutDate)} (${stayDetails.days} ${pluralize(stayDetails.days, 'день', 'дня', 'дней')}).</p>
          
          <p><strong>Комната:</strong> ${guest.roomId || 'N/A'}</p>
          
          <p style="margin-top: 40px;">Справка выдана для предъявления по месту требования.</p>
        </div>
        <div class="signature">
          <div>
            <p>Директор/Администратор</p>
            <p style="margin-top: 30px;">_____________</p>
          </div>
          <div>
            <p>М.П.</p>
          </div>
        </div>
      `;
    }
    
    html += `
      <div style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 5px;">
          Печать
        </button>
      </div>
      </body>
      </html>
    `;
    
    w.document.write(html);
    w.document.close();
  }
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
// App.jsx - Part 2/5
// Copy all parts sequentially into one file to use

// UI Components

// Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

// Button Component
const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// NavItem Component
const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
      active
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

// Notification Component
const Notification = ({ message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  };
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg ${colors[type]} max-w-md`}>
      <div className="flex justify-between items-start">
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ currentView, setCurrentView, currentUser, handleLogout, t }) => {
  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: t.checkin || 'Dashboard' },
    { id: 'rooms', icon: '🚪', label: t.rooms || 'Rooms' },
    { id: 'calendar', icon: '📅', label: t.calendar || 'Calendar' },
    { id: 'reports', icon: '📊', label: t.reports || 'Reports' },
    { id: 'debts', icon: '💰', label: t.debts || 'Debts' },
    { id: 'tasks', icon: '✓', label: t.tasks || 'Tasks' },
    { id: 'clients', icon: '👥', label: t.clients || 'Clients' },
    { id: 'staff', icon: '👨‍💼', label: t.staff || 'Staff' },
    { id: 'shifts', icon: '🕐', label: t.shifts || 'Shifts' },
  ];
  
  return (
    <div className="bg-white h-screen w-64 shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Hostel Manager</h1>
        <p className="text-sm text-gray-600 mt-1">{currentUser?.login || 'User'}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <Button variant="danger" onClick={handleLogout} className="w-full">
          {t.logout || 'Logout'}
        </Button>
      </div>
    </div>
  );
};

// Mobile Navigation Component
const MobileNavigation = ({ currentView, setCurrentView, currentUser, handleLogout, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center md:hidden">
        <h1 className="text-xl font-bold text-blue-600">Hostel Manager</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
          ☰
        </button>
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)}>
          <div className="bg-white w-64 h-full shadow-lg" onClick={e => e.stopPropagation()}>
            <Navigation
              currentView={currentView}
              setCurrentView={(view) => { setCurrentView(view); setIsOpen(false); }}
              currentUser={currentUser}
              handleLogout={handleLogout}
              t={t}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin, error }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(login, password);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Hostel Manager</h2>
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Введите пароль"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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
const DashboardStats = ({ guests, rooms, debts }) => {
  const occupied = guests.filter(g => g.status === 'checked_in').length;
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((sum, r) => sum + (r.beds || 0), 0);
  const occupiedBeds = guests.filter(g => g.status === 'checked_in').length;
  const totalDebts = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const stats = [
    { label: 'Занято комнат', value: `${occupied} / ${totalRooms}`, icon: '🚪', color: 'blue' },
    { label: 'Занято мест', value: `${occupiedBeds} / ${totalBeds}`, icon: '🛏️', color: 'green' },
    { label: 'Гостей сейчас', value: occupied, icon: '👥', color: 'purple' },
    { label: 'Общий долг', value: `${totalDebts} сум`, icon: '💰', color: 'red' },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <Card key={idx} className="text-center">
          <div className="text-4xl mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
};

// Charts Section Component
const ChartsSection = ({ guests, expenses }) => {
  // Calculate revenue for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  });
  
  const revenueData = last7Days.map(date => {
    const dayGuests = guests.filter(g => {
      const checkIn = new Date(g.checkInDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      return checkIn === date;
    });
    return dayGuests.reduce((sum, g) => sum + getTotalPaid(g), 0);
  });
  
  const maxRevenue = Math.max(...revenueData, 1);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <h3 className="text-lg font-bold mb-4">Доход за неделю</h3>
        <div className="space-y-2">
          {last7Days.map((day, idx) => (
            <div key={idx} className="flex items-center">
              <div className="w-16 text-sm text-gray-600">{day}</div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-600 rounded-full h-6 flex items-center justify-end pr-2 text-white text-xs font-medium"
                    style={{ width: `${(revenueData[idx] / maxRevenue) * 100}%` }}
                  >
                    {revenueData[idx] > 0 ? `${revenueData[idx]} сум` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-bold mb-4">Расходы</h3>
        <div className="space-y-2">
          {expenses.slice(0, 5).map((expense, idx) => (
            <div key={idx} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">{expense.description}</div>
                <div className="text-xs text-gray-500">{getLocalDateString(expense.date)}</div>
              </div>
              <div className="font-bold text-red-600">{expense.amount} сум</div>
            </div>
          ))}
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
        setTimeLeft('Время вышло!');
        clearInterval(timer);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  return <span className="font-mono font-bold">{timeLeft}</span>;
};

// Room Card Chess Component
const RoomCardChess = ({ room, guests, onRoomClick, onGuestClick }) => {
  const roomGuests = guests.filter(g => g.roomId === room.id && g.status === 'checked_in');
  const isFull = roomGuests.length >= (room.beds || 0);
  
  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        isFull ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
      } hover:shadow-lg`}
      onClick={() => onRoomClick(room)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{room.name || room.id}</h3>
        <span className={`px-2 py-1 rounded text-sm font-medium ${
          isFull ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
        }`}>
          {roomGuests.length} / {room.beds || 0}
        </span>
      </div>
      
      <div className="space-y-1">
        {roomGuests.map(guest => (
          <div
            key={guest.id}
            className="bg-white p-2 rounded text-sm hover:bg-gray-100"
            onClick={(e) => { e.stopPropagation(); onGuestClick(guest); }}
          >
            <div className="font-medium">{guest.fullName}</div>
            <div className="text-xs text-gray-600">
              до {getLocalDateString(guest.checkOutDate)}
            </div>
          </div>
        ))}
      </div>
      
      {!isFull && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Свободно: {(room.beds || 0) - roomGuests.length}
        </div>
      )}
    </div>
  );
};

// ============================================
// End of Part 2/5
// Continue with Part 3/5
// ============================================
// App.jsx - Part 3/5
// Copy all parts sequentially into one file to use

// Modal Components

// Check-In Modal Component
const CheckInModal = ({ isOpen, onClose, onSubmit, rooms, countries, canEdit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    country: '',
    birthDate: '',
    phone: '',
    email: '',
    roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: '',
    pricePerDay: '',
    deposit: 0,
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      fullName: '',
      passport: '',
      country: '',
      birthDate: '',
      phone: '',
      email: '',
      roomId: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: '',
      pricePerDay: '',
      deposit: 0,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Заселение гостя</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ФИО *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
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
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Страна *</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              >
                <option value="">Выберите страну</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Дата рождения</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Комната *</label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              >
                <option value="">Выберите комнату</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.id} ({r.beds} мест)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Цена за день *</label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Дата заселения *</label>
              <input
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Дата выселения *</label>
              <input
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Предоплата</label>
              <input
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canEdit}>
              Заселить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Guest Details Modal Component
const GuestDetailsModal = ({ guest, isOpen, onClose, onUpdate, onCheckout, onPrint, canEdit }) => {
  const [payment, setPayment] = useState('');
  const [note, setNote] = useState('');
  
  if (!isOpen || !guest) return null;
  
  const totalPaid = getTotalPaid(guest);
  const balance = (guest.totalPrice || 0) - totalPaid;
  
  const handleAddPayment = () => {
    if (payment && parseFloat(payment) > 0) {
      onUpdate(guest.id, {
        payments: [...(guest.payments || []), {
          amount: parseFloat(payment),
          date: new Date().toISOString(),
          note: note || 'Оплата',
        }]
      });
      setPayment('');
      setNote('');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Информация о госте</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Guest Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ФИО</p>
              <p className="font-medium">{guest.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Паспорт</p>
              <p className="font-medium">{guest.passport}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Страна</p>
              <p className="font-medium">{guest.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Комната</p>
              <p className="font-medium">{guest.roomId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Заселение</p>
              <p className="font-medium">{getLocalDateString(guest.checkInDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Выселение</p>
              <p className="font-medium">{getLocalDateString(guest.checkOutDate)}</p>
            </div>
          </div>
          
          {/* Financial Info */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Финансы</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Всего</p>
                <p className="text-xl font-bold">{guest.totalPrice} сум</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Оплачено</p>
                <p className="text-xl font-bold text-green-600">{totalPaid} сум</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Баланс</p>
                <p className={`text-xl font-bold ${balance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {balance} сум
                </p>
              </div>
            </div>
          </div>
          
          {/* Add Payment */}
          {guest.status === 'checked_in' && canEdit && (
            <div className="border-t pt-4">
              <h3 className="font-bold mb-2">Добавить оплату</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  placeholder="Сумма"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Примечание"
                  className={inputClass}
                />
                <Button onClick={handleAddPayment}>Добавить</Button>
              </div>
            </div>
          )}
          
          {/* Payment History */}
          {guest.payments && guest.payments.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-bold mb-2">История оплат</h3>
              <div className="space-y-2">
                {guest.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div>
                      <p className="font-medium">{p.amount} сум</p>
                      <p className="text-xs text-gray-600">{p.note || 'Оплата'}</p>
                    </div>
                    <p className="text-sm text-gray-600">{getLocalDateString(p.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 justify-end border-t pt-4">
            <Button variant="secondary" onClick={() => onPrint('check', guest)}>
              Чек
            </Button>
            <Button variant="secondary" onClick={() => onPrint('regcard', guest)}>
              Анкета
            </Button>
            <Button variant="secondary" onClick={() => onPrint('ref', guest)}>
              Справка
            </Button>
            {guest.status === 'checked_in' && (
              <Button 
                variant="danger" 
                onClick={() => onCheckout(guest.id)}
                disabled={!canEdit}
              >
                Выселить
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Move Guest Modal Component
const MoveGuestModal = ({ guest, isOpen, onClose, onMove, rooms, canEdit }) => {
  const [newRoomId, setNewRoomId] = useState('');
  
  if (!isOpen || !guest) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onMove(guest.id, newRoomId);
    setNewRoomId('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Переместить гостя</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="mb-2"><strong>Гость:</strong> {guest.fullName}</p>
            <p className="mb-4"><strong>Текущая комната:</strong> {guest.roomId}</p>
          </div>
          
          <div>
            <label className={labelClass}>Новая комната *</label>
            <select
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
              className={inputClass}
              required
              disabled={!canEdit}
            >
              <option value="">Выберите комнату</option>
              {rooms.filter(r => r.id !== guest.roomId).map(r => (
                <option key={r.id} value={r.id}>
                  {r.name || r.id} ({r.beds} мест)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canEdit}>
              Переместить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Expense Modal Component
const ExpenseModal = ({ isOpen, onClose, onSubmit, canEdit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      description: '',
      amount: '',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Добавить расход</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Описание *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={inputClass}
              required
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Сумма *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className={inputClass}
              required
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={inputClass}
              disabled={!canEdit}
            >
              <option value="utilities">Коммунальные услуги</option>
              <option value="supplies">Расходные материалы</option>
              <option value="maintenance">Ремонт и обслуживание</option>
              <option value="salary">Зарплата</option>
              <option value="other">Прочее</option>
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Дата</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canEdit}>
              Добавить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Room Form Modal Component
const RoomFormModal = ({ isOpen, onClose, onSubmit, room, canEdit }) => {
  const [formData, setFormData] = useState({
    name: room?.name || '',
    beds: room?.beds || 1,
    pricePerDay: room?.pricePerDay || '',
    floor: room?.floor || 1,
  });
  
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        beds: room.beds || 1,
        pricePerDay: room.pricePerDay || '',
        floor: room.floor || 1,
      });
    }
  }, [room]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{room ? 'Редактировать комнату' : 'Добавить комнату'}</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Название *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={inputClass}
              required
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Количество мест *</label>
            <input
              type="number"
              value={formData.beds}
              onChange={(e) => setFormData({...formData, beds: parseInt(e.target.value)})}
              className={inputClass}
              min="1"
              required
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Цена за день</label>
            <input
              type="number"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Этаж</label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canEdit}>
              {room ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Shift Closing Modal Component
const ShiftClosingModal = ({ isOpen, onClose, onSubmit, currentShift }) => {
  const [notes, setNotes] = useState('');
  
  if (!isOpen || !currentShift) return null;
  
  const handleSubmit = () => {
    onSubmit(notes);
    setNotes('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Закрыть смену</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <p><strong>Заработано:</strong> {currentShift.totalEarned || 0} сум</p>
            <p><strong>Начало смены:</strong> {getLocalDateString(currentShift.startTime)}</p>
          </div>
          
          <div>
            <label className={labelClass}>Примечания</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              rows="4"
              placeholder="Добавьте примечания к смене..."
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button variant="danger" onClick={handleSubmit}>
              Закрыть смену
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shift Block Screen Component
const ShiftBlockScreen = ({ message }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold mb-4">Смена заблокирована</h2>
        <p className="text-gray-700">{message}</p>
      </Card>
    </div>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    onSubmit(oldPassword, newPassword);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Сменить пароль</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Старый пароль *</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Новый пароль *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Подтвердите пароль *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              Сменить пароль
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Client Import Modal Component
const ClientImportModal = ({ isOpen, onClose, onImport }) => {
  const [csvData, setCsvData] = useState('');
  
  if (!isOpen) return null;
  
  const handleImport = () => {
    onImport(csvData);
    setCsvData('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Импорт клиентов</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Вставьте CSV данные (формат: имя,паспорт,страна,телефон,email)
            </p>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className={inputClass}
              rows="10"
              placeholder="John Doe,AB123456,USA,+1234567890,john@example.com&#10;Jane Smith,CD789012,UK,+9876543210,jane@example.com"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleImport}>
              Импортировать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Client Edit Modal Component
const ClientEditModal = ({ isOpen, onClose, onSubmit, client, countries }) => {
  const [formData, setFormData] = useState(client || {});
  
  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Редактировать клиента</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ФИО *</label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Паспорт *</label>
              <input
                type="text"
                value={formData.passport || ''}
                onChange={(e) => setFormData({...formData, passport: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Страна</label>
              <select
                value={formData.country || ''}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className={inputClass}
              >
                <option value="">Выберите страну</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Телефон</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={inputClass}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              Сохранить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Debt Modal Component
const CreateDebtModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    reason: '',
    dueDate: '',
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      clientName: '',
      amount: '',
      reason: '',
      dueDate: '',
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Добавить долг</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Клиент *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Сумма *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Причина</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Срок погашения</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// End of Part 3/5
// Continue with Part 4/5
// ============================================
// App.jsx - Part 4/5
// Copy all parts sequentially into one file to use

// View Components

// Calendar View Component - FIXED visualization for checked out guests
const CalendarView = ({ guests, rooms }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
  
  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };
  
  // Get guest block style with FIXED visualization
  const getGuestBlockStyle = (guest) => {
    const checkIn = new Date(guest.checkInDate);
    const checkOut = new Date(guest.checkOutDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // FIXED: For checked_out guests, use checkOutDate from DB, not today's date
    const endDate = guest.status === 'checked_out' 
      ? checkOut 
      : (checkOut < now ? checkOut : now);
    
    const start = Math.max(checkIn, monthStart);
    const end = Math.min(endDate, monthEnd);
    
    if (start > monthEnd || end < monthStart) {
      return null;
    }
    
    const startDay = Math.max(0, Math.floor((start - monthStart) / (1000 * 60 * 60 * 24)));
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate paid and unpaid days with color coding
    const totalPaid = getTotalPaid(guest);
    const totalPrice = guest.totalPrice || 0;
    const pricePerDay = guest.pricePerDay || 0;
    const totalDays = guest.days || 0;
    
    // Calculate paid ratio
    const paidRatio = pricePerDay > 0 ? Math.min(totalPaid / totalPrice, 1) : 0;
    const paidDays = Math.floor(totalDays * paidRatio);
    
    return {
      left: `${(startDay / 31) * 100}%`,
      width: `${(duration / 31) * 100}%`,
      paidRatio: paidRatio,
      status: guest.status,
    };
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={prevMonth}>← Предыдущий</Button>
          <h2 className="text-2xl font-bold">
            {selectedMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
          <Button onClick={nextMonth}>Следующий →</Button>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days header */}
            <div className="flex border-b pb-2 mb-2">
              {Array.from({ length: 31 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-gray-600">
                  {i + 1}
                </div>
              ))}
            </div>
            
            {/* Guest rows */}
            <div className="space-y-1">
              {guests
                .filter(g => {
                  const checkIn = new Date(g.checkInDate);
                  const checkOut = new Date(g.checkOutDate);
                  return checkIn <= monthEnd && checkOut >= monthStart;
                })
                .map(guest => {
                  const style = getGuestBlockStyle(guest);
                  if (!style) return null;
                  
                  return (
                    <div key={guest.id} className="relative h-8 border-b">
                      <div className="absolute inset-y-0 flex items-center text-xs">
                        <div
                          className="relative h-6 rounded flex items-center overflow-hidden"
                          style={{
                            left: style.left,
                            width: style.width,
                          }}
                        >
                          {/* Paid portion (green) */}
                          <div
                            className="h-full bg-green-500 flex items-center px-2"
                            style={{ width: `${style.paidRatio * 100}%` }}
                          />
                          {/* Unpaid portion (red) */}
                          <div
                            className="h-full bg-red-500 flex items-center px-2"
                            style={{ width: `${(1 - style.paidRatio) * 100}%` }}
                          />
                          {/* Guest name overlay */}
                          <div className="absolute inset-0 flex items-center px-2 text-white font-medium text-xs truncate">
                            {guest.fullName} ({guest.roomId})
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Оплаченные дни</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Неоплаченные дни</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Staff View Component
const StaffView = ({ staff, shifts, onAddStaff, onEditStaff, onDeleteStaff, canEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Сотрудники</h2>
          <Button onClick={() => { setEditingStaff(null); setShowModal(true); }} disabled={!canEdit}>
            + Добавить сотрудника
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(s => {
            const salaryInfo = calculateSalary(shifts, s);
            return (
              <Card key={s.id} className="bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    <p className="text-sm text-gray-600">{s.position || 'Сотрудник'}</p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingStaff(s); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onDeleteStaff(s.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 text-sm">
                  <p><strong>Процент:</strong> {s.salaryPercent || 0}%</p>
                  <p><strong>Заработано:</strong> {salaryInfo.totalEarned} сум</p>
                  <p><strong>Зарплата:</strong> {salaryInfo.salary} сум</p>
                  <p><strong>Смен:</strong> {salaryInfo.shiftsCount}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// Clients View Component - WITH PAGINATION AND FILTERS
const ClientsView = ({ clients, onEditClient, onDeleteClient, onViewHistory, canEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get unique countries for filter
  const uniqueCountries = useMemo(() => {
    const countries = clients.map(c => c.country).filter(Boolean);
    return [...new Set(countries)].sort();
  }, [clients]);
  
  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = !searchTerm || 
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.passport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm);
      
      const matchesCountry = !countryFilter || c.country === countryFilter;
      
      return matchesSearch && matchesCountry;
    });
  }, [clients, searchTerm, countryFilter]);
  
  // Paginate clients
  const paginatedClients = useMemo(() => {
    const startIdx = (currentPage - 1) * perPage;
    const endIdx = startIdx + perPage;
    return filteredClients.slice(startIdx, endIdx);
  }, [filteredClients, currentPage, perPage]);
  
  const totalPages = Math.ceil(filteredClients.length / perPage);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, countryFilter, perPage]);
  
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Клиенты</h2>
        
        {/* Filters and Pagination Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по имени, паспорту, телефону..."
            className={inputClass + " flex-1 min-w-[200px]"}
          />
          
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className={inputClass + " w-40"}
          >
            <option value="">Все страны</option>
            {uniqueCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className={inputClass + " w-24"}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Показано: {paginatedClients.length} из {filteredClients.length}
          </div>
        </div>
        
        {/* Clients Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">ФИО</th>
                <th className="border p-2 text-left">Паспорт</th>
                <th className="border p-2 text-left">Страна</th>
                <th className="border p-2 text-left">Телефон</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="border p-2">{client.fullName}</td>
                  <td className="border p-2">{client.passport}</td>
                  <td className="border p-2">{client.country}</td>
                  <td className="border p-2">{client.phone}</td>
                  <td className="border p-2">{client.email}</td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewHistory(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        📋
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onEditClient(client)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => onDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="secondary"
            >
              ← Назад
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="secondary"
            >
              Вперёд →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

// Task Manager Component
const TaskManager = ({ tasks, onAddTask, onToggleTask, onDeleteTask, canEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(newTask);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowModal(false);
  };
  
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Задачи</h2>
          <Button onClick={() => setShowModal(true)} disabled={!canEdit}>
            + Добавить задачу
          </Button>
        </div>
        
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`border rounded-lg p-4 ${task.completed ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="mt-1"
                  disabled={!canEdit}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
                      {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getLocalDateString(task.createdAt)}
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Добавить задачу</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Название *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className={inputClass}
                  required
                />
              </div>
              
              <div>
                <label className={labelClass}>Описание</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className={inputClass}
                  rows="3"
                />
              </div>
              
              <div>
                <label className={labelClass}>Приоритет</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className={inputClass}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Отмена
                </Button>
                <Button type="submit">
                  Добавить
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Debts View Component
const DebtsView = ({ debts, onPayDebt, onDeleteDebt, canEdit }) => {
  const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Долги</h2>
          <div className="text-xl font-bold text-red-600">
            Общий долг: {totalDebt} сум
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Клиент</th>
                <th className="border p-2 text-left">Сумма</th>
                <th className="border p-2 text-left">Причина</th>
                <th className="border p-2 text-left">Дата</th>
                <th className="border p-2 text-left">Срок</th>
                <th className="border p-2 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(debt => (
                <tr key={debt.id} className="hover:bg-gray-50">
                  <td className="border p-2">{debt.clientName}</td>
                  <td className="border p-2 font-bold text-red-600">{debt.amount} сум</td>
                  <td className="border p-2">{debt.reason}</td>
                  <td className="border p-2">{getLocalDateString(debt.date)}</td>
                  <td className="border p-2">
                    {debt.dueDate ? getLocalDateString(debt.dueDate) : '-'}
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      {canEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => onPayDebt(debt.id)}
                          >
                            Оплачено
                          </Button>
                          <button
                            onClick={() => onDeleteDebt(debt.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </>
                      )}
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
const ReportsView = ({ guests, expenses, rooms }) => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const filteredGuests = guests.filter(g => {
    const checkIn = new Date(g.checkInDate);
    return checkIn >= new Date(startDate) && checkIn <= new Date(endDate);
  });
  
  const filteredExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
  });
  
  const totalRevenue = filteredGuests.reduce((sum, g) => sum + getTotalPaid(g), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const handleExport = () => {
    // Создаем данные для доходов (гости)
    const incomeData = filteredGuests.map(g => ({
      'Тип': 'ДОХОД',
      'Дата': getLocalDateString(g.checkInDate),
      'Описание': `${g.fullName} - Проживание (${g.days} дн.)`,
      'Детали': `Паспорт: ${g.passport}, Страна: ${g.country}, Комната: ${g.roomId}`,
      'Сумма': getTotalPaid(g),
      'Способ оплаты': `Нал: ${g.cashPaid || 0}, Карта: ${g.cardPaid || 0}, QR: ${g.qrPaid || 0}`,
    }));
    
    // Создаем данные для расходов
    const expenseData = filteredExpenses.map(e => ({
      'Тип': 'РАСХОД',
      'Дата': getLocalDateString(e.date),
      'Описание': e.description || 'Без описания',
      'Детали': e.category || '-',
      'Сумма': e.amount || 0,
      'Способ оплаты': e.paymentMethod || '-',
    }));
    
    // Объединяем доходы и расходы
    const allData = [...incomeData, ...expenseData];
    
    // Сортируем по дате
    allData.sort((a, b) => {
      const dateA = new Date(a['Дата'].split('.').reverse().join('-'));
      const dateB = new Date(b['Дата'].split('.').reverse().join('-'));
      return dateA - dateB;
    });
    
    // Добавляем итоговые строки
    allData.push({
      'Тип': '',
      'Дата': '',
      'Описание': '',
      'Детали': '',
      'Сумма': '',
      'Способ оплаты': '',
    });
    
    allData.push({
      'Тип': 'ИТОГО',
      'Дата': '',
      'Описание': 'Доходы:',
      'Детали': '',
      'Сумма': totalRevenue,
      'Способ оплаты': '',
    });
    
    allData.push({
      'Тип': 'ИТОГО',
      'Дата': '',
      'Описание': 'Расходы:',
      'Детали': '',
      'Сумма': totalExpenses,
      'Способ оплаты': '',
    });
    
    allData.push({
      'Тип': 'ИТОГО',
      'Дата': '',
      'Описание': 'Чистая прибыль:',
      'Детали': '',
      'Сумма': netProfit,
      'Способ оплаты': '',
    });
    
    exportToExcel(
      allData,
      `Report_${startDate}_${endDate}`,
      ['Тип', 'Дата', 'Описание', 'Детали', 'Сумма', 'Способ оплаты']
    );
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Отчёты</h2>
        
        <div className="flex gap-4 mb-6">
          <div>
            <label className={labelClass}>От</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>До</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleExport}>
              📊 Экспорт в Excel
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50">
            <h3 className="text-sm text-gray-600">Доход</h3>
            <p className="text-2xl font-bold text-green-600">{totalRevenue} сум</p>
          </Card>
          <Card className="bg-red-50">
            <h3 className="text-sm text-gray-600">Расходы</h3>
            <p className="text-2xl font-bold text-red-600">{totalExpenses} сум</p>
          </Card>
          <Card className="bg-blue-50">
            <h3 className="text-sm text-gray-600">Чистая прибыль</h3>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {netProfit} сум
            </p>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2">Гости ({filteredGuests.length})</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100">
                    <th className="border p-1">ФИО</th>
                    <th className="border p-1">Оплачено</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map(g => (
                    <tr key={g.id}>
                      <td className="border p-1">{g.fullName}</td>
                      <td className="border p-1">{getTotalPaid(g)} сум</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Расходы ({filteredExpenses.length})</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100">
                    <th className="border p-1">Описание</th>
                    <th className="border p-1">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="border p-1">{e.description}</td>
                      <td className="border p-1">{e.amount} сум</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Shifts View Component
const ShiftsView = ({ shifts, staff }) => {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Смены</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Сотрудник</th>
                <th className="border p-2 text-left">Начало</th>
                <th className="border p-2 text-left">Конец</th>
                <th className="border p-2 text-left">Заработано</th>
                <th className="border p-2 text-left">Статус</th>
                <th className="border p-2 text-left">Примечания</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map(shift => {
                const staffMember = staff.find(s => s.id === shift.staffId);
                return (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="border p-2">{staffMember?.name || 'N/A'}</td>
                    <td className="border p-2">{getLocalDateString(shift.startTime)}</td>
                    <td className="border p-2">
                      {shift.endTime ? getLocalDateString(shift.endTime) : 'Активна'}
                    </td>
                    <td className="border p-2 font-bold">{shift.totalEarned || 0} сум</td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        shift.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shift.status === 'active' ? 'Активна' : 'Закрыта'}
                      </span>
                    </td>
                    <td className="border p-2">{shift.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Client History Modal Component
const ClientHistoryModal = ({ client, isOpen, onClose, guests }) => {
  if (!isOpen || !client) return null;
  
  const clientHistory = guests.filter(g => 
    g.passport === client.passport || g.fullName === client.fullName
  );
  
  const totalStays = clientHistory.length;
  const totalSpent = clientHistory.reduce((sum, g) => sum + getTotalPaid(g), 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">История клиента</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ФИО</p>
              <p className="font-medium">{client.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Паспорт</p>
              <p className="font-medium">{client.passport}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Страна</p>
              <p className="font-medium">{client.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Телефон</p>
              <p className="font-medium">{client.phone || '-'}</p>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <Card className="bg-blue-50">
              <h3 className="text-sm text-gray-600">Всего проживаний</h3>
              <p className="text-2xl font-bold text-blue-600">{totalStays}</p>
            </Card>
            <Card className="bg-green-50">
              <h3 className="text-sm text-gray-600">Всего потрачено</h3>
              <p className="text-2xl font-bold text-green-600">{totalSpent} сум</p>
            </Card>
          </div>
          
          {/* History Table */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">История проживаний</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Комната</th>
                    <th className="border p-2 text-left">Заселение</th>
                    <th className="border p-2 text-left">Выселение</th>
                    <th className="border p-2 text-left">Дней</th>
                    <th className="border p-2 text-left">Цена</th>
                    <th className="border p-2 text-left">Оплачено</th>
                    <th className="border p-2 text-left">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {clientHistory.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="border p-2">{g.roomId}</td>
                      <td className="border p-2">{getLocalDateString(g.checkInDate)}</td>
                      <td className="border p-2">{getLocalDateString(g.checkOutDate)}</td>
                      <td className="border p-2">{g.days}</td>
                      <td className="border p-2">{g.totalPrice} сум</td>
                      <td className="border p-2">{getTotalPaid(g)} сум</td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          g.status === 'checked_in' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {g.status === 'checked_in' ? 'Проживает' : 'Выселен'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// End of Part 4/5
// Continue with Part 5/5
// ============================================
// App.jsx - Part 5/5
// Copy all parts sequentially into one file to use

// Main App Component
function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // View State
  const [currentView, setCurrentView] = useState('dashboard');
  const [language, setLanguage] = useState('ru');
  const [notification, setNotification] = useState(null);
  
  // Data State
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  
  // Modal State
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showClientHistory, setShowClientHistory] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientEditModal, setShowClientEditModal] = useState(false);
  
  // Hostel Filter State - for Fazliddin special permissions
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('all');
  
  // Translation helper
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  
  // Determine if current user can edit - FAZLIDDIN SPECIAL PERMISSIONS
  const canEdit = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.login === 'fazliddin') {
      // Fazliddin can only edit in hostel2, read-only in hostel1
      return selectedHostelFilter === 'hostel2';
    }
    return currentUser.role === 'cashier';
  }, [currentUser, selectedHostelFilter]);
  
  // Initialize Firebase and load data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Load user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ ...userDoc.data(), uid: user.uid });
        }
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Load all data when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        // Load guests
        const guestsQuery = query(collection(db, 'guests'), orderBy('checkInDate', 'desc'));
        const guestsSnap = await getDocs(guestsQuery);
        setGuests(guestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load rooms
        const roomsSnap = await getDocs(collection(db, 'rooms'));
        setRooms(roomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load expenses
        const expensesSnap = await getDocs(collection(db, 'expenses'));
        setExpenses(expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load debts
        const debtsSnap = await getDocs(collection(db, 'debts'));
        setDebts(debtsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load tasks
        const tasksSnap = await getDocs(collection(db, 'tasks'));
        setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load clients
        const clientsSnap = await getDocs(collection(db, 'clients'));
        setClients(clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load staff
        const staffSnap = await getDocs(collection(db, 'staff'));
        setStaff(staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load shifts
        const shiftsSnap = await getDocs(collection(db, 'shifts'));
        setShifts(shiftsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Ошибка загрузки данных', 'error');
      }
    };
    
    loadData();
  }, [currentUser]);
  
  // Notification helper
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };
  
  // Login handler
  const handleLogin = async (login, password) => {
    try {
      // Check default users
      const defaultUser = DEFAULT_USERS.find(u => u.login === login && u.password === password);
      if (defaultUser) {
        // Create a mock auth for default users
        setCurrentUser(defaultUser);
        setLoginError('');
        showNotification('Вход выполнен успешно', 'success');
        return;
      }
      
      // Try Firebase authentication
      await signInWithEmailAndPassword(auth, login, password);
      setLoginError('');
    } catch (error) {
      setLoginError('Неверный логин или пароль');
    }
  };
  
  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Check-in handler
  const handleCheckIn = async (formData) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const totalPrice = days * parseFloat(formData.pricePerDay);
      
      // Check for collision
      if (checkCollision(formData.roomId, checkIn, checkOut, guests)) {
        showNotification('Комната уже занята в этот период!', 'error');
        return;
      }
      
      const guestData = {
        ...formData,
        days,
        totalPrice,
        status: 'checked_in',
        payments: formData.deposit > 0 ? [{
          amount: parseFloat(formData.deposit),
          date: new Date().toISOString(),
          note: 'Предоплата при заселении',
        }] : [],
        hostel: selectedHostelFilter !== 'all' ? selectedHostelFilter : 'hostel1',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.login,
      };
      
      const docRef = doc(collection(db, 'guests'));
      await setDoc(docRef, guestData);
      
      setGuests([...guests, { id: docRef.id, ...guestData }]);
      
      // Save to clients if not exists
      const existingClient = clients.find(c => c.passport === formData.passport);
      if (!existingClient) {
        const clientData = {
          fullName: formData.fullName,
          passport: formData.passport,
          country: getNormalizedCountry(formData.country),
          phone: formData.phone,
          email: formData.email,
          birthDate: formData.birthDate,
        };
        const clientRef = doc(collection(db, 'clients'));
        await setDoc(clientRef, clientData);
        setClients([...clients, { id: clientRef.id, ...clientData }]);
      }
      
      setShowCheckInModal(false);
      showNotification('Гость успешно заселен', 'success');
      
      // Send Telegram notification
      await sendTelegramMessage(
        `✅ <b>Заселение</b>\n` +
        `Гость: ${formData.fullName}\n` +
        `Комната: ${formData.roomId}\n` +
        `Период: ${getLocalDateString(checkIn)} - ${getLocalDateString(checkOut)}\n` +
        `Сумма: ${totalPrice} сум`
      );
    } catch (error) {
      console.error('Check-in error:', error);
      showNotification('Ошибка при заселении', 'error');
    }
  };
  
  // Checkout handler - FIXED: Allow checkout for balance >= 0
  const handleCheckOut = async (guestId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const guest = guests.find(g => g.id === guestId);
      if (!guest) return;
      
      const totalPaid = getTotalPaid(guest);
      const balance = (guest.totalPrice || 0) - totalPaid;
      
      // FIXED: Removed the balance < 0 check
      // Now allows checkout even if balance >= 0
      
      const checkOutData = {
        status: 'checked_out',
        checkOutDate: new Date().toISOString(),
        actualCheckOutDate: new Date().toISOString(),
      };
      
      await updateDoc(doc(db, 'guests', guestId), checkOutData);
      
      setGuests(guests.map(g => g.id === guestId ? { ...g, ...checkOutData } : g));
      setShowGuestDetails(false);
      showNotification('Гость успешно выселен', 'success');
      
      // Send Telegram notification
      await sendTelegramMessage(
        `🚪 <b>Выселение</b>\n` +
        `Гость: ${guest.fullName}\n` +
        `Комната: ${guest.roomId}\n` +
        `Оплачено: ${totalPaid} / ${guest.totalPrice} сум\n` +
        `Баланс: ${balance} сум`
      );
    } catch (error) {
      console.error('Checkout error:', error);
      showNotification('Ошибка при выселении', 'error');
    }
  };
  
  // Update guest handler
  const handleUpdateGuest = async (guestId, updates) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'guests', guestId), updates);
      setGuests(guests.map(g => g.id === guestId ? { ...g, ...updates } : g));
      
      if (selectedGuest?.id === guestId) {
        setSelectedGuest({ ...selectedGuest, ...updates });
      }
      
      showNotification('Данные обновлены', 'success');
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Ошибка при обновлении', 'error');
    }
  };
  
  // Move guest handler
  const handleMoveGuest = async (guestId, newRoomId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const guest = guests.find(g => g.id === guestId);
      if (checkCollision(newRoomId, guest.checkInDate, guest.checkOutDate, guests, guestId)) {
        showNotification('Комната уже занята в этот период!', 'error');
        return;
      }
      
      await updateDoc(doc(db, 'guests', guestId), { roomId: newRoomId });
      setGuests(guests.map(g => g.id === guestId ? { ...g, roomId: newRoomId } : g));
      setShowMoveModal(false);
      showNotification('Гость перемещен', 'success');
    } catch (error) {
      console.error('Move error:', error);
      showNotification('Ошибка при перемещении', 'error');
    }
  };
  
  // Add expense handler
  const handleAddExpense = async (formData) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.login,
        hostel: selectedHostelFilter !== 'all' ? selectedHostelFilter : 'hostel1',
      };
      
      const docRef = doc(collection(db, 'expenses'));
      await setDoc(docRef, expenseData);
      
      setExpenses([...expenses, { id: docRef.id, ...expenseData }]);
      setShowExpenseModal(false);
      showNotification('Расход добавлен', 'success');
    } catch (error) {
      console.error('Expense error:', error);
      showNotification('Ошибка при добавлении расхода', 'error');
    }
  };
  
  // Task handlers
  const handleAddTask = async (taskData) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const task = {
        ...taskData,
        completed: false,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.login,
      };
      
      const docRef = doc(collection(db, 'tasks'));
      await setDoc(docRef, task);
      
      setTasks([...tasks, { id: docRef.id, ...task }]);
      showNotification('Задача добавлена', 'success');
    } catch (error) {
      console.error('Task error:', error);
      showNotification('Ошибка при добавлении задачи', 'error');
    }
  };
  
  const handleToggleTask = async (taskId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const task = tasks.find(t => t.id === taskId);
      const updates = { completed: !task.completed };
      
      await updateDoc(doc(db, 'tasks', taskId), updates);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Toggle task error:', error);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter(t => t.id !== taskId));
      showNotification('Задача удалена', 'success');
    } catch (error) {
      console.error('Delete task error:', error);
      showNotification('Ошибка при удалении задачи', 'error');
    }
  };
  
  // Debt handlers
  const handlePayDebt = async (debtId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'debts', debtId));
      setDebts(debts.filter(d => d.id !== debtId));
      showNotification('Долг оплачен', 'success');
    } catch (error) {
      console.error('Pay debt error:', error);
      showNotification('Ошибка при оплате долга', 'error');
    }
  };
  
  const handleDeleteDebt = async (debtId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'debts', debtId));
      setDebts(debts.filter(d => d.id !== debtId));
      showNotification('Долг удален', 'success');
    } catch (error) {
      console.error('Delete debt error:', error);
      showNotification('Ошибка при удалении долга', 'error');
    }
  };
  
  // Client handlers
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowClientEditModal(true);
  };
  
  const handleUpdateClient = async (clientData) => {
    try {
      await updateDoc(doc(db, 'clients', clientData.id), clientData);
      setClients(clients.map(c => c.id === clientData.id ? clientData : c));
      setShowClientEditModal(false);
      showNotification('Клиент обновлен', 'success');
    } catch (error) {
      console.error('Update client error:', error);
      showNotification('Ошибка при обновлении клиента', 'error');
    }
  };
  
  const handleDeleteClient = async (clientId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'clients', clientId));
      setClients(clients.filter(c => c.id !== clientId));
      showNotification('Клиент удален', 'success');
    } catch (error) {
      console.error('Delete client error:', error);
      showNotification('Ошибка при удалении клиента', 'error');
    }
  };
  
  const handleViewHistory = (client) => {
    setSelectedClient(client);
    setShowClientHistory(true);
  };
  
  // Print handler - FIXED
  const handlePrint = (type, guest) => {
    const hostel = HOSTELS.find(h => h.id === guest.hostel) || HOSTELS[0];
    printDocument(type, guest, hostel);
  };
  
  // Filter data based on selected hostel for Fazliddin
  const filteredGuests = useMemo(() => {
    if (currentUser?.login === 'fazliddin' && selectedHostelFilter !== 'all') {
      return guests.filter(g => g.hostel === selectedHostelFilter);
    }
    return guests;
  }, [guests, currentUser, selectedHostelFilter]);
  
  const filteredRooms = useMemo(() => {
    if (currentUser?.login === 'fazliddin' && selectedHostelFilter !== 'all') {
      return rooms.filter(r => r.hostel === selectedHostelFilter);
    }
    return rooms;
  }, [rooms, currentUser, selectedHostelFilter]);
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold">Загрузка...</div>
      </div>
    );
  }
  
  // Login screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }
  
  // Main application
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUser={currentUser}
          handleLogout={handleLogout}
          t={t}
        />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        handleLogout={handleLogout}
        t={t}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Fazliddin Hostel Selector */}
          {currentUser.login === 'fazliddin' && (
            <div className="mb-4">
              <Card>
                <div className="flex gap-2 items-center">
                  <span className="font-medium">Хостел:</span>
                  <select
                    value={selectedHostelFilter}
                    onChange={(e) => setSelectedHostelFilter(e.target.value)}
                    className={inputClass + " w-48"}
                  >
                    <option value="all">Все хостелы</option>
                    <option value="hostel1">Hostel №1 (только чтение)</option>
                    <option value="hostel2">Hostel №2 (полный доступ)</option>
                  </select>
                  {selectedHostelFilter === 'hostel1' && (
                    <span className="text-sm text-red-600">
                      ⚠️ Режим только для чтения
                    </span>
                  )}
                </div>
              </Card>
            </div>
          )}
          
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
              <DashboardStats guests={filteredGuests} rooms={filteredRooms} debts={debts} />
              <ChartsSection guests={filteredGuests} expenses={expenses} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-xl font-bold mb-4">Текущие гости</h2>
                  <div className="space-y-2">
                    {filteredGuests
                      .filter(g => g.status === 'checked_in')
                      .slice(0, 5)
                      .map(guest => (
                        <div
                          key={guest.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => { setSelectedGuest(guest); setShowGuestDetails(true); }}
                        >
                          <div>
                            <div className="font-medium">{guest.fullName}</div>
                            <div className="text-sm text-gray-600">
                              {guest.roomId} • до {getLocalDateString(guest.checkOutDate)}
                            </div>
                          </div>
                          <div className="text-sm">
                            {getTotalPaid(guest)} / {guest.totalPrice} сум
                          </div>
                        </div>
                      ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => setShowCheckInModal(true)}
                    disabled={!canEdit}
                  >
                    + Заселить гостя
                  </Button>
                </Card>
                
                <Card>
                  <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => setShowExpenseModal(true)}
                      variant="secondary"
                      disabled={!canEdit}
                    >
                      💰 Добавить расход
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => setCurrentView('tasks')}
                      variant="secondary"
                    >
                      ✓ Задачи ({tasks.filter(t => !t.completed).length})
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => setCurrentView('debts')}
                      variant="secondary"
                    >
                      💳 Долги ({debts.length})
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
          
          {/* Rooms View */}
          {currentView === 'rooms' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Комнаты</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map(room => (
                  <RoomCardChess
                    key={room.id}
                    room={room}
                    guests={filteredGuests}
                    onRoomClick={(r) => { setSelectedRoom(r); setShowRoomModal(true); }}
                    onGuestClick={(g) => { setSelectedGuest(g); setShowGuestDetails(true); }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Calendar View */}
          {currentView === 'calendar' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Календарь</h1>
              <CalendarView guests={filteredGuests} rooms={filteredRooms} />
            </div>
          )}
          
          {/* Reports View */}
          {currentView === 'reports' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Отчёты</h1>
              <ReportsView guests={filteredGuests} expenses={expenses} rooms={filteredRooms} />
            </div>
          )}
          
          {/* Debts View */}
          {currentView === 'debts' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Долги</h1>
              <DebtsView
                debts={debts}
                onPayDebt={handlePayDebt}
                onDeleteDebt={handleDeleteDebt}
                canEdit={canEdit}
              />
            </div>
          )}
          
          {/* Tasks View */}
          {currentView === 'tasks' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Задачи</h1>
              <TaskManager
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                canEdit={canEdit}
              />
            </div>
          )}
          
          {/* Clients View */}
          {currentView === 'clients' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Клиенты</h1>
              <ClientsView
                clients={clients}
                onEditClient={handleEditClient}
                onDeleteClient={handleDeleteClient}
                onViewHistory={handleViewHistory}
                canEdit={canEdit}
              />
            </div>
          )}
          
          {/* Staff View */}
          {currentView === 'staff' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Сотрудники</h1>
              <StaffView
                staff={staff}
                shifts={shifts}
                onAddStaff={() => {}}
                onEditStaff={() => {}}
                onDeleteStaff={() => {}}
                canEdit={canEdit}
              />
            </div>
          )}
          
          {/* Shifts View */}
          {currentView === 'shifts' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Смены</h1>
              <ShiftsView shifts={shifts} staff={staff} />
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSubmit={handleCheckIn}
        rooms={filteredRooms}
        countries={COUNTRIES}
        canEdit={canEdit}
      />
      
      <GuestDetailsModal
        guest={selectedGuest}
        isOpen={showGuestDetails}
        onClose={() => { setShowGuestDetails(false); setSelectedGuest(null); }}
        onUpdate={handleUpdateGuest}
        onCheckout={handleCheckOut}
        onPrint={handlePrint}
        canEdit={canEdit}
      />
      
      <MoveGuestModal
        guest={selectedGuest}
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={handleMoveGuest}
        rooms={filteredRooms}
        canEdit={canEdit}
      />
      
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleAddExpense}
        canEdit={canEdit}
      />
      
      <ClientHistoryModal
        client={selectedClient}
        isOpen={showClientHistory}
        onClose={() => { setShowClientHistory(false); setSelectedClient(null); }}
        guests={guests}
      />
      
      <ClientEditModal
        isOpen={showClientEditModal}
        onClose={() => { setShowClientEditModal(false); setSelectedClient(null); }}
        onSubmit={handleUpdateClient}
        client={selectedClient}
        countries={COUNTRIES}
      />
      
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
// All parts complete!
// ============================================
