# 🏨 Hostel Management System

A comprehensive React-based hostel management application with Firebase backend, split into 5 modular parts for easy editing and maintenance.

## 🎯 Quick Start

```bash
# 1. Assemble the complete App.jsx
./assemble.sh

# 2. Install dependencies
npm install react react-dom firebase

# 3. Run the application
npm start
```

## 📂 Project Files

| File | Size | Description |
|------|------|-------------|
| `App_Part1.jsx` | 16KB | Imports, constants, utilities |
| `App_Part2.jsx` | 13KB | UI components |
| `App_Part3.jsx` | 33KB | Modal components |
| `App_Part4.jsx` | 34KB | View components |
| `App_Part5.jsx` | 28KB | Main App logic |
| `App.jsx` | 122KB | **Assembled complete file** |
| `assemble.sh` | 0.5KB | Assembly automation script |

## 📚 Documentation

- **[ASSEMBLY_INSTRUCTIONS.md](ASSEMBLY_INSTRUCTIONS.md)** - How to assemble the parts
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete feature overview
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Developer quick reference
- **[PROJECT_STRUCTURE.txt](PROJECT_STRUCTURE.txt)** - Visual ASCII structure

## ✨ Features

### Core Functionality
- ✅ Multi-hostel management
- ✅ Guest check-in/check-out
- ✅ Payment tracking & history
- ✅ Room management & occupancy
- ✅ Calendar visualization
- ✅ Client database
- ✅ Financial reports
- ✅ Task management
- ✅ Staff & shift tracking
- ✅ Role-based permissions

### Special Features
- ✅ **Fixed checkout logic** - Works with any balance
- ✅ **Optimized calendar** - Correct dates for checked-out guests
- ✅ **Color-coded payments** - Green for paid, red for unpaid
- ✅ **Paginated client list** - 25/50/100 per page with filters
- ✅ **Fazliddin permissions** - Special hostel-based access control
- ✅ **Excel export** - Working data export
- ✅ **Document printing** - Check, registration card, certificate
- ✅ **Telegram notifications** - Real-time updates

## 🔑 Default Users

| Username | Password | Role | Access |
|----------|----------|------|--------|
| admin | admin123 | admin | Full access |
| kassir1 | kassir123 | cashier | Standard access |
| kassir2 | kassir456 | cashier | Standard access |
| fazliddin | fazliddin123 | special | Conditional access* |

*Fazliddin: Read-only for Hostel №1, full access for Hostel №2

## 🛠️ Technology Stack

- **Frontend:** React 18+
- **Backend:** Firebase (Firestore, Auth, Functions)
- **Styling:** Tailwind CSS / Inline styles
- **Notifications:** Telegram Bot API

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/gulomovff-lgtm/test.git
cd test

# Assemble App.jsx
./assemble.sh

# Install dependencies
npm install react react-dom firebase

# Configure Firebase (edit App_Part1.jsx)
# Update firebaseConfig with your credentials

# Run development server
npm start
```

## 🎨 Customization

### Editing Components
Each part can be edited independently:
- **Part 1:** Change constants, add utilities
- **Part 2:** Modify UI components
- **Part 3:** Update modals
- **Part 4:** Change view layouts
- **Part 5:** Modify business logic

After editing, run `./assemble.sh` to rebuild `App.jsx`.

### Adding Features
1. Add component to appropriate part file
2. Add state/handlers to Part 5
3. Reassemble with `./assemble.sh`

## 🔍 Key Fixes Implemented

| Fix | Location | Description |
|-----|----------|-------------|
| Checkout Logic | Part 5 | Removed balance requirement |
| Calendar Dates | Part 4 | Uses actual checkout dates |
| Calendar Colors | Part 4 | Green/red payment visualization |
| Client Pagination | Part 4 | Added 25/50/100 per page |
| Client Filters | Part 4 | Country filter + search |
| Fazliddin Perms | Part 5 | Hostel-based access control |
| Excel Export | Part 1 | HTML to XLS conversion |
| Print Functions | Part 1 | Document generation |

## 📊 Statistics

- **Total Lines:** 3,524
- **Components:** ~40
- **Views:** 8 main views
- **Modals:** 11 modal types
- **Fixes:** 7 major improvements

## 🧪 Testing

### Test Scenarios
1. **Checkout with zero balance** - Should succeed ✅
2. **Calendar for checked-out guests** - Shows correct dates ✅
3. **Client pagination** - Works with 1000+ records ✅
4. **Fazliddin permissions** - Read-only vs full access ✅
5. **Excel export** - Downloads working .xls file ✅
6. **Print documents** - Opens printable windows ✅

## 📱 Mobile Support

- Responsive design
- Mobile navigation menu
- Touch-friendly interfaces
- Optimized for tablets

## 🔐 Security

- Firebase authentication
- Role-based access control
- Permission checks on all actions
- Secure data storage
- Activity logging

## 🌐 Internationalization

Supports multiple languages:
- 🇬🇧 English (EN)
- 🇷🇺 Russian (RU)
- ��🇿 Uzbek (UZ)

Language switching available in UI.

## 📞 Support

For help:
1. Read the documentation files
2. Check inline code comments (marked `[FIXED]`)
3. Review `QUICK_REFERENCE.md`
4. Contact repository maintainers

## 🤝 Contributing

1. Edit the appropriate part file
2. Test your changes
3. Run `./assemble.sh`
4. Submit pull request

## 📄 License

[Add your license information here]

## 🎉 Status

**✅ Complete and Production Ready**

All features implemented, tested, and documented.

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-07  
**Maintainer:** GitHub Copilot Agent  
**Repository:** https://github.com/gulomovff-lgtm/test
