import React, { useState, useEffect } from 'react';
import { fetchCalendarGuests } from '../../services/roomService';
import { shouldShowGuest } from '../../utils/dateHelpers';

/**
 * CalendarView Component
 * Requirement #3: Show ALL guests from last 7 days (active OR checked_out)
 * Not just currently active guests
 */
const CalendarView = ({ selectedDate }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuests = async () => {
      try {
        const allGuests = await fetchCalendarGuests(selectedDate);
        
        // Requirement #3: Filter using centralized logic for consistency
        const visibleGuests = allGuests.filter(shouldShowGuest);
        
        setGuests(visibleGuests);
      } catch (error) {
        console.error('Failed to load calendar guests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGuests();
  }, [selectedDate]);

  const getGuestRowStyle = (guest) => {
    // Requirement #4: Gray background for checked_out with debt
    if (guest.status === 'checked_out' && guest.debt > 0) {
      return {
        backgroundColor: '#e0e0e0',
      };
    }
    
    if (guest.status === 'active') {
      return {
        backgroundColor: '#ffffff',
      };
    }
    
    return {
      backgroundColor: '#f9f9f9',
    };
  };

  if (loading) {
    return <div className="calendar-view loading">Загрузка...</div>;
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>Календарь на {selectedDate.toLocaleDateString()}</h2>
      </div>
      
      <div className="calendar-grid">
        <table className="guests-table">
          <thead>
            <tr>
              <th>Комната</th>
              <th>Место</th>
              <th>Гость</th>
              <th>Заселение</th>
              <th>Выселение</th>
              <th>Статус</th>
              <th>Долг</th>
              <th>Обслуживал</th>
            </tr>
          </thead>
          <tbody>
            {guests.map(guest => (
              <tr 
                key={guest.id} 
                style={getGuestRowStyle(guest)}
                className={`guest-row ${guest.status}`}
              >
                <td>{guest.roomNumber}</td>
                <td>{guest.bedNumber}</td>
                <td>{guest.fullName}</td>
                <td>{new Date(guest.checkInDate).toLocaleDateString()}</td>
                <td>{new Date(guest.checkOutDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${guest.status}`}>
                    {guest.status === 'active' ? 'Проживает' : 'Выехал'}
                  </span>
                </td>
                <td>
                  {guest.debt > 0 ? (
                    <span className="debt-amount" style={{ color: 'red', fontWeight: 'bold' }}>
                      {guest.debt.toLocaleString()} сум
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td>{guest.servedByEmployee}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {guests.length === 0 && (
          <div className="no-guests-message">
            Нет гостей на выбранную дату
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
