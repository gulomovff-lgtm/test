// ============================================
// App.jsx - Part 5/5
// Main App Component
// ============================================

function App() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ login: '', pass: '' });
  const [activeView, setActiveView] = useState('dashboard');
  const [lang, setLang] = useState('ru');
  const [guests, setGuests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('');
  
  // Modal states
  const [checkInModal, setCheckInModal] = useState({ 
    isOpen: false, 
    hostelId: null, 
    roomNumber: null, 
    bedId: null 
  });
  const [guestDetailsModal, setGuestDetailsModal] = useState({ 
    isOpen: false, 
    guest: null 
  });
  const [moveGuestModal, setMoveGuestModal] = useState({ 
    isOpen: false, 
    guest: null 
  });
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  
  const t = TRANSLATIONS[lang];
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Особые права для Fazliddin
  const canEdit = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'super') return true;
    if (currentUser.login === 'fazliddin') {
      return selectedHostelFilter === 'hostel2';
    }
    return true;
  }, [currentUser, selectedHostelFilter]);
  
  // ============================================
  // FIREBASE / DATA LOADING
  // ============================================
  useEffect(() => {
    // Load mock data for demo
    const mockGuests = [
      {
        id: '1',
        fullName: 'Иван Иванов',
        passport: 'AB1234567',
        country: 'Россия',
        phone: '+79001234567',
        hostelId: 'hostel1',
        roomNumber: '101',
        bedId: 'A',
        days: '3',
        pricePerNight: '50000',
        totalPrice: '150000',
        checkInDate: new Date().toISOString(),
        checkInDateTime: new Date().toISOString(),
        status: 'active',
        payments: [{
          amount: '100000',
          method: 'cash',
          date: new Date().toISOString()
        }]
      }
    ];
    
    setGuests(mockGuests);
  }, []);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleLogin = () => {
    const user = DEFAULT_USERS.find(
      u => u.login === loginForm.login && u.pass === loginForm.pass
    );
    
    if (user) {
      setCurrentUser(user);
      if (user.hostelId) {
        setSelectedHostelFilter(user.hostelId);
      }
    } else {
      alert('Неверный логин или пароль');
    }
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ login: '', pass: '' });
    setActiveView('dashboard');
    setSelectedHostelFilter('');
  };
  
  const handleBedClick = (hostelId, roomNumber, bedId, guest) => {
    if (!canEdit) {
      alert('У вас нет прав для этого действия');
      return;
    }
    
    if (guest) {
      setGuestDetailsModal({ isOpen: true, guest });
    } else {
      setCheckInModal({ isOpen: true, hostelId, roomNumber, bedId });
    }
  };
  
  const handleCheckIn = (guestData) => {
    const newGuest = {
      ...guestData,
      id: Date.now().toString(),
    };
    
    setGuests(prev => [...prev, newGuest]);
    setCheckInModal({ isOpen: false, hostelId: null, roomNumber: null, bedId: null });
    
    // Add income record
    const hostel = HOSTELS.find(h => h.id === guestData.hostelId);
    if (guestData.payments && guestData.payments.length > 0) {
      const payment = guestData.payments[0];
      setExpenses(prev => [...prev, {
        id: Date.now().toString(),
        type: 'income',
        amount: payment.amount,
        method: payment.method,
        date: payment.date,
        hostelId: guestData.hostelId,
        hostelName: hostel?.name || 'N/A',
        staff: currentUser.name,
        category: 'Проживание',
        description: `Заселение ${guestData.fullName}`
      }]);
    }
  };
  
  const handleCheckOut = (guest, finalData) => {
    setGuests(prev =>
      prev.map(g =>
        g.id === guest.id
          ? { 
              ...g, 
              status: 'checked_out', 
              checkOutDate: finalData.checkOutDate,
              refundAmount: finalData.refundAmount 
            }
          : g
      )
    );
    
    setGuestDetailsModal({ isOpen: false, guest: null });
  };
  
  const handleAddPayment = (guest, paymentData) => {
    setGuests(prev =>
      prev.map(g =>
        g.id === guest.id
          ? { ...g, payments: [...(g.payments || []), paymentData] }
          : g
      )
    );
    
    // Add income record
    const hostel = HOSTELS.find(h => h.id === guest.hostelId);
    setExpenses(prev => [...prev, {
      id: Date.now().toString(),
      type: 'income',
      amount: paymentData.amount,
      method: paymentData.method,
      date: paymentData.date,
      hostelId: guest.hostelId,
      hostelName: hostel?.name || 'N/A',
      staff: currentUser.name,
      category: 'Проживание',
      description: `Оплата от ${guest.fullName}`
    }]);
  };
  
  const handleMoveGuest = (guest, newLocation) => {
    setGuests(prev =>
      prev.map(g =>
        g.id === guest.id
          ? { ...g, ...newLocation }
          : g
      )
    );
    
    setMoveGuestModal({ isOpen: false, guest: null });
  };
  
  const handleAddTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
    };
    
    setTasks(prev => [...prev, newTask]);
  };
  
  const handleToggleTask = (taskId) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };
  
  const handleAddExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: Date.now().toString(),
      type: 'expense'
    };
    
    setExpenses(prev => [...prev, newExpense]);
  };
  
  const handleGuestClick = (guest) => {
    setGuestDetailsModal({ isOpen: true, guest });
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  // Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t.appTitle}
            </h1>
            <p className="text-gray-600">Авторизация</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <input
                type="text"
                value={loginForm.login}
                onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите логин"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={loginForm.pass}
                onChange={(e) => setLoginForm({ ...loginForm, pass: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите пароль"
              />
            </div>
            
            <Button
              onClick={handleLogin}
              variant="primary"
              className="w-full py-3 text-lg"
            >
              Войти
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Тестовые аккаунты:</p>
            <div className="text-xs space-y-1">
              <p>admin/admin123 (Администратор)</p>
              <p>fazliddin/123 (Кассир - Хостел 2)</p>
              <p>manager1/123 (Менеджер)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main app
  const filteredHostels = selectedHostelFilter
    ? HOSTELS.filter(h => h.id === selectedHostelFilter)
    : HOSTELS;
  
  const filteredGuests = guests.filter(g =>
    !selectedHostelFilter || g.hostelId === selectedHostelFilter
  );
  
  const selectedHostel = HOSTELS.find(h => h.id === checkInModal.hostelId);
  const detailsGuest = guestDetailsModal.guest;
  const detailsHostel = detailsGuest ? HOSTELS.find(h => h.id === detailsGuest.hostelId) : null;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navigation
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
        selectedHostelFilter={selectedHostelFilter}
        setSelectedHostelFilter={setSelectedHostelFilter}
        hostels={HOSTELS}
        lang={lang}
        t={t}
      />
      
      <main className="flex-1 p-8 overflow-auto">
        {activeView === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
            <DashboardStats 
              guests={guests} 
              hostels={HOSTELS} 
              selectedHostelFilter={selectedHostelFilter}
            />
            <ChartsSection 
              guests={guests} 
              selectedHostelFilter={selectedHostelFilter}
            />
            
            {filteredHostels.map(hostel => (
              <RoomCardChess
                key={hostel.id}
                hostel={hostel}
                guests={filteredGuests}
                onBedClick={handleBedClick}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
        
        {activeView === 'calendar' && (
          <CalendarView
            guests={filteredGuests}
            hostels={HOSTELS}
            selectedHostelFilter={selectedHostelFilter}
            onGuestClick={handleGuestClick}
          />
        )}
        
        {activeView === 'staff' && (
          <StaffView currentUser={currentUser} />
        )}
        
        {activeView === 'clients' && (
          <ClientsView guests={guests} />
        )}
        
        {activeView === 'tasks' && (
          <TaskManager
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            currentUser={currentUser}
          />
        )}
        
        {activeView === 'debts' && (
          <DebtsView guests={guests} />
        )}
        
        {activeView === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Отчёты</h1>
              {canEdit && (
                <Button 
                  onClick={() => setAddExpenseModal(true)} 
                  variant="danger"
                >
                  + Добавить расход
                </Button>
              )}
            </div>
            <ReportsView
              guests={guests}
              expenses={expenses}
              selectedHostelFilter={selectedHostelFilter}
              hostels={HOSTELS}
            />
          </div>
        )}
        
        {activeView === 'shifts' && (
          <ShiftsView currentUser={currentUser} />
        )}
      </main>
      
      {/* Modals */}
      <CheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => setCheckInModal({ isOpen: false, hostelId: null, roomNumber: null, bedId: null })}
        hostelId={checkInModal.hostelId}
        roomNumber={checkInModal.roomNumber}
        bedId={checkInModal.bedId}
        onCheckIn={handleCheckIn}
        hostel={selectedHostel}
      />
      
      <GuestDetailsModal
        isOpen={guestDetailsModal.isOpen}
        onClose={() => setGuestDetailsModal({ isOpen: false, guest: null })}
        guest={detailsGuest}
        onCheckOut={handleCheckOut}
        onAddPayment={handleAddPayment}
        hostel={detailsHostel}
      />
      
      <MoveGuestModal
        isOpen={moveGuestModal.isOpen}
        onClose={() => setMoveGuestModal({ isOpen: false, guest: null })}
        guest={moveGuestModal.guest}
        hostels={HOSTELS}
        onMove={handleMoveGuest}
      />
      
      <AddExpenseModal
        isOpen={addExpenseModal}
        onClose={() => setAddExpenseModal(false)}
        onAddExpense={handleAddExpense}
        currentUser={currentUser}
        selectedHostelFilter={selectedHostelFilter}
        hostels={HOSTELS}
      />
    </div>
  );
}

export default App;

// ============================================
// End of Part 5/5 - Ready to use!
// ============================================
