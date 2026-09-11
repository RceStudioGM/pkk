/* =================================================================
   DATA MENU — silakan ubah/tambah item sesuai produk UMKM Anda
   ================================================================= */
const MENU = [
  { id:1, name:'Nasi Goreng Spesial',   price:18000, category:'Makanan', emoji:'🍛' },
  { id:2, name:'Ayam Geprek Sambal',    price:20000, category:'Makanan', emoji:'🍗' },
  { id:3, name:'Mie Ayam Bakso',        price:15000, category:'Makanan', emoji:'🍜' },
  { id:4, name:'Soto Ayam Kampung',     price:17000, category:'Makanan', emoji:'🥣' },
  { id:5, name:'Es Teh Manis',          price:5000,  category:'Minuman', emoji:'🧋' },
  { id:6, name:'Es Jeruk Peras',        price:8000,  category:'Minuman', emoji:'🍊' },
  { id:7, name:'Kopi Susu Gula Aren',   price:12000, category:'Minuman', emoji:'☕' },
  { id:8, name:'Es Cendol',             price:10000, category:'Minuman', emoji:'🍧' },
  { id:9, name:'Pisang Goreng Keju',    price:10000, category:'Cemilan', emoji:'🍌' },
  { id:10,name:'Tahu Isi Sayur',        price:8000,  category:'Cemilan', emoji:'🧆' },
  { id:11,name:'Risoles Mayo',          price:9000,  category:'Cemilan', emoji:'🥟' },
  { id:12,name:'Cireng Bumbu Rujak',    price:7000,  category:'Cemilan', emoji:'🍢' },
];
const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Cemilan'];
const ORDER_DURATION = 15 * 60; // 15 menit, dalam detik

/* =================================================================
   STATE
   ================================================================= */
