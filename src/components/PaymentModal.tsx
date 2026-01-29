import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Loader2, DollarSign } from 'lucide-react';
import { Guest, Payment } from '../types';
import { calculateDebt, formatCurrency } from '../utils/helpers';
import { TRANSLATIONS, Language } from '../utils/translations';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest;
  payments: Payment[];
  onSubmitPayment: (guestId: string, amount: number, method: Payment['method']) => Promise<void>;
  lang: Language;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  guest,
  payments,
  onSubmitPayment,
  lang,
}) => {
  const t = (key: string) => TRANSLATIONS[lang][key];
  
  // ✅ Double-click prevention
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Payment['method']>('cash');

  const debt = calculateDebt(guest, payments);
  const totalPaid = payments
    .filter(p => p.guestId === guest.id)
    .reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Guard clause to prevent double submission
    if (isProcessing) return;
    
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert(lang === 'ru' ? 'Введите корректную сумму' : 'To\'g\'ri miqdorni kiriting');
      return;
    }

    setIsProcessing(true);
    try {
      await onSubmitPayment(guest.id, paymentAmount, method);
      setAmount('');
      alert(t('successPayment'));
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      alert(t('errorOccurred'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setAmount('');
      setMethod('cash');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lang === 'ru' ? 'Оплата' : 'To\'lov'} size="sm">
      <div className="space-y-4">
        {/* Payment summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('totalPrice')}:</span>
            <span className="font-bold">{formatCurrency(guest.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('paid')}:</span>
            <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600">{t('debt')}:</span>
            <span className={`font-bold text-lg ${debt > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatCurrency(debt)}
            </span>
          </div>
        </div>

        {/* Payment form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {lang === 'ru' ? 'Сумма платежа' : 'To\'lov miqdori'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isProcessing}
              placeholder={lang === 'ru' ? 'Введите сумму' : 'Miqdorni kiriting'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {lang === 'ru' ? 'Способ оплаты' : 'To\'lov usuli'}
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Payment['method'])}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isProcessing}
            >
              <option value="cash">{lang === 'ru' ? 'Наличные' : 'Naqd'}</option>
              <option value="card">{lang === 'ru' ? 'Карта' : 'Karta'}</option>
              <option value="transfer">{lang === 'ru' ? 'Перевод' : 'O\'tkazma'}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {t('processing')}
                </>
              ) : (
                <>
                  <DollarSign size={18} />
                  {t('save')}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Payment history */}
        {payments.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">
              {lang === 'ru' ? 'История платежей' : 'To\'lovlar tarixi'}
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {payments.map(payment => (
                <div key={payment.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                  <span>{formatCurrency(payment.amount)}</span>
                  <span className="text-gray-600">{payment.method}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
