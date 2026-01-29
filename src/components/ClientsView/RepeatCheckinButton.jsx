import React, { useState } from 'react';
import { startCheckin } from '../../services/guestService';

/**
 * RepeatCheckinButton Component
 * Requirement #2: Quick check-in with previous parameters
 * Pre-fills form with days, price, room/place, country from previous accommodation
 */
const RepeatCheckinButton = ({ accommodation, guestId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRepeatCheckin = async () => {
    // Requirement #5: Prevent double-click with loading state
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Pre-fill check-in form with previous parameters
      const checkinData = {
        guestId: guestId,
        roomNumber: accommodation.roomNumber,
        bedNumber: accommodation.bedNumber,
        numberOfDays: accommodation.numberOfDays,
        pricePerDay: accommodation.pricePerDay,
        country: accommodation.country,
        // Copy other relevant parameters
      };
      
      await startCheckin(checkinData);
      
      // Navigate to check-in form or open modal with pre-filled data
      // This would typically redirect to a check-in form component
      window.location.href = `/checkin?preload=${guestId}&template=${accommodation.id}`;
      
    } catch (error) {
      console.error('Failed to start repeat check-in:', error);
      alert('Ошибка при попытке повторного заселения');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className="btn-repeat-checkin"
      onClick={handleRepeatCheckin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="spinner" />
          Загрузка...
        </>
      ) : (
        'Повторить заселение'
      )}
    </button>
  );
};

export default RepeatCheckinButton;
