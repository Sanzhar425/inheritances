/**
 * ===== СТРУКТУРА КОДА =====
 * 1. showScreen() - Переключение между экранами
 * 2. АВТОРИЗАЦИЯ - Регистрация, вход, выход (localStorage)
 * 3. ОБЪЯВЛЕНИЯ - Загрузка и отображение товаров
 * 4. КАРТОЧКА ТОВАРА - Деталь товара и кнопки контакта
 * 5. БРОНИРОВАНИЕ - Сохранение брони и отмена
 * 6. ЛИЧНЫЙ КАБИНЕТ - Данные пользователя и "Мои брони"
 * 7. ЛОКАЛИЗАЦИЯ - Переключение языков
 */

/* ==== Переводы (i18n) ==== */
const translations = {
    ru: {
        app_title: 'Наследство',
        search_placeholder: 'Поиск...',
        filter_button: '⚙️ Фильтр',
        favorites_label: 'Избранные',
        login_button: 'Войти',
        register_button: 'Регистрация',
        profile_button: 'Кабинет',
        profile_title: 'Личный кабинет',
        edit_profile: 'Редактировать профиль',
        add_ad_title: '➕ Добавить объявление',
        add_ad_desc: 'Разместите новую вещь для продажи',
        add_button: 'Добавить',
        my_ads: 'Мои объявления',
        sell_title: 'Продай хлам',
        login_title: 'Вход',
        register_title: 'Регистрация'
    },
    kz: {
        app_title: 'Мұра',
        search_placeholder: 'Іздеу...',
        filter_button: '⚙️ Сүзгі',
        favorites_label: 'Таңдаулылар',
        login_button: 'Кіру',
        register_button: 'Тіркелу',
        profile_button: 'Кабинет',
        profile_title: 'Жеке кабинет',
        edit_profile: 'Профильді өңдеу',
        add_ad_title: '➕ Хабарландыру қосу',
        add_ad_desc: 'Жаңа затты сату үшін орналастырыңыз',
        add_button: 'Қосу',
        my_ads: 'Менің хабарландыруларым',
        sell_title: 'Қоқысыңды сат',
        login_title: 'Кіру',
        register_title: 'Тіркелу'
    },
    en: {
        app_title: 'Heritage',
        search_placeholder: 'Search...',
        filter_button: '⚙️ Filter',
        favorites_label: 'Favorites',
        login_button: 'Login',
        register_button: 'Register',
        profile_button: 'Account',
        profile_title: 'Profile',
        edit_profile: 'Edit profile',
        add_ad_title: '➕ Add listing',
        add_ad_desc: 'Post a new item for sale',
        add_button: 'Add',
        my_ads: 'My listings',
        sell_title: 'Sell junk',
        login_title: 'Login',
        register_title: 'Register'
    }
};

function getCurrentLang() {
    return localStorage.getItem('lang') || 'ru';
}

function applyTranslations(lang) {
    const t = translations[lang] || translations.ru;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.setAttribute('placeholder', t[key]);
    });
    // Обновление профиля / кнопок
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && t['profile_button']) profileBtn.textContent = t['profile_button'];
}

function changeLanguage(lang) {
    localStorage.setItem('lang', lang);
    applyTranslations(lang);
}


/**
 * showScreen(screenId)
 * Функция переключения между экранами приложения
 * Скрывает все экраны и показывает нужный
 * @param {string} screenId - ID экрана (screen-home, screen-login и т.д.)
 */
