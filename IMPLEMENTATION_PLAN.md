# Implementation Plan for Hotel Management System Features

## Overview
This document outlines the implementation plan for the guest history modal and related features as described in the requirements.

## Requirements (Translated from Russian)

### 1. Guest History Modal in ClientsView
- **Trigger**: Click on a client in ClientsView
- **Display**:
  - Full accommodation history
  - Payment history
  - Debts and refunds
  - Personal info (Full name, passport, country)
  - Total number of visits
  - Total amounts spent and paid
  - "Who served" field showing responsible employee for each accommodation

### 2. "Repeat Check-in" Button
- Quick start check-in with previous parameters
- Pre-fill: days, price, room/place, country, etc.

### 3. Fix Guest Display Logic in RoomCardChess and CalendarView
- **Current behavior**: Only shows active guests
- **New behavior**: Show ALL guests from last 7 days (or based on checkout date)
- Don't hide guests who checked out today at 12:00 or later
- Display any guest who is active OR checked_out within the time window

### 4. Visual Style for Checked-out Guests with Debt
- Gray bar for the guest entry
- Red debt amount (e.g., "-10000")

### 5. Prevent Double-Click Actions
- Add loading state to check-in buttons
- Add loading state to payment buttons
- Disable buttons while request is in progress

### 6. Role-based Button Visibility
- **Cashiers**: Can only see "Add New" and country search
- **Admins**: Can see all buttons including:
  - Export
  - Import  
  - Merge
  - Country normalization

## Implementation Approach

Since this is a test repository without existing codebase, here's how these features would typically be implemented in a real application:

### Technology Stack (Assumed)
- Frontend: React/Vue/Angular
- Backend: Node.js/Python/Java
- Database: PostgreSQL/MySQL

### Component Structure
```
src/
├── components/
│   ├── ClientsView/
│   │   ├── ClientsView.jsx
│   │   ├── GuestHistoryModal.jsx
│   │   └── RepeatCheckinButton.jsx
│   ├── RoomCardChess/
│   │   └── RoomCardChess.jsx
│   └── CalendarView/
│       └── CalendarView.jsx
├── services/
│   ├── guestService.js
│   └── roomService.js
└── utils/
    ├── dateHelpers.js
    └── roleHelpers.js
```

### Key Implementation Details

#### 1. Guest History Modal
```javascript
// API endpoint needed
GET /api/guests/:guestId/history
// Returns: accommodations, payments, debts, refunds, personal info, stats

// Component features:
- Modal dialog with tabs or sections
- Accommodation history table
- Payment/debt summary
- "Repeat check-in" button with pre-filled form
```

#### 2. Room Display Logic
```javascript
// Current logic (to be replaced):
const activeGuests = guests.filter(g => g.status === 'active');

// New logic:
const sevenDaysAgo = new Date() - 7 * 24 * 60 * 60 * 1000;
const visibleGuests = guests.filter(g => 
  g.status === 'active' || 
  (g.status === 'checked_out' && g.checkoutDate >= sevenDaysAgo)
);
```

#### 3. Loading States
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleCheckin = async () => {
  setIsLoading(true);
  try {
    await api.checkin(data);
  } finally {
    setIsLoading(false);
  }
};

// Button:
<button disabled={isLoading} onClick={handleCheckin}>
  {isLoading ? 'Loading...' : 'Check In'}
</button>
```

#### 4. Role-based Visibility
```javascript
const userRole = useAuth().role; // 'admin' or 'cashier'

{userRole === 'admin' && (
  <>
    <ExportButton />
    <ImportButton />
    <MergeButton />
    <NormalizeCountriesButton />
  </>
)}
```

## Testing Strategy
1. Unit tests for date filtering logic
2. Integration tests for API endpoints
3. E2E tests for user workflows
4. Role-based access control tests

## Database Schema Changes
```sql
-- Track who served each guest
ALTER TABLE accommodations ADD COLUMN served_by_employee_id INT;
ALTER TABLE accommodations ADD FOREIGN KEY (served_by_employee_id) REFERENCES employees(id);
```

## Next Steps
1. Set up project structure with chosen framework
2. Create database schema
3. Implement backend API endpoints
4. Build frontend components
5. Add authentication and role management
6. Implement loading states and error handling
7. Add comprehensive tests
8. Deploy and monitor
