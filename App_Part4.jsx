// App.jsx - Part 4/5
// Copy all parts sequentially into one file to use

// View Components

// Calendar View Component - FIXED visualization for checked out guests
const CalendarView = ({ guests, rooms }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
  
  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };
  
  // Get guest block style with FIXED visualization
  const getGuestBlockStyle = (guest) => {
    const checkIn = new Date(guest.checkInDate);
    const checkOut = new Date(guest.checkOutDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // FIXED: For checked_out guests, use checkOutDate from DB, not today's date
    const endDate = guest.status === 'checked_out' 
      ? checkOut 
      : (checkOut < now ? checkOut : now);
    
    const start = Math.max(checkIn, monthStart);
    const end = Math.min(endDate, monthEnd);
    
    if (start > monthEnd || end < monthStart) {
      return null;
    }
    
    const startDay = Math.max(0, Math.floor((start - monthStart) / (1000 * 60 * 60 * 24)));
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate paid and unpaid days with color coding
    const totalPaid = getTotalPaid(guest);
    const totalPrice = guest.totalPrice || 0;
    const pricePerDay = guest.pricePerDay || 0;
    const totalDays = guest.days || 0;
    
    // Calculate paid ratio
    const paidRatio = pricePerDay > 0 ? Math.min(totalPaid / totalPrice, 1) : 0;
    const paidDays = Math.floor(totalDays * paidRatio);
    
    return {
      left: `${(startDay / 31) * 100}%`,
      width: `${(duration / 31) * 100}%`,
      paidRatio: paidRatio,
      status: guest.status,
    };
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={prevMonth}>← Предыдущий</Button>
          <h2 className="text-2xl font-bold">
            {selectedMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
          <Button onClick={nextMonth}>Следующий →</Button>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days header */}
            <div className="flex border-b pb-2 mb-2">
              {Array.from({ length: 31 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-gray-600">
                  {i + 1}
                </div>
              ))}
            </div>
            
            {/* Guest rows */}
            <div className="space-y-1">
              {guests
                .filter(g => {
                  const checkIn = new Date(g.checkInDate);
                  const checkOut = new Date(g.checkOutDate);
                  return checkIn <= monthEnd && checkOut >= monthStart;
                })
                .map(guest => {
                  const style = getGuestBlockStyle(guest);
                  if (!style) return null;
                  
                  return (
                    <div key={guest.id} className="relative h-8 border-b">
                      <div className="absolute inset-y-0 flex items-center text-xs">
                        <div
                          className="relative h-6 rounded flex items-center overflow-hidden"
                          style={{
                            left: style.left,
                            width: style.width,
                          }}
                        >
                          {/* Paid portion (green) */}
                          <div
                            className="h-full bg-green-500 flex items-center px-2"
                            style={{ width: `${style.paidRatio * 100}%` }}
                          />
                          {/* Unpaid portion (red) */}
                          <div
                            className="h-full bg-red-500 flex items-center px-2"
                            style={{ width: `${(1 - style.paidRatio) * 100}%` }}
                          />
                          {/* Guest name overlay */}
                          <div className="absolute inset-0 flex items-center px-2 text-white font-medium text-xs truncate">
                            {guest.fullName} ({guest.roomId})
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Оплаченные дни</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Неоплаченные дни</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Staff View Component
const StaffView = ({ staff, shifts, onAddStaff, onEditStaff, onDeleteStaff, canEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Сотрудники</h2>
          <Button onClick={() => { setEditingStaff(null); setShowModal(true); }} disabled={!canEdit}>
            + Добавить сотрудника
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(s => {
            const salaryInfo = calculateSalary(shifts, s);
            return (
              <Card key={s.id} className="bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    <p className="text-sm text-gray-600">{s.position || 'Сотрудник'}</p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingStaff(s); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onDeleteStaff(s.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 text-sm">
                  <p><strong>Процент:</strong> {s.salaryPercent || 0}%</p>
                  <p><strong>Заработано:</strong> {salaryInfo.totalEarned} сум</p>
                  <p><strong>Зарплата:</strong> {salaryInfo.salary} сум</p>
                  <p><strong>Смен:</strong> {salaryInfo.shiftsCount}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// Clients View Component - WITH PAGINATION AND FILTERS
const ClientsView = ({ clients, onEditClient, onDeleteClient, onViewHistory, canEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get unique countries for filter
  const uniqueCountries = useMemo(() => {
    const countries = clients.map(c => c.country).filter(Boolean);
    return [...new Set(countries)].sort();
  }, [clients]);
  
  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = !searchTerm || 
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.passport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm);
      
      const matchesCountry = !countryFilter || c.country === countryFilter;
      
      return matchesSearch && matchesCountry;
    });
  }, [clients, searchTerm, countryFilter]);
  
  // Paginate clients
  const paginatedClients = useMemo(() => {
    const startIdx = (currentPage - 1) * perPage;
    const endIdx = startIdx + perPage;
    return filteredClients.slice(startIdx, endIdx);
  }, [filteredClients, currentPage, perPage]);
  
  const totalPages = Math.ceil(filteredClients.length / perPage);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, countryFilter, perPage]);
  
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Клиенты</h2>
        
        {/* Filters and Pagination Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по имени, паспорту, телефону..."
            className={inputClass + " flex-1 min-w-[200px]"}
          />
          
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className={inputClass + " w-40"}
          >
            <option value="">Все страны</option>
            {uniqueCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className={inputClass + " w-24"}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Показано: {paginatedClients.length} из {filteredClients.length}
          </div>
        </div>
        
        {/* Clients Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">ФИО</th>
                <th className="border p-2 text-left">Паспорт</th>
                <th className="border p-2 text-left">Страна</th>
                <th className="border p-2 text-left">Телефон</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="border p-2">{client.fullName}</td>
                  <td className="border p-2">{client.passport}</td>
                  <td className="border p-2">{client.country}</td>
                  <td className="border p-2">{client.phone}</td>
                  <td className="border p-2">{client.email}</td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewHistory(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        📋
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onEditClient(client)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => onDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="secondary"
            >
              ← Назад
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="secondary"
            >
              Вперёд →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

// Task Manager Component
const TaskManager = ({ tasks, onAddTask, onToggleTask, onDeleteTask, canEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(newTask);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowModal(false);
  };
  
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Задачи</h2>
          <Button onClick={() => setShowModal(true)} disabled={!canEdit}>
            + Добавить задачу
          </Button>
        </div>
        
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`border rounded-lg p-4 ${task.completed ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="mt-1"
                  disabled={!canEdit}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
                      {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getLocalDateString(task.createdAt)}
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Добавить задачу</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Название *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className={inputClass}
                  required
                />
              </div>
              
              <div>
                <label className={labelClass}>Описание</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className={inputClass}
                  rows="3"
                />
              </div>
              
              <div>
                <label className={labelClass}>Приоритет</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className={inputClass}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Отмена
                </Button>
                <Button type="submit">
                  Добавить
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Debts View Component
const DebtsView = ({ debts, onPayDebt, onDeleteDebt, canEdit }) => {
  const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Долги</h2>
          <div className="text-xl font-bold text-red-600">
            Общий долг: {totalDebt} сум
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Клиент</th>
                <th className="border p-2 text-left">Сумма</th>
                <th className="border p-2 text-left">Причина</th>
                <th className="border p-2 text-left">Дата</th>
                <th className="border p-2 text-left">Срок</th>
                <th className="border p-2 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(debt => (
                <tr key={debt.id} className="hover:bg-gray-50">
                  <td className="border p-2">{debt.clientName}</td>
                  <td className="border p-2 font-bold text-red-600">{debt.amount} сум</td>
                  <td className="border p-2">{debt.reason}</td>
                  <td className="border p-2">{getLocalDateString(debt.date)}</td>
                  <td className="border p-2">
                    {debt.dueDate ? getLocalDateString(debt.dueDate) : '-'}
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      {canEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => onPayDebt(debt.id)}
                          >
                            Оплачено
                          </Button>
                          <button
                            onClick={() => onDeleteDebt(debt.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </>
                      )}
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
const ReportsView = ({ guests, expenses, rooms }) => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const filteredGuests = guests.filter(g => {
    const checkIn = new Date(g.checkInDate);
    return checkIn >= new Date(startDate) && checkIn <= new Date(endDate);
  });
  
  const filteredExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
  });
  
  const totalRevenue = filteredGuests.reduce((sum, g) => sum + getTotalPaid(g), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const handleExport = () => {
    const data = filteredGuests.map(g => ({
      'ФИО': g.fullName,
      'Паспорт': g.passport,
      'Страна': g.country,
      'Комната': g.roomId,
      'Заселение': getLocalDateString(g.checkInDate),
      'Выселение': getLocalDateString(g.checkOutDate),
      'Дней': g.days,
      'Цена': g.totalPrice,
      'Оплачено': getTotalPaid(g),
      'Баланс': g.totalPrice - getTotalPaid(g),
    }));
    
    exportToExcel(
      data,
      `Report_${startDate}_${endDate}`,
      ['ФИО', 'Паспорт', 'Страна', 'Комната', 'Заселение', 'Выселение', 'Дней', 'Цена', 'Оплачено', 'Баланс']
    );
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Отчёты</h2>
        
        <div className="flex gap-4 mb-6">
          <div>
            <label className={labelClass}>От</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>До</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleExport}>
              📊 Экспорт в Excel
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50">
            <h3 className="text-sm text-gray-600">Доход</h3>
            <p className="text-2xl font-bold text-green-600">{totalRevenue} сум</p>
          </Card>
          <Card className="bg-red-50">
            <h3 className="text-sm text-gray-600">Расходы</h3>
            <p className="text-2xl font-bold text-red-600">{totalExpenses} сум</p>
          </Card>
          <Card className="bg-blue-50">
            <h3 className="text-sm text-gray-600">Чистая прибыль</h3>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {netProfit} сум
            </p>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2">Гости ({filteredGuests.length})</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100">
                    <th className="border p-1">ФИО</th>
                    <th className="border p-1">Оплачено</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map(g => (
                    <tr key={g.id}>
                      <td className="border p-1">{g.fullName}</td>
                      <td className="border p-1">{getTotalPaid(g)} сум</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Расходы ({filteredExpenses.length})</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100">
                    <th className="border p-1">Описание</th>
                    <th className="border p-1">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="border p-1">{e.description}</td>
                      <td className="border p-1">{e.amount} сум</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Shifts View Component
const ShiftsView = ({ shifts, staff }) => {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Смены</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Сотрудник</th>
                <th className="border p-2 text-left">Начало</th>
                <th className="border p-2 text-left">Конец</th>
                <th className="border p-2 text-left">Заработано</th>
                <th className="border p-2 text-left">Статус</th>
                <th className="border p-2 text-left">Примечания</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map(shift => {
                const staffMember = staff.find(s => s.id === shift.staffId);
                return (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="border p-2">{staffMember?.name || 'N/A'}</td>
                    <td className="border p-2">{getLocalDateString(shift.startTime)}</td>
                    <td className="border p-2">
                      {shift.endTime ? getLocalDateString(shift.endTime) : 'Активна'}
                    </td>
                    <td className="border p-2 font-bold">{shift.totalEarned || 0} сум</td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        shift.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shift.status === 'active' ? 'Активна' : 'Закрыта'}
                      </span>
                    </td>
                    <td className="border p-2">{shift.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Client History Modal Component
const ClientHistoryModal = ({ client, isOpen, onClose, guests }) => {
  if (!isOpen || !client) return null;
  
  const clientHistory = guests.filter(g => 
    g.passport === client.passport || g.fullName === client.fullName
  );
  
  const totalStays = clientHistory.length;
  const totalSpent = clientHistory.reduce((sum, g) => sum + getTotalPaid(g), 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">История клиента</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ФИО</p>
              <p className="font-medium">{client.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Паспорт</p>
              <p className="font-medium">{client.passport}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Страна</p>
              <p className="font-medium">{client.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Телефон</p>
              <p className="font-medium">{client.phone || '-'}</p>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <Card className="bg-blue-50">
              <h3 className="text-sm text-gray-600">Всего проживаний</h3>
              <p className="text-2xl font-bold text-blue-600">{totalStays}</p>
            </Card>
            <Card className="bg-green-50">
              <h3 className="text-sm text-gray-600">Всего потрачено</h3>
              <p className="text-2xl font-bold text-green-600">{totalSpent} сум</p>
            </Card>
          </div>
          
          {/* History Table */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">История проживаний</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Комната</th>
                    <th className="border p-2 text-left">Заселение</th>
                    <th className="border p-2 text-left">Выселение</th>
                    <th className="border p-2 text-left">Дней</th>
                    <th className="border p-2 text-left">Цена</th>
                    <th className="border p-2 text-left">Оплачено</th>
                    <th className="border p-2 text-left">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {clientHistory.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="border p-2">{g.roomId}</td>
                      <td className="border p-2">{getLocalDateString(g.checkInDate)}</td>
                      <td className="border p-2">{getLocalDateString(g.checkOutDate)}</td>
                      <td className="border p-2">{g.days}</td>
                      <td className="border p-2">{g.totalPrice} сум</td>
                      <td className="border p-2">{getTotalPaid(g)} сум</td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          g.status === 'checked_in' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {g.status === 'checked_in' ? 'Проживает' : 'Выселен'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// End of Part 4/5
// Continue with Part 5/5
// ============================================
