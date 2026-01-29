import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Repeat, Calendar, Bed, User } from 'lucide-react';
import { GuestHistoryItem } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { TRANSLATIONS, Language } from '../utils/translations';

interface ClientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GuestHistoryItem[];
  onRepeatStay: (lastGuest: GuestHistoryItem) => void;
  lang: Language;
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRepeatStay,
  lang,
}) => {
  const t = (key: string) => TRANSLATIONS[lang][key];

  if (!history.length) return null;

  // Calculate totals
  const totals = history.reduce(
    (acc, item) => ({
      spent: acc.spent + item.guest.totalPrice,
      paid: acc.paid + item.totalPaid,
      debt: acc.debt + item.debt,
      refunds: acc.refunds + item.refunds,
    }),
    { spent: 0, paid: 0, debt: 0, refunds: 0 }
  );

  const lastStay = history[0]; // Newest first

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('clientHistory')} size="lg">
      <div className="space-y-4">
        {/* Client info header */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">
            {history[0].client.firstName} {history[0].client.lastName}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">{t('passportNumber')}:</span>{' '}
              <span className="font-medium">{history[0].client.passportNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('phoneNumber')}:</span>{' '}
              <span className="font-medium">{history[0].client.phoneNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('country')}:</span>{' '}
              <span className="font-medium">{history[0].client.country}</span>
            </div>
          </div>
        </div>

        {/* Totals summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">{t('totalSpent')}</div>
            <div className="font-bold text-green-700">{formatCurrency(totals.spent)}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">{t('totalPaid')}</div>
            <div className="font-bold text-blue-700">{formatCurrency(totals.paid)}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">{t('totalDebt')}</div>
            <div className="font-bold text-red-700">{formatCurrency(totals.debt)}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">{t('totalRefunds')}</div>
            <div className="font-bold text-purple-700">{formatCurrency(totals.refunds)}</div>
          </div>
        </div>

        {/* Repeat last stay button */}
        <div className="flex justify-center">
          <Button
            variant="success"
            icon={Repeat}
            onClick={() => onRepeatStay(lastStay)}
          >
            {t('repeatLastStay')}
          </Button>
        </div>

        {/* Visit history */}
        <div>
          <h4 className="font-bold mb-3">{lang === 'ru' ? 'История посещений' : 'Tashrif tarixi'}</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((item, index) => (
              <div
                key={item.guest.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="font-medium">
                      {formatDate(item.guest.checkInDate)} -{' '}
                      {item.guest.checkOutDate 
                        ? formatDate(item.guest.checkOutDate)
                        : t('checkedIn')}
                    </span>
                    {index === 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                        {lang === 'ru' ? 'Последний' : 'Oxirgi'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        item.guest.status === 'checked_in'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {t(item.guest.status === 'checked_in' ? 'checkedIn' : 'checkedOut')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Bed size={14} className="text-gray-500" />
                    <span>
                      {t('room')} {item.room.number}, {t('bed')} {item.guest.bedId.split('-').pop()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500" />
                    <span>{item.guest.staffName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('days')}:</span>{' '}
                    <span className="font-medium">{item.guest.days}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('pricePerNight')}:</span>{' '}
                    <span className="font-medium">{formatCurrency(item.guest.pricePerNight)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 text-xs">{t('totalPrice')}</div>
                    <div className="font-bold">{formatCurrency(item.guest.totalPrice)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">{t('paid')}</div>
                    <div className="font-bold text-green-600">{formatCurrency(item.totalPaid)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">{t('debt')}</div>
                    <div className={`font-bold ${item.debt > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatCurrency(item.debt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