const App = {
  cart: {},              // { itemId: qty }
  activeCategory: 'Semua',
  paymentMethod: 'cash',
  timerInterval: null,
  timeLeft: ORDER_DURATION,

  /* ---------- Util ---------- */
  formatRp(n) { return 'Rp' + n.toLocaleString('id-ID'); },

  cartTotalItems() {
    return Object.values(this.cart).reduce((a,b) => a+b, 0);
  },
  cartTotalPrice() {
    return Object.entries(this.cart).reduce((sum,[id,qty]) => {
      const item = MENU.find(m => m.id == id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  },

  /* ---------- Navigasi SPA (tanpa reload) ---------- */
  go(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    if (page === 'payment') this.renderPayment();
    if (page === 'cart') this.renderCart();
  },

  /* ---------- Render: Kategori ---------- */
  renderCategories() {
    const wrap = document.getElementById('categories');
    wrap.innerHTML = CATEGORIES.map(cat => `
      <button
        onclick="App.setCategory('${cat}')"
        class="cat-pill shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition
          ${cat === this.activeCategory
            ? 'bg-primary text-white border-primary shadow-sm shadow-orange-200'
            : 'bg-white text-ink/60 border-orange-100'}"
      >${cat}</button>
    `).join('');
  },
  setCategory(cat) {
    this.activeCategory = cat;
    this.renderCategories();
    this.renderMenu();
  },

  /* ---------- Render: Grid menu ---------- */
  renderMenu() {
    const grid = document.getElementById('menu-grid');
    const items = this.activeCategory === 'Semua'
      ? MENU
      : MENU.filter(m => m.category === this.activeCategory);

    grid.innerHTML = items.map(item => `
      <div class="bg-white rounded-2xl border border-orange-100 overflow-hidden flex flex-col shadow-sm">
        <div class="aspect-square bg-gradient-to-br from-peach to-gold/30 flex items-center justify-center text-5xl">
          ${item.emoji}
        </div>
        <div class="p-3 flex flex-col gap-2 flex-1">
          <p class="font-semibold text-sm leading-snug line-clamp-2">${item.name}</p>
          <p class="font-display font-bold text-primary text-base mt-auto">${this.formatRp(item.price)}</p>
          <button onclick="App.addToCart(${item.id})"
            class="w-full py-2 rounded-full bg-orange-50 text-primary text-xs font-bold active:scale-95 active:bg-primary active:text-white transition">
            + Tambah ke Keranjang
          </button>
        </div>
      </div>
    `).join('');
  },

  /* ---------- Keranjang: tambah / update ---------- */
  addToCart(id) {
    this.cart[id] = (this.cart[id] || 0) + 1;
    this.renderCartBar();
  },
  changeQty(id, delta) {
    const newQty = (this.cart[id] || 0) + delta;
    if (newQty <= 0) delete this.cart[id];
    else this.cart[id] = newQty;
    this.renderCart();
    this.renderCartBar();
  },

  renderCartBar() {
    const bar = document.getElementById('cartbar');
    const count = this.cartTotalItems();
    document.getElementById('cartbar-count').textContent = count;
    document.getElementById('cartbar-total').textContent = this.formatRp(this.cartTotalPrice());
    bar.classList.toggle('show', count > 0);
  },

  renderCart() {
    const list = document.getElementById('cart-list');
    const entries = Object.entries(this.cart);

    if (entries.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center pt-16">
          <p class="text-5xl mb-3">🧺</p>
          <p class="font-display font-bold text-base mb-1">Keranjang masih kosong</p>
          <p class="text-sm text-ink/50 mb-5">Yuk pilih menu favoritmu dulu</p>
          <button onclick="App.go('home')" class="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold">Lihat Menu</button>
        </div>`;
    } else {
      list.innerHTML = entries.map(([id, qty]) => {
        const item = MENU.find(m => m.id == id);
        return `
        <div class="flex items-center gap-3 bg-white border border-orange-100 rounded-2xl p-3">
          <div class="w-14 h-14 rounded-xl bg-peach flex items-center justify-center text-2xl shrink-0">${item.emoji}</div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate">${item.name}</p>
            <p class="text-xs text-ink/50">${this.formatRp(item.price)}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button onclick="App.changeQty(${item.id}, -1)" class="qty-btn w-7 h-7 rounded-full bg-peach text-primary font-bold active:scale-90 transition">−</button>
            <span class="w-5 text-center font-semibold text-sm">${qty}</span>
            <button onclick="App.changeQty(${item.id}, 1)" class="qty-btn w-7 h-7 rounded-full bg-primary text-white font-bold active:scale-90 transition">+</button>
          </div>
        </div>`;
      }).join('');
    }

    document.getElementById('cart-subtotal').textContent = this.formatRp(this.cartTotalPrice());
    document.getElementById('cart-total').textContent = this.formatRp(this.cartTotalPrice());
    document.getElementById('cart-footer').classList.toggle('hidden', entries.length === 0);
  },

  /* ---------- Pembayaran ---------- */
  renderPayment() {
    document.getElementById('payment-total').textContent = this.formatRp(this.cartTotalPrice());
  },
  selectPayment(method) {
    // Hanya 'cash' yang aktif — opsi lain memang non-klikable (Coming Soon)
    this.paymentMethod = method;
  },

  confirmOrder() {
    if (this.cartTotalItems() === 0) return;
    this.go('success');

    // Beep notifikasi ringan saat pesanan dikonfirmasi (opsional, halus)
    setTimeout(() => {
      this.go('tracking');
      this.startTracking();
    }, 3000); // auto-redirect 3 detik
  },

  /* ---------- Pelacakan & Timer ---------- */
  startTracking() {
    // Generate nomor antrean acak
    const num = Math.floor(100 + Math.random() * 899);
    document.getElementById('order-id').textContent = '#A' + num;

    // Ringkasan pesanan
    const summary = document.getElementById('track-summary');
    summary.innerHTML = Object.entries(this.cart).map(([id, qty]) => {
      const item = MENU.find(m => m.id == id);
      return `
      <div class="flex justify-between items-center text-sm bg-peach/50 rounded-xl px-3 py-2">
        <span>${item.emoji} ${item.name} <span class="text-ink/40">x${qty}</span></span>
        <span class="font-semibold">${this.formatRp(item.price * qty)}</span>
      </div>`;
    }).join('');

    // Reset & mulai countdown
    clearInterval(this.timerInterval);
    this.timeLeft = ORDER_DURATION;
    document.getElementById('timer-card').classList.remove('hidden');
    document.getElementById('ready-btn').classList.add('hidden');
    this.tickTimer();
    this.timerInterval = setInterval(() => this.tickTimer(), 1000);
  },

  tickTimer() {
    const display = document.getElementById('timer-display');
    if (this.timeLeft <= 0) {
      clearInterval(this.timerInterval);
      display.parentElement.classList.add('hidden');
      document.getElementById('ready-btn').classList.remove('hidden');
      this.playChime();
      return;
    }
    const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const s = (this.timeLeft % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;
    this.timeLeft--;
  },

  /* Bunyi "ding" ramah telinga via Web Audio API (tanpa file eksternal) */
  playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [880, 1318.5]; // dua nada lembut
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);
        osc.start(start);
        osc.stop(start + 0.9);
      });
    } catch (e) { /* Audio tidak tersedia, abaikan secara diam-diam */ }
  },

  /* ---------- Reset untuk pesanan baru ---------- */
  resetOrder() {
    clearInterval(this.timerInterval);
    this.cart = {};
    this.renderCartBar();
    this.renderMenu();
    this.go('home');
  },

  /* ---------- Init ---------- */
  init() {
    this.renderCategories();
    this.renderMenu();
    this.renderCartBar();
  }
};

App.init();
  
