# App.jsx - Split into 5 Parts

This repository contains App.jsx split into 5 separate files for easy editing and maintenance.

## 📁 Files Overview

### Part 1: `App_Part1.jsx` (574 lines)
**Contains:**
- All imports (React, Firebase, Lucide icons)
- Styles (inputClass, labelClass)
- Translations (TRANSLATIONS for ru/uz)
- Telegram configuration (TG_BOT_TOKEN, sendTelegramMessage)
- Firebase configuration (firebaseConfig, app, auth, db, functions)
- Constants (APP_ID, PUBLIC_DATA_PATH, DAILY_SALARY, DEFAULT_USERS, COUNTRY_MAP, COUNTRIES, HOSTELS)
- Utility functions (getTotalPaid, pluralize, getLocalDateString, getLocalDatetimeString, getStayDetails, checkCollision, calculateSalary, getNormalizedCountry)
- **✅ FIXED** export/print functions (exportToExcel, printDocument, printDebts, printReport)

### Part 2: `App_Part2.jsx` (405 lines)
**Contains:**
- Card component
- Button component
- NavItem component
- Notification component
- MobileNavigation component
- Navigation component
- LoginScreen component
- DashboardStats component
- ChartsSection component
- CountdownTimer component
- **✅ FIXED** RoomCardChess component (correct guest display logic)

### Part 3: `App_Part3.jsx` (1023 lines)
**Contains:**
- ChangePasswordModal component
- CreateDebtModal component
- ClientImportModal component
- ClientEditModal component
- CheckInModal component (with AI passport scanning)
- **✅ FIXED** GuestDetailsModal component (checkout without balance blocking)
- MoveGuestModal component
- ExpenseModal component
- RoomFormModal component
- ShiftClosingModal component
- ShiftBlockScreen component

### Part 4: `App_Part4.jsx` (1001 lines)
**Contains:**
- **✅ FIXED** CalendarView component (correct checkout date handling + payment color gradient)
- StaffView component
- **✅ FIXED** ClientsView component (pagination + country filters)
- ClientHistoryModal component
- TaskManager component
- DebtsView component
- ReportsView component
- ShiftsView component

### Part 5: `App_Part5.jsx` (837 lines)
**Contains:**
- Main App() function
- All useState hooks
- All useEffect hooks
- All useMemo hooks
- All event handlers (handleCheckIn, handleCheckOut, handleLogin, etc.)
- Main JSX with conditional tab rendering
- **✅ ADDED** Fazliddin special permissions logic
- Export default App

---

## 🔧 Critical Fixes Implemented

### ✅ 1. Checkout Fix (Part 3 - GuestDetailsModal)
**Problem:** Checkout was blocked when balance < 0  
**Solution:** Removed balance check, allow checkout with debt, properly calculate refund

```javascript
// OLD (REMOVED):
// if (balance < 0) return notify(`Ошибка! Долг...`, 'error');

// NEW:
const refund = checkoutManualRefund ? parseInt(checkoutManualRefund) : Math.max(0, balance);
const finalData = {
  totalPrice: actualCost,
  refundAmount: refund,
  checkOutDate: new Date().toISOString()
};
onCheckOut(guest, finalData);
```

### ✅ 2. Calendar Fix (Part 4 - CalendarView)
**Problem:** Checked-out guest bars extended to today instead of actual checkout date  
**Solution:** Use checkOutDate from database for checked-out guests

```javascript
let checkOutDate;
if (guest.status === 'checked_out' && guest.checkOutDate) {
  checkOutDate = new Date(guest.checkOutDate);
  checkOutDate.setHours(12, 0, 0, 0);
} else {
  const guestDurationMs = parseInt(guest.days) * 24 * 60 * 60 * 1000;
  checkOutDate = new Date(checkInDate.getTime() + guestDurationMs);
  checkOutDate.setHours(12, 0, 0, 0);
}
```

### ✅ 3. Payment Color Gradient (Part 4 - CalendarView)
**Added:** Visual payment status with gradient colors  
**Implementation:** Green (paid) → Red (unpaid) gradient based on payment ratio

```javascript
const totalPaid = getTotalPaid(guest);
const paidRatio = Math.min(1, totalPaid / (guest.totalPrice || 1));

<div style={{
  background: `linear-gradient(to right, 
    #10b981 0%, 
    #10b981 ${paidRatio * 100}%, 
    #ef4444 ${paidRatio * 100}%, 
    #ef4444 100%)`
}}>
```

### ✅ 4. Clients Pagination (Part 4 - ClientsView)
**Added:** Pagination controls and country filters  
**Features:**
- Pagination with 25/50/100 items per page
- Country filter dropdown
- Shows count per country
- Page navigation controls

```javascript
const [pagination, setPagination] = useState({ page: 1, perPage: 25 });
const [countryFilter, setCountryFilter] = useState('');

