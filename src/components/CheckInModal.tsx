import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Loader2, User as UserIcon } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/translations';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckInFormData) => Promise<void>;
  roomId?: string;
  bedId?: string;
  prefillData?: Partial<CheckInFormData>;
  lang: Language;
}

export interface CheckInFormData {
  clientId?: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  phoneNumber: string;
  country: string;
  roomId: string;
  bedId: string;
  days: number;
  pricePerNight: number;
  isScanning?: boolean;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  roomId = '',
  bedId = '',
  prefillData,
  lang,
}) => {
  const t = (key: string) => TRANSLATIONS[lang][key];
  
  // ✅ Double-click prevention
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [formData, setFormData] = useState<CheckInFormData>({
    firstName: '',
    lastName: '',
    passportNumber: '',
    phoneNumber: '',
    country: '',
    roomId,
    bedId,
    days: 1,
    pricePerNight: 100000,
    ...prefillData,
  });

  // Update form when prefill data changes (for "Repeat Stay")
  useEffect(() => {
    if (prefillData && isOpen) {
      setFormData(prev => ({
        ...prev,
        ...prefillData,
        roomId: roomId || prev.roomId,
        bedId: bedId || prev.bedId,
      }));
    }
  }, [prefillData, isOpen, roomId, bedId]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setIsScanning(false);
      if (!prefillData) {
        setFormData({
          firstName: '',
          lastName: '',
          passportNumber: '',
          phoneNumber: '',
          country: '',
          roomId: roomId || '',
          bedId: bedId || '',
          days: 1,
          pricePerNight: 100000,
        });
      }
    }
  }, [isOpen, prefillData, roomId, bedId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Guard clause to prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error checking in:', error);
      alert(t('errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    // Simulate document scanning
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        firstName: 'Scanned',
        lastName: 'User',
        passportNumber: 'SC1234567',
        country: 'Uzbekistan',
      }));
      setIsScanning(false);
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('checkIn')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document scanning */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={simulateScan}
            disabled={isScanning || isSubmitting}
            className="flex-1"
          >
            {isScanning ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {t('loading')}
              </>
            ) : (
              <>
                <UserIcon size={18} />
                Scan Document
              </>
            )}
          </Button>
        </div>

        {/* Client information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('firstName')}</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isSubmitting || isScanning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('lastName')}</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isSubmitting || isScanning}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('passportNumber')}</label>
          <input
            type="text"
            required
            value={formData.passportNumber}
            onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            disabled={isSubmitting || isScanning}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('phoneNumber')}</label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isSubmitting || isScanning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('country')}</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isSubmitting || isScanning}
            />
          </div>
        </div>

        {/* Stay information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('days')}</label>
            <input
              type="number"
              required
              min="1"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isSubmitting || isScanning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('pricePerNight')}</label>
            <input
              type="number"
              required
              min="0"
              value={formData.pricePerNight}
              onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isSubmitting || isScanning}
            />
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end gap-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || isScanning}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {t('processing')}
              </>
            ) : (
              t('checkIn')
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
