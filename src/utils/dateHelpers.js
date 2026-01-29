/**
 * Date Helper Functions
 * Requirement #3: Date filtering logic for showing guests from last 7 days
 */

/**
 * Check if a date is within the last 7 days
 * Used for filtering guests in RoomCardChess and CalendarView
 */
export const isWithinLast7Days = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return date >= sevenDaysAgo && date <= now;
};

/**
 * Check if a guest should be visible based on status and checkout date
 * Requirement #3: Show active OR checked_out within time window
 * Don't hide guests who checked out today at 12:00 or later
 */
export const shouldShowGuest = (guest) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Always show active guests
  if (guest.status === 'active') {
    return true;
  }
  
  // For checked_out guests
  if (guest.status === 'checked_out') {
    const checkoutDate = new Date(guest.checkOutDate);
    const checkoutDay = new Date(
      checkoutDate.getFullYear(),
      checkoutDate.getMonth(),
      checkoutDate.getDate()
    );
    
    // If checked out today, always show (regardless of time)
    if (checkoutDay.getTime() === today.getTime()) {
      return true;
    }
    
    // Otherwise, check if within last 7 days
    return isWithinLast7Days(guest.checkOutDate);
  }
  
  return false;
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format datetime for display
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate number of days between two dates
 */
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
