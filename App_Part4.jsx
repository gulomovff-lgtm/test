// ============================================
// App.jsx - Part 4/5
// View Components (Pages)
// ============================================

// FIXED: Calendar View with corrected checked-out guest display and color gradient
const CalendarView = ({ guests, rooms, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'week' or 'month'
  
  // Generate days for display
  const days = useMemo(() => {
    const result = [];
    const start = new Date(currentDate);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    
    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(start);
      day.setDate(i + 1);
      result.push({
        date: day,
        str: day.toISOString().split('T')[0],
        dayNum: i + 1
      });
    }
    
    return result;
  }, [currentDate]);
  
  // FIXED: Get guest block style with proper checkout date handling
  const getGuestBlockStyle = (guest) => {
    let checkInDate = new Date(guest.checkInDate || guest.checkInDateTime || guest.checkIn);
    checkInDate.setHours(12, 0, 0, 0);

    // FIXED: For checked-out guests, use actual checkOutDate from database
    let checkOutDate;
    if (guest.status === 'checked_out' && guest.checkOutDate) {
      checkOutDate = new Date(guest.checkOutDate);
      checkOutDate.setHours(12, 0, 0, 0);
    } else {
      // For active guests, calculate expected checkout
      const guestDurationMs = parseInt(guest.days) * 24 * 60 * 60 * 1000;
      checkOutDate = new Date(checkInDate.getTime() + guestDurationMs);
      checkOutDate.setHours(12, 0, 0, 0);
    }

    const calendarStart = new Date(days[0].str);
    calendarStart.setHours(0, 0, 0, 0);
    
    const calendarEnd = new Date(days[days.length - 1].str);
    calendarEnd.setHours(23, 59, 59, 999);

    // Don't show if completely outside calendar range
    if (checkOutDate < calendarStart || checkInDate > calendarEnd) return null;

    // Calculate visible portion
    const visibleStart = checkInDate < calendarStart ? calendarStart : checkInDate;
    const visibleEnd = checkOutDate > calendarEnd ? calendarEnd : checkOutDate;
    
    const totalDays = days.length;
    const startDay = Math.floor((visibleStart - calendarStart) / (24 * 60 * 60 * 1000));
    const endDay = Math.floor((visibleEnd - calendarStart) / (24 * 60 * 60 * 1000));
    
    const leftPercent = (startDay / totalDays) * 100;
    const widthPercent = ((endDay - startDay + 1) / totalDays) * 100;
    
    return {
      leftPercent,
      widthPercent,
      visibleStart,
      visibleEnd
    };
  };
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Календарь загруженности</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={goToPrevMonth}>
            <ChevronLeft size={20} />
          </Button>
          <span className="px-4 py-2 font-semibold">
            {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="secondary" onClick={goToNextMonth}>
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
      
      <Card>
        {/* Calendar header with dates */}
        <div className="flex border-b pb-2 mb-4">
          {days.map((day, i) => (
            <div key={i} className="flex-1 text-center text-xs">
              <div className="font-semibold">{day.dayNum}</div>
              <div className="text-gray-500">
                {day.date.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Rooms with guest bars */}
        <div className="space-y-3">
          {rooms.map(room => {
            const roomGuests = guests.filter(g => 
              g.roomNumber === room.number && 
              (g.status === 'checked_in' || g.status === 'checked_out')
            );
            
            return (
              <div key={room.number} className="relative">
                <div className="flex items-center mb-2">
                  <span className="w-24 font-semibold text-sm">
                    Комната {room.number}
                  </span>
                  <div className="flex-1 h-12 bg-gray-100 rounded relative">
                    {roomGuests.map((guest, gi) => {
                      const styleData = getGuestBlockStyle(guest);
                      if (!styleData) return null;
                      
                      // FIXED: Color gradient based on payment ratio
                      const totalPaid = getTotalPaid(guest);
                      const paidRatio = Math.min(1, totalPaid / (guest.totalPrice || 1));
                      
                      return (
                        <div
                          key={gi}
                          className="absolute h-10 top-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            left: `${styleData.leftPercent}%`,
                            width: `${styleData.widthPercent}%`,
                            background: `linear-gradient(to right, 
                              #10b981 0%, 
                              #10b981 ${paidRatio * 100}%, 
                              #ef4444 ${paidRatio * 100}%, 
                              #ef4444 100%)`,
                            zIndex: 10 + gi
                          }}
                          title={`${guest.fullName} - Место ${guest.bedId}`}
                          onClick={() => onDayClick && onDayClick(guest)}
                        >
                          <div className="px-2 py-1 text-white text-xs truncate">
                            <div className="font-semibold">{guest.fullName}</div>
                            <div className="text-[10px]">
                              Место {guest.bedId} • {totalPaid}/{guest.totalPrice} ₽
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Полностью оплачено</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Не оплачено</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded" style={{
              background: 'linear-gradient(to right, #10b981 0%, #10b981 50%, #ef4444 50%, #ef4444 100%)'
            }}></div>
            <span>Частично оплачено</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Staff View Component
const StaffView = ({ staff, onAdd, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const filteredStaff = staff.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Персонал</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} className="mr-2" />
          Добавить сотрудника
        </Button>
      </div>
      
      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по имени или должности..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Имя</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Должность</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Телефон</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Зарплата</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3">{member.role}</td>
                  <td className="px-4 py-3">{member.phone}</td>
                  <td className="px-4 py-3">{member.salary?.toLocaleString()} ₽</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(member)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(member.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// FIXED: Clients View with pagination and country filters
const ClientsView = ({ clients, onAdd, onEdit, onDelete, onViewHistory }) => {
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, perPage: 25 });
  const [countryFilter, setCountryFilter] = useState('');
  const [showImport, setShowImport] = useState(false);
  
  // Get unique countries from clients
  const uniqueCountries = useMemo(() => {
    return [...new Set(clients.map(c => c.country))].filter(Boolean).sort();
  }, [clients]);
  
  // Filter and paginate clients
  const filteredAndPaginated = useMemo(() => {
    let result = clients.filter(c =>
      (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.passport || '').includes(search.toUpperCase()) ||
      (c.phone || '').includes(search)
    );
    
    // Apply country filter
    if (countryFilter) {
      result = result.filter(c => c.country === countryFilter);
    }
    
    // Paginate
    const start = (pagination.page - 1) * pagination.perPage;
    const end = start + pagination.perPage;
    
    return {
      clients: result.slice(start, end),
      total: result.length,
      totalPages: Math.ceil(result.length / pagination.perPage)
    };
  }, [clients, search, countryFilter, pagination]);
  
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };
  
  const handlePerPageChange = (newPerPage) => {
    setPagination({ page: 1, perPage: newPerPage });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">База клиентов</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImport(true)}>
            <Upload size={20} className="mr-2" />
            Импорт
          </Button>
          <Button onClick={onAdd}>
            <Plus size={20} className="mr-2" />
            Добавить клиента
          </Button>
        </div>
      </div>
      
      <Card>
        {/* Search and filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по имени, паспорту, телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          {/* FIXED: Country filter and pagination controls */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <select
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Все страны ({clients.length})</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>
                    {country} ({clients.filter(c => c.country === country).length})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => handlePerPageChange(25)}
                className={`px-3 py-2 rounded ${
                  pagination.perPage === 25
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                25
              </button>
              <button
                onClick={() => handlePerPageChange(50)}
                className={`px-3 py-2 rounded ${
                  pagination.perPage === 50
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                50
              </button>
              <button
                onClick={() => handlePerPageChange(100)}
                className={`px-3 py-2 rounded ${
                  pagination.perPage === 100
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                100
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Показано {filteredAndPaginated.clients.length} из {filteredAndPaginated.total} клиентов
          </div>
        </div>
        
        {/* Clients table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ФИО</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Паспорт</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Телефон</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Страна</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Визиты</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAndPaginated.clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{client.fullName}</td>
                  <td className="px-4 py-3">{client.passport}</td>
                  <td className="px-4 py-3">{client.phone || '-'}</td>
                  <td className="px-4 py-3">{client.country}</td>
                  <td className="px-4 py-3">{client.visits || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewHistory(client)}
                        className="text-blue-600 hover:text-blue-800"
                        title="История"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(client)}
                        className="text-green-600 hover:text-green-800"
                        title="Редактировать"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(client.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {filteredAndPaginated.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft size={20} />
              Назад
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: filteredAndPaginated.totalPages }, (_, i) => i + 1)
                .filter(p => 
                  p === 1 || 
                  p === filteredAndPaginated.totalPages || 
                  Math.abs(p - pagination.page) <= 2
                )
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        pagination.page === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            
            <Button
              variant="secondary"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === filteredAndPaginated.totalPages}
            >
              Вперед
              <ChevronRight size={20} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

// Client History Modal Component
const ClientHistoryModal = ({ client, guests, onClose }) => {
  const clientVisits = guests.filter(g => 
    g.passport === client.passport || g.fullName === client.fullName
  );
  
  const totalSpent = clientVisits.reduce((sum, g) => sum + (parseInt(g.totalPrice) || 0), 0);
  const totalNights = clientVisits.reduce((sum, g) => sum + (parseInt(g.days) || 0), 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{client.fullName}</h2>
            <p className="text-sm text-gray-600">{client.passport}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Всего визитов</p>
            <p className="text-2xl font-bold">{clientVisits.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Ночей</p>
            <p className="text-2xl font-bold">{totalNights}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Потрачено</p>
            <p className="text-2xl font-bold">{totalSpent.toLocaleString()} ₽</p>
          </div>
        </div>
        
        <h3 className="font-semibold mb-3">История визитов</h3>
        <div className="space-y-2">
          {clientVisits.map(visit => (
            <div key={visit.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Комната {visit.roomNumber}, место {visit.bedId}</p>
                  <p className="text-sm text-gray-600">
                    {getLocalDateString(visit.checkInDate)} — {
                      visit.checkOutDate ? getLocalDateString(visit.checkOutDate) : 'Проживает'
                    }
                  </p>
                  <p className="text-sm text-gray-600">{visit.days} ночей</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{visit.totalPrice} ₽</p>
                  <p className="text-sm text-gray-600">
                    Оплачено: {getTotalPaid(visit)} ₽
                  </p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    visit.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {visit.status === 'checked_in' ? 'Активен' : 'Выселен'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Task Manager Component
const TaskManager = ({ tasks, onAdd, onToggle, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', assignee: '' });
  
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Задачи</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Новая задача
        </Button>
      </div>
      
      {showForm && (
        <Card>
          <h3 className="font-semibold mb-3">Создать задачу</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Название задачи"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className={inputClass}
            />
            <div className="flex gap-2">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className={inputClass}
              >
                <option value="low">Низкий приоритет</option>
                <option value="medium">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
              </select>
              <Button onClick={() => {
                onAdd(newTask);
                setNewTask({ title: '', priority: 'medium', assignee: '' });
                setShowForm(false);
              }}>
                Создать
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">Активные задачи ({pendingTasks.length})</h3>
          <div className="space-y-2">
            {pendingTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => onToggle(task.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-600">{task.assignee}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {task.priority}
                </span>
                <button onClick={() => onDelete(task.id)} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <h3 className="font-semibold mb-3">Выполненные ({completedTasks.length})</h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded opacity-60">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => onToggle(task.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium line-through">{task.title}</p>
                </div>
                <button onClick={() => onDelete(task.id)} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Debts View Component
const DebtsView = ({ debts, onAdd, onPay, onDelete }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'unpaid', 'paid'
  
  const filteredDebts = debts.filter(d => {
    if (filter === 'all') return true;
    return d.status === filter;
  });
  
  const totalDebt = debts
    .filter(d => d.status === 'unpaid')
    .reduce((sum, d) => sum + parseInt(d.amount || 0), 0);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление долгами</h2>
        <Button onClick={onAdd}>
          <Plus size={20} className="mr-2" />
          Добавить долг
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50">
          <p className="text-sm text-gray-600">Всего долгов</p>
          <p className="text-3xl font-bold text-red-600">{totalDebt.toLocaleString()} ₽</p>
        </Card>
      </div>
      
      <Card>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded ${
              filter === 'unpaid' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            Неоплаченные
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded ${
              filter === 'paid' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            Оплаченные
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Клиент</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Сумма</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Дата</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Описание</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDebts.map(debt => (
                <tr key={debt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{debt.clientName}</td>
                  <td className="px-4 py-3 font-semibold">{parseInt(debt.amount).toLocaleString()} ₽</td>
                  <td className="px-4 py-3">{getLocalDateString(debt.date)}</td>
                  <td className="px-4 py-3">{debt.description || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      debt.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {debt.status === 'paid' ? 'Оплачен' : 'Не оплачен'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {debt.status === 'unpaid' && (
                        <button
                          onClick={() => onPay(debt.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(debt.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Reports View Component
const ReportsView = ({ transactions, onExport, onPrint }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hostelFilter, setHostelFilter] = useState('all');
  
  const filteredTransactions = transactions.filter(t => {
    if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(t.date) > new Date(dateTo)) return false;
    if (hostelFilter !== 'all' && t.hostel !== hostelFilter) return false;
    return true;
  });
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
  
  const balance = totalIncome - totalExpense;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Финансовые отчеты</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onExport(filteredTransactions)}>
            <Download size={20} className="mr-2" />
            Экспорт
          </Button>
          <Button variant="secondary" onClick={() => onPrint(filteredTransactions)}>
            <Printer size={20} className="mr-2" />
            Печать
          </Button>
        </div>
      </div>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>От даты</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>До даты</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Хостел</label>
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">Все хостелы</option>
              {HOSTELS.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Доходы</p>
            <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} ₽</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Расходы</p>
            <p className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} ₽</p>
          </div>
          <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
            <p className="text-sm text-gray-600">Баланс</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
              {balance.toLocaleString()} ₽
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Дата</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Тип</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Хостел</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Кассир</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Сумма</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Метод</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{getLocalDateString(transaction.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type === 'income' ? 'Приход' : 'Расход'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{transaction.hostel}</td>
                  <td className="px-4 py-3">{transaction.staff}</td>
                  <td className="px-4 py-3 font-semibold">{parseInt(transaction.amount).toLocaleString()} ₽</td>
                  <td className="px-4 py-3">{transaction.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Shifts View Component
const ShiftsView = ({ shifts, currentShift, onOpenShift, onCloseShift }) => {
  const activeShift = shifts.find(s => s.status === 'active');
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление сменами</h2>
        {!activeShift && (
          <Button onClick={onOpenShift}>
            <Clock size={20} className="mr-2" />
            Открыть смену
          </Button>
        )}
      </div>
      
      {activeShift && (
        <Card className="bg-green-50 border-2 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Текущая смена</h3>
              <p className="text-sm text-gray-600">
                Начало: {getLocalDatetimeString(activeShift.startTime)}
              </p>
              <p className="text-sm text-gray-600">Кассир: {activeShift.staffName}</p>
            </div>
            <Button variant="danger" onClick={() => onCloseShift(activeShift)}>
              Закрыть смену
            </Button>
          </div>
        </Card>
      )}
      
      <Card>
        <h3 className="font-semibold mb-4">История смен</h3>
        <div className="space-y-3">
          {shifts.filter(s => s.status === 'closed').map(shift => (
            <div key={shift.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{shift.staffName}</p>
                  <p className="text-sm text-gray-600">
                    {getLocalDatetimeString(shift.startTime)} — {getLocalDatetimeString(shift.endTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{shift.cashCount?.toLocaleString()} ₽</p>
                  <p className="text-xs text-gray-600">Касса</p>
                </div>
              </div>
              {shift.notes && (
                <p className="text-sm text-gray-600 mt-2">{shift.notes}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================
// End of Part 4/5
// Continue with Part 5/5
// ============================================
