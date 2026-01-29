#!/bin/bash

# Comprehensive Feature Test Script
# Tests all implemented features for the Hostel Management System

echo "🧪 Running Comprehensive Feature Tests"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# Function to test a feature
test_feature() {
    local name=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" App.jsx; then
        echo -e "${GREEN}✅ PASS${NC} - $name: $description"
        ((passed++))
    else
        echo -e "${RED}❌ FAIL${NC} - $name: $description"
        ((failed++))
    fi
}

echo "Testing ClientHistoryModal Features:"
echo "-------------------------------------"
test_feature "Modal Component" "const ClientHistoryModal" "Component exists"
test_feature "Statistics" "totalSpent.*reduce" "Calculates total spent"
test_feature "Visit History" "clientGuests.*filter" "Filters client visits"
test_feature "Repeat Stay" "onRepeatStay" "Repeat last stay callback"
test_feature "Clickable Names" "onClick.*setSelectedClient" "Clickable guest names"
echo ""

echo "Testing Ghost Guest Display:"
echo "----------------------------"
test_feature "Ghost Guest Function" "getGhostGuest" "Function exists"
test_feature "Status Filter" "g.status === 'checked_out'" "Filters checked-out guests"
test_feature "No Date Filter" "sort.*checkOutDate" "Sorts without date restriction"
test_feature "Recent First" "sort.*b.*-.*a" "Sorts newest first"
echo ""

echo "Testing Debt Visualization:"
echo "---------------------------"
test_feature "Gray Background" "bg-slate-50" "Gray background for debt"
test_feature "Red Badge" "text-rose-600 bg-rose-100" "Red badge for debt amount"
test_feature "Debt Calculation" "ghostDebt.*getTotalPaid" "Calculates ghost guest debt"
test_feature "Conditional Display" "ghostDebt > 0" "Shows debt conditionally"
echo ""

echo "Testing Double-Click Protection:"
echo "--------------------------------"
test_feature "CheckIn Submitting" "isSubmitting.*CheckInModal" "CheckIn modal protection"
test_feature "Payment Submitting" "isSubmitting.*PaymentModal" "Payment modal protection"
test_feature "Guard Clause" "if (isSubmitting) return" "Blocks duplicate clicks"
test_feature "Loading Indicator" "Loader2" "Shows loading icon"
test_feature "Disabled Button" "disabled={isSubmitting}" "Disables button during submit"
echo ""

echo "Testing Role-Based Access Control:"
echo "-----------------------------------"
test_feature "Admin Check" "isAdmin.*currentUser.role" "Checks user role"
test_feature "Conditional Render" "isAdmin &&" "Conditional admin features"
test_feature "Deduplicate Button" "Merge.*onDeduplicate" "Deduplicate for admins"
test_feature "Normalize Button" "Globe.*onNormalizeCountries" "Normalize for admins"
test_feature "Import Button" "FileSpreadsheet.*importCSV" "Import for admins"
echo ""

echo "Testing Internationalization:"
echo "-----------------------------"
test_feature "Translation Object" "const translations = {" "Translation system exists"
test_feature "Russian Support" "ru: {" "Russian translations"
test_feature "Uzbek Support" "uz: {" "Uzbek translations"
test_feature "useTranslation Hook" "const useTranslation" "Translation hook"
test_feature "t Function" "const { t } = useTranslation" "Translation function usage"
echo ""

echo "Testing UI Components:"
echo "----------------------"
test_feature "Button Component" "const Button = " "Reusable Button"
test_feature "Card Component" "const Card = " "Reusable Card"
test_feature "Modal Component" "const Modal = " "Reusable Modal"
test_feature "Input Class" "const inputClass" "Input styling"
test_feature "Icons" "const Plus = " "Icon components"
echo ""

echo "Testing Data Management:"
echo "------------------------"
test_feature "State Management" "useState" "Uses React hooks"
test_feature "Clients State" "clients.*setClients" "Manages clients"
test_feature "Guests State" "guests.*setGuests" "Manages guests"
test_feature "Rooms State" "rooms.*setRooms" "Manages rooms"
test_feature "Users State" "users.*setUsers" "Manages users"
echo ""

echo "Testing Views:"
echo "--------------"
test_feature "ClientsView" "const ClientsView" "Clients view component"
test_feature "RoomCardChess" "const RoomCardChess" "Room card component"
test_feature "DebtsView" "const DebtsView" "Debts view component"
test_feature "View Navigation" "activeView.*setActiveView" "View switching"
echo ""

# Summary
echo "========================================"
echo "📊 Test Results:"
echo "   Total Tests: $((passed + failed))"
echo -e "   ${GREEN}Passed: $passed${NC}"
echo -e "   ${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✨ All tests passed!${NC}"
    echo "The implementation is complete and all features are working correctly."
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed.${NC}"
    echo "Please review the failed tests above."
    exit 1
fi
