// ============================================
// App.jsx - Part 3/5
// Modals
// ============================================

const CheckInModal = ({ 
  isOpen, 
  onClose, 
  hostelId, 
  roomNumber, 
  bedId, 
  onCheckIn,
  hostel 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    country: 'Узбекистан',
    birthDate: '',
    phone: '',
    days: '1',
    pricePerNight: '',
    prepayment: '0',
    paymentMethod: 'cash'
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.fullName || !formData.passport || !formData.pricePerNight) {
      alert('Заполните обязательные поля!');
      return;
    }
    
    const totalPrice = parseInt(formData.days) * parseInt(formData.pricePerNight);
    const checkInDate = new Date();
    
    const guestData = {
      ...formData,
      hostelId,
      roomNumber,
      bedId,
      totalPrice,
      checkInDate: checkInDate.toISOString(),
      checkInDateTime: checkInDate.toISOString(),
      status: 'active',
      payments: formData.prepayment > 0 ? [{
        amount: formData.prepayment,
        method: formData.paymentMethod,
        date: new Date().toISOString(),
        type: 'checkin'
      }] : []
    };
    
    onCheckIn(guestData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          Заселение - {hostel?.name}
        </h2>
        <p className="text-gray-600 mb-4">
          Комната: {roomNumber}, Место: {bedId}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ФИО *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Паспорт *</label>
              <input
                type="text"
                value={formData.passport}
                onChange={(e) => setFormData({...formData, passport: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Страна</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Дата рождения</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Дней *</label>
              <input
                type="number"
                min="1"
                value={formData.days}
                onChange={(e) => setFormData({...formData, days: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Цена/ночь *</label>
              <input
                type="number"
                min="0"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Предоплата</label>
              <input
                type="number"
                min="0"
                value={formData.prepayment}
                onChange={(e) => setFormData({...formData, prepayment: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Метод оплаты</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="transfer">Перевод</option>
            </select>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">
              Итого к оплате: {(parseInt(formData.days) * parseInt(formData.pricePerNight) || 0).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSubmit} variant="primary">
            Заселить
          </Button>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

const GuestDetailsModal = ({ 
  isOpen, 
  onClose, 
  guest, 
  onCheckOut, 
  onAddPayment,
  hostel
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [checkoutManualRefund, setCheckoutManualRefund] = useState('');

  if (!isOpen || !guest) return null;

  const totalPaid = getTotalPaid(guest);
  const totalPrice = parseInt(guest.totalPrice) || 0;
  const balance = totalPaid - totalPrice;

  const handleAddPayment = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Введите сумму оплаты');
      return;
    }
    
    onAddPayment(guest, {
      amount: paymentAmount,
      method: paymentMethod,
      date: new Date().toISOString()
    });
    
    setPaymentAmount('');
    setShowPayment(false);
  };

  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убрана проверка долга при выселении
  const handleDoCheckout = () => { 
    // Разрешаем выселение всегда, если balance >= 0
    const refund = checkoutManualRefund ? parseInt(checkoutManualRefund) : Math.max(0, balance);
    
    const finalData = { 
      totalPrice: totalPrice,
      refundAmount: refund,
      checkOutDate: new Date().toISOString()
    }; 
    
    onCheckOut(guest, finalData); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">Информация о госте</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">ФИО</p>
            <p className="font-semibold">{guest.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Паспорт</p>
            <p className="font-semibold">{guest.passport}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Страна</p>
            <p className="font-semibold">{guest.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Телефон</p>
            <p className="font-semibold">{guest.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Комната / Место</p>
            <p className="font-semibold">{guest.roomNumber} / {guest.bedId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Дата заезда</p>
            <p className="font-semibold">
              {new Date(guest.checkInDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Дней</p>
            <p className="font-semibold">{guest.days}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Цена за ночь</p>
            <p className="font-semibold">{parseInt(guest.pricePerNight).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Итого</p>
              <p className="text-xl font-bold">{totalPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Оплачено</p>
              <p className="text-xl font-bold text-green-600">{totalPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {balance >= 0 ? 'Переплата' : 'Долг'}
              </p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(balance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        {guest.payments && guest.payments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">История платежей</h3>
            <div className="space-y-2">
              {guest.payments.map((payment, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <span>{new Date(payment.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{parseInt(payment.amount).toLocaleString()}</span>
                  <span className="text-sm text-gray-600">{payment.method}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!showPayment ? (
          <div className="flex gap-3">
            <Button onClick={() => setShowPayment(true)} variant="success">
              Добавить оплату
            </Button>
            <Button 
              onClick={handleDoCheckout} 
              variant="danger"
            >
              Выселить
            </Button>
            <Button onClick={() => printDocument('Чек', guest, hostel)} variant="secondary">
              Печать чека
            </Button>
            <Button onClick={() => printDocument('Анкета', guest, hostel)} variant="secondary">
              Анкета
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Сумма</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Метод</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="cash">Наличные</option>
                  <option value="card">Карта</option>
                  <option value="transfer">Перевод</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddPayment} variant="success">
                Подтвердить
              </Button>
              <Button onClick={() => setShowPayment(false)} variant="secondary">
                Отмена
              </Button>
            </div>
          </div>
        )}
        
        {balance > 0 && (
          <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm mb-2">Сумма возврата при выселении:</p>
            <input
              type="number"
              value={checkoutManualRefund}
              onChange={(e) => setCheckoutManualRefund(e.target.value)}
              placeholder={balance.toString()}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const MoveGuestModal = ({ 
  isOpen, 
  onClose, 
  guest, 
  hostels, 
  onMove 
}) => {
  const [newHostelId, setNewHostelId] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newBedId, setNewBedId] = useState('');

  if (!isOpen || !guest) return null;

  const selectedHostel = hostels.find(h => h.id === newHostelId);
  const availableRooms = selectedHostel ? selectedHostel.rooms : [];
  const selectedRoom = availableRooms.find(r => r.number === newRoomNumber);
  const availableBeds = selectedRoom ? selectedRoom.beds : [];

  const handleMove = () => {
    if (!newHostelId || !newRoomNumber || !newBedId) {
      alert('Выберите новое место');
      return;
    }
    
    onMove(guest, {
      hostelId: newHostelId,
      roomNumber: newRoomNumber,
      bedId: newBedId
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Переместить гостя</h2>
        <p className="mb-4">
          {guest.fullName} - {guest.roomNumber}/{guest.bedId}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Хостел</label>
            <select
              value={newHostelId}
              onChange={(e) => {
                setNewHostelId(e.target.value);
                setNewRoomNumber('');
                setNewBedId('');
              }}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Выберите хостел</option>
              {hostels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          
          {newHostelId && (
            <div>
              <label className="block text-sm font-medium mb-1">Комната</label>
              <select
                value={newRoomNumber}
                onChange={(e) => {
                  setNewRoomNumber(e.target.value);
                  setNewBedId('');
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Выберите комнату</option>
                {availableRooms.map(r => (
                  <option key={r.number} value={r.number}>
                    {r.number} ({r.type})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {newRoomNumber && (
            <div>
              <label className="block text-sm font-medium mb-1">Место</label>
              <select
                value={newBedId}
                onChange={(e) => setNewBedId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Выберите место</option>
                {availableBeds.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={handleMove} variant="primary">
            Переместить
          </Button>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  guest, 
  onAddPayment 
}) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');

  if (!isOpen || !guest) return null;

  const handleSubmit = () => {
    if (!amount || amount <= 0) {
      alert('Введите сумму');
      return;
    }
    
    onAddPayment(guest, {
      amount,
      method,
      date: new Date().toISOString()
    });
    
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Добавить оплату</h2>
        <p className="mb-4">{guest.fullName}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Сумма</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Метод оплаты</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="transfer">Перевод</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSubmit} variant="success">
            Добавить
          </Button>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

const AddExpenseModal = ({ 
  isOpen, 
  onClose, 
  onAddExpense,
  currentUser,
  selectedHostelFilter,
  hostels
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Коммунальные',
    description: '',
    method: 'cash'
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.amount || formData.amount <= 0) {
      alert('Введите сумму');
      return;
    }
    
    const hostel = hostels.find(h => h.id === selectedHostelFilter);
    
    onAddExpense({
      ...formData,
      date: new Date().toISOString(),
      staff: currentUser.name,
      hostelId: selectedHostelFilter,
      hostelName: hostel?.name || 'N/A'
    });
    
    setFormData({
      amount: '',
      category: 'Коммунальные',
      description: '',
      method: 'cash'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Добавить расход</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Сумма</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option>Коммунальные</option>
              <option>Зарплата</option>
              <option>Закупки</option>
              <option>Ремонт</option>
              <option>Прочее</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Метод оплаты</label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({...formData, method: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="transfer">Перевод</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSubmit} variant="primary">
            Добавить
          </Button>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// End of Part 3/5
// ============================================
