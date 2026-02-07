// ============================================
// App.jsx - Part 4/5
// Views (Pages)
// ============================================

const CalendarView = ({ guests, hostels, selectedHostelFilter, onGuestClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const result = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      result.push({
        date: i,
        str: date.toISOString().split('T')[0]
      });
    }
    return result;
  }, [currentMonth]);
  
  const filteredGuests = guests.filter(g => {
    if (selectedHostelFilter && g.hostelId !== selectedHostelFilter) return false;
    return true;
  });
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Правильный расчет позиции для выселенных гостей
  const getGuestBlockStyle = (guest) => {
    let checkInDate = new Date(guest.checkInDate || guest.checkInDateTime || guest.checkIn);
    checkInDate.setHours(12, 0, 0, 0);

    const calendarStart = new Date(days[0].str);
    calendarStart.setHours(0, 0, 0, 0);
    
    // ✅ ДЛЯ ВЫСЕЛЕННЫХ ИСПОЛЬЗУЕМ checkOutDate ИЗ БД
    let checkOutDate;
    if (guest.status === 'checked_out' && guest.checkOutDate) {
      checkOutDate = new Date(guest.checkOutDate);
      checkOutDate.setHours(12, 0, 0, 0);
    } else {
      const guestDurationMs = parseInt(guest.days) * 24 * 60 * 60 * 1000;
      checkOutDate = new Date(checkInDate.getTime() + guestDurationMs);
      checkOutDate.setHours(12, 0, 0, 0);
    }

    const startDayIndex = Math.floor((checkInDate - calendarStart) / (24 * 60 * 60 * 1000));
    const endDayIndex = Math.floor((checkOutDate - calendarStart) / (24 * 60 * 60 * 1000));
    
    const left = Math.max(0, startDayIndex);
    const width = Math.max(1, endDayIndex - startDayIndex);
    
    // ✅ Цветовое кодирование: зелёный=оплачено, красный=долг
    const totalPaid = getTotalPaid(guest);
    const totalPrice = guest.totalPrice || 0;
    const paidRatio = totalPrice > 0 ? Math.min(totalPaid / totalPrice, 1) : 0;
    
    return {
      left: `${(left / days.length) * 100}%`,
      width: `${(width / days.length) * 100}%`,
      background: `linear-gradient(90deg, 
        #10b981 0%, 
        #10b981 ${paidRatio * 100}%, 
        #ef4444 ${paidRatio * 100}%, 
        #ef4444 100%
      )`
    };
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Календарь</h1>
        <div className="flex gap-2 items-center">
          <Button onClick={prevMonth} variant="secondary">←</Button>
          <span className="text-xl font-semibold px-4">
            {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </span>
          <Button onClick={nextMonth} variant="secondary">→</Button>
        </div>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex border-b pb-2 mb-4">
              {days.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 text-center text-sm font-semibold"
                >
                  {day.date}
                </div>
              ))}
            </div>
            
            <div className="space-y-1">
              {filteredGuests.map((guest) => {
                const styleData = getGuestBlockStyle(guest);
                
                return (
                  <div
                    key={guest.id}
                    className="relative h-12 cursor-pointer"
                    onClick={() => onGuestClick(guest)}
                  >
                    <div
                      className="absolute h-10 rounded flex items-center px-2 text-white text-sm overflow-hidden"
                      style={styleData}
                    >
                      <span className="font-semibold truncate">
                        {guest.fullName} - {guest.roomNumber}/{guest.bedId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
      
      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded"></div>
          <span className="text-sm">Оплачено</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded"></div>
          <span className="text-sm">Долг</span>
        </div>
      </div>
    </div>
  );
};

const StaffView = ({ currentUser }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Персонал</h1>
      <Card>
        <div className="space-y-4">
          {DEFAULT_USERS.map((user, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.login}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{user.role}</p>
                {user.hostelId && (
                  <p className="text-sm text-gray-600">
                    {HOSTELS.find(h => h.id === user.hostelId)?.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const ClientsView = ({ guests }) => {
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [countryFilter, setCountryFilter] = useState('');
  
  const clients = useMemo(() => {
    const uniqueClients = new Map();
    guests.forEach(g => {
      if (!uniqueClients.has(g.passport)) {
        uniqueClients.set(g.passport, {
          fullName: g.fullName,
          passport: g.passport,
          country: g.country,
          phone: g.phone,
          lastVisit: g.checkInDate,
          visits: 1
        });
      } else {
        const existing = uniqueClients.get(g.passport);
        existing.visits += 1;
        if (new Date(g.checkInDate) > new Date(existing.lastVisit)) {
          existing.lastVisit = g.checkInDate;
        }
      }
    });
    return Array.from(uniqueClients.values());
  }, [guests]);
  
  // ✅ Уникальные страны для фильтра
  const uniqueCountries = useMemo(() => {
    return [...new Set(clients.map(c => c.country))].sort();
  }, [clients]);
  
  // ✅ Фильтрация + пагинация
  const filteredClients = useMemo(() => {
    let result = clients.filter(c => {
      const matchSearch = (c.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
                         (c.passport || '').includes(search.toUpperCase());
      const matchCountry = !countryFilter || c.country === countryFilter;
      return matchSearch && matchCountry;
    });
    
    return result.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [clients, search, countryFilter, currentPage, perPage]);
  
  const totalPages = Math.ceil(
    clients.filter(c => !countryFilter || c.country === countryFilter).length / perPage
  );
  
  useEffect(() => {
    setCurrentPage(1);
  }, [search, countryFilter, perPage]);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Клиенты</h1>
      
      <Card className="mb-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Поиск по имени или паспорту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <select 
            value={perPage} 
            onChange={e => setPerPage(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value={25}>25 на странице</option>
            <option value={50}>50 на странице</option>
            <option value={100}>100 на странице</option>
          </select>
          
          <select 
            value={countryFilter} 
            onChange={e => setCountryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Все страны</option>
            {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <div className="flex gap-2 items-center">
            <Button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              variant="secondary"
            >
              ←
            </Button>
            <span className="px-3 font-semibold">
              {currentPage} / {totalPages || 1}
            </span>
            <Button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(p => p + 1)}
              variant="secondary"
            >
              →
            </Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">ФИО</th>
                <th className="text-left p-3">Паспорт</th>
                <th className="text-left p-3">Страна</th>
                <th className="text-left p-3">Телефон</th>
                <th className="text-left p-3">Посещений</th>
                <th className="text-left p-3">Последний визит</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{client.fullName}</td>
                  <td className="p-3">{client.passport}</td>
                  <td className="p-3">{client.country}</td>
                  <td className="p-3">{client.phone || '-'}</td>
                  <td className="p-3">{client.visits}</td>
                  <td className="p-3">
                    {new Date(client.lastVisit).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Клиенты не найдены
          </div>
        )}
      </Card>
    </div>
  );
};

const TaskManager = ({ tasks, onAddTask, onToggleTask, currentUser }) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    
    onAddTask({
      text: newTaskText,
      priority: newTaskPriority,
      completed: false,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString()
    });
    
    setNewTaskText('');
    setShowAddTask(false);
  };
  
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Задачи</h1>
        <Button onClick={() => setShowAddTask(!showAddTask)} variant="primary">
          + Добавить задачу
        </Button>
      </div>
      
      {showAddTask && (
        <Card className="mb-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Описание задачи..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <div className="flex gap-4">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="low">Низкий приоритет</option>
                <option value="medium">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
              </select>
              <Button onClick={handleAddTask} variant="success">
                Сохранить
              </Button>
              <Button onClick={() => setShowAddTask(false)} variant="secondary">
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.text}
                </p>
                <p className="text-sm text-gray-500">
                  {task.createdBy} - {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>
          </Card>
        ))}
      </div>
      
      {tasks.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 py-8">Нет задач</p>
        </Card>
      )}
    </div>
  );
};

const DebtsView = ({ guests }) => {
  const debts = useMemo(() => {
    return guests
      .filter(g => g.status === 'active')
      .map(g => {
        const totalPaid = getTotalPaid(g);
        const totalPrice = parseInt(g.totalPrice) || 0;
        const debt = totalPrice - totalPaid;
        return { ...g, debt };
      })
      .filter(g => g.debt > 0)
      .sort((a, b) => b.debt - a.debt);
  }, [guests]);
  
  const totalDebt = debts.reduce((sum, g) => sum + g.debt, 0);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Долги</h1>
      
      <Card className="mb-6">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Общая сумма долгов</p>
          <p className="text-4xl font-bold text-red-600">
            {totalDebt.toLocaleString()}
          </p>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Гость</th>
                <th className="text-left p-3">Комната/Место</th>
                <th className="text-left p-3">Дата заезда</th>
                <th className="text-left p-3">Итого</th>
                <th className="text-left p-3">Оплачено</th>
                <th className="text-left p-3">Долг</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((guest) => {
                const totalPaid = getTotalPaid(guest);
                return (
                  <tr key={guest.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{guest.fullName}</td>
                    <td className="p-3">{guest.roomNumber}/{guest.bedId}</td>
                    <td className="p-3">
                      {new Date(guest.checkInDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{parseInt(guest.totalPrice).toLocaleString()}</td>
                    <td className="p-3 text-green-600">{totalPaid.toLocaleString()}</td>
                    <td className="p-3 font-bold text-red-600">
                      {guest.debt.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {debts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет долгов
          </div>
        )}
      </Card>
    </div>
  );
};

const ReportsView = ({ guests, expenses, selectedHostelFilter, hostels }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const reportData = useMemo(() => {
    const income = guests
      .filter(g => {
        if (selectedHostelFilter && g.hostelId !== selectedHostelFilter) return false;
        if (!g.payments) return false;
        return true;
      })
      .flatMap(g => 
        (g.payments || []).map(p => ({
          date: new Date(p.date).toLocaleDateString(),
          type: 'income',
          amount: p.amount,
          method: p.method,
          hostel: HOSTELS.find(h => h.id === g.hostelId)?.name || 'N/A',
          staff: 'N/A',
          comment: `Оплата от ${g.fullName}`
        }))
      );
    
    const expenseData = expenses
      .filter(e => {
        if (selectedHostelFilter && e.hostelId !== selectedHostelFilter) return false;
        return true;
      })
      .map(e => ({
        date: new Date(e.date).toLocaleDateString(),
        type: 'expense',
        amount: e.amount,
        method: e.method,
        hostel: e.hostelName,
        staff: e.staff,
        comment: `${e.category}: ${e.description}`
      }));
    
    return [...income, ...expenseData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [guests, expenses, selectedHostelFilter]);
  
  const filteredData = useMemo(() => {
    if (!dateFrom && !dateTo) return reportData;
    
    return reportData.filter(item => {
      const itemDate = new Date(item.date);
      if (dateFrom && itemDate < new Date(dateFrom)) return false;
      if (dateTo && itemDate > new Date(dateTo)) return false;
      return true;
    });
  }, [reportData, dateFrom, dateTo]);
  
  const totalIncome = filteredData
    .filter(d => d.type === 'income')
    .reduce((sum, d) => sum + parseInt(d.amount), 0);
  
  const totalExpense = filteredData
    .filter(d => d.type === 'expense')
    .reduce((sum, d) => sum + parseInt(d.amount), 0);
  
  const balance = totalIncome - totalExpense;
  
  const handleExport = () => {
    const filename = `report_${new Date().toLocaleDateString()}.xls`;
    exportToExcel(filteredData, filename, totalIncome, totalExpense);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Отчёты</h1>
      
      <Card className="mb-6">
        <div className="flex gap-4 items-center flex-wrap mb-4">
          <div>
            <label className="block text-sm mb-1">От:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">До:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex-1"></div>
          <Button onClick={handleExport} variant="success">
            📊 Экспорт в Excel
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Приход</p>
            <p className="text-2xl font-bold text-green-600">
              {totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Расход</p>
            <p className="text-2xl font-bold text-red-600">
              {totalExpense.toLocaleString()}
            </p>
          </div>
          <div className={`${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg text-center`}>
            <p className="text-sm text-gray-600">Баланс</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {balance.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Дата</th>
                <th className="text-left p-3">Тип</th>
                <th className="text-left p-3">Хостел</th>
                <th className="text-left p-3">Кассир</th>
                <th className="text-left p-3">Сумма</th>
                <th className="text-left p-3">Метод</th>
                <th className="text-left p-3">Описание</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.type === 'income' ? 'Приход' : 'Расход'}
                    </span>
                  </td>
                  <td className="p-3">{item.hostel}</td>
                  <td className="p-3">{item.staff}</td>
                  <td className="p-3 font-semibold">
                    {parseInt(item.amount).toLocaleString()}
                  </td>
                  <td className="p-3">{item.method}</td>
                  <td className="p-3 text-sm">{item.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const ShiftsView = ({ currentUser }) => {
  const [shifts, setShifts] = useState([]);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Смены</h1>
      <Card>
        <p className="text-center text-gray-500 py-8">
          Функция в разработке
        </p>
      </Card>
    </div>
  );
};

// ============================================
// End of Part 4/5
// ============================================
