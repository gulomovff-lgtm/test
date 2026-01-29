import React, { useState } from 'react';
import { Room, Guest, Client } from '../types';
import { calculateDebt, formatCurrency } from '../utils/helpers';
import { Payment } from '../types';

interface RoomCardChessProps {
  room: Room;
  guests: Guest[];
  clients: Client[];
  payments: Payment[];
  onCheckIn: (roomId: string, bedId: string) => void;
  onClientClick: (clientId: string) => void;
  lang: 'ru' | 'uz';
}

export const RoomCardChess: React.FC<RoomCardChessProps> = ({
  room,
  guests,
  clients,
  payments,
  onCheckIn,
  onClientClick,
  lang,
}) => {
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);

  // Generate bed IDs
  const beds = Array.from({ length: room.beds }, (_, i) => ({
    id: `bed-${room.id}-${i + 1}`,
    number: i + 1,
  }));

  const renderBed = (bedId: string, bedNumber: number) => {
    // Find active guest in this bed
    const activeGuest = guests.find(
      g => String(g.roomId) === String(room.id) && 
           String(g.bedId) === String(bedId) &&
           g.status === 'checked_in'
    );

    // ✅ FIXED: Show ALL checked-out guests (removed 2-day filter)
    // Previously had: new Date(g.checkOutDate) > yesterday
    const ghostGuest = guests.find(g => 
      String(g.roomId) === String(room.id) && 
      String(g.bedId) === String(bedId) &&
      g.status === 'checked_out'
      // ❌ REMOVED THIS LINE: && new Date(g.checkOutDate) > yesterday
    );

    // Calculate debt for ghost guest
    const ghostDebt = ghostGuest ? calculateDebt(ghostGuest, payments) : 0;

    const client = activeGuest 
      ? clients.find(c => c.id === activeGuest.clientId)
      : ghostGuest
        ? clients.find(c => c.id === ghostGuest.clientId)
        : null;

    const isHovered = hoveredBed === bedId;

    return (
      <div
        key={bedId}
        className="relative aspect-square border-2 rounded-lg overflow-hidden transition-all cursor-pointer"
        style={{
          borderColor: activeGuest ? '#10b981' : ghostGuest ? '#9ca3af' : '#e5e7eb',
          backgroundColor: activeGuest ? '#d1fae5' : ghostGuest ? '#f3f4f6' : '#ffffff',
        }}
        onMouseEnter={() => setHoveredBed(bedId)}
        onMouseLeave={() => setHoveredBed(null)}
        onClick={() => {
          if (client) {
            onClientClick(client.id);
          }
        }}
      >
        {/* Bed number */}
        <div className="absolute top-1 left-1 bg-white px-2 py-0.5 rounded text-xs font-semibold">
          {bedNumber}
        </div>

        {/* Guest info */}
        {(activeGuest || ghostGuest) && client && (
          <div 
            className="p-2 h-full flex flex-col justify-center"
            style={{
              fontStyle: ghostGuest ? 'italic' : 'normal',
            }}
          >
            <div className="text-sm font-medium truncate">
              {client.firstName}
            </div>
            <div className="text-xs truncate">
              {client.lastName}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {client.country}
            </div>
            
            {/* Debt badge - RED even for ghost guests */}
            {((activeGuest && calculateDebt(activeGuest, payments) > 0) || 
              (ghostGuest && ghostDebt > 0)) && (
              <div 
                className="mt-1 text-xs font-bold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                }}
              >
                {lang === 'ru' ? 'Долг' : 'Qarz'}: {formatCurrency(
                  activeGuest ? calculateDebt(activeGuest, payments) : ghostDebt
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty bed */}
        {!activeGuest && !ghostGuest && (
          <div className="h-full flex items-center justify-center text-gray-400">
            <span className="text-2xl">🛏️</span>
          </div>
        )}

        {/* Hover overlay for ghost guests */}
        {ghostGuest && isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
            <div className="text-white text-sm font-medium mb-2">
              {lang === 'ru' ? 'Выселен' : 'Chiqarilgan'}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn(room.id, bedId);
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              {lang === 'ru' ? 'Заселить нового' : 'Yangi joylash'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">
          {lang === 'ru' ? 'Комната' : 'Xona'} {room.number}
        </h3>
        <span className="text-sm text-gray-600">
          {lang === 'ru' ? 'Этаж' : 'Qavat'} {room.floor}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {beds.map(bed => renderBed(bed.id, bed.number))}
      </div>
    </div>
  );
};
