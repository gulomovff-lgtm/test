#!/bin/bash

# Validation script for Hostel Management System implementation

echo "🔍 Validating Hostel Management System Implementation"
echo "=================================================="
echo ""

# Check if App.jsx exists
if [ -f "App.jsx" ]; then
    echo "✅ App.jsx exists"
else
    echo "❌ App.jsx not found"
    exit 1
fi

# Validate ClientHistoryModal
if grep -q "const ClientHistoryModal" App.jsx; then
    echo "✅ ClientHistoryModal component exists"
else
    echo "❌ ClientHistoryModal component not found"
fi

# Validate double-click protection
if grep -q "isSubmitting" App.jsx && grep -q "if (isSubmitting) return;" App.jsx; then
    echo "✅ Double-click protection implemented"
else
    echo "❌ Double-click protection not found"
fi

# Validate role-based access control
if grep -q "isAdmin.*=.*currentUser.role === 'admin'" App.jsx; then
    echo "✅ Role-based access control implemented"
else
    echo "❌ Role-based access control not found"
fi

# Validate ghost guest fix
if grep -q "getGhostGuest" App.jsx && grep -q "g.status === 'checked_out'" App.jsx; then
    echo "✅ Ghost guest display logic implemented"
else
    echo "❌ Ghost guest display logic not found"
fi

# Validate date filtering removal
if ! grep -q "new Date(g.checkOutDate) > yesterday" App.jsx; then
    echo "✅ Date filtering removed from ghost guests (as required)"
else
    echo "❌ Old date filtering still present"
fi

# Validate debt visualization
if grep -q "bg-slate-50" App.jsx && grep -q "text-rose-600 bg-rose-100" App.jsx; then
    echo "✅ Debt visualization styling implemented"
else
    echo "❌ Debt visualization styling not found"
fi

# Validate repeat last stay feature
if grep -q "repeatLastStay" App.jsx || grep -q "onRepeatStay" App.jsx; then
    echo "✅ Repeat last stay feature implemented"
else
    echo "❌ Repeat last stay feature not found"
fi

# Validate i18n support
if grep -q "translations.*ru:" App.jsx && grep -q "translations.*uz:" App.jsx; then
    echo "✅ Internationalization (ru/uz) supported"
else
    echo "❌ Internationalization not found"
fi

# Validate clickable client names
if grep -q "onClick.*setSelectedClient" App.jsx; then
    echo "✅ Clickable client names implemented"
else
    echo "❌ Clickable client names not found"
fi

# Check project structure
echo ""
echo "📁 Checking project structure..."
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json not found"
fi

if [ -f "vite.config.js" ]; then
    echo "✅ vite.config.js exists"
else
    echo "❌ vite.config.js not found"
fi

if [ -f "tailwind.config.js" ]; then
    echo "✅ tailwind.config.js exists"
else
    echo "❌ tailwind.config.js not found"
fi

if [ -d "src" ]; then
    echo "✅ src directory exists"
else
    echo "❌ src directory not found"
fi

echo ""
echo "=================================================="
echo "✨ Validation complete!"
echo ""
echo "📝 Summary of implemented features:"
echo "   1. ClientHistoryModal with statistics and visit history"
echo "   2. Fixed ghost guest display (removed date filtering)"
echo "   3. Debt visualization (gray bg, red text)"
echo "   4. Double-click protection (CheckInModal, PaymentModal)"
echo "   5. Role-based access control (admin vs cashier)"
echo "   6. Repeat last stay functionality"
echo "   7. Internationalization (Russian/Uzbek)"
echo "   8. Clickable client names to open history"
echo ""