function showScreen(screenId) {
    // Скрываем все основные экраны
    const screens = ['screen-home','screen-product','screen-create','screen-login','screen-register','screen-bookings','screen-filter','screen-favorites'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Показываем нужный экран
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');

    // Прокручиваем вверх при переключении
    const ms = document.querySelector('.mobile-screen');
    if (ms) ms.scrollTop = 0;

    // Обновляем UI авторизации (показываем/скрываем кнопки входа)
    updateAuthUI();

    // Специальная обработка для экрана бронирования
    if (screenId === 'screen-bookings') renderBookings();
    if (screenId === 'screen-favorites') renderFavorites();
}

/* ===== АВТОРИЗАЦИЯ: Работа с пользователями в localStorage ===== */

/**
 * getUsers() - Получить всех пользователей из localStorage
 * @returns {Array} массив пользователей
 */
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

/**
 * saveUsers(users) - Сохранить пользователей в localStorage
 * @param {Array} users - массив пользователей
 */
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * getCurrentUser() - Получить текущего залогиненного пользователя
 * @returns {Object|null} объект пользователя или null
 */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

/**
 * setCurrentUser(user) - Сохранить текущего пользователя (при входе)
 * @param {Object} user - объект пользователя
 */
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * clearCurrentUser() - Очистить текущего пользователя (при выходе)
 */
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

/**
 * registerUser() - Регистрация нового пользователя
 * Берет данные из формы (regName, regEmail, regPassword)
 * Создает нового пользователя и сохраняет его
 * После регистрации сразу логинит пользователя
 */
function registerUser() {
    // Получаем данные из полей формы
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;

    // Проверяем, что все поля заполнены
    if (!name || !email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    // Проверяем, что пользователь с таким email уже не существует
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }

    // Создаем нового пользователя
    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    saveUsers(users);
    
    // Сразу логиним его
    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    alert('Аккаунт создан и вы вошли в систему');
    showScreen('screen-home');
}

/**
 * loginUser() - Вход существующего пользователя
 * Проверяет email и пароль, затем логинит если верно
 */
function loginUser() {
    // Получаем данные из формы входа
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    // Ищем пользователя с таким email и паролем
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        alert('Неверный email или пароль');
        return;
    }

    // Сохраняем текущего пользователя
    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    alert('Вы успешно вошли');
    showScreen('screen-home');
}

/**
 * logout() - Выход пользователя
 */
function logout() {
    clearCurrentUser();      // Удаляем данные пользователя
    updateAuthUI();          // Обновляем интерфейс (скрываем профиль, показываем кнопку входа)
    showScreen('screen-home'); // Переводим на главный экран
}

/**
 * updateAuthUI() - Обновить интерфейс авторизации
 * Показывает кнопки входа если пользователь не залогинен
 * Показывает профиль и выход если залогинен
 */
