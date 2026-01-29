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
      
      // Navigate to check-in form with pre-loaded data
      // TODO: Replace with React Router navigation (useNavigate) for better UX
      const params = new URLSearchParams({
        preload: guestId,
        template: accommodation.id
      });
      window.location.href = `/checkin?${params.toString()}`;
      
    } catch (error) {
      console.error('Failed to start repeat check-in:', error);
      // TODO: Replace alert with toast notification system
      alert('Ошибка при попытке повторного заселения');
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
