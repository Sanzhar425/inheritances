// auth.js — локальная авторизация через localStorage
// Используется index.html и profile.html
// Для реальной авторизации используется Supabase (login.html)

const Auth = {

  _get(k)    { try { return JSON.parse(localStorage.getItem(k)) ?? null; } catch { return null; } },
  _set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },

  // ── Проверка сессии ──────────────────────────────────────────
  isLoggedIn()   { return !!this._get('session_user'); },
  currentUser()  { return this._get('session_user'); },

  // ── Список пользователей ─────────────────────────────────────
  getUsers() { return this._get('users') ?? []; },

  // ── Регистрация ──────────────────────────────────────────────
  register(name, email, password, location) {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { err: 'emailExists' };
    }
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const user = { id, name, email, password, location, avatar: null, rating: 5.0, reviews: 0, verified: false };
    users.push(user);
    this._set('users', users);
    const session = { id, name, email, location, avatar: null, rating: 5.0, reviews: 0, verified: false };
    this._set('session_user', session);
    localStorage.setItem('current_user', JSON.stringify(session));
    return { ok: true };
  },

  // ── Вход ─────────────────────────────────────────────────────
  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { err: 'notFound' };
    if (user.password !== password) return { err: 'wrongPassword' };
    const session = {
      id: user.id, name: user.name, email: user.email,
      location: user.location || '', avatar: user.avatar,
      rating: user.rating, reviews: user.reviews, verified: user.verified,
    };
    this._set('session_user', session);
    localStorage.setItem('current_user', JSON.stringify(session));
    return { ok: true };
  },

  // ── Выход ────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem('session_user');
    localStorage.removeItem('current_user');
    localStorage.removeItem('db_v2');
    localStorage.removeItem('listings');
    localStorage.removeItem('favorites');
    localStorage.removeItem('messages');
  },
};
