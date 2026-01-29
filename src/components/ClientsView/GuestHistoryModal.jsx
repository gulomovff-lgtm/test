import React, { useState, useEffect } from 'react';
import { fetchGuestHistory } from '../../services/guestService';
import RepeatCheckinButton from './RepeatCheckinButton';

/**
 * GuestHistoryModal Component
 * Displays comprehensive guest history including accommodations, payments, debts
 * Requirement #1: Guest History + Client Card modal
 */
const GuestHistoryModal = ({ guest, onClose }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchGuestHistory(guest.id);
        setHistory(data);
      } catch (error) {
        console.error('Failed to load guest history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [guest.id]);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => {
      // Only close if clicking directly on overlay, not on modal content
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div 
        className="modal-content guest-history-modal" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-history-title"
      >
        <div className="modal-header">
          <h2 id="guest-history-title">История гостя + Карточка клиента</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Закрыть модальное окно"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Client Card Section */}
          <section className="client-card-section">
            <h3>Информация о клиенте</h3>
            <div className="client-details">
              <div className="detail-row">
                <span className="label">ФИО:</span>
                <span className="value">{history.personalInfo.fullName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Паспорт:</span>
                <span className="value">{history.personalInfo.passport}</span>
              </div>
              <div className="detail-row">
                <span className="label">Страна:</span>
                <span className="value">{history.personalInfo.country}</span>
              </div>
              <div className="detail-row">
                <span className="label">Общее количество визитов:</span>
                <span className="value">{history.stats.totalVisits}</span>
              </div>
              <div className="detail-row">
                <span className="label">Общие потраченные:</span>
                <span className="value">{history.stats.totalSpent.toLocaleString()} сум</span>
              </div>
              <div className="detail-row">
                <span className="label">Общие оплаченные:</span>
                <span className="value">{history.stats.totalPaid.toLocaleString()} сум</span>
              </div>
              <div className="detail-row">
                <span className="label">Возвраты:</span>
                <span className="value">{history.stats.totalRefunds.toLocaleString()} сум</span>
              </div>
            </div>
          </section>

          {/* Accommodation History */}
          <section className="accommodation-history-section">
            <h3>История размещений</h3>
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Дата заселения</th>
                    <th>Дата выселения</th>
                    <th>Комната/Место</th>
                    <th>Дней</th>
                    <th>Цена</th>
                    <th>Кто обслуживал</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {history.accommodations.map(acc => (
                    <tr key={acc.id}>
                      <td>{new Date(acc.checkInDate).toLocaleDateString()}</td>
                      <td>{new Date(acc.checkOutDate).toLocaleDateString()}</td>
                      <td>{acc.roomNumber} / {acc.bedNumber}</td>
                      <td>{acc.numberOfDays}</td>
                      <td>{acc.totalPrice.toLocaleString()} сум</td>
                      <td>{acc.servedByEmployee}</td>
                      <td>
                        <RepeatCheckinButton accommodation={acc} guestId={guest.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment History */}
          <section className="payment-history-section">
            <h3>История оплат</h3>
            <div className="payments-table">
              <table>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Сумма</th>
                    <th>Тип</th>
                    <th>Примечание</th>
                  </tr>
                </thead>
                <tbody>
                  {history.payments.map(payment => (
                    <tr key={payment.id}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td className={payment.type === 'debt' ? 'debt-amount' : ''}>
                        {payment.amount.toLocaleString()} сум
                      </td>
                      <td>{payment.type}</td>
                      <td>{payment.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Debts Section */}
          {history.debts.length > 0 && (
            <section className="debts-section">
              <h3>Долги</h3>
              <div className="debts-list">
                {history.debts.map(debt => (
                  <div key={debt.id} className="debt-item">
                    <span className="debt-date">{new Date(debt.date).toLocaleDateString()}</span>
                    <span className="debt-amount" style={{ color: 'red', fontWeight: 'bold' }}>
                      {debt.amount.toLocaleString()} сум
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Refunds Section */}
          {history.refunds.length > 0 && (
            <section className="refunds-section">
              <h3>Возвраты</h3>
              <div className="refunds-list">
                {history.refunds.map(refund => (
                  <div key={refund.id} className="refund-item">
                    <span className="refund-date">{new Date(refund.date).toLocaleDateString()}</span>
                    <span className="refund-amount">
                      {refund.amount.toLocaleString()} сум
                    </span>
                    <span className="refund-reason">{refund.reason}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestHistoryModal;
