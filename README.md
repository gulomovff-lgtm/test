# Hostel Management System

A comprehensive React-based hostel management system with client history tracking, ghost guest display, debt visualization, and role-based access control.

## Features Implemented

### 1. Client History Modal (ClientHistoryModal)
- ✅ Complete guest history display with all visits (active, completed, bookings)
- ✅ Statistics dashboard showing:
  - Total spent
  - Total paid
  - Current debt
  - Refunds
- ✅ Detailed visit information for each stay:
  - Check-in/check-out dates
  - Room number and bed
  - Number of days
  - Amount and payment status
  - Cashier who served
- ✅ "Repeat Last Stay" button that:
  - Copies data from the last stay
  - Pre-fills the check-in form
  - Allows quick check-in for regular guests
- ✅ Clickable guest names in ClientsView to open history modal

### 2. Fixed Ghost Guest Display
- ✅ Removed date filtering for checked-out guests
- ✅ Shows ALL checked-out guests in RoomCardChess
- ✅ Sorted by checkout date (latest first)
- ✅ Displays most recent guest who checked out from each bed

### 3. Debt Visualization for Checked-Out Guests
- ✅ Gray background (`bg-slate-50`) for cards with outstanding debt
- ✅ Red text with background (`text-rose-600 bg-rose-100`) for debt amounts
- ✅ Debt display for ghost guests in RoomCardChess
- ✅ Clear visual indicators for guests with unpaid balances

### 4. Double-Click Protection
- ✅ `isSubmitting` state in CheckInModal
- ✅ `isSubmitting` state in PaymentModal
- ✅ Disabled buttons during submission
- ✅ Loading indicator (Loader2 icon with animation)
- ✅ Prevents duplicate check-ins and payments

### 5. Role-Based Access Control for Cashiers
- ✅ Admin-only buttons hidden from cashiers:
  - Deduplicate clients
  - Normalize countries
  - Import CSV
- ✅ Cashiers can still:
  - Search clients
  - Add new clients
  - View client history
  - Process check-ins and payments

## Technical Implementation

### Architecture
- Single-file React application in `App.jsx`
- Component-based structure with:
  - `ClientHistoryModal` - Guest history viewer
  - `CheckInModal` - Guest check-in form
  - `PaymentModal` - Payment processing
  - `ClientsView` - Client management
  - `RoomCardChess` - Room and bed visualization
  - `DebtsView` - Debt tracking and payment

### Internationalization (i18n)
- Support for Russian (ru) and Uzbek (uz) languages
- Translation system with `useTranslation` hook
- Language switcher in header

### State Management
- React hooks (useState, useEffect)
- Local state for modals and forms
- Sample data structure compatible with Firebase Firestore

### Styling
- Tailwind CSS for responsive design
- Mobile-first approach
- Accessible UI components

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

### Viewing Client History
1. Navigate to the "Clients" tab
2. Click on any client's name in the table
3. The ClientHistoryModal will open showing:
   - Statistics overview
   - Complete visit history
   - Option to repeat last stay

### Repeat Last Stay
1. Open a client's history modal
2. Click "Repeat Last Stay" button
3. Check-in form opens with pre-filled data:
   - Client name and passport
   - Number of days from last stay
   - Price from last stay
4. Adjust dates and confirm check-in

### Viewing Ghost Guests
1. Navigate to the "Rooms" tab
2. Empty beds show the last checked-out guest
3. If guest has debt, it's displayed in red
4. Click "Check in new guest" to book the bed

### Managing Debts
1. Navigate to the "Debts" tab
2. See all guests with outstanding balances
3. Checked-out guests with debt have:
   - Gray background
   - Red debt amount with background
4. Click "Pay" to process payment

### Role-Based Features
- Switch between "Admin" and "Cashier" roles using dropdown in header
- Admin role shows all features
- Cashier role hides:
  - Deduplicate button
  - Normalize Countries button
  - Import CSV button

## Data Structure

### Guest Object
```javascript
{
  id: string,
  fullName: string,
  passport: string,
  roomId: string,
  bedId: string,
  checkInDate: string (ISO date),
  checkOutDate: string (ISO date),
  status: 'checked_in' | 'checked_out' | 'booked',
  totalPrice: number,
  pricePerDay: number,
  cashierId: string,
  payments: [{ amount: number, date: string }]
}
```

### Client Object
```javascript
{
  id: string,
  fullName: string,
  passport: string,
  country: string,
  phone: string
}
```

## Key Changes from Original Requirements

### RoomCardChess Ghost Guest Logic
**Before:**
```javascript
const recent = guests.filter(g => 
    String(g.roomId) === String(room.id) && 
    String(g.bedId) === String(bedId) &&
    g.status === 'checked_out' &&
    new Date(g.checkOutDate) > yesterday  // ❌ Removed
)
```

**After:**
```javascript
const recent = guests
  .filter(g => 
      String(g.roomId) === String(room.id) && 
      String(g.bedId) === String(bedId) &&
      g.status === 'checked_out'
  )
  .sort((a, b) => new Date(b.checkOutDate) - new Date(a.checkOutDate));
```

### CheckInModal with Double-Click Protection
```javascript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Block double clicks
    
    setIsSubmitting(true);
    try {
        await onSubmit(form);
    } finally {
        setIsSubmitting(false);
    }
};
```

## Testing Checklist

- [x] ClientHistoryModal opens on client name click
- [x] All visits display correctly in history
- [x] Statistics calculate properly (spent, paid, debt, refunds)
- [x] "Repeat Last Stay" button pre-fills check-in form
- [x] Ghost guests visible in all rooms regardless of date
- [x] Ghost guests sorted by most recent checkout
- [x] Checked-out guests with debt show gray background
- [x] Debt amounts show red background
- [x] Double-click on check-in button blocked
- [x] Double-click on payment button blocked
- [x] Loading indicator shows during submission
- [x] Cashiers don't see admin-only buttons
- [x] Cashiers can still add clients and process payments
- [x] Language switching works (ru/uz)
- [x] Responsive design works on mobile and desktop

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT