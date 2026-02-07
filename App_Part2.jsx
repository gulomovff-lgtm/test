// App.jsx - Part 2/5
// Copy all parts sequentially into one file to use

// UI Components

// Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

// Button Component
const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// NavItem Component
const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
      active
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

// Notification Component
const Notification = ({ message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  };
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg ${colors[type]} max-w-md`}>
      <div className="flex justify-between items-start">
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ currentView, setCurrentView, currentUser, handleLogout, t }) => {
  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: t.checkin || 'Dashboard' },
    { id: 'rooms', icon: '🚪', label: t.rooms || 'Rooms' },
    { id: 'calendar', icon: '📅', label: t.calendar || 'Calendar' },
    { id: 'reports', icon: '📊', label: t.reports || 'Reports' },
    { id: 'debts', icon: '💰', label: t.debts || 'Debts' },
    { id: 'tasks', icon: '✓', label: t.tasks || 'Tasks' },
    { id: 'clients', icon: '👥', label: t.clients || 'Clients' },
    { id: 'staff', icon: '👨‍💼', label: t.staff || 'Staff' },
    { id: 'shifts', icon: '🕐', label: t.shifts || 'Shifts' },
  ];
  
  return (
    <div className="bg-white h-screen w-64 shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Hostel Manager</h1>
        <p className="text-sm text-gray-600 mt-1">{currentUser?.login || 'User'}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <Button variant="danger" onClick={handleLogout} className="w-full">
          {t.logout || 'Logout'}
        </Button>
      </div>
    </div>
  );
};

// Mobile Navigation Component
const MobileNavigation = ({ currentView, setCurrentView, currentUser, handleLogout, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center md:hidden">
        <h1 className="text-xl font-bold text-blue-600">Hostel Manager</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
          ☰
        </button>
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)}>
          <div className="bg-white w-64 h-full shadow-lg" onClick={e => e.stopPropagation()}>
            <Navigation
              currentView={currentView}
              setCurrentView={(view) => { setCurrentView(view); setIsOpen(false); }}
              currentUser={currentUser}
              handleLogout={handleLogout}
              t={t}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin, error }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(login, password);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Hostel Manager</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Логин</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className={inputClass}
              placeholder="Введите логин"
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Введите пароль"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>
      </Card>
    </div>
  );
};

// Dashboard Stats Component
const DashboardStats = ({ guests, rooms, debts }) => {
  const occupied = guests.filter(g => g.status === 'checked_in').length;
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((sum, r) => sum + (r.beds || 0), 0);
  const occupiedBeds = guests.filter(g => g.status === 'checked_in').length;
  const totalDebts = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const stats = [
    { label: 'Занято комнат', value: `${occupied} / ${totalRooms}`, icon: '🚪', color: 'blue' },
    { label: 'Занято мест', value: `${occupiedBeds} / ${totalBeds}`, icon: '🛏️', color: 'green' },
    { label: 'Гостей сейчас', value: occupied, icon: '👥', color: 'purple' },
    { label: 'Общий долг', value: `${totalDebts} сум`, icon: '💰', color: 'red' },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <Card key={idx} className="text-center">
          <div className="text-4xl mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
};

// Charts Section Component
const ChartsSection = ({ guests, expenses }) => {
  // Calculate revenue for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  });
  
  const revenueData = last7Days.map(date => {
    const dayGuests = guests.filter(g => {
      const checkIn = new Date(g.checkInDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      return checkIn === date;
    });
    return dayGuests.reduce((sum, g) => sum + getTotalPaid(g), 0);
  });
  
  const maxRevenue = Math.max(...revenueData, 1);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <h3 className="text-lg font-bold mb-4">Доход за неделю</h3>
        <div className="space-y-2">
          {last7Days.map((day, idx) => (
            <div key={idx} className="flex items-center">
              <div className="w-16 text-sm text-gray-600">{day}</div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-600 rounded-full h-6 flex items-center justify-end pr-2 text-white text-xs font-medium"
                    style={{ width: `${(revenueData[idx] / maxRevenue) * 100}%` }}
                  >
                    {revenueData[idx] > 0 ? `${revenueData[idx]} сум` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-bold mb-4">Расходы</h3>
        <div className="space-y-2">
          {expenses.slice(0, 5).map((expense, idx) => (
            <div key={idx} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">{expense.description}</div>
                <div className="text-xs text-gray-500">{getLocalDateString(expense.date)}</div>
              </div>
              <div className="font-bold text-red-600">{expense.amount} сум</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft('Время вышло!');
        clearInterval(timer);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  return <span className="font-mono font-bold">{timeLeft}</span>;
};

// Room Card Chess Component
const RoomCardChess = ({ room, guests, onRoomClick, onGuestClick }) => {
  const roomGuests = guests.filter(g => g.roomId === room.id && g.status === 'checked_in');
  const isFull = roomGuests.length >= (room.beds || 0);
  
  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        isFull ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
      } hover:shadow-lg`}
      onClick={() => onRoomClick(room)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{room.name || room.id}</h3>
        <span className={`px-2 py-1 rounded text-sm font-medium ${
          isFull ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
        }`}>
          {roomGuests.length} / {room.beds || 0}
        </span>
      </div>
      
      <div className="space-y-1">
        {roomGuests.map(guest => (
          <div
            key={guest.id}
            className="bg-white p-2 rounded text-sm hover:bg-gray-100"
            onClick={(e) => { e.stopPropagation(); onGuestClick(guest); }}
          >
            <div className="font-medium">{guest.fullName}</div>
            <div className="text-xs text-gray-600">
              до {getLocalDateString(guest.checkOutDate)}
            </div>
          </div>
        ))}
      </div>
      
      {!isFull && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Свободно: {(room.beds || 0) - roomGuests.length}
        </div>
      )}
    </div>
  );
};

// ============================================
// End of Part 2/5
// Continue with Part 3/5
// ============================================
