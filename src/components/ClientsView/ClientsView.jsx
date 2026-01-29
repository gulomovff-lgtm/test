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
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  // TODO: Add useEffect to fetch clients data from API
  // useEffect(() => {
  //   fetchClients().then(setClients);
  // }, []);

  const handleClientClick = (client) => {
    setSelectedGuest(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
  };

  const handleAddNew = () => {
    // TODO: Implement add new client functionality
    console.log('Add new client');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // TODO: Implement client search by country
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clients');
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import clients');
  };

  const handleMerge = () => {
    // TODO: Implement merge functionality
    console.log('Merge clients');
  };

  const handleNormalizeCountries = () => {
    // TODO: Implement country normalization
    console.log('Normalize countries');
  };

  return (
    <div className="clients-view">
      <div className="clients-header">
        <h1>Клиенты</h1>
        
        {/* Search and basic actions available to all roles */}
        <div className="basic-actions">
          <button onClick={handleAddNew}>
            Добавить нового
          </button>
          <input 
            type="text" 
            placeholder="Поиск по странам..." 
            className="country-search"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Admin-only actions - hidden for cashiers */}
        {isAdmin && (
          <div className="admin-actions">
            <button onClick={handleExport}>
              Экспорт
            </button>
            <button onClick={handleImport}>
              Импорт
            </button>
            <button onClick={handleMerge}>
              Объединить
            </button>
            <button onClick={handleNormalizeCountries}>
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
