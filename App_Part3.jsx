// App.jsx - Part 3/5
// Copy all parts sequentially into one file to use

// Modal Components

// Check-In Modal Component
const CheckInModal = ({ isOpen, onClose, onSubmit, rooms, countries, canEdit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    country: '',
    birthDate: '',
    phone: '',
    email: '',
    roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: '',
    pricePerDay: '',
    deposit: 0,
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      fullName: '',
      passport: '',
      country: '',
      birthDate: '',
      phone: '',
      email: '',
      roomId: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: '',
      pricePerDay: '',
      deposit: 0,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Заселение гостя</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ФИО *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
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
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Страна *</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              >
                <option value="">Выберите страну</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Дата рождения</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Комната *</label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              >
                <option value="">Выберите комнату</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.id} ({r.beds} мест)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Цена за день *</label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Дата заселения *</label>
              <input
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Дата выселения *</label>
              <input
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                className={inputClass}
                required
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className={labelClass}>Предоплата</label>
              <input
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canEdit}>
              Заселить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Guest Details Modal Component
const GuestDetailsModal = ({ guest, isOpen, onClose, onUpdate, onCheckout, onPrint, canEdit }) => {
  const [payment, setPayment] = useState('');
  const [note, setNote] = useState('');
  
  if (!isOpen || !guest) return null;
  
  const totalPaid = getTotalPaid(guest);
  const balance = (guest.totalPrice || 0) - totalPaid;
  
  const handleAddPayment = () => {
    if (payment && parseFloat(payment) > 0) {
      onUpdate(guest.id, {
        payments: [...(guest.payments || []), {
          amount: parseFloat(payment),
          date: new Date().toISOString(),
          note: note || 'Оплата',
        }]
      });
      setPayment('');
      setNote('');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Информация о госте</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Guest Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ФИО</p>
              <p className="font-medium">{guest.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Паспорт</p>
              <p className="font-medium">{guest.passport}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Страна</p>
              <p className="font-medium">{guest.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Комната</p>
              <p className="font-medium">{guest.roomId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Заселение</p>
              <p className="font-medium">{getLocalDateString(guest.checkInDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Выселение</p>
              <p className="font-medium">{getLocalDateString(guest.checkOutDate)}</p>
            </div>
          </div>
          
          {/* Financial Info */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Финансы</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Всего</p>
                <p className="text-xl font-bold">{guest.totalPrice} сум</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Оплачено</p>
                <p className="text-xl font-bold text-green-600">{totalPaid} сум</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Баланс</p>
                <p className={`text-xl font-bold ${balance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {balance} сум
                </p>
              </div>
            </div>
          </div>
          
          {/* Add Payment */}
          {guest.status === 'checked_in' && canEdit && (
            <div className="border-t pt-4">
              <h3 className="font-bold mb-2">Добавить оплату</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  placeholder="Сумма"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Примечание"
                  className={inputClass}
                />
                <Button onClick={handleAddPayment}>Добавить</Button>
              </div>
            </div>
          )}
          
          {/* Payment History */}
          {guest.payments && guest.payments.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-bold mb-2">История оплат</h3>
              <div className="space-y-2">
                {guest.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div>
                      <p className="font-medium">{p.amount} сум</p>
                      <p className="text-xs text-gray-600">{p.note || 'Оплата'}</p>
                    </div>
                    <p className="text-sm text-gray-600">{getLocalDateString(p.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 justify-end border-t pt-4">
            <Button variant="secondary" onClick={() => onPrint('check', guest)}>
              Чек
            </Button>
            <Button variant="secondary" onClick={() => onPrint('regcard', guest)}>
              Анкета
            </Button>
            <Button variant="secondary" onClick={() => onPrint('ref', guest)}>
              Справка
            </Button>
            {guest.status === 'checked_in' && (
              <Button 
                variant="danger" 
                onClick={() => onCheckout(guest.id)}
                disabled={!canEdit}
              >
                Выселить
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Move Guest Modal Component
const MoveGuestModal = ({ guest, isOpen, onClose, onMove, rooms, canEdit }) => {
  const [newRoomId, setNewRoomId] = useState('');
  
  if (!isOpen || !guest) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onMove(guest.id, newRoomId);
    setNewRoomId('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Переместить гостя</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="mb-2"><strong>Гость:</strong> {guest.fullName}</p>
            <p className="mb-4"><strong>Текущая комната:</strong> {guest.roomId}</p>
          </div>
          
          <div>
            <label className={labelClass}>Новая комната *</label>
            <select
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
              className={inputClass}
              required
              disabled={!canEdit}
            >
              <option value="">Выберите комнату</option>
              {rooms.filter(r => r.id !== guest.roomId).map(r => (
                <option key={r.id} value={r.id}>
                  {r.name || r.id} ({r.beds} мест)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canEdit}>
              Переместить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Expense Modal Component
const ExpenseModal = ({ isOpen, onClose, onSubmit, canEdit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      description: '',
      amount: '',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Добавить расход</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Описание *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={inputClass}
              required
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Сумма *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className={inputClass}
              required
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={inputClass}
              disabled={!canEdit}
            >
              <option value="utilities">Коммунальные услуги</option>
              <option value="supplies">Расходные материалы</option>
              <option value="maintenance">Ремонт и обслуживание</option>
              <option value="salary">Зарплата</option>
              <option value="other">Прочее</option>
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Дата</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canEdit}>
              Добавить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Room Form Modal Component
const RoomFormModal = ({ isOpen, onClose, onSubmit, room, canEdit }) => {
  const [formData, setFormData] = useState({
    name: room?.name || '',
    beds: room?.beds || 1,
    pricePerDay: room?.pricePerDay || '',
    floor: room?.floor || 1,
  });
  
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        beds: room.beds || 1,
        pricePerDay: room.pricePerDay || '',
        floor: room.floor || 1,
      });
    }
  }, [room]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{room ? 'Редактировать комнату' : 'Добавить комнату'}</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Название *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={inputClass}
              required
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Количество мест *</label>
            <input
              type="number"
              value={formData.beds}
              onChange={(e) => setFormData({...formData, beds: parseInt(e.target.value)})}
              className={inputClass}
              min="1"
              required
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Цена за день</label>
            <input
              type="number"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          
          <div>
            <label className={labelClass}>Этаж</label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canEdit}>
              {room ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Shift Closing Modal Component
const ShiftClosingModal = ({ isOpen, onClose, onSubmit, currentShift }) => {
  const [notes, setNotes] = useState('');
  
  if (!isOpen || !currentShift) return null;
  
  const handleSubmit = () => {
    onSubmit(notes);
    setNotes('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Закрыть смену</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <p><strong>Заработано:</strong> {currentShift.totalEarned || 0} сум</p>
            <p><strong>Начало смены:</strong> {getLocalDateString(currentShift.startTime)}</p>
          </div>
          
          <div>
            <label className={labelClass}>Примечания</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              rows="4"
              placeholder="Добавьте примечания к смене..."
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button variant="danger" onClick={handleSubmit}>
              Закрыть смену
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shift Block Screen Component
const ShiftBlockScreen = ({ message }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold mb-4">Смена заблокирована</h2>
        <p className="text-gray-700">{message}</p>
      </Card>
    </div>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    onSubmit(oldPassword, newPassword);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Сменить пароль</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Старый пароль *</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Новый пароль *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Подтвердите пароль *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              Сменить пароль
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Client Import Modal Component
const ClientImportModal = ({ isOpen, onClose, onImport }) => {
  const [csvData, setCsvData] = useState('');
  
  if (!isOpen) return null;
  
  const handleImport = () => {
    onImport(csvData);
    setCsvData('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Импорт клиентов</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Вставьте CSV данные (формат: имя,паспорт,страна,телефон,email)
            </p>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className={inputClass}
              rows="10"
              placeholder="John Doe,AB123456,USA,+1234567890,john@example.com&#10;Jane Smith,CD789012,UK,+9876543210,jane@example.com"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleImport}>
              Импортировать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Client Edit Modal Component
const ClientEditModal = ({ isOpen, onClose, onSubmit, client, countries }) => {
  const [formData, setFormData] = useState(client || {});
  
  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Редактировать клиента</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ФИО *</label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Паспорт *</label>
              <input
                type="text"
                value={formData.passport || ''}
                onChange={(e) => setFormData({...formData, passport: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <label className={labelClass}>Страна</label>
              <select
                value={formData.country || ''}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className={inputClass}
              >
                <option value="">Выберите страну</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Телефон</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={inputClass}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              Сохранить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Debt Modal Component
const CreateDebtModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    reason: '',
    dueDate: '',
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      clientName: '',
      amount: '',
      reason: '',
      dueDate: '',
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Добавить долг</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Клиент *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Сумма *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Причина</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Срок погашения</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className={inputClass}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// End of Part 3/5
// Continue with Part 4/5
// ============================================