function updateAuthUI() {
    const current = getCurrentUser();
    const userArea = document.getElementById('userArea');     // Кнопки "Войти" и "Регистрация"
    const userMenu = document.getElementById('userMenu');     // Меню профиля пользователя
    const profileBtn = document.getElementById('profileBtn');

    if (current) {
        // Пользователь залогинен - показываем личный кабинет
        if (userArea) userArea.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        if (profileBtn) profileBtn.textContent = translations[getCurrentLang()]['profile_button'] || 'Личный кабинет';
    } else {
        // Пользователь не залогинен - показываем кнопки входа
        if (userArea) userArea.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
    // обновляем переводы на случай смены языка во время работы
    applyTranslations(getCurrentLang());
}

/**
 * renderProfile() - Отрисовать страницу личного кабинета
 * Показывает имя, email пользователя и кнопку "Мои брони"
 */
function renderProfile() {
    const current = getCurrentUser();
    if (!current) {
        alert('Пожалуйста, войдите для просмотра профиля');
        showScreen('screen-login');
        return;
    }

    // Фиктивные данные, можно расширить
    document.getElementById('profileName').textContent = current.name || 'Пользователь';
    document.getElementById('profileLocation').textContent = current.location || '📍 Общага №17';
    document.getElementById('profileRating').textContent = '⭐ Рейтинг: 4.8';
    // аватар генерируем как раньше
    const avatarEl = document.getElementById('profileAvatar');
    if (avatarEl) avatarEl.src = `https://i.pravatar.cc/150?u=${encodeURIComponent(current.name)}`;

    // Заполняем блок "Мои объявления" товарами, созданными этим пользователем
    const adsGrid = document.getElementById('myAdsGrid');
    if (adsGrid) {
        const all = getListings() || [];
        const mine = all.filter(item => item.sellerName === current.name);
        if (mine.length === 0) {
            adsGrid.innerHTML = '<div class="text-sm text-gray-500">У вас нет объявлений.</div>';
        } else {
            adsGrid.innerHTML = mine.map(item => `
                <div class="ad-card">
                    <img src="${item.img}" alt="" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" />
                    <h3>${escapeHtml(item.title)}</h3>
                    <p class="price">${item.price} ₸</p>
                    <div class="actions">
                        <button class="edit" onclick="showProduct(${item.id})">Открыть</button>
                        <button class="delete" onclick="deleteListing(${item.id})">Удалить</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// helper to remove listing from storage
function deleteListing(id) {
    let listings = getListings() || [];
    listings = listings.filter(l => l.id !== id);
    saveListings(listings);
    loadListings();
    renderProfile();
}

/* ===== БРОНИРОВАНИЕ: Страница «Мои брони» ===== */

/**
 * renderBookings() - Отрисовать страницу забронированных товаров
 * Показывает все брони текущего пользователя с кнопками на открытие и отмену
 */
function renderBookings() {
    const container = document.getElementById('bookingsList');
    const current = getCurrentUser();
    if (!container) return;
    
    // Если пользователь не залогинен - просим войти
    if (!current) {
        container.innerHTML = '<div class="text-sm text-gray-500">Пожалуйста, войдите для просмотра брони.</div>';
        return;
    }

    // Фильтруем брони только текущего пользователя
    const bookings = getBookings().filter(b => b.userId === current.id);
    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<div class="text-sm text-gray-500">У вас пока нет бронирований.</div>';
        return;
    }

    // Для каждой брони показываем карточку с информацией о товаре
    const listings = getListings() || [];
    container.innerHTML = bookings.map(b => {
        const item = listings.find(l => l.id === b.listingId) || { title: 'Товар удалён', price: 0, img: '' };
        return `
            <div class="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                <img src="${item.img}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="w-16 h-16 object-cover rounded-lg" />
                <div class="flex-1">
                    <div class="font-bold">${escapeHtml(item.title)}</div>
                    <div class="text-sm text-gray-500">${item.price} ₸ — ${escapeHtml(item.location || '')}</div>
                    <div class="text-[12px] text-gray-400">Забронировано: ${new Date(b.date).toLocaleString()}</div>
                </div>
                <div class="flex flex-col gap-2">
                    <button class="text-sm bg-white border border-gray-100 py-2 px-3 rounded-xl" onclick="showProduct(${item.id})">Открыть</button>
                    <button class="text-sm text-red-500 border border-red-100 py-2 px-3 rounded-xl" onclick="cancelBooking(${b.id})">Отменить</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * cancelBooking(bookingId) - Отменить бронирование
 * Удаляет запись о брони из хранилища
 * @param {number} bookingId - ID бронирования
 */
function cancelBooking(bookingId) {
    if (!confirm('Отменить бронирование?')) return;
    
    // Удаляем бронь по ID
    let bookings = getBookings();
    bookings = bookings.filter(b => b.id !== bookingId);
    saveBookings(bookings);
    
    // Обновляем список товаров и страницу бронирования
    const listings = getListings() || [];
    renderListings(listings);
    renderBookings();
    alert('Бронирование отменено');
}

/**
 * publishListing() - Опубликовать объявление
 * Проверяет, что пользователь залогинен
 * Если не залогинен - перенаправляет на экран входа
 */
function publishListing() {
    const current = getCurrentUser();
    if (!current) {
        alert('Требуется вход. Пожалуйста, войдите или зарегистрируйтесь.');
        showScreen('screen-login');
        return;
    }

    // Здесь можно обработать данные формы создания объявления
    alert('Объявление опубликовано от имени ' + current.name);
    showScreen('screen-home');
}

/* ===== ОБЪЯВЛЕНИЯ: Работа с товарами в localStorage ===== */

/**
 * getListings() - Получить все объявления из localStorage
 * @returns {Array|null} массив объявлений или null
 */
function getListings() {
    return JSON.parse(localStorage.getItem('listings') || 'null') || null;
}

/**
 * saveListings(listings) - Сохранить объявления в localStorage
 * @param {Array} listings - массив объявлений
 */
function saveListings(listings) {
    localStorage.setItem('listings', JSON.stringify(listings));
}

/**
 * getBookings() - Получить все брони из localStorage
 * @returns {Array} массив бронирований
 */
function getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
}

/**
 * saveBookings(bookings) - Сохранить брони в localStorage
 * @param {Array} bookings - массив бронирований
 */
function saveBookings(bookings) {
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// ===== ТЕСТОВЫЕ ДАННЫЕ ОБЪЯВЛЕНИЙ =====
// Эти объявления загружаются при первом открытии, если нет сохраненных
const defaultListings = [
    { id: 101, title: 'Микроволновка Samsung', price: 8500, img: 'https://avatars.mds.yandex.net/get-mpic/5303294/2a00000190e3d5b7e59d03534526bf00ddfe/orig', location: 'Общага №3', sellerName: 'Арман', sellerPhone: '77001234567', description: 'Работает отлично, есть небольшие царапины.', category: 'tech' },
    { id: 102, title: 'Холодильник маленький', price: 12000, img: 'https://sc04.alicdn.com/kf/H59dbc5dce6dc4046bcd74cc4d2b56cffZ/Mini-Single-Door-Small--Tabletop-Compact-Mobile-Home-Fridge-Freezer.jpg', location: 'Общага №5', sellerName: 'Медина', sellerPhone: '77007654321', description: 'Экономичный, без запахов.', category: 'tech' },
    { id: 103, title: 'Плита электрическая', price: 6000, img: 'https://cdn.vseinstrumenti.ru/images/goods/tovary-dlya-ofisa-i-doma/bytovaya-tehnika/15592252/2400x1600/176023966.jpg', location: 'Общага №2', sellerName: 'Крис', sellerPhone: '77009871234', description: 'Две конфорки, работает стабильно.', category: 'tech' },
    { id: 104, title: 'Стул складной', price: 800, img: 'https://ir.ozone.ru/s3/multimedia-1-3/7079192571.jpg', location: 'Общага №1', sellerName: 'Софья', sellerPhone: '77005551234', description: 'Легкий и удобный, как новый.', category: 'furniture' },
    { id: 105, title: 'Учебник: Математика (2 курс)', price: 2000, img: 'https://ir.ozone.ru/s3/multimedia-g/6016887508.jpg', location: 'Общага №4', sellerName: 'Данияр', sellerPhone: '77003334455', description: 'Полезный учебник для второго курса, конспекты в комплекте.', category: 'books' },
    { id: 106, title: 'Электрочайник', price: 1500, img: 'https://ir.ozone.ru/s3/multimedia-1/6905296153.jpg', location: 'Общага №6', sellerName: 'Анна', sellerPhone: '77002223344', description: 'Быстро кипятит, есть фильтр.', category: 'tech' }
];

/**
 * loadListings() - Загрузить объявления либо из хранилища, либо использовать примеры
 */
function loadListings() {
    let listings = getListings();
    console.log('loadListings() called, current listings:', listings);
    
    // Если нет данных или старые данные - используем новые примеры
    if (!listings || !Array.isArray(listings) || listings.length === 0) {
        console.log('No listings in localStorage, using defaults');
        listings = defaultListings;
        saveListings(listings);
    }
    
    console.log('Final listings to render:', listings);
    renderListings(listings);
}

/**
 * renderListings(listings) - Отрисовать все объявления на главном экране
 * Показывает карточки товаров в сетке
 * @param {Array} listings - массив объявлений
 */
function renderListings(listings) {
    const grid = document.getElementById('listingsGrid');
    if (!grid) return;
    
    console.log('renderListings called with', listings.length, 'listings');
    
    const bookings = getBookings();
    
    // Для каждого объявления создаем карточку товара
    grid.innerHTML = listings.map(item => {
        console.log('Rendering item:', item.id, 'with img:', item.img);
        // Проверяем, забронирован ли товар
        const booked = bookings.find(b => b.listingId === item.id);
        const fav = isFavorited(item.id);
        return `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-95 transition-transform relative" onclick="showProduct(${item.id})">
                <img src="${item.img}" onclick="showProduct(${item.id}); event.stopPropagation();" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="h-24 sm:h-32 w-full object-cover cursor-pointer">
                <button onclick="event.stopPropagation(); toggleFavorite(${item.id})" class="absolute top-1 right-1 text-xl bg-white/70 rounded-full p-1">${fav ? '❤️' : '🤍'}</button>
                <div class="p-2 sm:p-3">
                    <div class="font-bold text-base sm:text-lg">${item.price} ₸</div>
                    <div class="text-[9px] sm:text-[10px] text-gray-500 truncate">${escapeHtml(item.title)}</div>
                    ${booked ? `<div class="text-[9px] text-red-500 mt-1">Забронировано</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Текущая активная категория (null — все, 'tech'/'books'/'furniture' — фильтр по категории)
let currentCategory = null;

/**
 * filterListings(category) - Фильтрует список объявлений по категории
 * @param {string|null} category - 'tech' | 'books' | 'furniture' или null для снятия фильтра
 */
function filterListings(category) {
    // Повторный клик по активной категории снимает фильтр
    if (currentCategory === category) category = null;
    currentCategory = category;
    
    const all = getListings() || [];
    const result = category ? all.filter(l => l.category === category) : all;
    renderListings(result);

    // Визуальная подсветка выбранной категории
    ['cat-tech','cat-books','cat-furniture'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('ring-2', false);
        el.classList.toggle('ring-primary-green', false);
    });
    if (category) {
        const map = { tech: 'cat-tech', books: 'cat-books', furniture: 'cat-furniture' };
        const active = document.getElementById(map[category]);
        if (active) {
            active.classList.add('ring-2','ring-primary-green');
        }
    }
    
    // Очищаем поле поиска при смене категории
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
}

/**
 * searchListings() - Поиск товаров по названию и описанию
 * Фильтрует объявления по введенному тексту
 */
function searchListings() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        // Если поле пусто, показываем все 
        const all = getListings() || [];
        renderListings(all);
        currentCategory = null;
        return;
    }

    // Ищем по названию и описанию
    const all = getListings() || [];
    const results = all.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    );
    
    renderListings(results);
    currentCategory = null;
}

// Поиск при нажатии Enter в поле поиска
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchListings();
            }
        });
    }

    // инициализация языка
    const savedLang = getCurrentLang();
    const switcher = document.getElementById('langSwitcher');
    if (switcher) {
        switcher.value = savedLang;
        switcher.addEventListener('change', e => changeLanguage(e.target.value));
    }
    applyTranslations(savedLang);
});

