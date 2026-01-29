# Hostel Management System

A comprehensive hostel management application built with React, TypeScript, and Vite. This system addresses critical features for guest tracking, checkout handling, and user permissions.

## Features Implemented

### 1. ✅ Client History Modal & "Repeat Stay" Feature
- **Client History Modal** shows:
  - All guest visits in chronological order (newest first)
  - Total spent, total paid, total debt, and total refunds
  - Staff member who handled each visit
  - Room and bed information for each stay
  - Date ranges for each visit
  - Payment status for each visit
- **"Repeat Last Stay" button** that:
  - Copies the last checkout's parameters (days, price per night)
  - Pre-fills the check-in form with the client's data
  - Opens check-in modal with pre-populated data
- **Clickable client cards** in rooms view to open history modal

### 2. ✅ Fixed Ghost Guest Display in Rooms
**FIXED BUG**: Previously, checked-out guests disappeared from room cards after 2 days.

**Current behavior**:
- Shows ALL checked-out guests in room cards (removed 2-day filter)
- Displays them with gray background and italic text
- Shows debt amount in RED if they have unpaid balance
- Keeps hover overlay with "Checked Out" label and "Check-in New" button

### 3. ✅ Show Debt for Checked-Out Guests
- Calculates debt correctly for ghost guests
- Displays debt badge in RED even when background is gray
- Proper styling: gray background + red debt amount badge

### 4. ✅ Prevent Double-Click on Critical Actions
Added debouncing/disabling for:

**In CheckInModal**:
- `isSubmitting` state prevents double submission
- Disabled submit button while processing
- Loading indicator during submission

**In PaymentModal**:
- `isProcessing` state prevents double payment
- Disabled "Save" button after first click
- Re-enables only after operation completes or fails

### 5. ✅ Restrict Cashier Permissions in ClientsView
**Permissions implemented**:
- **Admin/Super**: Full access (export, deduplicate, normalize, bulk delete, search, add client)
- **Cashier**: Limited access (search only, add new client)

### 6. ✅ Additional UI Improvements
- Added loading spinner icon to scanning state in CheckInModal
- Improved error messages with context
- Success confirmation messages after operations
- Proper modal z-index stacking

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Firebase ready (currently using mock data service)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Architecture

### Components

- **RoomCardChess**: Room display with chess-like bed grid, shows current and historical guests
- **CheckInModal**: Guest check-in form with double-click prevention and document scanning
- **ClientHistoryModal**: Shows complete client history with repeat stay functionality
- **ClientsView**: Client management with role-based permissions
- **PaymentModal**: Payment processing with double-click prevention
- **Button**: Reusable button component with variants
- **Modal**: Base modal component with proper z-index handling

### Services

- **dataService**: Mock Firebase service for data management
  - Guests, Clients, Rooms, Payments
  - Client history aggregation
  - CRUD operations

### Utils

- **translations**: Multi-language support (Russian/Uzbek)
- **helpers**: Currency formatting, date formatting, debt calculations

## Key Features Explained

### Ghost Guest Display Fix

The critical bug where checked-out guests disappeared after 2 days has been fixed:

```typescript
// ✅ FIXED: Show ALL checked-out guests
const ghostGuest = guests.find(g => 
  String(g.roomId) === String(room.id) && 
  String(g.bedId) === String(bedId) &&
  g.status === 'checked_out'
  // ❌ REMOVED: && new Date(g.checkOutDate) > yesterday
);
```

### Double-Click Prevention

All critical actions now implement proper double-click prevention:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return; // Guard clause
  setIsSubmitting(true);
  try {
    await onSubmit(data);
  } finally {
    setIsSubmitting(false);
  }
};
```

### Role-Based Permissions

Cashiers see limited functionality compared to admins:

```typescript
const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super';

{isAdmin && (
  <>
    <Button onClick={onDeduplicate}>Deduplicate</Button>
    <Button onClick={onNormalizeCountries}>Normalize Countries</Button>
    {/* ... other admin-only buttons */}
  </>
)}
```

## Testing Checklist

- [x] Client history modal opens and displays all past visits
- [x] "Repeat Stay" button pre-fills check-in form correctly
- [x] All checked-out guests visible in room cards (no time limit)
- [x] Debt amount shows in RED for checked-out guests with unpaid balance
- [x] Double-click on check-in button doesn't create duplicate guests
- [x] Double-click on payment button doesn't process payment twice
- [x] Cashiers can only search and add clients, not export/normalize
- [x] Admins retain full access to all client management features

## Future Enhancements

- Calendar view implementation
- Real Firebase integration
- Export/Import CSV functionality
- Advanced reporting
- Multi-property support
- Email/SMS notifications

## License

ISC