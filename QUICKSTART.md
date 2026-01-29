# Quick Start Guide

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

```bash
# 1. Clone the repository (if not already done)
git clone https://github.com/gulomovff-lgtm/test.git
cd test

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

## First Time Usage

### 1. Understanding the Interface

The application has three main views accessible via the top navigation:

- **Clients** - Manage guest database
- **Rooms** - View and manage room occupancy
- **Debts** - Track and process payments

### 2. Language Selection

Use the language buttons in the top-right corner:
- **RU** - Russian interface
- **UZ** - Uzbek interface

### 3. Role Switching (Demo)

Use the dropdown in the header to switch between:
- **Admin** - Full access to all features
- **Cashier** - Limited access (no export/import)

## Feature Walkthrough

### Viewing Client History

1. Go to **Clients** view
2. Click on any client's name in the table
3. ClientHistoryModal opens showing:
   - Statistics (spent, paid, debt, refunds)
   - Complete visit history
   - "Repeat Last Stay" button

### Repeat Booking

1. Open a client's history (click their name)
2. Click **"Repeat Last Stay"** button
3. Check-in form opens with pre-filled data:
   - Client information
   - Number of days from last stay
   - Price from last stay
4. Adjust dates if needed
5. Click **"Check In"** to confirm

### Viewing Ghost Guests

1. Go to **Rooms** view
2. Look at empty beds
3. Previously checked-out guests appear in gray
4. If guest has debt, red badge shows amount
5. Click **"Check in new guest"** to book the bed

### Processing Payments

1. Go to **Debts** view
2. See all guests with outstanding balances
3. Guests with debt have:
   - Red debt amount
   - "Pay" button
4. Click **"Pay"** to open payment modal
5. Enter amount and confirm

### Admin Functions

Available only to Admin/Super roles:

**In Clients View:**
- **Deduplicate** - Remove duplicate client records
- **Normalize Countries** - Standardize country names
- **Import CSV** - Bulk import clients

## Sample Data

The application comes with sample data:

**Clients:**
- Иван Петров (Passport: AB123456)
- Мария Сидорова (Passport: CD789012)
- John Smith (Passport: US123456)

**Rooms:**
- Room 101 (4 beds)
- Room 102 (4 beds)
- Room 103 (2 beds)

**Guests:**
- Ivan Petrov - Room 101, Bed 1 (Active, has debt)
- Maria Sidorova - Room 101, Bed 2 (Checked-out, has debt)
- John Smith - Room 102, Bed 1 (Checked-out, paid)

## Testing Features

### Test ClientHistoryModal
1. Switch to Clients view
2. Click "Иван Петров" name
3. Verify statistics display
4. Verify visit list shows correctly
5. Click "Repeat Last Stay"
6. Verify form pre-fills

### Test Ghost Guest Display
1. Switch to Rooms view
2. Look at Room 101, Bed 2
3. Verify Maria Sidorova shows as ghost guest
4. Verify debt amount displays in red
5. Hover over bed to see options

### Test Double-Click Protection
1. Open check-in modal or payment modal
2. Fill in required fields
3. Click submit button twice quickly
4. Verify only one submission occurs
5. Verify button shows loading state

### Test Role-Based Access
1. Set role to "Admin" in header dropdown
2. Verify all buttons visible in Clients view
3. Change role to "Cashier"
4. Verify admin buttons disappear
5. Verify basic functions still work

## Troubleshooting

### Port Already in Use
```bash
# If port 5173 is busy, Vite will suggest another
# Or specify a different port:
npm run dev -- --port 3000
```

### Dependencies Not Installing
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Styles Not Loading
```bash
# Rebuild Tailwind CSS
npm run build
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to your hosting provider
```

## Next Steps

### Connect to Firebase
To use with real data:

1. Create Firebase project
2. Add Firebase config to environment variables
3. Update data fetching functions
4. Implement authentication
5. Set up Firestore security rules

### Customize
- Add your hostel's logo
- Adjust colors in tailwind.config.js
- Add more languages in translations
- Customize room layouts
- Add custom fields

### Deploy
Popular hosting options:
- Vercel (recommended)
- Netlify
- Firebase Hosting
- AWS Amplify
- GitHub Pages

## Support

### Documentation
- **README.md** - Overview and features
- **TECHNICAL.md** - Implementation details
- **DEMONSTRATIONS.md** - Visual examples
- **SUMMARY.md** - Project statistics

### Validation
Run validation scripts:
```bash
# Feature validation
./validate.sh

# Comprehensive tests
./test-features.sh
```

## Keyboard Shortcuts

- **Esc** - Close any modal
- **Tab** - Navigate form fields
- **Enter** - Submit forms

## Best Practices

### Data Entry
- Always fill required fields
- Use consistent date formats
- Verify amounts before payment
- Check room/bed availability

### Security
- Don't share admin credentials
- Log out when leaving workstation
- Regular backups recommended
- Monitor debt reports

### Performance
- Keep browser updated
- Clear browser cache if slow
- Close unused tabs
- Use modern hardware

## Common Tasks

### Add New Client
1. Clients view → "Add Client" button
2. Fill in: name, passport, country, phone
3. Submit

### Check In Guest
1. Rooms view → Find available bed
2. Click "Available" or "Check in new guest"
3. Fill in form (or use "Repeat Last Stay")
4. Submit

### Process Payment
1. Debts view → Find guest
2. Click "Pay" button
3. Enter amount
4. Confirm

### View History
1. Clients view → Click guest name
2. Review statistics and visits
3. Close when done

## Tips & Tricks

- Click guest names anywhere to see history
- Use search to find clients quickly
- Gray beds indicate checked-out guests with debt
- Loading indicators prevent double submissions
- Switch languages anytime without losing data
- Admin functions require admin role

---

**Need Help?** Check the documentation files or run validation scripts.

**Found a Bug?** Review the TECHNICAL.md for implementation details.

**Want to Contribute?** Follow React best practices and update tests.
