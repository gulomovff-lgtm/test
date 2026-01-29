# Feature Demonstrations

This document provides visual examples and demonstrations of each implemented feature.

## Table of Contents
1. [Client History Modal](#1-client-history-modal)
2. [Ghost Guest Display](#2-ghost-guest-display)
3. [Debt Visualization](#3-debt-visualization)
4. [Double-Click Protection](#4-double-click-protection)
5. [Role-Based Access Control](#5-role-based-access-control)

---

## 1. Client History Modal

### Opening the Modal
**Action:** Click on a client's name in the Clients View table

**Result:** ClientHistoryModal opens with:
- Client's full name in title
- Statistics dashboard (4 cards)
- "Repeat Last Stay" button
- List of all visits

### Statistics Display
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total Spent     │ Total Paid      │ Current Debt    │ Refunds         │
│ 1900.00        │ 1500.00        │ 400.00         │ 0.00           │
│ (Blue bg)       │ (Green bg)      │ (Rose bg)       │ (Yellow bg)     │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Color Coding:**
- Blue background: Total Spent - informational
- Green background: Total Paid - positive action
- Rose background: Current Debt - attention needed (if > 0)
- Yellow background: Refunds - historical data

### Visit History Display

Each visit shows:
```
┌────────────────────────────────────────────────────────────────┐
│ Check-in: 2026-01-20          Check-out: 2026-01-25           │
│ Room/Bed: Room 101 / 1        Days: 5                         │
│ Amount: 500.00                Status: Debt: 200.00 (red)      │
│ Served by: Admin User         Status: checked_in              │
└────────────────────────────────────────────────────────────────┘
```

**Payment Status Colors:**
- Green text "Paid" - fully paid
- Red badge "Debt: X.XX" - outstanding balance

**Background Colors:**
- White: Active or fully paid guests
- Gray (`bg-slate-50`): Checked-out guests with debt

### Repeat Last Stay Feature

**Flow:**
1. User views client history
2. Clicks "Repeat Last Stay" button
3. System calculates:
   - Number of days from last stay: 5 days
   - Price per day: 100.00
   - New dates: Today + 5 days
4. CheckInModal opens with pre-filled data:
   ```
   Full Name: [Pre-filled from client]
   Passport: [Pre-filled from client]
   Check-in: [Today's date]
   Check-out: [Today + 5 days]
   Amount: [Calculated: 500.00]
   ```

**Benefits:**
- Quick check-in for repeat guests
- Maintains pricing consistency
- Reduces data entry errors
- Saves time for staff

---

## 2. Ghost Guest Display

### Before Fix
**Problem:** Guests with checkout time >= 12:00 on current day were hidden

```
Room 101
┌──────┬──────┬──────┬──────┐
│ Bed 1│ Bed 2│ Bed 3│ Bed 4│
│ John │[Empty│[Empty│ Mary │
│ Smith│      │      │ Jones│
└──────┴──────┴──────┴──────┘
```
*Ghost guests not showing in beds 2 and 3*

### After Fix
**Solution:** Show ALL checked-out guests, sorted by most recent

```
Room 101
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Bed 1        │ Bed 2        │ Bed 3        │ Bed 4        │
│ John Smith   │ Ghost: Peter │ Available    │ Mary Jones   │
│ Active       │ Wilson       │              │ Active       │
│ (Green bg)   │ Out: 01/28   │              │ (Green bg)   │
│              │ (Gray bg)    │              │              │
│              │ [Check in new│              │              │
│              │ guest]       │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Key Changes:**
1. ✅ All checked-out guests visible
2. ✅ Shows checkout date
3. ✅ "Check in new guest" button for staff
4. ✅ Sorted by most recent (if multiple)

### Code Change
```javascript
// OLD (with date filter)
const recent = guests.filter(g => 
    String(g.roomId) === String(room.id) && 
    String(g.bedId) === String(bedId) &&
    g.status === 'checked_out' &&
    new Date(g.checkOutDate) > yesterday  // ❌ REMOVED
)

// NEW (no date filter)
const recent = guests
  .filter(g =>
    String(g.roomId) === String(room.id) &&
    String(g.bedId) === String(bedId) &&
    g.status === 'checked_out'
  )
  .sort((a, b) => new Date(b.checkOutDate) - new Date(a.checkOutDate));
```

---

## 3. Debt Visualization

### Room Card Display

**Active Guest (No Debt):**
```
┌────────────────────┐
│ Bed 1              │ ← Green background
│ John Smith         │
│ 01/20 - 01/25      │
│ (Fully paid)       │
└────────────────────┘
```

**Checked-Out Guest with Debt:**
```
┌────────────────────┐
│ Bed 2              │ ← Gray background (bg-slate-50)
│ Peter Wilson       │
│ Out: 01/28         │
│ ┌────────────────┐ │
│ │ Debt: 200.00   │ │ ← Red badge (text-rose-600 bg-rose-100)
│ └────────────────┘ │
│ [Check in new]     │
└────────────────────┘
```

**Booking (Future Guest):**
```
┌────────────────────┐
│ Bed 3              │ ← Yellow background
│ Mary Jones         │
│ 02/01 - 02/05      │
│ (Booked)           │
└────────────────────┘
```

### Debt View Display

**Checked-In Guest with Debt:**
```
┌──────────────────────────────────────────────────┐
│ John Smith                          400.00       │ ← White background
│ 01/20 - 01/25                   (Red text)       │   Red debt amount
│ Total: 500.00 | Paid: 100.00                     │
│                                    [Pay] button   │
└──────────────────────────────────────────────────┘
```

**Checked-Out Guest with Debt:**
```
┌──────────────────────────────────────────────────┐
│ Peter Wilson          ┌──────────┐               │ ← Gray background
│ 01/15 - 01/28         │ 200.00   │               │   (bg-slate-50)
│ Total: 600.00         └──────────┘               │
│ Paid: 400.00      (Red badge: text-rose-600      │
│                    bg-rose-100)    [Pay] button  │
└──────────────────────────────────────────────────┘
```

### Color Scheme Summary

| Status | Background | Debt Display | Border |
|--------|-----------|--------------|---------|
| Active, No Debt | `bg-green-100` | N/A | `border-green-400` |
| Active, Has Debt | `bg-white` | `text-rose-600` | `border-gray-300` |
| Booked | `bg-yellow-100` | N/A | `border-yellow-400` |
| Checked-Out, No Debt | `bg-white` | N/A | `border-gray-300` |
| Checked-Out, Has Debt | `bg-slate-50` | `text-rose-600 bg-rose-100` | `border-gray-300` |

---

## 4. Double-Click Protection

### Check-In Modal

**State Machine:**
```
Initial State:
  isSubmitting = false
  Button: Enabled, shows "Заселить" (Check In)
  
User Clicks Submit:
  → isSubmitting = true (guard clause blocks additional clicks)
  → Button: Disabled, shows "Заселение..." (Checking In...)
  → Loader icon spinning
  
Processing:
  → API call in progress
  → User cannot click again (button disabled)
  → Loading indicator provides feedback
  
Complete:
  → isSubmitting = false
  → Modal closes
  → State reset for next use
```

**Visual States:**

**Before Click:**
```
┌─────────────────────────────────┐
│ Check In                        │
│                                 │
│ Full Name: [John Smith      ]  │
│ Passport:  [AB123456        ]  │
│ Check-in:  [2026-01-29      ]  │
│ Check-out: [2026-02-03      ]  │
│ Amount:    [500.00          ]  │
│                                 │
│ ┌──────────────────┐ ┌────────┐│
│ │   Заселить       │ │ Отмена ││ ← Enabled
│ └──────────────────┘ └────────┘│
└─────────────────────────────────┘
```

**During Submission:**
```
┌─────────────────────────────────┐
│ Check In                        │
│                                 │
│ Full Name: [John Smith      ]  │
│ Passport:  [AB123456        ]  │
│ Check-in:  [2026-01-29      ]  │
│ Check-out: [2026-02-03      ]  │
│ Amount:    [500.00          ]  │
│                                 │
│ ┌──────────────────┐ ┌────────┐│
│ │ ⟳ Заселение...   │ │ Отмена ││ ← Disabled (grayed out)
│ └──────────────────┘ └────────┘│
└─────────────────────────────────┘
```

### Payment Modal

**Same Pattern:**
```javascript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return; // ← Guard clause
  
  setIsSubmitting(true);
  try {
    await onSubmit(guest, amount);
  } finally {
    setIsSubmitting(false); // ← Always reset
  }
};
```

**Button States:**
- Idle: "Оплатить" (Pay) - Enabled
- Submitting: "⟳ Оплата..." (Paying...) - Disabled
- Complete: Modal closes

### Benefits

1. **Prevents Duplicate Records:**
   - No double check-ins
   - No double payments
   - Database consistency

2. **User Feedback:**
   - Visual loading indicator
   - Button state changes
   - Clear feedback during processing

3. **Error Handling:**
   - Finally block ensures state reset
   - Even on error, button re-enables
   - User can retry if needed

---

## 5. Role-Based Access Control

### Admin View

```
┌──────────────────────────────────────────────────────────┐
│ Clients                                                   │
│                                                           │
│ ┌────────────┐ ┌────────────────────┐ ┌──────────────┐  │
│ │Дедупликация│ │Нормализовать страны│ │  Import CSV  │  │ ← Admin only
│ └────────────┘ └────────────────────┘ └──────────────┘  │
│                                                           │
│ ┌─────────────────┐                                      │
│ │ Добавить клиента│                                      │ ← All users
│ └─────────────────┘                                      │
│                                                           │
│ [Search: ________________]                                │
│                                                           │
│ ┌──────────┬──────────┬────────┬──────────┐             │
│ │ Name     │ Passport │ Country│ Phone    │             │
│ ├──────────┼──────────┼────────┼──────────┤             │
│ │ John...  │ AB123... │ USA    │ +1 555...│             │
│ └──────────┴──────────┴────────┴──────────┘             │
└──────────────────────────────────────────────────────────┘
```

### Cashier View

```
┌──────────────────────────────────────────────────────────┐
│ Clients                                                   │
│                                                           │
│ ┌─────────────────┐                                      │
│ │ Добавить клиента│                                      │ ← Only this button
│ └─────────────────┘                                      │
│                                                           │
│ [Search: ________________]                                │
│                                                           │
│ ┌──────────┬──────────┬────────┬──────────┐             │
│ │ Name     │ Passport │ Country│ Phone    │             │
│ ├──────────┼──────────┼────────┼──────────┤             │
│ │ John...  │ AB123... │ USA    │ +1 555...│             │
│ └──────────┴──────────┴────────┴──────────┘             │
└──────────────────────────────────────────────────────────┘
```

### Implementation

```javascript
const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super';

// Conditional rendering
{isAdmin && (
  <>
    <Button icon={Merge} onClick={onDeduplicate}>
      {t('deduplicate')}
    </Button>
    <Button icon={Globe} onClick={onNormalizeCountries}>
      {t('normalizeCountries')}
    </Button>
    <Button icon={FileSpreadsheet} onClick={() => setIsImportModalOpen(true)}>
      {t('importCSV')}
    </Button>
  </>
)}
```

### Access Control Matrix

| Feature | Admin | Super | Cashier | Notes |
|---------|-------|-------|---------|-------|
| **Clients View** |
| View list | ✅ | ✅ | ✅ | Basic access |
| Search clients | ✅ | ✅ | ✅ | Basic access |
| Add client | ✅ | ✅ | ✅ | Basic access |
| View history | ✅ | ✅ | ✅ | Click name |
| Deduplicate | ✅ | ✅ | ❌ | Admin only |
| Normalize countries | ✅ | ✅ | ❌ | Admin only |
| Import CSV | ✅ | ✅ | ❌ | Admin only |
| **Rooms View** |
| View rooms | ✅ | ✅ | ✅ | Basic access |
| Check in guests | ✅ | ✅ | ✅ | Basic access |
| View ghost guests | ✅ | ✅ | ✅ | Basic access |
| **Debts View** |
| View debts | ✅ | ✅ | ✅ | Basic access |
| Process payments | ✅ | ✅ | ✅ | Basic access |

### Role Switching Demo

**In App Header:**
```
┌────────────────────────────────────────────────────┐
│ Hostel Management System    [RU] [UZ] [Admin ▼]   │
└────────────────────────────────────────────────────┘
                                        │
                                        ▼
                              ┌─────────────┐
                              │ Admin       │ ← Current
                              │ Cashier     │
                              └─────────────┘
```

**Selecting Cashier:**
- Admin buttons disappear
- Other functionality remains
- UI updates immediately

---

## Summary

All five major features have been successfully implemented:

1. ✅ **ClientHistoryModal** - Complete guest history with statistics and repeat booking
2. ✅ **Ghost Guest Display** - Fixed to show all checked-out guests
3. ✅ **Debt Visualization** - Clear color-coded indicators for outstanding balances
4. ✅ **Double-Click Protection** - Prevents duplicate submissions with visual feedback
5. ✅ **Role-Based Access Control** - Restricts admin functions from cashiers

Each feature follows React best practices and maintains consistency with the existing codebase.
