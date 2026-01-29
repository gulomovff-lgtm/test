export type Language = 'ru' | 'uz';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ru: {
    // Navigation
    rooms: 'Комнаты',
    calendar: 'Календарь',
    clients: 'Клиенты',
    debts: 'Долги',
    settings: 'Настройки',
    
    // Actions
    checkIn: 'Заселить',
    checkOut: 'Выселить',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    export: 'Экспорт',
    import: 'Импорт',
    search: 'Поиск',
    add: 'Добавить',
    close: 'Закрыть',
    
    // Client management
    addNewClient: 'Добавить нового клиента',
    clientHistory: 'История клиента',
    repeatLastStay: 'Повторить последнее проживание',
    totalSpent: 'Всего потрачено',
    totalPaid: 'Всего оплачено',
    totalDebt: 'Общий долг',
    totalRefunds: 'Всего возвратов',
    deduplicate: 'Удалить дубликаты',
    normalizeCountries: 'Нормализовать страны',
    deleteSelected: 'Удалить выбранные',
    
    // Guest info
    firstName: 'Имя',
    lastName: 'Фамилия',
    passportNumber: 'Номер паспорта',
    phoneNumber: 'Телефон',
    country: 'Страна',
    room: 'Комната',
    bed: 'Кровать',
    checkInDate: 'Дата заселения',
    checkOutDate: 'Дата выселения',
    plannedCheckOutDate: 'Планируемая дата выезда',
    days: 'Дней',
    pricePerNight: 'Цена за ночь',
    totalPrice: 'Общая стоимость',
    debt: 'Долг',
    paid: 'Оплачено',
    
    // Status
    checkedOut: 'Выселен',
    checkedIn: 'Заселен',
    processing: 'Обработка...',
    loading: 'Загрузка...',
    
    // Messages
    successCheckIn: 'Гость успешно заселен',
    successCheckOut: 'Гость успешно выселен',
    successPayment: 'Платеж успешно обработан',
    errorOccurred: 'Произошла ошибка',
    confirmDelete: 'Вы уверены, что хотите удалить?',
    
    // Staff
    staff: 'Сотрудник',
    handledBy: 'Обработал',
  },
  uz: {
    // Navigation
    rooms: 'Xonalar',
    calendar: 'Kalendar',
    clients: 'Mijozlar',
    debts: 'Qarzlar',
    settings: 'Sozlamalar',
    
    // Actions
    checkIn: 'Joylash',
    checkOut: 'Chiqarish',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    delete: "O'chirish",
    edit: 'Tahrirlash',
    export: 'Eksport',
    import: 'Import',
    search: 'Qidirish',
    add: "Qo'shish",
    close: 'Yopish',
    
    // Client management
    addNewClient: 'Yangi mijoz qo\'shish',
    clientHistory: 'Mijoz tarixi',
    repeatLastStay: 'Oxirgi turarjoyni takrorlash',
    totalSpent: 'Jami sarflangan',
    totalPaid: "Jami to'langan",
    totalDebt: 'Umumiy qarz',
    totalRefunds: 'Jami qaytarilganlar',
    deduplicate: 'Dublikatlarni o\'chirish',
    normalizeCountries: 'Mamlakatlarni normalizatsiya qilish',
    deleteSelected: 'Tanlanganlarni o\'chirish',
    
    // Guest info
    firstName: 'Ism',
    lastName: 'Familiya',
    passportNumber: 'Pasport raqami',
    phoneNumber: 'Telefon',
    country: 'Mamlakat',
    room: 'Xona',
    bed: 'Krovat',
    checkInDate: 'Joylashgan sana',
    checkOutDate: 'Chiqish sanasi',
    plannedCheckOutDate: 'Rejalashtirilgan chiqish sanasi',
    days: 'Kunlar',
    pricePerNight: 'Bir kecha narxi',
    totalPrice: 'Umumiy narx',
    debt: 'Qarz',
    paid: "To'langan",
    
    // Status
    checkedOut: 'Chiqarilgan',
    checkedIn: 'Joylashgan',
    processing: 'Ishlov berilmoqda...',
    loading: 'Yuklanmoqda...',
    
    // Messages
    successCheckIn: 'Mijoz muvaffaqiyatli joylashtirildi',
    successCheckOut: 'Mijoz muvaffaqiyatli chiqarildi',
    successPayment: "To'lov muvaffaqiyatli qayta ishlandi",
    errorOccurred: 'Xatolik yuz berdi',
    confirmDelete: "O'chirishni xohlaysizmi?",
    
    // Staff
    staff: 'Xodim',
    handledBy: 'Qayta ishlagan',
  }
};
