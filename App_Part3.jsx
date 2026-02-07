// ============================================
// App.jsx - Part 3/5
// Modal Components
// ============================================

// Change Password Modal Component
const ChangePasswordModal = ({ user, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    onSubmit({ oldPassword, newPassword });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Смена пароля</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Старый пароль</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Подтверждение пароля</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Create Debt Modal Component
const CreateDebtModal = ({ onClose, onSubmit, clients }) => {
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    onSubmit({
      clientId,
      clientName: client?.fullName || '',
      amount: parseInt(amount),
      description,
      dueDate,
      status: 'unpaid',
      createdAt: new Date().toISOString()
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Создать долг</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Клиент</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Выберите клиента</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.fullName} - {client.passport}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Сумма долга</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              rows="3"
            />
          </div>
          
          <div>
            <label className={labelClass}>Срок погашения</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Создать</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Client Import Modal Component
const ClientImportModal = ({ onClose, onImport }) => {
  const [jsonData, setJsonData] = useState('');
  
  const handleImport = () => {
    try {
      const data = JSON.parse(jsonData);
      onImport(data);
      onClose();
    } catch (error) {
      alert('Ошибка парсинга JSON: ' + error.message);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Импорт клиентов</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={labelClass}>JSON данные</label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className={inputClass}
              rows="10"
              placeholder='[{"fullName":"Иван Иванов","passport":"1234567890",...}]'
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleImport} className="flex-1">Импортировать</Button>
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Client Edit Modal Component
const ClientEditModal = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: client?.fullName || '',
    passport: client?.passport || '',
    phone: client?.phone || '',
    email: client?.email || '',
    country: client?.country || '',
    birthDate: client?.birthDate || '',
    notes: client?.notes || ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...client, ...formData });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Редактировать клиента</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>ФИО</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Паспорт</label>
            <input
              type="text"
              value={formData.passport}
              onChange={(e) => setFormData({...formData, passport: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Страна</label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className={inputClass}
            >
              <option value="">Выберите страну</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Дата рождения</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Примечания</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className={inputClass}
              rows="3"
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Check-In Modal Component (with AI passport scanning)
const CheckInModal = ({ onClose, onSubmit, rooms, clients }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    phone: '',
    country: '',
    roomNumber: '',
    bedId: '',
    days: '1',
    pricePerNight: '',
    paymentMethod: 'cash',
    initialPayment: '0'
  });
  const [scanning, setScanning] = useState(false);
  
  const handleScan = async (file) => {
    setScanning(true);
    // Simulated AI scanning - in production, call actual AI service
    setTimeout(() => {
      setFormData({
        ...formData,
        fullName: 'Иванов Иван Иванович',
        passport: '1234 567890',
        country: 'Россия'
      });
      setScanning(false);
    }, 2000);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const totalPrice = parseInt(formData.days) * parseInt(formData.pricePerNight);
    onSubmit({
      ...formData,
      totalPrice,
      checkInDate: new Date().toISOString(),
      status: 'checked_in'
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Заселение гостя</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">
              Сканировать паспорт (AI)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleScan(e.target.files[0])}
              className="w-full"
              disabled={scanning}
            />
            {scanning && <p className="text-sm text-blue-600 mt-2">Сканирование...</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ФИО *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Паспорт *</label>
              <input
                type="text"
                value={formData.passport}
                onChange={(e) => setFormData({...formData, passport: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Страна *</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className={inputClass}
                required
              >
                <option value="">Выберите страну</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Комната *</label>
              <select
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                className={inputClass}
                required
              >
                <option value="">Выберите комнату</option>
                {rooms.map(r => (
                  <option key={r.number} value={r.number}>Комната {r.number}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Место *</label>
              <input
                type="number"
                value={formData.bedId}
                onChange={(e) => setFormData({...formData, bedId: e.target.value})}
                className={inputClass}
                min="1"
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Количество дней *</label>
              <input
                type="number"
                value={formData.days}
                onChange={(e) => setFormData({...formData, days: e.target.value})}
                className={inputClass}
                min="1"
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Цена за ночь *</label>
              <input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Начальный платеж</label>
              <input
                type="number"
                value={formData.initialPayment}
                onChange={(e) => setFormData({...formData, initialPayment: e.target.value})}
                className={inputClass}
                min="0"
              />
            </div>
            
            <div>
              <label className={labelClass}>Способ оплаты</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className={inputClass}
              >
                <option value="cash">Наличные</option>
                <option value="card">Карта</option>
                <option value="transfer">Перевод</option>
              </select>
            </div>
          </div>
          
          {formData.days && formData.pricePerNight && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-lg font-semibold">
                Итого: {parseInt(formData.days) * parseInt(formData.pricePerNight)} ₽
              </p>
              <p className="text-sm text-gray-600">
                К оплате: {parseInt(formData.days) * parseInt(formData.pricePerNight) - parseInt(formData.initialPayment)} ₽
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Заселить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// FIXED: Guest Details Modal with corrected checkout logic
const GuestDetailsModal = ({ guest, onClose, onCheckOut, onPayment, onExtend }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [checkoutManualRefund, setCheckoutManualRefund] = useState('');
  
  const totalPaid = getTotalPaid(guest);
  const actualCost = parseInt(guest.totalPrice) || 0;
  const balance = totalPaid - actualCost;
  const { daysStayed, daysRemaining } = getStayDetails(guest);
  
  const handlePayment = () => {
    if (!paymentAmount || parseInt(paymentAmount) <= 0) {
      alert('Введите корректную сумму');
      return;
    }
    onPayment(guest, {
      amount: parseInt(paymentAmount),
      method: paymentMethod,
      date: new Date().toISOString()
    });
    setShowPayment(false);
    setPaymentAmount('');
  };
  
  // FIXED: Checkout logic - removed balance check blocking
  const handleDoCheckout = () => {
    // OLD BLOCKING CODE REMOVED:
    // if (balance < 0) return notify(`Ошибка! Долг...`, 'error');
    
    // NEW LOGIC: Allow checkout with debt, calculate refund properly
    const refund = checkoutManualRefund ? parseInt(checkoutManualRefund) : Math.max(0, balance);
    
    const finalData = {
      totalPrice: actualCost,
      refundAmount: refund,
      checkOutDate: new Date().toISOString()
    };
    
    onCheckOut(guest, finalData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Детали гостя</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ФИО</p>
              <p className="font-semibold">{guest.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Паспорт</p>
              <p className="font-semibold">{guest.passport}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Комната / Место</p>
              <p className="font-semibold">{guest.roomNumber} / {guest.bedId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Страна</p>
              <p className="font-semibold">{guest.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Дата заселения</p>
              <p className="font-semibold">{getLocalDateString(guest.checkInDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Прожито / Осталось</p>
              <p className="font-semibold">{daysStayed} / {daysRemaining} дней</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Финансы</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Стоимость проживания:</span>
                <span className="font-semibold">{actualCost.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Оплачено:</span>
                <span className="font-semibold text-green-600">{totalPaid.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Баланс:</span>
                <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance >= 0 ? '+' : ''}{balance.toLocaleString()} ₽
                </span>
              </div>
            </div>
          </div>
          
          {guest.payments && guest.payments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">История платежей</h3>
              <div className="space-y-2">
                {guest.payments.map((payment, index) => (
                  <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{getLocalDatetimeString(payment.date)}</span>
                    <span>{payment.method}</span>
                    <span className="font-semibold">{parseInt(payment.amount).toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showPayment ? (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Принять оплату</h3>
              <div>
                <label className={labelClass}>Сумма</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={inputClass}
                  placeholder="Введите сумму"
                />
              </div>
              <div>
                <label className={labelClass}>Способ оплаты</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={inputClass}
                >
                  <option value="cash">Наличные</option>
                  <option value="card">Карта</option>
                  <option value="transfer">Перевод</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePayment} className="flex-1">Принять</Button>
                <Button variant="secondary" onClick={() => setShowPayment(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setShowPayment(true)} variant="success">
                Принять оплату
              </Button>
              <Button onClick={() => onExtend(guest)} variant="secondary">
                Продлить
              </Button>
              <Button onClick={handleDoCheckout} variant="danger">
                Выселить
              </Button>
            </div>
          )}
          
          {balance > 0 && (
            <div className="bg-yellow-50 p-3 rounded">
              <label className="block text-sm font-medium mb-2">
                Сумма возврата (по умолчанию {Math.max(0, balance)} ₽)
              </label>
              <input
                type="number"
                value={checkoutManualRefund}
                onChange={(e) => setCheckoutManualRefund(e.target.value)}
                className={inputClass}
                placeholder={Math.max(0, balance).toString()}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Move Guest Modal Component
const MoveGuestModal = ({ guest, rooms, onClose, onMove }) => {
  const [newRoom, setNewRoom] = useState('');
  const [newBed, setNewBed] = useState('');
  
  const handleMove = () => {
    if (!newRoom || !newBed) {
      alert('Выберите комнату и место');
      return;
    }
    onMove(guest, newRoom, newBed);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Переместить гостя</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Текущее размещение</p>
            <p className="font-semibold">Комната {guest.roomNumber}, место {guest.bedId}</p>
          </div>
          
          <div>
            <label className={labelClass}>Новая комната</label>
            <select
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className={inputClass}
            >
              <option value="">Выберите комнату</option>
              {rooms.map(r => (
                <option key={r.number} value={r.number}>Комната {r.number}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Новое место</label>
            <input
              type="number"
              value={newBed}
              onChange={(e) => setNewBed(e.target.value)}
              className={inputClass}
              min="1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleMove} className="flex-1">Переместить</Button>
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Expense Modal Component
const ExpenseModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'utilities',
    date: new Date().toISOString().split('T')[0]
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Добавить расход</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Описание</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Сумма</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={inputClass}
            >
              <option value="utilities">Коммунальные услуги</option>
              <option value="supplies">Хозяйственные товары</option>
              <option value="maintenance">Ремонт</option>
              <option value="salary">Зарплата</option>
              <option value="other">Другое</option>
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Дата</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Добавить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Room Form Modal Component
const RoomFormModal = ({ room, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    number: room?.number || '',
    beds: room?.beds || 4,
    description: room?.description || '',
    pricePerNight: room?.pricePerNight || ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {room ? 'Редактировать комнату' : 'Добавить комнату'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Номер комнаты</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Количество мест</label>
            <input
              type="number"
              value={formData.beds}
              onChange={(e) => setFormData({...formData, beds: parseInt(e.target.value)})}
              className={inputClass}
              min="1"
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Цена за ночь</label>
            <input
              type="number"
              value={formData.pricePerNight}
              onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={inputClass}
              rows="3"
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Сохранить</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Shift Closing Modal Component
const ShiftClosingModal = ({ shift, onClose, onClose: onCloseShift }) => {
  const [cashCount, setCashCount] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleClose = () => {
    onCloseShift({
      ...shift,
      cashCount: parseInt(cashCount),
      notes,
      endTime: new Date().toISOString(),
      status: 'closed'
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Закрытие смены</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Смена начата</p>
            <p className="font-semibold">{getLocalDatetimeString(shift.startTime)}</p>
          </div>
          
          <div>
            <label className={labelClass}>Наличные в кассе</label>
            <input
              type="number"
              value={cashCount}
              onChange={(e) => setCashCount(e.target.value)}
              className={inputClass}
              placeholder="Подсчитайте и введите сумму"
            />
          </div>
          
          <div>
            <label className={labelClass}>Примечания</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              rows="3"
              placeholder="Особые замечания по смене..."
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleClose} className="flex-1">Закрыть смену</Button>
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Shift Block Screen Component
const ShiftBlockScreen = ({ message, onOpenShift }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md text-center">
        <AlertCircle className="mx-auto text-yellow-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-4">Смена не открыта</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button onClick={onOpenShift} className="w-full">
          Открыть смену
        </Button>
      </Card>
    </div>
  );
};

// ============================================
// End of Part 3/5
// Continue with Part 4/5
// ============================================
