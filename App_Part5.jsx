// App.jsx - Part 5/5
// Copy all parts sequentially into one file to use

// Main App Component
function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // View State
  const [currentView, setCurrentView] = useState('dashboard');
  const [language, setLanguage] = useState('ru');
  const [notification, setNotification] = useState(null);
  
  // Data State
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  
  // Modal State
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showClientHistory, setShowClientHistory] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientEditModal, setShowClientEditModal] = useState(false);
  
  // Hostel Filter State - for Fazliddin special permissions
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('all');
  
  // Translation helper
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  
  // Determine if current user can edit - FAZLIDDIN SPECIAL PERMISSIONS
  const canEdit = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.login === 'fazliddin') {
      // Fazliddin can only edit in hostel2, read-only in hostel1
      return selectedHostelFilter === 'hostel2';
    }
    return currentUser.role === 'cashier';
  }, [currentUser, selectedHostelFilter]);
  
  // Initialize Firebase and load data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Load user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ ...userDoc.data(), uid: user.uid });
        }
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Load all data when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        // Load guests
        const guestsQuery = query(collection(db, 'guests'), orderBy('checkInDate', 'desc'));
        const guestsSnap = await getDocs(guestsQuery);
        setGuests(guestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load rooms
        const roomsSnap = await getDocs(collection(db, 'rooms'));
        setRooms(roomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load expenses
        const expensesSnap = await getDocs(collection(db, 'expenses'));
        setExpenses(expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load debts
        const debtsSnap = await getDocs(collection(db, 'debts'));
        setDebts(debtsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load tasks
        const tasksSnap = await getDocs(collection(db, 'tasks'));
        setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load clients
        const clientsSnap = await getDocs(collection(db, 'clients'));
        setClients(clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load staff
        const staffSnap = await getDocs(collection(db, 'staff'));
        setStaff(staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Load shifts
        const shiftsSnap = await getDocs(collection(db, 'shifts'));
        setShifts(shiftsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Ошибка загрузки данных', 'error');
      }
    };
    
    loadData();
  }, [currentUser]);
  
  // Notification helper
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };
  
  // Login handler
  const handleLogin = async (login, password) => {
    try {
      // Check default users
      const defaultUser = DEFAULT_USERS.find(u => u.login === login && u.password === password);
      if (defaultUser) {
        // Create a mock auth for default users
        setCurrentUser(defaultUser);
        setLoginError('');
        showNotification('Вход выполнен успешно', 'success');
        return;
      }
      
      // Try Firebase authentication
      await signInWithEmailAndPassword(auth, login, password);
      setLoginError('');
    } catch (error) {
      setLoginError('Неверный логин или пароль');
    }
  };
  
  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Check-in handler
  const handleCheckIn = async (formData) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const totalPrice = days * parseFloat(formData.pricePerDay);
      
      // Check for collision
      if (checkCollision(formData.roomId, checkIn, checkOut, guests)) {
        showNotification('Комната уже занята в этот период!', 'error');
        return;
      }
      
      const guestData = {
        ...formData,
        days,
        totalPrice,
        status: 'checked_in',
        payments: formData.deposit > 0 ? [{
          amount: parseFloat(formData.deposit),
          date: new Date().toISOString(),
          note: 'Предоплата при заселении',
        }] : [],
        hostel: selectedHostelFilter !== 'all' ? selectedHostelFilter : 'hostel1',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.login,
      };
      
      const docRef = doc(collection(db, 'guests'));
      await setDoc(docRef, guestData);
      
      setGuests([...guests, { id: docRef.id, ...guestData }]);
      
      // Save to clients if not exists
      const existingClient = clients.find(c => c.passport === formData.passport);
      if (!existingClient) {
        const clientData = {
          fullName: formData.fullName,
          passport: formData.passport,
          country: getNormalizedCountry(formData.country),
          phone: formData.phone,
          email: formData.email,
          birthDate: formData.birthDate,
        };
        const clientRef = doc(collection(db, 'clients'));
        await setDoc(clientRef, clientData);
        setClients([...clients, { id: clientRef.id, ...clientData }]);
      }
      
      setShowCheckInModal(false);
      showNotification('Гость успешно заселен', 'success');
      
      // Send Telegram notification
      await sendTelegramMessage(
        `✅ <b>Заселение</b>\n` +
        `Гость: ${formData.fullName}\n` +
        `Комната: ${formData.roomId}\n` +
        `Период: ${getLocalDateString(checkIn)} - ${getLocalDateString(checkOut)}\n` +
        `Сумма: ${totalPrice} сум`
      );
    } catch (error) {
      console.error('Check-in error:', error);
      showNotification('Ошибка при заселении', 'error');
    }
  };
  
  // Checkout handler - FIXED: Allow checkout for balance >= 0
  const handleCheckOut = async (guestId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const guest = guests.find(g => g.id === guestId);
      if (!guest) return;
      
      const totalPaid = getTotalPaid(guest);
      const balance = (guest.totalPrice || 0) - totalPaid;
      
      // FIXED: Removed the balance < 0 check
      // Now allows checkout even if balance >= 0
      
      const checkOutData = {
        status: 'checked_out',
        checkOutDate: new Date().toISOString(),
        actualCheckOutDate: new Date().toISOString(),
      };
      
      await updateDoc(doc(db, 'guests', guestId), checkOutData);
      
      setGuests(guests.map(g => g.id === guestId ? { ...g, ...checkOutData } : g));
      setShowGuestDetails(false);
      showNotification('Гость успешно выселен', 'success');
      
      // Send Telegram notification
      await sendTelegramMessage(
        `🚪 <b>Выселение</b>\n` +
        `Гость: ${guest.fullName}\n` +
        `Комната: ${guest.roomId}\n` +
        `Оплачено: ${totalPaid} / ${guest.totalPrice} сум\n` +
        `Баланс: ${balance} сум`
      );
    } catch (error) {
      console.error('Checkout error:', error);
      showNotification('Ошибка при выселении', 'error');
    }
  };
  
  // Update guest handler
  const handleUpdateGuest = async (guestId, updates) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'guests', guestId), updates);
      setGuests(guests.map(g => g.id === guestId ? { ...g, ...updates } : g));
      
      if (selectedGuest?.id === guestId) {
        setSelectedGuest({ ...selectedGuest, ...updates });
      }
      
      showNotification('Данные обновлены', 'success');
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Ошибка при обновлении', 'error');
    }
  };
  
  // Move guest handler
  const handleMoveGuest = async (guestId, newRoomId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const guest = guests.find(g => g.id === guestId);
      if (checkCollision(newRoomId, guest.checkInDate, guest.checkOutDate, guests, guestId)) {
        showNotification('Комната уже занята в этот период!', 'error');
        return;
      }
      
      await updateDoc(doc(db, 'guests', guestId), { roomId: newRoomId });
      setGuests(guests.map(g => g.id === guestId ? { ...g, roomId: newRoomId } : g));
      setShowMoveModal(false);
      showNotification('Гость перемещен', 'success');
    } catch (error) {
      console.error('Move error:', error);
      showNotification('Ошибка при перемещении', 'error');
    }
  };
  
  // Add expense handler
  const handleAddExpense = async (formData) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.login,
        hostel: selectedHostelFilter !== 'all' ? selectedHostelFilter : 'hostel1',
      };
      
      const docRef = doc(collection(db, 'expenses'));
      await setDoc(docRef, expenseData);
      
      setExpenses([...expenses, { id: docRef.id, ...expenseData }]);
      setShowExpenseModal(false);
      showNotification('Расход добавлен', 'success');
    } catch (error) {
      console.error('Expense error:', error);
      showNotification('Ошибка при добавлении расхода', 'error');
    }
  };
  
  // Task handlers
  const handleAddTask = async (taskData) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const task = {
        ...taskData,
        completed: false,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.login,
      };
      
      const docRef = doc(collection(db, 'tasks'));
      await setDoc(docRef, task);
      
      setTasks([...tasks, { id: docRef.id, ...task }]);
      showNotification('Задача добавлена', 'success');
    } catch (error) {
      console.error('Task error:', error);
      showNotification('Ошибка при добавлении задачи', 'error');
    }
  };
  
  const handleToggleTask = async (taskId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      const task = tasks.find(t => t.id === taskId);
      const updates = { completed: !task.completed };
      
      await updateDoc(doc(db, 'tasks', taskId), updates);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Toggle task error:', error);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter(t => t.id !== taskId));
      showNotification('Задача удалена', 'success');
    } catch (error) {
      console.error('Delete task error:', error);
      showNotification('Ошибка при удалении задачи', 'error');
    }
  };
  
  // Debt handlers
  const handlePayDebt = async (debtId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'debts', debtId));
      setDebts(debts.filter(d => d.id !== debtId));
      showNotification('Долг оплачен', 'success');
    } catch (error) {
      console.error('Pay debt error:', error);
      showNotification('Ошибка при оплате долга', 'error');
    }
  };
  
  const handleDeleteDebt = async (debtId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'debts', debtId));
      setDebts(debts.filter(d => d.id !== debtId));
      showNotification('Долг удален', 'success');
    } catch (error) {
      console.error('Delete debt error:', error);
      showNotification('Ошибка при удалении долга', 'error');
    }
  };
  
  // Client handlers
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowClientEditModal(true);
  };
  
  const handleUpdateClient = async (clientData) => {
    try {
      await updateDoc(doc(db, 'clients', clientData.id), clientData);
      setClients(clients.map(c => c.id === clientData.id ? clientData : c));
      setShowClientEditModal(false);
      showNotification('Клиент обновлен', 'success');
    } catch (error) {
      console.error('Update client error:', error);
      showNotification('Ошибка при обновлении клиента', 'error');
    }
  };
  
  const handleDeleteClient = async (clientId) => {
    if (!canEdit) {
      showNotification('У вас нет прав для этого действия', 'error');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'clients', clientId));
      setClients(clients.filter(c => c.id !== clientId));
      showNotification('Клиент удален', 'success');
    } catch (error) {
      console.error('Delete client error:', error);
      showNotification('Ошибка при удалении клиента', 'error');
    }
  };
  
  const handleViewHistory = (client) => {
    setSelectedClient(client);
    setShowClientHistory(true);
  };
  
  // Print handler - FIXED
  const handlePrint = (type, guest) => {
    const hostel = HOSTELS.find(h => h.id === guest.hostel) || HOSTELS[0];
    printDocument(type, guest, hostel);
  };
  
  // Filter data based on selected hostel for Fazliddin
  const filteredGuests = useMemo(() => {
    if (currentUser?.login === 'fazliddin' && selectedHostelFilter !== 'all') {
      return guests.filter(g => g.hostel === selectedHostelFilter);
    }
    return guests;
  }, [guests, currentUser, selectedHostelFilter]);
  
  const filteredRooms = useMemo(() => {
    if (currentUser?.login === 'fazliddin' && selectedHostelFilter !== 'all') {
      return rooms.filter(r => r.hostel === selectedHostelFilter);
    }
    return rooms;
  }, [rooms, currentUser, selectedHostelFilter]);
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold">Загрузка...</div>
      </div>
    );
  }
  
  // Login screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }
  
  // Main application
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUser={currentUser}
          handleLogout={handleLogout}
          t={t}
        />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        handleLogout={handleLogout}
        t={t}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Fazliddin Hostel Selector */}
          {currentUser.login === 'fazliddin' && (
            <div className="mb-4">
              <Card>
                <div className="flex gap-2 items-center">
                  <span className="font-medium">Хостел:</span>
                  <select
                    value={selectedHostelFilter}
                    onChange={(e) => setSelectedHostelFilter(e.target.value)}
                    className={inputClass + " w-48"}
                  >
                    <option value="all">Все хостелы</option>
                    <option value="hostel1">Hostel №1 (только чтение)</option>
                    <option value="hostel2">Hostel №2 (полный доступ)</option>
                  </select>
                  {selectedHostelFilter === 'hostel1' && (
                    <span className="text-sm text-red-600">
                      ⚠️ Режим только для чтения
                    </span>
                  )}
                </div>
              </Card>
            </div>
          )}
          
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
              <DashboardStats guests={filteredGuests} rooms={filteredRooms} debts={debts} />
              <ChartsSection guests={filteredGuests} expenses={expenses} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-xl font-bold mb-4">Текущие гости</h2>
                  <div className="space-y-2">
                    {filteredGuests
                      .filter(g => g.status === 'checked_in')
                      .slice(0, 5)
                      .map(guest => (
                        <div
                          key={guest.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => { setSelectedGuest(guest); setShowGuestDetails(true); }}
                        >
                          <div>
                            <div className="font-medium">{guest.fullName}</div>
                            <div className="text-sm text-gray-600">
                              {guest.roomId} • до {getLocalDateString(guest.checkOutDate)}
                            </div>
                          </div>
                          <div className="text-sm">
                            {getTotalPaid(guest)} / {guest.totalPrice} сум
                          </div>
                        </div>
                      ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => setShowCheckInModal(true)}
                    disabled={!canEdit}
                  >
                    + Заселить гостя
                  </Button>
                </Card>
                
                <Card>
                  <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => setShowExpenseModal(true)}
                      variant="secondary"
                      disabled={!canEdit}
                    >
                      💰 Добавить расход
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => setCurrentView('tasks')}
                      variant="secondary"
                    >
                      ✓ Задачи ({tasks.filter(t => !t.completed).length})
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => setCurrentView('debts')}
                      variant="secondary"
                    >
                      💳 Долги ({debts.length})
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
          
          {/* Rooms View */}
          {currentView === 'rooms' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Комнаты</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map(room => (
                  <RoomCardChess
                    key={room.id}
                    room={room}
                    guests={filteredGuests}
                    onRoomClick={(r) => { setSelectedRoom(r); setShowRoomModal(true); }}
                    onGuestClick={(g) => { setSelectedGuest(g); setShowGuestDetails(true); }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Calendar View */}
          {currentView === 'calendar' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Календарь</h1>
              <CalendarView guests={filteredGuests} rooms={filteredRooms} />
            </div>
          )}
          
          {/* Reports View */}
          {currentView === 'reports' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Отчёты</h1>
              <ReportsView guests={filteredGuests} expenses={expenses} rooms={filteredRooms} />
            </div>
          )}
          
          {/* Debts View */}
          {currentView === 'debts' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Долги</h1>
              <DebtsView
                debts={debts}
                onPayDebt={handlePayDebt}
                onDeleteDebt={handleDeleteDebt}
                canEdit={canEdit}
              />
            </div>
          )}
          
          {/* Tasks View */}
          {currentView === 'tasks' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Задачи</h1>
              <TaskManager
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                canEdit={canEdit}
              />
            </div>
          )}
          
          {/* Clients View */}
          {currentView === 'clients' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Клиенты</h1>
              <ClientsView
                clients={clients}
                onEditClient={handleEditClient}
                onDeleteClient={handleDeleteClient}
                onViewHistory={handleViewHistory}
                canEdit={canEdit}
              />
            </div>
          )}
          
          {/* Staff View */}
          {currentView === 'staff' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Сотрудники</h1>
              <StaffView
                staff={staff}
                shifts={shifts}
                onAddStaff={() => {}}
                onEditStaff={() => {}}
                onDeleteStaff={() => {}}
                canEdit={canEdit}
              />
            </div>
          )}
          
          {/* Shifts View */}
          {currentView === 'shifts' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Смены</h1>
              <ShiftsView shifts={shifts} staff={staff} />
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSubmit={handleCheckIn}
        rooms={filteredRooms}
        countries={COUNTRIES}
        canEdit={canEdit}
      />
      
      <GuestDetailsModal
        guest={selectedGuest}
        isOpen={showGuestDetails}
        onClose={() => { setShowGuestDetails(false); setSelectedGuest(null); }}
        onUpdate={handleUpdateGuest}
        onCheckout={handleCheckOut}
        onPrint={handlePrint}
        canEdit={canEdit}
      />
      
      <MoveGuestModal
        guest={selectedGuest}
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={handleMoveGuest}
        rooms={filteredRooms}
        canEdit={canEdit}
      />
      
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleAddExpense}
        canEdit={canEdit}
      />
      
      <ClientHistoryModal
        client={selectedClient}
        isOpen={showClientHistory}
        onClose={() => { setShowClientHistory(false); setSelectedClient(null); }}
        guests={guests}
      />
      
      <ClientEditModal
        isOpen={showClientEditModal}
        onClose={() => { setShowClientEditModal(false); setSelectedClient(null); }}
        onSubmit={handleUpdateClient}
        client={selectedClient}
        countries={COUNTRIES}
      />
      
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
// All parts complete!
// ============================================