/**
 * Глобальная переменная для хранения текущего просматриваемого объявления
 * @type {Object|null}
 */
let currentListing = null;

/**
 * showProduct(id) - Показать полные детали объявления по его ID
 * Загружает информацию о товаре, продавце и настраивает кнопки действий
 * @param {number} id - ID объявления, которое нужно показать
 * 
 * Функция выполняет следующее:
 * 1. Находит объявление в списке по ID
 * 2. Заполняет HTML элементы данными: картинка, название, цена, продавец
 * 3. Генерирует аватар продавца используя сервис gravatar
 * 4. Настраивает кнопку WhatsApp для связи с продавцом
 * 5. Проверяет, забронирован ли товар, и регулирует состояние кнопки "Забронировать"
 * 6. Показывает экран с подробностями товара
 */
function showProduct(id) {
    const listings = getListings() || [];
    console.log('showProduct called with id=', id, 'listings length=', listings ? listings.length : 0);
    let item = listings.find(l => l.id === id);
    // Если не найдено — попробуем привести id к числу (иногда передаётся строкой)
    if (!item) {
        const numericId = Number(id);
        if (!Number.isNaN(numericId)) {
            item = listings.find(l => l.id === numericId);
            console.log('Tried numeric id:', numericId, 'found:', !!item);
        }
    }
    if (!item) {
        console.warn('showProduct: item not found for id=', id);
        return;
    }
    currentListing = item;

    // Получаем HTML элементы страницы продукта
    const img = document.getElementById('productImage');
    const title = document.getElementById('productTitle');
    const price = document.getElementById('productPrice');
    const seller = document.getElementById('sellerName');
    const sellerAvatar = document.getElementById('sellerAvatar');
    const sellerVerify = document.getElementById('sellerVerify');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const bookBtn = document.getElementById('bookBtn');

    // Заполняем информацию о товаре
    if (img) {
        img.src = item.img || 'https://via.placeholder.com/500?text=No+Image';
        img.onerror = function() { this.src = 'https://via.placeholder.com/500?text=No+Image'; };
    }
    if (title) title.textContent = item.title;
    if (price) price.textContent = item.price + ' ₸';
    if (seller) seller.textContent = item.sellerName + ', ' + (item.location || '');
    // Используем gravatar API для генерации аватара на основе имени продавца
    if (sellerAvatar) sellerAvatar.src = `https://i.pravatar.cc/150?u=${encodeURIComponent(item.sellerName)}`;

    // Настройка кнопки WhatsApp - открывает чат с предзаполненным сообщением
    if (whatsappBtn) {
        whatsappBtn.onclick = function() {
            const phone = item.sellerPhone || '';
            const text = `Привет, я заинтересован в вашем объявлении: ${item.title} (${item.price} ₸). Вы можете написать?`;
            if (phone) {
                // Используем WhatsApp Web Protocol для открытия чата
                const url = `https://wa.me/${phone}?text=` + encodeURIComponent(text);
                window.open(url, '_blank');
            } else {
                alert('Номер продавца не указан');
            }
        };
    }

    // Настройка кнопки "Забронировать" - проверяем, не забронирован ли товар уже
    if (bookBtn) {
        const bookings = getBookings();
        const booked = bookings.find(b => b.listingId === item.id);
        if (booked) {
            // Если товар забронирован, делаем кнопку неактивной
            bookBtn.textContent = 'Забронировано';
            bookBtn.disabled = true;
        } else {
            // Если свободен, активируем кнопку бронирования
            bookBtn.textContent = 'Забронировать';
            bookBtn.disabled = false;
            bookBtn.onclick = function() { bookListing(item.id); };
        }
    }

    showScreen('screen-product');
}

