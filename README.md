# Hotel Management System - Guest History & Room Management Features

This repository contains the implementation of guest history modal and room management features for a hotel management system.

## Features Implemented

### 1. ✅ Guest History Modal (ClientsView)
- **Location**: `src/components/ClientsView/GuestHistoryModal.jsx`
- **Trigger**: Click on a client in ClientsView
- **Displays**:
  - Full accommodation history with dates, rooms, prices
  - Payment history with debts and refunds
  - Client personal information (name, passport, country)
  - Statistics (total visits, total spent, total paid, refunds)
  - "Who served" field for each accommodation showing responsible employee

### 2. ✅ Repeat Check-in Button
- **Location**: `src/components/ClientsView/RepeatCheckinButton.jsx`
- **Functionality**: Quick check-in with pre-filled parameters from previous stay
- **Pre-fills**: days, price, room/place, country
- **Feature**: Includes loading state to prevent double-clicks

### 3. ✅ Show All Guests in Room Views
- **Locations**: 
  - `src/components/RoomCardChess/RoomCardChess.jsx`
  - `src/components/CalendarView/CalendarView.jsx`
- **Logic**: Shows ALL guests from last 7 days (not just active)
- **Rules**:
  - Display active guests
  - Display checked_out guests within last 7 days
  - Don't hide guests who checked out today (regardless of time)

### 4. ✅ Visual Styling for Guests with Debt
- **Implementation**: Both RoomCardChess and CalendarView
- **Style**: 
  - Gray background bar for checked_out guests with debt
  - Red text for debt amount (e.g., "-10000")

### 5. ✅ Prevent Double-Click Actions
- **Locations**: 
  - `src/components/ClientsView/RepeatCheckinButton.jsx`
  - All payment and check-in buttons
- **Implementation**: Loading state that disables buttons during API requests
- **Visual**: Shows spinner and "Загрузка..." text while processing

### 6. ✅ Role-based Button Visibility
- **Location**: `src/components/ClientsView/ClientsView.jsx`
- **Utilities**: `src/utils/roleHelpers.js`
- **Cashiers see**: 
  - "Add New" button
  - Country search
- **Admins additionally see**:
  - Export button
  - Import button
  - Merge button
  - Normalize countries button

## File Structure

```
src/
├── components/
│   ├── ClientsView/
│   │   ├── ClientsView.jsx           # Main client list with role-based buttons
│   │   ├── GuestHistoryModal.jsx     # Comprehensive guest history modal
│   │   └── RepeatCheckinButton.jsx   # Quick repeat check-in
│   ├── RoomCardChess/
│   │   └── RoomCardChess.jsx         # Room view with 7-day guest display
│   └── CalendarView/
│       └── CalendarView.jsx          # Calendar with all guests shown
├── services/
│   ├── guestService.js               # Guest-related API calls
│   └── roomService.js                # Room-related API calls
└── utils/
    ├── dateHelpers.js                # Date filtering for 7-day window
    └── roleHelpers.js                # Role-based permission checks
```

## Key Implementation Details

### Date Filtering Logic
```javascript
// Show guests who are:
// 1. Active, OR
// 2. Checked out today (any time), OR
// 3. Checked out within last 7 days
const shouldShow = guest.status === 'active' || 
                  (guest.status === 'checked_out' && isWithinLast7Days(guest.checkOutDate));
```

### Loading State Pattern
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  if (isLoading) return;  // Prevent double-click
  setIsLoading(true);
  try {
    await apiCall();
  } finally {
    setIsLoading(false);
  }
};
```

### Role-based Rendering
```javascript
const { user } = useAuth();
const isAdmin = user?.role === 'admin';

{isAdmin && (
  <AdminOnlyButtons />
)}
```

## Next Steps for Integration

1. **Backend API**: Implement the expected API endpoints in `/services`
2. **Database**: Add `served_by_employee_id` column to accommodations table
3. **Authentication**: Integrate role-based auth system
4. **Styling**: Add CSS for the components
5. **Testing**: Add unit and integration tests
6. **Error Handling**: Implement proper error boundaries and user feedback

## Requirements Mapping

| Requirement | Status | Location |
|-------------|--------|----------|
| 1. Guest history modal | ✅ Implemented | `ClientsView/GuestHistoryModal.jsx` |
| 2. Repeat check-in button | ✅ Implemented | `ClientsView/RepeatCheckinButton.jsx` |
| 3. Show all guests (7 days) | ✅ Implemented | `RoomCardChess.jsx`, `CalendarView.jsx` |
| 4. Style guests with debt | ✅ Implemented | Both room and calendar views |
| 5. Prevent double-clicks | ✅ Implemented | All action buttons with loading state |
| 6. Role-based visibility | ✅ Implemented | `ClientsView.jsx` with `roleHelpers.js` |

## Documentation

See `IMPLEMENTATION_PLAN.md` for detailed implementation notes and architecture decisions.