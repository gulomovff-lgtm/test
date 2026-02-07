# Quick Reference Guide

## 🚀 Quick Start

```bash
# Assemble the complete file
./assemble.sh

# Install dependencies
npm install react react-dom firebase

# Run the app
npm start
```

## 📂 File Organization

| File | Purpose | Lines |
|------|---------|-------|
| `App_Part1.jsx` | Setup: imports, constants, utilities | 506 |
| `App_Part2.jsx` | UI: buttons, cards, navigation | 359 |
| `App_Part3.jsx` | Modals: forms and dialogs | 977 |
| `App_Part4.jsx` | Views: main screens | 879 |
| `App_Part5.jsx` | Logic: App component, handlers | 803 |

## 🔑 Default Users

| Login | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin | admin123 | admin | Full access |
| kassir1 | kassir123 | cashier | Standard access |
| kassir2 | kassir456 | cashier | Standard access |
| fazliddin | fazliddin123 | special | Conditional access |

## 🎨 Main Components

### Part 1 - Utilities
```javascript
getTotalPaid(guest)           // Calculate total payments
exportToExcel(data, filename) // Export to Excel
printDocument(type, guest)    // Print documents
getNormalizedCountry(country) // Normalize country names
```

### Part 2 - UI Components
```javascript
<Card />                      // Container card
<Button variant="primary" />  // Action button
<Navigation />                // Desktop navigation
<MobileNavigation />          // Mobile navigation
<DashboardStats />            // Statistics cards
```

### Part 3 - Modals
```javascript
<CheckInModal />              // Guest check-in
<GuestDetailsModal />         // Guest information
<ExpenseModal />              // Add expense
<ClientEditModal />           // Edit client
```

### Part 4 - Views
```javascript
<CalendarView />              // Calendar with guests
<ClientsView />               // Client list (paginated)
<ReportsView />               // Financial reports
<TaskManager />               // Task management
```

### Part 5 - Main App
```javascript
handleCheckIn()               // Check in guest
handleCheckOut()              // Check out guest (FIXED)
handleUpdateGuest()           // Update guest data
canEdit                       // Permission check
```

## 🔧 Key Fixes

### 1. Checkout Fix
**File:** `App_Part5.jsx`  
**Line:** ~2950  
**Change:** Removed balance check
```javascript
// Before: if (balance < 0) { error... }
// After: (removed check)
```

### 2. Calendar Date Fix
**File:** `App_Part4.jsx`  
**Line:** ~1870  
**Change:** Use actual checkout date
```javascript
const endDate = guest.status === 'checked_out' 
  ? checkOut          // Use actual date
  : (checkOut < now ? checkOut : now);
```

### 3. Calendar Colors
**File:** `App_Part4.jsx`  
**Component:** CalendarView  
**Change:** Added green/red bars
```javascript
const paidRatio = totalPaid / totalPrice;
// Green bar: width = paidRatio * 100%
// Red bar: width = (1 - paidRatio) * 100%
```

### 4. Client Pagination
**File:** `App_Part4.jsx`  
**Component:** ClientsView  
**Change:** Added state + filters
```javascript
const [perPage, setPerPage] = useState(25);
const [currentPage, setCurrentPage] = useState(1);
const [countryFilter, setCountryFilter] = useState('');
```

### 5. Fazliddin Permissions
**File:** `App_Part5.jsx`  
**Line:** ~2765  
**Change:** Conditional canEdit
```javascript
const canEdit = currentUser.login === 'fazliddin'
  ? selectedHostelFilter === 'hostel2'
  : true;
```

## 🎯 Common Tasks

### Add a New Modal
1. Create component in `App_Part3.jsx`
2. Add state in `App_Part5.jsx`: `const [showModal, setShowModal] = useState(false)`
3. Add handler in `App_Part5.jsx`
4. Add to JSX render section

### Add a New View
1. Create component in `App_Part4.jsx`
2. Add menu item in Navigation (Part 2)
3. Add case in main render (Part 5)

### Add a New Utility
1. Add function to `App_Part1.jsx`
2. Use anywhere in other parts

### Modify Permissions
1. Edit `canEdit` logic in `App_Part5.jsx`
2. Add `disabled={!canEdit}` to buttons

## 📊 Data Structure

### Guest Object
```javascript
{
  id: string,
  fullName: string,
  passport: string,
  country: string,
  roomId: string,
  checkInDate: ISO string,
  checkOutDate: ISO string,
  status: 'checked_in' | 'checked_out',
  days: number,
  pricePerDay: number,
  totalPrice: number,
  payments: [{
    amount: number,
    date: ISO string,
    note: string
  }],
  hostel: 'hostel1' | 'hostel2'
}
```

### Room Object
```javascript
{
  id: string,
  name: string,
  beds: number,
  floor: number,
  pricePerDay: number,
  hostel: 'hostel1' | 'hostel2'
}
```

## 🔍 Debugging Tips

### Can't Check Out?
- Check `canEdit` value
- Check user role
- Check selected hostel (if Fazliddin)

### Calendar Not Showing?
- Check date format (ISO strings)
- Check guest status
- Verify checkInDate < checkOutDate

### Pagination Not Working?
- Check `perPage` state
- Check `currentPage` state
- Verify `filteredClients` calculation

### Excel Export Issues?
- Check data format (array of objects)
- Check headers array
- Verify blob creation

## 🎨 Styling

The app uses inline Tailwind-like classes. Main classes:

```javascript
inputClass  = "w-full px-3 py-2 border rounded-lg..."
labelClass  = "block text-sm font-medium text-gray-700..."
```

## 🔐 Firebase Setup

1. Create Firebase project
2. Enable Firestore
3. Enable Authentication
4. Update config in `App_Part1.jsx`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT",
  // ...
};
```

## 📱 Telegram Notifications

Configure in `App_Part1.jsx`:
```javascript
const TG_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_IDS = ['YOUR_CHAT_ID'];
```

## ⚡ Performance Tips

1. **Pagination:** Always use for large lists (implemented in Clients)
2. **useMemo:** Used for filtered/calculated data
3. **useCallback:** Not used but recommended for handlers
4. **Firestore indexes:** Create for common queries

## 🐛 Common Issues

### Issue: "Cannot read property of undefined"
**Solution:** Check if data exists before accessing
```javascript
guest?.payments?.length || 0
```

### Issue: Dates showing wrong
**Solution:** Use `getLocalDateString()` utility

### Issue: Permission denied
**Solution:** Check `canEdit` logic and user role

### Issue: Modal won't close
**Solution:** Check `isOpen` state and `onClose` handler

## 📦 Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "firebase": "^9.0.0"
}
```

## 🎓 Learning Resources

- React: https://react.dev
- Firebase: https://firebase.google.com/docs
- Firestore: https://firebase.google.com/docs/firestore
- Tailwind: https://tailwindcss.com/docs

## 📞 Getting Help

1. Read inline comments (marked with FIXED)
2. Check ASSEMBLY_INSTRUCTIONS.md
3. Review IMPLEMENTATION_SUMMARY.md
4. Test in isolation (comment out sections)

---

**Quick Tip:** Use Ctrl+F to search for specific components or functions across all parts!
