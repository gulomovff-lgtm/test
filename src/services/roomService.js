/**
 * Room Service
 * API calls for room and calendar operations
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Fetch guests for a specific room
 * Requirement #3: Returns ALL guests (active and recently checked out)
 */
export const fetchRoomGuests = async (roomNumber) => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomNumber}/guests`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch room guests');
  }
  
  return await response.json();
  
  /* Expected response format:
  [{
    id: number,
    fullName: string,
    bedNumber: string,
    checkInDate: string,
    checkOutDate: string,
    status: 'active' | 'checked_out',
    debt: number,
    servedByEmployee: string
  }]
  */
};

/**
 * Fetch guests for calendar view on a specific date
 * Requirement #3: Returns ALL guests within the time window
 */
export const fetchCalendarGuests = async (date) => {
  const dateStr = date.toISOString().split('T')[0];
  const response = await fetch(`${API_BASE_URL}/calendar/guests?date=${dateStr}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch calendar guests');
  }
  
  return await response.json();
  
  /* Expected response format:
  [{
    id: number,
    roomNumber: string,
    bedNumber: string,
    fullName: string,
    checkInDate: string,
    checkOutDate: string,
    status: 'active' | 'checked_out',
    debt: number,
    servedByEmployee: string
  }]
  */
};

/**
 * Fetch all rooms with their current status
 */
export const fetchAllRooms = async () => {
  const response = await fetch(`${API_BASE_URL}/rooms`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  
  return await response.json();
};
