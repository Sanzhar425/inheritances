// db.js — локальная "база данных" через localStorage
// Используется index.html и profile.html

const DB = {

  // ── Вспомогательные ───────────────────────────────────────────
  _get(k)      { try { return JSON.parse(localStorage.getItem(k)) ?? null; } catch { return null; } },
  _set(k, v)   { localStorage.setItem(k, JSON.stringify(v)); },
  _id()        { return Date.now() + Math.floor(Math.random() * 1000); },

  // ── ИНИЦИАЛИЗАЦИЯ ─────────────────────────────────────────────
  init() {
    if (this._get('db_v3')) return;
    // Сбрасываем старые данные без sellerName
    localStorage.removeItem('db_v2');
    localStorage.removeItem('listings');
    localStorage.removeItem('current_user');
    localStorage.removeItem('favorites');
    localStorage.removeItem('messages');
    const userId = this._id();
    const now = Date.now();
    this._set('current_user', {
      id: userId, name: 'Ержан С.', email: 'erzhan@test.kz',
      location: 'КазНУ, Общежитие №17', avatar: null,
      rating: 5.0, reviews: 12, verified: true,
    });
    this._set('listings', [
      { id: this._id(), userId, sellerName: 'Ержан С.', sellerLocation: 'КазНУ, Общежитие №17', title: 'Микроволновка Samsung', price: 8500, category: 'tech',
        description: 'В отличном состоянии, использовалась 1 год',
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop',
        status: 'active', views: 204, createdAt: now - 86400000 * 5 },
      { id: this._id(), userId, sellerName: 'Ержан С.', sellerLocation: 'КазНУ, Общежитие №17', title: 'Диван-кровать', price: 6000, category: 'furniture',
        description: 'Удобный, раскладывается',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        status: 'active', views: 168, createdAt: now - 86400000 * 4 },
      { id: this._id(), userId, sellerName: 'Ержан С.', sellerLocation: 'КазНУ, Общежитие №17', title: 'Письменный стол', price: 3500, category: 'furniture',
        description: 'Деревянный, без дефектов',
        image: 'https://images.unsplash.com/photo-1593642632651-d3fba3ca8d1d?w=400&h=300&fit=crop',
        status: 'sold', views: 98, createdAt: now - 86400000 * 3 },
      { id: this._id(), userId, sellerName: 'Ержан С.', sellerLocation: 'КазНУ, Общежитие №17', title: 'Утюг Philips', price: 4500, category: 'tech',
        description: 'Паровой, почти новый',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop',
        status: 'sold', views: 143, createdAt: now - 86400000 * 2 },
      { id: this._id(), userId, sellerName: 'Ержан С.', sellerLocation: 'КазНУ, Общежитие №17', title: 'Учебник по матанализу', price: 1200, category: 'books',
        description: '2-е издание, без пометок',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
        status: 'active', views: 77, createdAt: now - 86400000 },
      { id: this._id(), userId, sellerName: 'Ержан С.', sellerLocation: 'КазНУ, Общежитие №17', title: 'Электрочайник Bosch', price: 5500, category: 'tech',
        description: '1.7 л, быстрый нагрев',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        status: 'active', views: 120, createdAt: now },
    ]);
    this._set('favorites', []);
    this._set('messages', []);
    this._set('db_v3', true);
  },

  // ── ПОЛЬЗОВАТЕЛЬ ─────────────────────────────────────────────
  getUser() {
    // Сначала проверяем авторизованного пользователя (Auth), потом демо
    return (typeof Auth !== 'undefined' && Auth.currentUser())
      || this._get('current_user');
  },
  saveUser(data) {
    const u = { ...this.getUser(), ...data };
    this._set('current_user', u);
    return u;
  },

  // ── ОБЪЯВЛЕНИЯ ───────────────────────────────────────────────
  getListings({ category, maxPrice, search, status } = {}) {
    let l = this._get('listings') ?? [];
    if (status && status !== 'all') l = l.filter(x => x.status === status);
    if (category && category !== 'all') l = l.filter(x => x.category === category);
    if (maxPrice) l = l.filter(x => x.price <= Number(maxPrice));
    if (search) l = l.filter(x => x.title.toLowerCase().includes(search.toLowerCase()));
    return l.sort((a, b) => b.createdAt - a.createdAt);
  },

  getListing(id) {
    return (this._get('listings') ?? []).find(l => l.id === id) ?? null;
  },

  addListing(data) {
    const l = this._get('listings') ?? [];
    const user = this.getUser();
    const item = {
      id: this._id(),
      userId: user?.id,
      sellerName: user?.name || '',
      sellerLocation: user?.location || '',
      views: 0, status: 'active', createdAt: Date.now(), ...data,
    };
    l.unshift(item);
    this._set('listings', l);
    return item;
  },

  updateListing(id, data) {
    const l = this._get('listings') ?? [];
    const i = l.findIndex(x => x.id === id);
    if (i === -1) return null;
    l[i] = { ...l[i], ...data, updatedAt: Date.now() };
    this._set('listings', l);
    return l[i];
  },

  deleteListing(id) {
    this._set('listings', (this._get('listings') ?? []).filter(l => l.id !== id));
    this._set('favorites', (this._get('favorites') ?? []).filter(f => f !== id));
  },

  incrementViews(id) {
    const l = this.getListing(id);
    if (l) {
      const all = this._get('listings') ?? [];
      const i = all.findIndex(x => x.id === id);
      if (i > -1) { all[i].views = (all[i].views || 0) + 1; this._set('listings', all); }
    }
  },

  // ── ИЗБРАННОЕ ────────────────────────────────────────────────
  getFavorites()  { return this._get('favorites') ?? []; },
  isFavorite(id)  { return this.getFavorites().includes(id); },
  toggleFavorite(id) {
    const f = this.getFavorites();
    const n = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
    this._set('favorites', n);
    return n.includes(id);
  },
  getFavoriteListings() {
    const f = this.getFavorites();
    return (this._get('listings') ?? []).filter(l => f.includes(l.id));
  },

  // ── СООБЩЕНИЯ ────────────────────────────────────────────────
  getMessages()    { return this._get('messages') ?? []; },
  markRead(id)     {
    this._set('messages', this.getMessages().map(m => m.id === id ? { ...m, read: true } : m));
  },
  unreadCount()    { return this.getMessages().filter(m => !m.read).length; },

  // ── КАТЕГОРИИ ────────────────────────────────────────────────
  getCategoryName(id) {
    const map = { tech: 'tech', books: 'books', furniture: 'furniture' };
    // t() доступна глобально из HTML файла
    return (typeof t === 'function' ? t(map[id]) : map[id]) || id;
  },
};