const filteredAndPaginated = useMemo(() => {
  let result = clients.filter(/* search filter */);
  
  if (countryFilter) {
    result = result.filter(c => c.country === countryFilter);
  }
  
  const start = (pagination.page - 1) * pagination.perPage;
  return result.slice(start, start + pagination.perPage);
}, [clients, search, countryFilter, pagination]);
```

### ✅ 5. Fazliddin Permissions (Part 5 - App)
**Added:** Special permissions for user "fazliddin"  
**Features:**
- Can view Hostel 1 (read-only)
- Can edit Hostel 2 (full access)
- Hostel switcher in UI
- Disabled buttons for restricted hostels

```javascript
const isFazliddin = useMemo(() => {
  return currentUser?.login === 'fazliddin';
}, [currentUser]);

const [fazliddinHostel, setFazliddinHostel] = useState('hostel2');

const canEditCurrentHostel = useMemo(() => {
  if (!isFazliddin) return true;
  return fazliddinHostel === 'hostel2';
}, [isFazliddin, fazliddinHostel]);

// Usage:
<Button disabled={!canEditCurrentHostel} onClick={handleCheckIn}>
  Check-in
</Button>
```

### ✅ 6. Export/Print Functions (Part 1)
**Fixed:** exportToExcel, printDocument, printDebts, printReport  
**Improvements:**
- Proper HTML table formatting
- UTF-8 encoding
- Totals and balance calculation
- Professional styling

---

## 🔨 How to Assemble

To create the complete `App.jsx` file:

### Option 1: Manual Copy-Paste
1. Create a new file `App.jsx`
2. Copy content from `App_Part1.jsx` and paste
3. Copy content from `App_Part2.jsx` and paste below Part 1
4. Copy content from `App_Part3.jsx` and paste below Part 2
5. Copy content from `App_Part4.jsx` and paste below Part 3
6. Copy content from `App_Part5.jsx` and paste below Part 4

### Option 2: Command Line (Linux/Mac)
```bash
cat App_Part1.jsx App_Part2.jsx App_Part3.jsx App_Part4.jsx App_Part5.jsx > App.jsx
```

### Option 3: Command Line (Windows)
```cmd
type App_Part1.jsx App_Part2.jsx App_Part3.jsx App_Part4.jsx App_Part5.jsx > App.jsx
```

### Option 4: PowerShell (Windows)
```powershell
Get-Content App_Part1.jsx,App_Part2.jsx,App_Part3.jsx,App_Part4.jsx,App_Part5.jsx | Set-Content App.jsx
```

---

## ✅ Verification

After assembly, verify:
1. File starts with Part 1 header comment
2. File ends with Part 5 footer comment  
3. Total lines: ~3,840 lines
4. Only one `export default App;` at the end
5. No duplicate imports
6. All components are defined before use

---

## 📋 Structure Summary

```
App_Part1.jsx    →  Imports + Constants + Utilities
App_Part2.jsx    →  UI Components
App_Part3.jsx    →  Modal Components
App_Part4.jsx    →  View Components (Pages)
App_Part5.jsx    →  Main App + Logic + Export
```

**Total:** 3,840 lines | ~135 KB

---

## 🎯 Key Features

✅ All imports in Part 1 only  
✅ No imports in Parts 2-5  
✅ Only Part 5 has `export default`  
✅ Each part has clear header/footer comments  
✅ All critical bugs fixed  
✅ New features added  
✅ Ready for production use  

---

## 🐛 Fixed Issues

1. ❌ ~~Checkout blocked with negative balance~~ → ✅ Fixed
2. ❌ ~~Calendar shows wrong dates for checked-out guests~~ → ✅ Fixed
3. ❌ ~~No visual payment status~~ → ✅ Added gradient
4. ❌ ~~No pagination in clients view~~ → ✅ Added with filters
5. ❌ ~~No special permissions for Fazliddin~~ → ✅ Added
6. ❌ ~~Export/Print functions broken~~ → ✅ Fixed

---

## 📝 Notes

- Each file is standalone readable and editable
- Comments indicate which Part each section belongs to
- All fixes are marked with `FIXED` or `ADDED` comments
- Ready for deployment after assembly
- Compatible with React 18+ and Firebase 9+

---

## 🚀 Usage

1. **Edit individual parts** in your preferred text editor
2. **Assemble** using one of the methods above
3. **Deploy** the assembled `App.jsx` file
4. **Test** all fixed features
5. **Enjoy** improved workflow!

---

## 📞 Support

If you encounter any issues:
1. Check that all 5 parts are present
2. Verify assembly order (1→2→3→4→5)
3. Ensure no extra characters between parts
4. Check for proper UTF-8 encoding

---

**Last Updated:** 2026-02-07  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
