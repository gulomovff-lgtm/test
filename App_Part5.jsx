// ============================================
// App.jsx - Part 5/5
// Main App Component
// ============================================

function App() {
  // ============================================
  // Authentication State
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ============================================
  // UI State
  // ============================================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('ru');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ============================================
  // Data State
  // ============================================
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [debts, setDebts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  // ============================================
  // Modal State
  // ============================================
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showGuestDetailsModal, setShowGuestDetailsModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showClientEditModal, setShowClientEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientHistoryModal, setShowClientHistoryModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRoomFormModal, setShowRoomFormModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showShiftClosingModal, setShowShiftClosingModal] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  
  // ============================================
  // ADDED: Fazliddin Special Permissions
  // ============================================
  const isFazliddin = useMemo(() => {
    return currentUser?.login === 'fazliddin';
  }, [currentUser]);
  
  const [fazliddinHostel, setFazliddinHostel] = useState('hostel2');
  
  const canEditCurrentHostel = useMemo(() => {
    if (!isFazliddin) return true;
    return fazliddinHostel === 'hostel2';
  }, [isFazliddin, fazliddinHostel]);
  
  // ============================================
  // Notification Helper
  // ============================================
  const notify = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);
  
  // ============================================
  // Authentication Handlers
  // ============================================
  const handleLogin = useCallback((login, password) => {
    const user = DEFAULT_USERS.find(
      u => u.login === login && u.password === password
    );
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      notify(`Добро пожаловать, ${user.name}!`, 'success');
      
      // Send Telegram notification
      sendTelegramMessage(`🔐 Вход в систему: ${user.name} (${user.role})`);
    } else {
      notify('Неверный логин или пароль', 'error');
    }
  }, [notify]);
  
  const handleLogout = useCallback(() => {
    if (currentUser) {
      sendTelegramMessage(`🚪 Выход из системы: ${currentUser.name}`);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    notify('Вы вышли из системы', 'info');
  }, [currentUser, notify]);
  
  // ============================================
  // Guest Management Handlers
  // ============================================
  const handleCheckIn = useCallback((guestData) => {
    // Check collision
    if (checkCollision(guests, guestData.roomNumber, guestData.bedId)) {
      notify('Это место уже занято!', 'error');
      return;
    }
    
    const newGuest = {
      ...guestData,
      id: Date.now().toString(),
      checkInDate: new Date().toISOString(),
      checkInDateTime: new Date().toISOString(),
      status: 'checked_in',
      payments: guestData.initialPayment > 0 ? [{
        amount: guestData.initialPayment,
        method: guestData.paymentMethod,
        date: new Date().toISOString(),
        staff: currentUser?.name
      }] : []
    };
    
    setGuests(prev => [...prev, newGuest]);
    setShowCheckInModal(false);
    notify(`Гость ${guestData.fullName} успешно заселен!`, 'success');
    
    // Send Telegram notification
    sendTelegramMessage(
      `✅ Заселение: ${guestData.fullName}\n` +
      `📍 Комната ${guestData.roomNumber}, место ${guestData.bedId}\n` +
      `📅 Дней: ${guestData.days}\n` +
      `💰 Сумма: ${guestData.totalPrice} ₽\n` +
      `👤 Кассир: ${currentUser?.name}`
    );
    
    // Add to clients database if not exists
    const existingClient = clients.find(c => c.passport === guestData.passport);
    if (!existingClient) {
      const newClient = {
        id: Date.now().toString(),
        fullName: guestData.fullName,
        passport: guestData.passport,
        phone: guestData.phone,
        country: guestData.country,
        visits: 1,
        createdAt: new Date().toISOString()
      };
      setClients(prev => [...prev, newClient]);
    } else {
      setClients(prev => prev.map(c =>
        c.id === existingClient.id
          ? { ...c, visits: (c.visits || 0) + 1 }
          : c
      ));
    }
    
    // Add income transaction
    if (guestData.initialPayment > 0) {
      const transaction = {
        id: Date.now().toString(),
        type: 'income',
        amount: guestData.initialPayment,
        method: guestData.paymentMethod,
        date: new Date().toISOString(),
        hostel: fazliddinHostel || 'hostel1',
        staff: currentUser?.name,
        description: `Заселение: ${guestData.fullName}`
      };
      setTransactions(prev => [...prev, transaction]);
    }
  }, [guests, clients, currentUser, notify, fazliddinHostel]);
  
  const handleCheckOut = useCallback((guest, checkoutData) => {
    setGuests(prev => prev.map(g =>
      g.id === guest.id
        ? {
            ...g,
            status: 'checked_out',
            checkOutDate: checkoutData.checkOutDate || new Date().toISOString(),
            checkOutDateTime: new Date().toISOString(),
            refundAmount: checkoutData.refundAmount || 0
          }
        : g
    ));
    
    setShowGuestDetailsModal(false);
    notify(`Гость ${guest.fullName} выселен`, 'success');
    
    // Send Telegram notification
    const totalPaid = getTotalPaid(guest);
    const balance = totalPaid - (guest.totalPrice || 0);
    
    sendTelegramMessage(
      `🚪 Выселение: ${guest.fullName}\n` +
      `📍 Комната ${guest.roomNumber}, место ${guest.bedId}\n` +
      `💰 Всего оплачено: ${totalPaid} ₽\n` +
      `💵 Баланс: ${balance} ₽\n` +
      `🔄 Возврат: ${checkoutData.refundAmount || 0} ₽\n` +
      `👤 Кассир: ${currentUser?.name}`
    );
    
    // If there's a debt, create debt record
    if (balance < 0) {
      const newDebt = {
        id: Date.now().toString(),
        clientId: guest.id,
        clientName: guest.fullName,
        passport: guest.passport,
        phone: guest.phone,
        amount: Math.abs(balance),
        date: new Date().toISOString(),
        status: 'unpaid',
        description: `Долг за проживание (комната ${guest.roomNumber})`
      };
      setDebts(prev => [...prev, newDebt]);
    }
  }, [currentUser, notify]);
  
  const handlePayment = useCallback((guest, paymentData) => {
    setGuests(prev => prev.map(g =>
      g.id === guest.id
        ? {
            ...g,
            payments: [
              ...(g.payments || []),
              {
                ...paymentData,
                staff: currentUser?.name
              }
            ]
          }
        : g
    ));
    
    notify(`Платеж принят: ${paymentData.amount} ₽`, 'success');
    
    // Add income transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'income',
      amount: paymentData.amount,
      method: paymentData.method,
      date: paymentData.date,
      hostel: fazliddinHostel || 'hostel1',
      staff: currentUser?.name,
      description: `Оплата: ${guest.fullName}`
    };
    setTransactions(prev => [...prev, transaction]);
    
    // Send Telegram notification
    sendTelegramMessage(
      `💰 Оплата: ${guest.fullName}\n` +
      `💵 Сумма: ${paymentData.amount} ₽\n` +
      `💳 Метод: ${paymentData.method}\n` +
      `👤 Кассир: ${currentUser?.name}`
    );
  }, [currentUser, notify, fazliddinHostel]);
  
  const handleExtendStay = useCallback((guest) => {
    // Implementation for extending guest stay
    notify('Функция продления реализуется...', 'info');
  }, [notify]);
  
  const handleMoveGuest = useCallback((guest, newRoom, newBed) => {
    if (checkCollision(guests, newRoom, newBed, guest.id)) {
      notify('Это место уже занято!', 'error');
      return;
    }
    
    setGuests(prev => prev.map(g =>
      g.id === guest.id
        ? { ...g, roomNumber: newRoom, bedId: newBed }
        : g
    ));
    
    notify(`Гость перемещен в комнату ${newRoom}, место ${newBed}`, 'success');
  }, [guests, notify]);
  
  // ============================================
  // Client Management Handlers
  // ============================================
  const handleAddClient = useCallback(() => {
    setSelectedClient(null);
    setShowClientEditModal(true);
  }, []);
  
  const handleEditClient = useCallback((client) => {
    setSelectedClient(client);
    setShowClientEditModal(true);
  }, []);
  
  const handleSaveClient = useCallback((clientData) => {
    if (selectedClient) {
      setClients(prev => prev.map(c =>
        c.id === selectedClient.id ? { ...c, ...clientData } : c
      ));
      notify('Клиент обновлен', 'success');
    } else {
      const newClient = {
        ...clientData,
        id: Date.now().toString(),
        visits: 0,
        createdAt: new Date().toISOString()
      };
      setClients(prev => [...prev, newClient]);
      notify('Клиент добавлен', 'success');
    }
    setShowClientEditModal(false);
  }, [selectedClient, notify]);
  
  const handleDeleteClient = useCallback((clientId) => {
    if (window.confirm('Удалить клиента?')) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      notify('Клиент удален', 'success');
    }
  }, [notify]);
  
  const handleViewClientHistory = useCallback((client) => {
    setSelectedClient(client);
    setShowClientHistoryModal(true);
  }, []);
  
  // ============================================
  // Debt Management Handlers
  // ============================================
  const handleAddDebt = useCallback(() => {
    setShowDebtModal(true);
  }, []);
  
  const handleCreateDebt = useCallback((debtData) => {
    const newDebt = {
      ...debtData,
      id: Date.now().toString()
    };
    setDebts(prev => [...prev, newDebt]);
    setShowDebtModal(false);
    notify('Долг создан', 'success');
  }, [notify]);
  
  const handlePayDebt = useCallback((debtId) => {
    setDebts(prev => prev.map(d =>
      d.id === debtId ? { ...d, status: 'paid', paidDate: new Date().toISOString() } : d
    ));
    notify('Долг оплачен', 'success');
  }, [notify]);
  
  const handleDeleteDebt = useCallback((debtId) => {
    if (window.confirm('Удалить долг?')) {
      setDebts(prev => prev.filter(d => d.id !== debtId));
      notify('Долг удален', 'success');
    }
  }, [notify]);
  
  // ============================================
  // Expense Management Handlers
  // ============================================
  const handleAddExpense = useCallback(() => {
    setShowExpenseModal(true);
  }, []);
  
  const handleCreateExpense = useCallback((expenseData) => {
    const newExpense = {
      ...expenseData,
      id: Date.now().toString()
    };
    setExpenses(prev => [...prev, newExpense]);
    
    // Add expense transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: expenseData.amount,
      method: 'cash',
      date: expenseData.date,
      hostel: fazliddinHostel || 'hostel1',
      staff: currentUser?.name,
      description: expenseData.description
    };
    setTransactions(prev => [...prev, transaction]);
    
    setShowExpenseModal(false);
    notify('Расход добавлен', 'success');
  }, [currentUser, notify, fazliddinHostel]);
  
  // ============================================
  // Room Management Handlers
  // ============================================
  const handleAddRoom = useCallback(() => {
    setSelectedRoom(null);
    setShowRoomFormModal(true);
  }, []);
  
  const handleEditRoom = useCallback((room) => {
    setSelectedRoom(room);
    setShowRoomFormModal(true);
  }, []);
  
  const handleSaveRoom = useCallback((roomData) => {
    if (selectedRoom) {
      setRooms(prev => prev.map(r =>
        r.id === selectedRoom.id ? { ...r, ...roomData } : r
      ));
      notify('Комната обновлена', 'success');
    } else {
      const newRoom = {
        ...roomData,
        id: Date.now().toString()
      };
      setRooms(prev => [...prev, newRoom]);
      notify('Комната добавлена', 'success');
    }
    setShowRoomFormModal(false);
  }, [selectedRoom, notify]);
  
  const handleDeleteRoom = useCallback((roomId) => {
    if (window.confirm('Удалить комнату?')) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      notify('Комната удалена', 'success');
    }
  }, [notify]);
  
  // ============================================
  // Shift Management Handlers
  // ============================================
  const handleOpenShift = useCallback(() => {
    const newShift = {
      id: Date.now().toString(),
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      startTime: new Date().toISOString(),
      status: 'active',
      hostel: fazliddinHostel || 'hostel1'
    };
    setShifts(prev => [...prev, newShift]);
    setCurrentShift(newShift);
    notify('Смена открыта', 'success');
  }, [currentUser, notify, fazliddinHostel]);
  
  const handleCloseShift = useCallback((shift) => {
    setShowShiftClosingModal(true);
  }, []);
  
  const handleFinalizeShiftClose = useCallback((shiftData) => {
    setShifts(prev => prev.map(s =>
      s.id === shiftData.id ? shiftData : s
    ));
    setCurrentShift(null);
    setShowShiftClosingModal(false);
    notify('Смена закрыта', 'success');
  }, [notify]);
  
  // ============================================
  // Task Management Handlers
  // ============================================
  const handleAddTask = useCallback((taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    notify('Задача создана', 'success');
  }, [notify]);
  
  const handleToggleTask = useCallback((taskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  }, []);
  
  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    notify('Задача удалена', 'success');
  }, [notify]);
  
  // ============================================
  // Export and Print Handlers
  // ============================================
  const handleExportReport = useCallback((data) => {
    const totalIncome = data.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const totalExpense = data.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    
    const filename = `report_${new Date().toISOString().split('T')[0]}.xls`;
    exportToExcel(data, filename, totalIncome, totalExpense);
    notify('Отчет экспортирован', 'success');
  }, [notify]);
  
  const handlePrintReport = useCallback((data) => {
    const totalIncome = data.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const totalExpense = data.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    
    const hostel = HOSTELS[0];
    const period = `${new Date().toLocaleDateString('ru-RU')}`;
    printReport(data, hostel, period, totalIncome, totalExpense);
  }, []);
  
  // ============================================
  // Bed Click Handler (for room view)
  // ============================================
  const handleBedClick = useCallback((roomNumber, bedId, guest) => {
    if (guest) {
      setSelectedGuest(guest);
      setShowGuestDetailsModal(true);
    } else {
      if (canEditCurrentHostel) {
        setShowCheckInModal(true);
      } else {
        notify('У вас нет прав для заселения в этот хостел', 'error');
      }
    }
  }, [canEditCurrentHostel, notify]);
  
  // ============================================
  // Data Loading Effect
  // ============================================
  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      // In production, load from Firebase
      // For now, initialize with sample data
      setRooms([
        { id: '1', number: '101', beds: 4, pricePerNight: 1000, description: 'Стандартная комната' },
        { id: '2', number: '102', beds: 4, pricePerNight: 1000, description: 'Стандартная комната' },
        { id: '3', number: '103', beds: 6, pricePerNight: 800, description: 'Большая комната' },
        { id: '4', number: '201', beds: 4, pricePerNight: 1200, description: 'Улучшенная' }
      ]);
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // ============================================
  // Dashboard Stats Calculation
  // ============================================
  const dashboardData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const monthIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    
    return {
      income: monthIncome,
      weekOccupancy: [] // Calculate week occupancy
    };
  }, [transactions]);
  
  // ============================================
  // Render Login Screen
  // ============================================
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  // ============================================
  // Check Active Shift
  // ============================================
  const activeShift = shifts.find(s => s.status === 'active');
  const requiresShift = currentUser?.role === 'staff' || currentUser?.role === 'manager';
  
  if (requiresShift && !activeShift && activeTab !== 'shifts') {
    return (
      <ShiftBlockScreen
        message="Перед началом работы необходимо открыть смену"
        onOpenShift={handleOpenShift}
      />
    );
  }
  
  // ============================================
  // Main Application Render
  // ============================================
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        currentUser={currentUser}
        language={language}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* ADDED: Fazliddin Hostel Switcher */}
          {isFazliddin && (
            <Card className="mb-4 bg-yellow-50 border-2 border-yellow-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Переключатель хостелов</h3>
                  <p className="text-sm text-gray-600">
                    Вы можете редактировать только Hostel 2
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFazliddinHostel('hostel1')}
                    className={`px-4 py-2 rounded ${
                      fazliddinHostel === 'hostel1'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Hostel 1 (Просмотр)
                  </button>
                  <button
                    onClick={() => setFazliddinHostel('hostel2')}
                    className={`px-4 py-2 rounded ${
                      fazliddinHostel === 'hostel2'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Hostel 2 (Редактирование)
                  </button>
                </div>
              </div>
            </Card>
          )}
          
          {/* Content based on active tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Панель управления</h1>
              <DashboardStats
                guests={guests}
                rooms={rooms}
                debts={debts}
                income={dashboardData.income}
              />
              <ChartsSection data={dashboardData} />
            </div>
          )}
          
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Комнаты</h2>
                <Button onClick={handleAddRoom} disabled={!canEditCurrentHostel}>
                  <Plus size={20} className="mr-2" />
                  Добавить комнату
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <RoomCardChess
                    key={room.id}
                    room={room}
                    guests={guests}
                    onBedClick={handleBedClick}
                  />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'calendar' && (
            <CalendarView
              guests={guests}
              rooms={rooms}
              onDayClick={(guest) => {
                setSelectedGuest(guest);
                setShowGuestDetailsModal(true);
              }}
            />
          )}
          
          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              onAdd={handleAddClient}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onViewHistory={handleViewClientHistory}
            />
          )}
          
          {activeTab === 'staff' && (
            <StaffView
              staff={staff}
              onAdd={() => notify('Функция в разработке', 'info')}
              onEdit={() => notify('Функция в разработке', 'info')}
              onDelete={() => notify('Функция в разработке', 'info')}
            />
          )}
          
          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              onExport={handleExportReport}
              onPrint={handlePrintReport}
            />
          )}
          
          {activeTab === 'debts' && (
            <DebtsView
              debts={debts}
              onAdd={handleAddDebt}
              onPay={handlePayDebt}
              onDelete={handleDeleteDebt}
            />
          )}
          
          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              onAdd={handleAddTask}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          )}
          
          {activeTab === 'shifts' && (
            <ShiftsView
              shifts={shifts}
              currentShift={activeShift}
              onOpenShift={handleOpenShift}
              onCloseShift={handleCloseShift}
            />
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
      />
      
      {/* Modals */}
      {showCheckInModal && (
        <CheckInModal
          onClose={() => setShowCheckInModal(false)}
          onSubmit={handleCheckIn}
          rooms={rooms}
          clients={clients}
        />
      )}
      
      {showGuestDetailsModal && selectedGuest && (
        <GuestDetailsModal
          guest={selectedGuest}
          onClose={() => {
            setShowGuestDetailsModal(false);
            setSelectedGuest(null);
          }}
          onCheckOut={handleCheckOut}
          onPayment={handlePayment}
          onExtend={handleExtendStay}
        />
      )}
      
      {showClientEditModal && (
        <ClientEditModal
          client={selectedClient}
          onClose={() => {
            setShowClientEditModal(false);
            setSelectedClient(null);
          }}
          onSave={handleSaveClient}
        />
      )}
      
      {showClientHistoryModal && selectedClient && (
        <ClientHistoryModal
          client={selectedClient}
          guests={guests}
          onClose={() => {
            setShowClientHistoryModal(false);
            setSelectedClient(null);
          }}
        />
      )}
      
      {showDebtModal && (
        <CreateDebtModal
          onClose={() => setShowDebtModal(false)}
          onSubmit={handleCreateDebt}
          clients={clients}
        />
      )}
      
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleCreateExpense}
        />
      )}
      
      {showRoomFormModal && (
        <RoomFormModal
          room={selectedRoom}
          onClose={() => {
            setShowRoomFormModal(false);
            setSelectedRoom(null);
          }}
          onSave={handleSaveRoom}
        />
      )}
      
      {showShiftClosingModal && activeShift && (
        <ShiftClosingModal
          shift={activeShift}
          onClose={() => setShowShiftClosingModal(false)}
          onClose={handleFinalizeShiftClose}
        />
      )}
      
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;

// ============================================
// End of Part 5/5
// Assembly complete! This is the final part.
// ============================================
