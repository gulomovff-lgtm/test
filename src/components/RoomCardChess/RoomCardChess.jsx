import React, { useState, useEffect } from 'react';
import { fetchRoomGuests } from '../../services/roomService';
import { isWithinLast7Days } from '../../utils/dateHelpers';

/**
 * RoomCardChess Component
 * Requirement #3: Show ALL guests from last 7 days, not just active ones
 * Requirement #4: Style checked-out guests with debt (gray bar, red amount)
 */
const RoomCardChess = ({ roomNumber }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuests = async () => {
      try {
        const allGuests = await fetchRoomGuests(roomNumber);
        
        // Requirement #3: Show ALL guests (active OR checked_out in last 7 days)
        const visibleGuests = allGuests.filter(guest => {
          const isActive = guest.status === 'active';
          const isRecentCheckout = guest.status === 'checked_out' && 
                                   isWithinLast7Days(guest.checkOutDate);
          
          return isActive || isRecentCheckout;
        });
        
        setGuests(visibleGuests);
      } catch (error) {
        console.error('Failed to load room guests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGuests();
  }, [roomNumber]);

  const getGuestCardStyle = (guest) => {
    // Requirement #4: Gray bar for checked_out guests with debt
    if (guest.status === 'checked_out' && guest.debt > 0) {
      return {
        backgroundColor: '#cccccc', // Gray bar
        border: '1px solid #999',
      };
    }
    
    if (guest.status === 'active') {
      return {
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196F3',
      };
    }
    
    // Regular checked_out without debt
    return {
      backgroundColor: '#f5f5f5',
      border: '1px solid #ccc',
    };
  };

  const getDebtStyle = (debt) => {
    // Requirement #4: Red debt amount
    if (debt > 0) {
      return {
        color: 'red',
        fontWeight: 'bold',
      };
    }
    return {};
  };

  if (loading) {
    return <div className="room-card loading">Загрузка...</div>;
  }

  return (
    <div className="room-card-chess">
      <div className="room-header">
        <h3>Комната {roomNumber}</h3>
      </div>
      
      <div className="guests-list">
        {guests.length === 0 ? (
          <div className="no-guests">Нет гостей</div>
        ) : (
          guests.map(guest => (
            <div 
              key={guest.id} 
              className="guest-card"
              style={getGuestCardStyle(guest)}
            >
              <div className="guest-name">{guest.fullName}</div>
              <div className="guest-details">
                <span className="bed-number">Место {guest.bedNumber}</span>
                <span className="stay-duration">
                  {guest.checkInDate} - {guest.checkOutDate}
                </span>
                <span className="status-badge">
                  {guest.status === 'active' ? 'Проживает' : 'Выехал'}
                </span>
              </div>
              
              {/* Show debt amount in red if exists */}
              {guest.debt > 0 && (
                <div className="debt-info" style={getDebtStyle(guest.debt)}>
                  Долг: -{guest.debt.toLocaleString()} сум
                </div>
              )}
              
              <div className="guest-served-by">
                Обслуживал: {guest.servedByEmployee}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomCardChess;
