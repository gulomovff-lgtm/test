// ============================================
// App.jsx - Part 2/5
// UI Components
// ============================================

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
      active
        ? 'bg-indigo-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const Navigation = ({ 
  activeView, 
  setActiveView, 
  currentUser, 
  onLogout,
  selectedHostelFilter,
  setSelectedHostelFilter,
  hostels,
  lang,
  t
}) => {
  const canSwitchHostels = currentUser.role === 'admin' || 
                            currentUser.role === 'super' || 
                            currentUser.login === 'fazliddin';
  
  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-indigo-600">
          {t.appTitle}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {currentUser.name} ({currentUser.role})
        </p>
      </div>
      
      {canSwitchHostels && (
        <div className="p-4 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Хостел:
          </label>
          <select
            value={selectedHostelFilter}
            onChange={(e) => setSelectedHostelFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Все хостелы</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      )}
      
      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon="📊"
          label={t.dashboard}
          active={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />
        <NavItem
          icon="📅"
          label={t.calendar}
          active={activeView === 'calendar'}
          onClick={() => setActiveView('calendar')}
        />
        <NavItem
          icon="👥"
          label={t.staff}
          active={activeView === 'staff'}
          onClick={() => setActiveView('staff')}
        />
        <NavItem
          icon="🧳"
          label={t.clients}
          active={activeView === 'clients'}
          onClick={() => setActiveView('clients')}
        />
        <NavItem
          icon="✓"
          label={t.tasks}
          active={activeView === 'tasks'}
          onClick={() => setActiveView('tasks')}
        />
        <NavItem
          icon="💰"
          label={t.debts}
          active={activeView === 'debts'}
          onClick={() => setActiveView('debts')}
        />
        <NavItem
          icon="📈"
          label={t.reports}
          active={activeView === 'reports'}
          onClick={() => setActiveView('reports')}
        />
        <NavItem
          icon="⏰"
          label={t.shifts}
          active={activeView === 'shifts'}
          onClick={() => setActiveView('shifts')}
        />
      </nav>
      
      <div className="p-4 border-t">
        <Button
          onClick={onLogout}
          variant="secondary"
          className="w-full"
        >
          {t.logout}
        </Button>
      </div>
    </div>
  );
};

const DashboardStats = ({ guests, hostels, selectedHostelFilter }) => {
  const filteredGuests = guests.filter(g => 
    !selectedHostelFilter || g.hostelId === selectedHostelFilter
  );
  
  const activeGuests = filteredGuests.filter(g => g.status === 'active').length;
  const totalRevenue = filteredGuests.reduce((sum, g) => {
    const paid = getTotalPaid(g);
    return sum + paid;
  }, 0);
  
  const occupancyRate = useMemo(() => {
    const selectedHostels = selectedHostelFilter 
      ? hostels.filter(h => h.id === selectedHostelFilter)
      : hostels;
    
    const totalBeds = selectedHostels.reduce((sum, h) => {
      return sum + h.rooms.reduce((roomSum, r) => roomSum + r.beds.length, 0);
    }, 0);
    
    return totalBeds > 0 ? Math.round((activeGuests / totalBeds) * 100) : 0;
  }, [activeGuests, hostels, selectedHostelFilter]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Активные гости</p>
            <p className="text-3xl font-bold text-indigo-600">{activeGuests}</p>
          </div>
          <div className="text-4xl">🧳</div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Заполняемость</p>
            <p className="text-3xl font-bold text-green-600">{occupancyRate}%</p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Доход (всего)</p>
            <p className="text-3xl font-bold text-purple-600">
              {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-4xl">💰</div>
        </div>
      </Card>
    </div>
  );
};

const ChartsSection = ({ guests, selectedHostelFilter }) => {
  const chartData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      const dayGuests = guests.filter(g => {
        if (selectedHostelFilter && g.hostelId !== selectedHostelFilter) return false;
        const checkInDate = new Date(g.checkInDate);
        return checkInDate.toLocaleDateString() === dateStr;
      });
      
      last7Days.push({
        date: dateStr,
        count: dayGuests.length
      });
    }
    return last7Days;
  }, [guests, selectedHostelFilter]);
  
  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  
  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">Заезды за последние 7 дней</h2>
      <div className="flex items-end gap-2 h-48">
        {chartData.map((day, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-indigo-500 rounded-t transition-all"
              style={{ 
                height: `${(day.count / maxCount) * 100}%`,
                minHeight: day.count > 0 ? '20px' : '0'
              }}
            ></div>
            <p className="text-xs mt-2 text-center">{day.date.split('/')[0]}/{day.date.split('/')[1]}</p>
            <p className="text-sm font-bold">{day.count}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const RoomCardChess = ({ 
  hostel, 
  guests, 
  onBedClick, 
  canEdit 
}) => {
  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">{hostel.name}</h2>
      <div className="space-y-4">
        {hostel.rooms.map(room => {
          const roomGuests = guests.filter(g => 
            g.hostelId === hostel.id && 
            g.roomNumber === room.number && 
            g.status === 'active'
          );
          
          return (
            <div key={room.number} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                Комната {room.number} ({room.type})
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {room.beds.map(bedId => {
                  const guest = roomGuests.find(g => g.bedId === bedId);
                  const isOccupied = !!guest;
                  
                  return (
                    <button
                      key={bedId}
                      onClick={() => canEdit && onBedClick(hostel.id, room.number, bedId, guest)}
                      disabled={!canEdit}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${isOccupied 
                          ? 'bg-red-100 border-red-400 hover:bg-red-200' 
                          : 'bg-green-100 border-green-400 hover:bg-green-200'
                        }
                        ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="text-center">
                        <div className="font-bold">{bedId}</div>
                        {isOccupied && (
                          <div className="text-xs mt-1 truncate">
                            {guest.fullName.split(' ')[0]}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ============================================
// End of Part 2/5
// ============================================
