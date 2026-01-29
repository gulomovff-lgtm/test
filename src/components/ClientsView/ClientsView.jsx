import React, { useState } from 'react';
import GuestHistoryModal from './GuestHistoryModal';
import { useAuth } from '../../hooks/useAuth';

/**
 * ClientsView Component
 * Displays list of clients with ability to view history and manage permissions
 */
const ClientsView = () => {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  const handleClientClick = (client) => {
    setSelectedGuest(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
  };

  return (
    <div className="clients-view">
      <div className="clients-header">
        <h1>Клиенты</h1>
        
        {/* Search and basic actions available to all roles */}
        <div className="basic-actions">
          <button onClick={() => {/* Add new client */}}>
            Добавить нового
          </button>
          <input 
            type="text" 
            placeholder="Поиск по странам..." 
            className="country-search"
          />
        </div>

        {/* Admin-only actions - hidden for cashiers */}
        {isAdmin && (
          <div className="admin-actions">
            <button onClick={() => {/* Export clients */}}>
              Экспорт
            </button>
            <button onClick={() => {/* Import clients */}}>
              Импорт
            </button>
            <button onClick={() => {/* Merge clients */}}>
              Объединить
            </button>
            <button onClick={() => {/* Normalize countries */}}>
              Нормализация стран
            </button>
          </div>
        )}
      </div>

      {/* Clients list */}
      <div className="clients-list">
        {clients.map(client => (
          <div 
            key={client.id} 
            className="client-card"
            onClick={() => handleClientClick(client)}
            style={{ cursor: 'pointer' }}
          >
            <div className="client-name">{client.fullName}</div>
            <div className="client-info">
              <span>{client.country}</span>
              <span>Визиты: {client.totalVisits}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Guest History Modal */}
      {isModalOpen && selectedGuest && (
        <GuestHistoryModal 
          guest={selectedGuest}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ClientsView;