/**
 * bookListing(listingId) - Создать бронирование объявления
 * Требует авторизацию пользователя. Добавляет новое бронирование в массив
 * @param {number} listingId - ID объявления, которое нужно забронировать
 * 
 * Функция проверяет:
 * 1. Авторизован ли пользователь (если нет, переправляет на страницу входа)
 * 2. Не забронировано ли уже это объявление (исключает дублины бронирований)
 * 3. Если все проверки пройдены, создает новое бронирование с текущей датой и временем
 * 4. Сохраняет бронирование в localStorage
 * 5. Обновляет интерфейс - обновляет сетку объявлений и повторно показывает подробности товара
 */
function bookListing(listingId) {
    // Получаем текущего авторизованного пользователя
    const current = getCurrentUser();
    if (!current) {
        // Если пользователь не авторизован, просим вход
        alert('Требуется вход для бронирования');
        showScreen('screen-login');
        return;
    }

    // Получаем все существующие бронирования
    const bookings = getBookings();
    // Проверяем, не забронировано ли уже это объявление
    if (bookings.find(b => b.listingId === listingId)) {
        alert('Это объявление уже забронировано');
        return;
    }

    // Создаем новое бронирование с уникальным ID (текущее время) и информацией о бронирующем
    bookings.push({ 
        id: Date.now(), 
        listingId, 
        userId: current.id, 
        date: new Date().toISOString() 
    });
    // Сохраняем обновленный массив бронирований
    saveBookings(bookings);

    // Обновляем интерфейс: пометим товары как забронированные в сетке объявлений
    const listings = getListings() || [];
    saveListings(listings);
    renderListings(listings);
    // Повторно показываем детали товара, чтобы обновить состояние кнопки "Забронировать"
    showProduct(listingId);
    alert('Успешно! Вы забронировали объявление.');
}

