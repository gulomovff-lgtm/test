/**
 * Guest Service
 * API calls for guest-related operations
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Fetch complete guest history
 * Requirement #1: Get full accommodation history, payments, debts, refunds, stats
 */
export const fetchGuestHistory = async (guestId) => {
  const response = await fetch(`${API_BASE_URL}/guests/${guestId}/history`);
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch guest history (${response.status}): ${errorText}`);
  }
  
  return await response.json();
  
  /* Expected response format:
  {
    personalInfo: {
      fullName: string,
      passport: string,
      country: string
    },
    stats: {
      totalVisits: number,
      totalSpent: number,
      totalPaid: number,
      totalRefunds: number
    },
    accommodations: [{
      id: number,
      checkInDate: string,
      checkOutDate: string,
      roomNumber: string,
      bedNumber: string,
      numberOfDays: number,
      pricePerDay: number,
      totalPrice: number,
      servedByEmployee: string,
      country: string
    }],
    payments: [{
      id: number,
      date: string,
      amount: number,
      type: string,
      note: string
    }],
    debts: [{
      id: number,
      date: string,
      amount: number
    }],
    refunds: [{
      id: number,
      date: string,
      amount: number,
      reason: string
    }]
  }
  */
};

/**
 * Start check-in with pre-filled parameters
 * Requirement #2: Quick repeat check-in
 * Requirement #5: Loading state to prevent double-click
 */
export const startCheckin = async (checkinData) => {
  const response = await fetch(`${API_BASE_URL}/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(checkinData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to start check-in');
  }
  
  return await response.json();
};

/**
 * Process payment with loading state
 * Requirement #5: Prevent double-click on payment actions
 */
export const processPayment = async (paymentData) => {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to process payment');
  }
  
  return await response.json();
};
