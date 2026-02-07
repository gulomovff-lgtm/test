// ============================================
// App.jsx - Part 2/5
// UI Components
// ============================================

// Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

// Button Component
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  className = '',
  type = 'button'
}) => {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// NavItem Component
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-100 text-indigo-700' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

// Notification Component
const Notification = ({ message, type, onClose }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };
  
  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-75">
        <X size={20} />
      </button>
    </div>
  );
};

// Mobile Navigation Component
const MobileNavigation = ({ activeTab, setActiveTab, language }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: TRANSLATIONS[language].dashboard },
    { id: 'rooms', icon: Building, label: TRANSLATIONS[language].rooms },
    { id: 'calendar', icon: Calendar, label: TRANSLATIONS[language].calendar },
    { id: 'clients', icon: Users, label: TRANSLATIONS[language].clients },
    { id: 'reports', icon: FileText, label: TRANSLATIONS[language].reports }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-gray-600'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ activeTab, setActiveTab, onLogout, currentUser, language }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: TRANSLATIONS[language].dashboard },
    { id: 'rooms', icon: Building, label: TRANSLATIONS[language].rooms },
    { id: 'calendar', icon: Calendar, label: TRANSLATIONS[language].calendar },
    { id: 'guests', icon: User, label: TRANSLATIONS[language].guests },
    { id: 'clients', icon: Users, label: TRANSLATIONS[language].clients },
    { id: 'staff', icon: Briefcase, label: TRANSLATIONS[language].staff },
    { id: 'reports', icon: FileText, label: TRANSLATIONS[language].reports },
    { id: 'debts', icon: DollarSign, label: TRANSLATIONS[language].debts },
    { id: 'tasks', icon: Clock, label: TRANSLATIONS[language].tasks },
    { id: 'shifts', icon: Clock, label: TRANSLATIONS[language].shifts }
  ];
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-600">Hostel CRM</h1>
        <p className="text-sm text-gray-600">{currentUser?.name}</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
        
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
        >
          <LogOut size={20} />
          <span>{TRANSLATIONS[language].logout}</span>
        </button>
      </nav>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(login, password);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">Hostel CRM</h1>
          <p className="text-gray-600">Войдите в систему</p>
        </div>
        
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Введите пароль"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
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
const DashboardStats = ({ guests, rooms, debts, income }) => {
  const activeGuests = guests.filter(g => g.status === 'checked_in').length;
  const occupiedBeds = guests.filter(g => g.status === 'checked_in').length;
  const totalBeds = rooms.reduce((sum, r) => sum + (r.beds || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const totalDebt = debts.reduce((sum, d) => sum + parseInt(d.amount || 0), 0);
  
  const stats = [
    { label: 'Активные гости', value: activeGuests, icon: User, color: 'text-blue-600' },
    { label: 'Заполненность', value: `${occupancyRate}%`, icon: Building, color: 'text-green-600' },
    { label: 'Долги', value: `${totalDebt.toLocaleString()} ₽`, icon: DollarSign, color: 'text-red-600' },
    { label: 'Доход за месяц', value: `${income.toLocaleString()} ₽`, icon: DollarSign, color: 'text-indigo-600' }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <stat.icon className={`${stat.color}`} size={32} />
          </div>
        </Card>
      ))}
    </div>
  );
};

// Charts Section Component
const ChartsSection = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Заполненность за неделю</h3>
        <div className="h-64 flex items-end justify-around gap-2">
          {data.weekOccupancy?.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-indigo-500 rounded-t"
                style={{ height: `${day.percentage}%` }}
              />
              <span className="text-xs mt-2">{day.label}</span>
            </div>
          ))}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Доходы и расходы</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Доходы</span>
              <span className="font-semibold text-green-600">
                {data.income?.toLocaleString()} ₽
              </span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: '75%' }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Расходы</span>
              <span className="font-semibold text-red-600">
                {data.expense?.toLocaleString()} ₽
              </span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: '45%' }}
              />
            </div>
          </div>
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
        setTimeLeft('Время истекло');
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${days}д ${hours}ч ${minutes}м`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  return <span className="text-sm text-gray-600">{timeLeft}</span>;
};

// FIXED: RoomCardChess Component with corrected guest display logic
const RoomCardChess = ({ room, guests, onBedClick }) => {
  const roomGuests = guests.filter(g => 
    g.roomNumber === room.number && g.status === 'checked_in'
  );
  
  const beds = [];
  for (let i = 1; i <= (room.beds || 4); i++) {
    const guest = roomGuests.find(g => g.bedId === i.toString());
    beds.push({ id: i, guest });
  }
  
  const occupiedCount = roomGuests.length;
  const totalBeds = room.beds || 4;
  const occupancyPercent = Math.round((occupiedCount / totalBeds) * 100);
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Комната {room.number}</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          occupancyPercent === 100 ? 'bg-red-100 text-red-700' :
          occupancyPercent > 50 ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {occupiedCount}/{totalBeds}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {beds.map(bed => (
          <button
            key={bed.id}
            onClick={() => onBedClick(room.number, bed.id, bed.guest)}
            className={`p-3 rounded-lg border-2 transition-colors ${
              bed.guest
                ? 'border-red-500 bg-red-50 hover:bg-red-100'
                : 'border-green-500 bg-green-50 hover:bg-green-100'
            }`}
          >
            <div className="text-sm font-medium mb-1">Место {bed.id}</div>
            {bed.guest ? (
              <div className="text-xs">
                <div className="font-semibold truncate">{bed.guest.fullName}</div>
                <div className="text-gray-600">{bed.guest.passport}</div>
                <CountdownTimer targetDate={
                  new Date(new Date(bed.guest.checkInDate).getTime() + 
                    parseInt(bed.guest.days) * 24 * 60 * 60 * 1000)
                } />
              </div>
            ) : (
              <div className="text-xs text-gray-500">Свободно</div>
            )}
          </button>
        ))}
      </div>
      
      {room.description && (
        <p className="text-sm text-gray-600 mt-3">{room.description}</p>
      )}
    </Card>
  );
};

// ============================================
// End of Part 2/5
// Continue with Part 3/5
// ============================================