/**
 * escapeHtml(text) - Экранирует HTML символы для безопасного вывода в документ
 * Предотвращает XSS (Cross-Site Scripting) атаки путем замены специальных символов
 * @param {string} text - Текст для экранирования
 * @returns {string} Безопасный HTML текст с экранированными символами
 * 
 * Функция заменяет опасные символы:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#039;
 * 
 * Это критически важно при выводе пользовательского контента (названия товаров, имена продавцов)
 * чтобы не позволить вредоносный JavaScript выполняться в браузере
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function (m) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]; });
}

/* ===== ИЗБРАННЫЕ ТОВАРЫ ===== */

/**
 * getFavorites() - Получить список избранных товаров
 * @returns {Array} массив ID избранных товаров
 */
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}

/**
 * saveFavorites(favorites) - Сохранить список избранных товаров
 * @param {Array} favorites - массив ID товаров
 */
function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavCount();
}

/**
 * toggleFavorite(itemId) - Добавить/удалить товар из избранных
 * @param {number} itemId - ID товара
 */
function toggleFavorite(itemId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(itemId);
    if (index > -1) {
        // Товар уже в избранных - удаляем
        favorites.splice(index, 1);
    } else {
        // Товара нет в избранных - добавляем
        favorites.push(itemId);
    }
    saveFavorites(favorites);
    
    // Обновляем визуальное отображение сердца
    const listings = getListings() || [];
    renderListings(listings);
}

