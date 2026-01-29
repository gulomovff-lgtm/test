import React, { useState } from 'react';
import { Button } from './Button';
import { Search, Plus, FileSpreadsheet, Merge, Globe, Trash2, User as UserIcon } from 'lucide-react';
import { Client, User } from '../types';
import { TRANSLATIONS, Language } from '../utils/translations';

interface ClientsViewProps {
  clients: Client[];
  onUpdateClient: (id: string, updates: Partial<Client>) => void;
  onImportClients?: (data: any) => void;
  onDeduplicate?: () => void;
  onBulkDelete?: (ids: string[]) => void;
  onNormalizeCountries?: () => void;
  onClientClick: (clientId: string) => void;
  lang: Language;
  currentUser: User;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onDeduplicate,
  onBulkDelete,
  onNormalizeCountries,
  onClientClick,
  lang,
  currentUser,
}) => {
  const t = (key: string) => TRANSLATIONS[lang][key];
  
  // ✅ Role-based permission check
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter clients by search term
  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(search) ||
      client.lastName.toLowerCase().includes(search) ||
      client.passportNumber.toLowerCase().includes(search) ||
      client.phoneNumber.toLowerCase().includes(search) ||
      client.country.toLowerCase().includes(search)
    );
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (window.confirm(t('confirmDelete'))) {
      onBulkDelete?.(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{t('clients')}</h1>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Search - available to all users */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Add New Client - available to all users */}
          <Button
            icon={Plus}
            onClick={() => alert(t('addNewClient'))}
          >
            {t('addNewClient')}
          </Button>

          {/* Admin-only buttons */}
          {isAdmin && (
            <>
              <Button
                icon={Merge}
                variant="secondary"
                onClick={onDeduplicate}
              >
                {t('deduplicate')}
              </Button>
              <Button
                icon={Globe}
                variant="secondary"
                onClick={onNormalizeCountries}
              >
                {t('normalizeCountries')}
              </Button>
              <Button
                icon={FileSpreadsheet}
                variant="secondary"
                onClick={() => alert('Import CSV')}
              >
                Import CSV
              </Button>
              {selectedIds.size > 0 && (
                <Button
                  icon={Trash2}
                  variant="danger"
                  onClick={handleBulkDelete}
                >
                  {t('deleteSelected')} ({selectedIds.size})
                </Button>
              )}
            </>
          )}
        </div>

        {/* Role indicator */}
        <div className="text-sm text-gray-600 mb-4">
          {lang === 'ru' ? 'Роль' : 'Rol'}: <span className="font-semibold">{currentUser.role}</span>
          {!isAdmin && (
            <span className="ml-2 text-yellow-600">
              ({lang === 'ru' ? 'Ограниченный доступ' : 'Cheklangan kirish'})
            </span>
          )}
        </div>
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {isAdmin && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredClients.length && filteredClients.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(filteredClients.map(c => c.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left">{t('firstName')}</th>
              <th className="px-4 py-3 text-left">{t('lastName')}</th>
              <th className="px-4 py-3 text-left">{t('passportNumber')}</th>
              <th className="px-4 py-3 text-left">{t('phoneNumber')}</th>
              <th className="px-4 py-3 text-left">{t('country')}</th>
              <th className="px-4 py-3 text-left">{lang === 'ru' ? 'Действия' : 'Amallar'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr
                key={client.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onClientClick(client.id)}
              >
                {isAdmin && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(client.id)}
                      onChange={() => toggleSelect(client.id)}
                    />
                  </td>
                )}
                <td className="px-4 py-3">{client.firstName}</td>
                <td className="px-4 py-3">{client.lastName}</td>
                <td className="px-4 py-3">{client.passportNumber}</td>
                <td className="px-4 py-3">{client.phoneNumber}</td>
                <td className="px-4 py-3">{client.country}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="secondary"
                    onClick={() => onClientClick(client.id)}
                    className="text-sm py-1 px-2"
                  >
                    <UserIcon size={14} />
                    {lang === 'ru' ? 'История' : 'Tarix'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            {lang === 'ru' ? 'Клиенты не найдены' : 'Mijozlar topilmadi'}
          </div>
        )}
      </div>
    </div>
  );
};
