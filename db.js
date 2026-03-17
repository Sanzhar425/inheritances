// db.js — локальная "база данных" через localStorage
// Используется обоими страницами: index.html и profile.html

const DB = {

  // ── Вспомогательные ───────────────────────────────────────────
  _get(key)        { try { return JSON.parse(localStorage.getItem(key)) ?? null; } catch { return null; } },
  _set(key, val)   { localStorage.setItem(key, JSON.stringify(val)); },
  _id()            { return Date.now() + Math.floor(Math.random() * 1000); },

  // ── ИНИЦИАЛИЗАЦИЯ (вызвать один раз при загрузке) ─────────────
  init() {
    if (this._get('db_initialized')) return;

    // Категории
    this._set('categories', [
      { id: 'tech',      name: 'Техника',   icon: '🫖' },
      { id: 'books',     name: 'Учебники',  icon: '📚' },
      { id: 'furniture', name: 'Мебель',    icon: '🛋️' },
    ]);

    // Демо-пользователь
    const userId = this._id();
    this._set('current_user', {
      id: userId, name: 'Ержан С.', email: 'erzhan@test.kz',
      location: 'КазНУ, Общежитие №17',
      avatar: null, rating: 5.0, reviews: 12, verified: true,
    });

    // Демо-объявления
    const now = Date.now();
    this._set('listings', [
      { id: this._id(), userId, title: 'Микроволновка Samsung', price: 8500, category: 'tech',
        description: 'В отличном состоянии, использовалась 1 год',
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop',
        status: 'active', views: 204, createdAt: now - 86400000 * 5 },
      { id: this._id(), userId, title: 'Диван-кровать', price: 6000, category: 'furniture',
        description: 'Удобный, раскладывается',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        status: 'active', views: 168, createdAt: now - 86400000 * 4 },
      { id: this._id(), userId, title: 'Письменный стол', price: 3500, category: 'furniture',
        description: 'Деревянный, без дефектов',
        image: 'https://images.unsplash.com/photo-1593642632651-d3fba3ca8d1d?w=400&h=300&fit=crop',
        status: 'sold', views: 98, createdAt: now - 86400000 * 3 },
      { id: this._id(), userId, title: 'Утюг Philips', price: 4500, category: 'tech',
        description: 'Паровой, почти новый',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop',
        status: 'sold', views: 143, createdAt: now - 86400000 * 2 },
      { id: this._id(), userId, title: 'Учебник по матанализу', price: 1200, category: 'books',
        description: '2-е издание, без пометок',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
        status: 'active', views: 77, createdAt: now - 86400000 },
      { id: this._id(), userId, title: 'Электрочайник Bosch', price: 5500, category: 'tech',
        description: '1.7 л, быстрый нагрев',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        status: 'active', views: 120, createdAt: now },
    ]);

    this._set('favorites', []);   // [] of listing ids
    this._set('messages',  []);   // [] of {id, fromName, text, listingId, createdAt, read}
    this._set('db_initialized', true);
  },

  // ── ПОЛЬЗОВАТЕЛЬ ─────────────────────────────────────────────
  getUser()        { return this._get('current_user'); },
  saveUser(data)   {
    const u = { ...this.getUser(), ...data };
    this._set('current_user', u);
    return u;
  },

  // ── ОБЪЯВЛЕНИЯ ───────────────────────────────────────────────
  getListings({ category, maxPrice, search, status } = {}) {
    let list = this._get('listings') ?? [];
    if (status && status !== 'all') list = list.filter(l => l.status === status);
    if (category && category !== 'all') list = list.filter(l => l.category === category);
    if (maxPrice)  list = list.filter(l => l.price <= Number(maxPrice));
    if (search)    list = list.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => b.createdAt - a.createdAt);
  },

  getListing(id) {
    return (this._get('listings') ?? []).find(l => l.id === id) ?? null;
  },

  addListing(data) {
    const list = this._get('listings') ?? [];
    const item = { id: this._id(), userId: this.getUser()?.id, views: 0,
                   status: 'active', createdAt: Date.now(), ...data };
    list.unshift(item);
    this._set('listings', list);
    return item;
  },

  updateListing(id, data) {
    const list = this._get('listings') ?? [];
    const idx  = list.findIndex(l => l.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, updatedAt: Date.now() };
    this._set('listings', list);
    return list[idx];
  },

  deleteListing(id) {
    const list = (this._get('listings') ?? []).filter(l => l.id !== id);
    this._set('listings', list);
    // убрать из избранного тоже
    this._set('favorites', (this._get('favorites') ?? []).filter(fid => fid !== id));
  },

  incrementViews(id) {
    const l = this.getListing(id);
    if (l) this.updateListing(id, { views: (l.views || 0) + 1 });
  },

  // ── ИЗБРАННОЕ ────────────────────────────────────────────────
  getFavorites()  { return this._get('favorites') ?? []; },

  isFavorite(id)  { return this.getFavorites().includes(id); },

  toggleFavorite(id) {
    const favs = this.getFavorites();
    const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    this._set('favorites', next);
    return next.includes(id); // true = добавлено
  },

  getFavoriteListings() {
    const favIds = this.getFavorites();
    return (this._get('listings') ?? []).filter(l => favIds.includes(l.id));
  },

  // ── СООБЩЕНИЯ ────────────────────────────────────────────────
  getMessages()  { return this._get('messages') ?? []; },

  addMessage(data) {
    const msgs = this.getMessages();
    const msg  = { id: this._id(), createdAt: Date.now(), read: false, ...data };
    msgs.push(msg);
    this._set('messages', msgs);
    return msg;
  },

  markRead(id) {
    const msgs = this.getMessages().map(m => m.id === id ? { ...m, read: true } : m);
    this._set('messages', msgs);
  },

  unreadCount() { return this.getMessages().filter(m => !m.read).length; },

  // ── КАТЕГОРИИ ────────────────────────────────────────────────
  getCategories() { return this._get('categories') ?? []; },
  getCategoryName(id) { return this.getCategories().find(c => c.id === id)?.name ?? id; },
};