/**
 * isFavorited(itemId) - Проверить, в избранных ли товар
 * @param {number} itemId - ID товара
 * @returns {boolean} true если товар в избранных
 */
function isFavorited(itemId) {
    return getFavorites().includes(itemId);
}

/**
 * updateFavCount() - Обновить счетчик избранного на кнопке
 */
function updateFavCount() {
    const countEl = document.getElementById('favCount');
    if (countEl) {
        countEl.textContent = getFavorites().length;
    }
}

/**
 * renderFavorites() - Отрисовать все избранные товары
 */
function renderFavorites() {
    const container = document.getElementById('favoritesGrid');
    if (!container) return;
    
    const favorites = getFavorites();
    const all = getListings() || [];
    const items = all.filter(item => favorites.includes(item.id));
    
    if (items.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-center py-8 text-gray-500">Нет избранных товаров</div>';
        return;
    }
    
    const bookings = getBookings();
    container.innerHTML = items.map(item => {
        const booked = bookings.find(b => b.listingId === item.id);
        const fav = isFavorited(item.id);
        return `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-95 transition-transform relative" onclick="showProduct(${item.id})">
                <img src="${item.img}" onclick="showProduct(${item.id})" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" class="h-24 sm:h-32 w-full object-cover cursor-pointer">
                <button onclick="event.stopPropagation(); toggleFavorite(${item.id})" class="absolute top-2 right-2 text-xl">${fav ? '❤️' : '🤍'}</button>
                <div class="p-2 sm:p-3">
                    <div class="font-bold text-base sm:text-lg">${item.price} ₸</div>
                    <div class="text-[9px] sm:text-[10px] text-gray-500 truncate">${escapeHtml(item.title)}</div>
                    ${booked ? `<div class="text-[9px] text-red-500 mt-1">Забронировано</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/* ===== ФИЛЬТР ===== */

/**
 * applyPriceFilter() - Применить фильтр по цене
 */
function applyPriceFilter() {
    const maxPriceInput = document.getElementById('filterMaxPrice');
    const maxPrice = maxPriceInput ? parseInt(maxPriceInput.value) : null;
    
    // категория
    const catEls = document.getElementsByName('filterCategory');
    let selectedCat = '';
    catEls.forEach(el => { if (el.checked) selectedCat = el.value; });
    
    const all = getListings() || [];
    let filtered = all;
    if (maxPrice && maxPrice > 0) {
        filtered = filtered.filter(item => item.price <= maxPrice);
    }
    if (selectedCat) {
        filtered = filtered.filter(item => item.category === selectedCat);
    }
    // исключить забронированные, если стоит чекбокс
    const excludeBooked = document.getElementById('filterExcludeBooked')?.checked;
    if (excludeBooked) {
        const bookings = getBookings();
        const bookedIds = bookings.map(b => b.listingId);
        filtered = filtered.filter(item => !bookedIds.includes(item.id));
    }
    
    renderListings(filtered);
    showScreen('screen-home');
    alert(`Найдено ${filtered.length} товаров${selectedCat ? ' в категории ' + selectedCat : ''}${maxPrice && maxPrice>0 ? ' до ' + maxPrice + ' ₸' : ''}${excludeBooked ? ' (без забронированных)' : ''}`);
}

/**
 * clearFilters() - Очистить все фильтры
 */
function clearFilters() {
    const maxPriceInput = document.getElementById('filterMaxPrice');
    if (maxPriceInput) maxPriceInput.value = '';
    // сброс категории
    const catEls = document.getElementsByName('filterCategory');
    catEls.forEach(el => el.checked = el.value === '');
    
    const all = getListings() || [];
    renderListings(all);
    currentCategory = null;
    
    showScreen('screen-home');
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ: При загрузке страницы
// ============================================
// Очищаем старые данные с неправильными URL - используем новые
localStorage.removeItem('listings');

// Загружаем объявления в localStorage (если там ничего нет, используем примеры по умолчанию)
loadListings();

// Показываем главный экран приложения
showScreen('screen-home');

// Обновляем состояние кнопок входа/профиля в зависимости от того, авторизован ли пользователь
updateAuthUI();

// Обновляем счетчик избранных
updateFavCount();
