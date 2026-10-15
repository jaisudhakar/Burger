/* ==========================================================
   Smokestack Burger Co. — single-page app
   Hash routes: #/  #/menu[/category]  #/product/:id  #/cart  #/locations
   ========================================================== */
(function () {
  'use strict';

  const { products, categories, locations, TAX_RATE } = window.SB_DATA;
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const locById = Object.fromEntries(locations.map(l => [l.id, l]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app');

  /* ---------- Icons ---------- */
  const icon = {
    arrowLeft: '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-7-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowRight: '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-7 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    trash: '<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M9 6V4h6v2m-9 0 1 14h10l1-14M10 10v7m4-7v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pin: '<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    chevron: '<svg class="chev" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    close: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    filter: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    cart: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM1 2h3.3l.94 2H21a1 1 0 0 1 .9 1.45l-3.6 7A2 2 0 0 1 16.53 13.5H8.1l-1.1 2H19v2H5.6a1.5 1.5 0 0 1-1.3-2.25L5.8 12.6 2.7 4H1V2Z"/></svg>',
    star(fill) {
      const id = 'g' + Math.random().toString(36).slice(2, 8);
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}"><stop offset="${fill * 100}%" stop-color="#E0531F"/><stop offset="${fill * 100}%" stop-color="#E9D6BD"/></linearGradient></defs><path fill="url(#${id})" d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>`;
    }
  };
  const checkSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Storage ---------- */
  const storage = {
    get(key, fallback) {
      try { const v = localStorage.getItem('sb:' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('sb:' + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    }
  };

  /* ---------- Cart store ---------- */
  const cart = {
    lines: storage.get('cart', []).filter(l => byId[l.id] && l.qty > 0),
    firstOrderDone: storage.get('firstOrderDone', false),
    pickup: storage.get('pickup', { locationId: 'main-st', slot: null }),

    save() {
      storage.set('cart', this.lines);
      storage.set('pickup', this.pickup);
      storage.set('firstOrderDone', this.firstOrderDone);
      updateCartBadge();
    },
    key(id, size, addons) { return [id, size || '', [...addons].sort().join('+')].join('|'); },
    unitPrice(line) {
      const p = byId[line.id];
      let price = p.price;
      if (p.sizes && line.size) {
        const s = p.sizes.find(s => s.id === line.size);
        if (s) price += s.delta;
      }
      (line.addons || []).forEach(a => {
        const ad = (p.addons || []).find(x => x.id === a);
        if (ad) price += ad.price;
      });
      return price;
    },
    add(id, { size, addons = [], qty = 1 } = {}) {
      const p = byId[id];
      if (!p) return;
      size = size || p.defaultSize || null;
      const key = this.key(id, size, addons);
      const existing = this.lines.find(l => l.key === key);
      if (existing) existing.qty = Math.min(99, existing.qty + qty);
      else this.lines.push({ key, id, size, addons: [...addons], qty });
      this.save();
    },
    setQty(key, qty) {
      const line = this.lines.find(l => l.key === key);
      if (!line) return;
      line.qty = Math.max(1, Math.min(99, qty));
      this.save();
    },
    remove(key) { this.lines = this.lines.filter(l => l.key !== key); this.save(); },
    clear() { this.lines = []; this.save(); },
    count() { return this.lines.reduce((n, l) => n + l.qty, 0); },
    totals() {
      const subtotal = this.lines.reduce((s, l) => s + this.unitPrice(l) * l.qty, 0);
      let discount = 0;
      if (!this.firstOrderDone) {
        const fries = this.lines.find(l => l.id === 'crinkle-fries');
        if (fries) discount = byId['crinkle-fries'].price;
      }
      const taxable = Math.max(0, subtotal - discount);
      const tax = Math.round(taxable * TAX_RATE * 100) / 100;
      return { subtotal, discount, tax, total: taxable + tax };
    }
  };

  function lineLabel(line) {
    const p = byId[line.id];
    const parts = [];
    if (p.sizes && line.size) parts.push(p.sizes.find(s => s.id === line.size).label);
    (line.addons || []).forEach(a => { const ad = (p.addons || []).find(x => x.id === a); if (ad) parts.push(ad.label); });
    return parts;
  }

  function updateCartBadge(bump) {
    const el = $('#cartCount');
    el.textContent = cart.count();
    if (bump) {
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      const link = $('#cartLink');
      link.classList.remove('shake'); void link.offsetWidth; link.classList.add('shake');
    }
  }

  /* ---------- Pickup slots ---------- */
  function slotsFor(locationId, limit = 12) {
    const loc = locById[locationId] || locations[0];
    const out = [];
    const now = new Date();
    for (let dayOffset = 0; dayOffset < 3 && out.length < limit; dayOffset++) {
      const day = new Date(now); day.setDate(now.getDate() + dayOffset);
      const [open, close] = loc.hours[day.getDay()];
      const start = new Date(day); start.setHours(open, 0, 0, 0);
      const end = new Date(day); end.setHours(0, 0, 0, 0); end.setMinutes(close * 60 - 15);
      let t = new Date(Math.max(start.getTime(), now.getTime() + 20 * 60000));
      t.setSeconds(0, 0);
      const rem = t.getMinutes() % 15; if (rem) t.setMinutes(t.getMinutes() + (15 - rem));
      while (t <= end && out.length < limit) { out.push(new Date(t)); t = new Date(t.getTime() + 15 * 60000); }
      if (out.length) break; // only offer the first day that has slots
    }
    return out;
  }
  const fmtTime = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  function dayWord(d) {
    const today = new Date(); const tmr = new Date(); tmr.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'today';
    if (d.toDateString() === tmr.toDateString()) return 'tomorrow';
    return d.toLocaleDateString([], { weekday: 'long' });
  }
  function ensurePickup() {
    if (!locById[cart.pickup.locationId]) cart.pickup.locationId = locations[0].id;
    const slots = slotsFor(cart.pickup.locationId);
    const current = cart.pickup.slot ? new Date(cart.pickup.slot) : null;
    if (!current || !slots.some(s => s.getTime() === current.getTime())) {
      cart.pickup.slot = slots[0] ? slots[0].toISOString() : null;
    }
    return slots;
  }
  function isOpenNow(loc) {
    const now = new Date();
    const [o, c] = loc.hours[now.getDay()];
    const h = now.getHours() + now.getMinutes() / 60;
    return h >= o && h < c;
  }
  const fmtHour = h => { const d = new Date(); d.setHours(h % 24, 0, 0, 0); return d.toLocaleTimeString([], { hour: 'numeric' }); };

  /* ---------- Shared bits ---------- */
  function tagsHtml(p, extra = []) {
    const tags = [...extra, ...p.tags];
    if (!tags.length) return '';
    return `<div class="tag-row">${tags.map(t => `<span class="tag tag-${t}">${t === 'popular' ? 'Fan fave' : t}</span>`).join('')}</div>`;
  }
  function qtyHtml(value, attrs = '', small = false) {
    return `<div class="qty ${small ? 'qty-sm' : ''}" ${attrs}>
      <button type="button" data-qty="-1" aria-label="Decrease quantity">${icon.minus}</button>
      <output aria-live="polite">${value}</output>
      <button type="button" data-qty="1" aria-label="Increase quantity">${icon.plus}</button>
    </div>`;
  }
  function starsHtml(rating) {
    let s = '';
    for (let i = 0; i < 5; i++) s += `<span style="--i:${i}">${icon.star(Math.max(0, Math.min(1, rating - i)))}</span>`;
    return `<span class="stars" role="img" aria-label="${rating} out of 5 stars">${s}</span>`;
  }

  /* ---------- Views ---------- */
  function homeView() {
    const featured = products.filter(p => p.featured);
    return `
    <div class="page home">
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <p class="eyebrow fade-up" style="--d:.05s">Burgers bring people together</p>
            <h1 class="display"><span class="line"><span>Stacked right.</span></span><span class="line"><span>Served hot.</span></span></h1>
            <p class="hero-lead fade-up" style="--d:.45s">Smash burgers, hand-cut fries and thick shakes since 1974.</p>
            <div class="hero-ctas fade-up" style="--d:.6s">
              <a href="#/menu" class="btn btn-red">Order Now</a>
              <a href="#/menu" class="btn btn-outline">See the Menu</a>
            </div>
          </div>
          <div class="hero-visual" id="heroVisual">
            <div class="hero-sun"><div class="hero-rays"></div></div>
            <svg class="hero-sparks" viewBox="0 0 60 70" aria-hidden="true"><path d="M44 8 54 26" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M30 34 52 38" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M32 60 52 50" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>
            <div class="hero-burger" id="heroBurger"><img src="images/double-bacon-stack-hero.jpg" alt="Double Bacon Stack burger with two patties, melted cheddar, bacon, pickles and red onion" /></div>
            <a class="burst" href="#/product/crinkle-fries" aria-label="Free fries with your first order"><span>Free fries with first order</span></a>
            <div class="handwritten" aria-hidden="true">Good<br>burgers<br>brighter<br>days<svg viewBox="0 0 100 12"><path d="M3 9 Q50 1 97 4" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>
          </div>
        </div>
      </section>

      <section class="ticker" aria-label="Our promise">
        <div class="ticker-track">${tickerItems()}${tickerItems()}</div>
      </section>

      <section class="container home-section popular">
        <div class="section-head reveal">
          <h2 class="display section-title">Popular Burgers</h2>
          <a href="#/menu" class="link-arrow">View Full Menu ${icon.arrowRight}</a>
        </div>
        <div class="cards cards-3">
          ${featured.map((p, i) => `
          <article class="card reveal" style="--d:${i * 120}ms" data-card="${p.id}">
            <a class="card-media" href="#/product/${p.id}" aria-label="${esc(p.name)} details">
              ${tagsHtml(p, i === 0 ? ['popular'] : [])}
              <img src="${p.wide || p.img}" alt="${esc(p.name)}" loading="lazy" />
            </a>
            <div class="card-body">
              <h3 class="card-title"><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
              <span class="price">${money(p.price)}</span>
              <p class="card-desc">${esc(p.short)}</p>
              <button class="btn btn-red btn-xs" data-add="${p.id}">Add to Cart</button>
            </div>
          </article>`).join('')}
        </div>
      </section>

      <section class="container home-section">
        <div class="section-head reveal"><h2 class="display section-title">How it works</h2></div>
        <div class="steps">
          ${[
            ['1', 'Pick your stack', 'Browse the menu, choose your patty size and pile on the add-ons.', '<path d="M4 6h16M4 12h16M4 18h10" stroke="#3A160C" stroke-width="2.4" stroke-linecap="round"/>'],
            ['2', 'We smash it fresh', 'Fresh beef, never frozen, smashed to order on a screaming-hot griddle.', '<path d="M12 3c2 3 5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8Z" fill="none" stroke="#3A160C" stroke-width="2.2" stroke-linejoin="round"/>'],
            ['3', 'Grab it hot', 'Pick a time and location. Your order is bagged and ready when you are.', '<path d="M6 8h12l-1 12H7L6 8Zm3 0a3 3 0 0 1 6 0" fill="none" stroke="#3A160C" stroke-width="2.2" stroke-linejoin="round"/>']
          ].map((s, i) => `
          <div class="step reveal" style="--d:${i * 120}ms">
            <span class="step-num">0${s[0]}</span>
            <div class="step-icon"><svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">${s[3]}</svg></div>
            <h3>${s[1]}</h3><p>${s[2]}</p>
          </div>`).join('')}
        </div>

        <div class="promo reveal">
          <div class="promo-copy">
            <p class="eyebrow" style="color:var(--yellow)">Since 1974</p>
            <h2 class="display">Fifty years of <em>smashing it.</em></h2>
            <p>Same family recipe, same seasoned griddle, same toasted brioche. Fries are on us with your very first online order.</p>
            <div class="stats">
              <div class="stat"><strong data-count="50">0</strong><span>years on the griddle</span></div>
              <div class="stat"><strong data-count="4">0</strong><span>neighborhood spots</span></div>
              <div class="stat"><strong data-count="2.1" data-suffix="M">0</strong><span>burgers smashed</span></div>
            </div>
            <div><a href="#/menu" class="btn btn-red">Start an Order</a></div>
          </div>
          <div class="promo-media"><img src="images/crinkle-fries-2.jpg" alt="Crinkle fries with ketchup on checkered paper" loading="lazy" /></div>
          <div class="checker-strip" aria-hidden="true"></div>
        </div>
      </section>
    </div>`;
  }
  function tickerItems() {
    const words = ['FRESH BEEF DAILY', 'NEVER FROZEN', 'TOASTED BRIOCHE', 'HAND-SPUN SHAKES', 'SINCE 1974'];
    return `<div class="ticker-item"><span class="checker" aria-hidden="true"></span>${words.map(w => `<span>${w}</span><span class="star" aria-hidden="true">★</span>`).join('')}</div>`;
  }

  /* --- Menu --- */
  const menuState = { category: 'burgers', veg: false, spicy: false, under10: false, ranges: new Set(), sort: 'popular' };

  function menuView(category) {
    menuState.category = categories.some(c => c.id === category) ? category : 'burgers';
    const chk = (name, label, checked) => `<label class="check"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''}/><span class="box">${checkSvg}</span>${label}</label>`;
    const rad = (value, label) => `<label class="radio"><input type="radio" name="sort" value="${value}" ${menuState.sort === value ? 'checked' : ''}/><span class="dot"></span>${label}</label>`;
    return `
    <div class="page menu-page">
      <div class="container">
        <div class="menu-hero">
          <div>
            <h1 class="display page-title">Our Menu</h1>
            <p class="page-sub fade-up" style="--d:.15s">Fresh ingredients. Bold flavors. Burgers for every craving.</p>
          </div>
          <div class="handwritten" aria-hidden="true">Good<br>burgers<br>brighter<br>days<svg viewBox="0 0 100 12"><path d="M3 9 Q50 1 97 4" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>
        </div>

        <div class="tabs" role="tablist" aria-label="Menu categories">
          ${categories.map(c => `<button class="tab ${c.id === menuState.category ? 'active' : ''}" role="tab" aria-selected="${c.id === menuState.category}" data-tab="${c.id}">${c.label}</button>`).join('')}
          <span class="tab-indicator" aria-hidden="true"></span>
        </div>

        <div class="menu-layout">
          <div>
            <button class="btn btn-outline btn-sm filters-toggle" id="filtersToggle" aria-expanded="false" aria-controls="filters" style="margin-bottom:14px">${icon.filter} Filters</button>
            <aside class="filters" id="filters" aria-label="Filters">
              <h2>Filter</h2>
              <div class="filter-group">
                <h3>Dietary</h3>
                ${chk('veg', 'Vegetarian', menuState.veg)}
                ${chk('spicy', 'Spicy', menuState.spicy)}
                ${chk('under10', 'Under $10', menuState.under10)}
              </div>
              <div class="filter-group">
                <h3>Price Range</h3>
                ${chk('r-low', 'Under $10', menuState.ranges.has('low'))}
                ${chk('r-mid', '$10 – $15', menuState.ranges.has('mid'))}
                ${chk('r-high', '$15+', menuState.ranges.has('high'))}
              </div>
              <div class="filter-group">
                <h3>Sort By</h3>
                ${rad('popular', 'Most Popular')}
                ${rad('low', 'Price: Low to High')}
                ${rad('high', 'Price: High to Low')}
              </div>
              <button class="filters-reset" type="button" data-reset>Reset filters</button>
            </aside>
          </div>
          <div>
            <div class="menu-results-bar"><span id="resultsCount"></span></div>
            <div class="menu-grid" id="menuGrid"></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function filteredProducts() {
    const s = menuState;
    let list = products.filter(p => p.category === s.category);
    if (s.veg) list = list.filter(p => p.tags.includes('vegetarian'));
    if (s.spicy) list = list.filter(p => p.tags.includes('spicy'));
    if (s.under10) list = list.filter(p => p.price < 10);
    if (s.ranges.size) {
      list = list.filter(p =>
        (s.ranges.has('low') && p.price < 10) ||
        (s.ranges.has('mid') && p.price >= 10 && p.price <= 15) ||
        (s.ranges.has('high') && p.price > 15));
    }
    if (s.sort === 'low') list.sort((a, b) => a.price - b.price);
    else if (s.sort === 'high') list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => b.popularity - a.popularity);
    return list;
  }

  function renderMenuGrid() {
    const grid = $('#menuGrid');
    if (!grid) return;
    const list = filteredProducts();
    const cat = categories.find(c => c.id === menuState.category);
    $('#resultsCount').textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'} in ${cat.label}`;
    grid.innerHTML = list.length ? list.map((p, i) => `
      <article class="card" style="--d:${i * 60}ms" data-card="${p.id}">
        <a class="card-media" href="#/product/${p.id}" aria-label="${esc(p.name)} details">
          ${tagsHtml(p)}
          <img src="${p.img}" alt="${esc(p.name)}" loading="lazy" />
        </a>
        <div class="card-body">
          <h3 class="card-title"><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
          <p class="card-desc">${esc(p.short)}</p>
          <div class="card-foot">
            <span class="price">${money(p.price)}</span>
            <button class="btn btn-red btn-xs" data-add="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>`).join('') : `
      <div class="empty-state">
        <div class="empty-emoji" aria-hidden="true">🍔</div>
        <h3>Nothing on the grill</h3>
        <p>No ${esc(cat.label.toLowerCase())} match those filters. Try loosening them up.</p>
        <button class="btn btn-red btn-sm" data-reset>Reset filters</button>
      </div>`;
  }

  function moveIndicator(container, activeEl, indicator) {
    if (!container || !activeEl || !indicator) return;
    indicator.style.width = activeEl.offsetWidth + 'px';
    indicator.style.transform = `translateX(${activeEl.offsetLeft}px)`;
    indicator.style.opacity = 1;
  }

  function bindMenu() {
    const page = $('.menu-page');
    renderMenuGrid();
    const tabs = $('.tabs', page);
    const placeIndicator = () => moveIndicator(tabs, $('.tab.active', tabs), $('.tab-indicator', tabs));
    requestAnimationFrame(placeIndicator);

    tabs.addEventListener('click', e => {
      const t = e.target.closest('[data-tab]');
      if (!t) return;
      history.replaceState(null, '', '#/menu/' + t.dataset.tab);
      setMenuCategory(t.dataset.tab);
    });
    $('#filters').addEventListener('change', e => {
      const n = e.target.name;
      if (n === 'veg' || n === 'spicy' || n === 'under10') menuState[n] = e.target.checked;
      else if (n && n.startsWith('r-')) {
        const r = n.slice(2);
        e.target.checked ? menuState.ranges.add(r) : menuState.ranges.delete(r);
      } else if (n === 'sort') menuState.sort = e.target.value;
      renderMenuGrid();
    });
    page.addEventListener('click', e => {
      if (e.target.closest('[data-reset]')) {
        Object.assign(menuState, { veg: false, spicy: false, under10: false, sort: 'popular' });
        menuState.ranges.clear();
        $$('#filters input[type=checkbox]').forEach(i => (i.checked = false));
        $('#filters input[value=popular]').checked = true;
        renderMenuGrid();
      }
    });
    $('#filtersToggle').addEventListener('click', e => {
      const f = $('#filters');
      const open = f.classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', open);
    });
  }

  function setMenuCategory(cat) {
    menuState.category = categories.some(c => c.id === cat) ? cat : 'burgers';
    $$('.tab').forEach(t => {
      const on = t.dataset.tab === menuState.category;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    const tabs = $('.tabs');
    moveIndicator(tabs, $('.tab.active', tabs), $('.tab-indicator', tabs));
    renderMenuGrid();
  }

  /* --- Product --- */
  let productState = null;

  function productView(id) {
    const p = byId[id];
    if (!p) return notFoundView();
    productState = { id, size: p.defaultSize || null, addons: new Set(), qty: 1 };
    const cat = categories.find(c => c.id === p.category);
    const pairs = p.category === 'burgers' || p.category === 'combos'
      ? ['crinkle-fries', 'chocolate-shake', 'onion-rings']
      : products.filter(x => x.featured).map(x => x.id);
    const pairTitle = p.category === 'burgers' ? 'Perfect with your burger' : p.category === 'combos' ? 'Add a little extra' : 'Pairs perfectly with';
    return `
    <div class="page product-page">
      <div class="container">
        <a href="#/menu/${p.category}" class="link-arrow back back-link">${icon.arrowLeft} Back to Menu</a>
        <div class="product-grid">
          <div class="product-media">
            ${tagsHtml(p)}
            <img src="${p.hero || p.img}" alt="${esc(p.name)}" />
          </div>
          <div class="product-info">
            <p class="eyebrow fade-up">${esc(cat.label)}</p>
            <h1 class="display fade-up" style="--d:.05s">${esc(p.name)}</h1>
            <div class="rating fade-up" style="--d:.1s">${starsHtml(p.rating)}<span>${p.rating} (${p.reviews} reviews)</span></div>
            <div class="price product-price fade-up" style="--d:.15s" id="productPrice">${money(p.price)}</div>
            <p class="product-desc fade-up" style="--d:.2s">${esc(p.desc)}</p>
            <form id="productForm" class="fade-up" style="--d:.28s" onsubmit="return false">
              ${p.sizes ? `
              <h2 class="opt-title">Patty Size</h2>
              <div class="sizes" role="radiogroup" aria-label="Patty size">
                ${p.sizes.map(s => `<label class="size"><input type="radio" name="size" value="${s.id}" ${s.id === productState.size ? 'checked' : ''}/><span class="dot"></span>${s.label}<small>${s.delta === 0 ? '' : (s.delta > 0 ? '+' : '−') + money(Math.abs(s.delta))}</small></label>`).join('')}
              </div>` : ''}
              ${p.addons && p.addons.length ? `
              <h2 class="opt-title">Add-Ons</h2>
              <div class="addons">
                ${p.addons.map(a => `<label class="check"><input type="checkbox" name="addon" value="${a.id}"/><span class="box">${checkSvg}</span>${esc(a.label)} <span class="addon-price">+${money(a.price)}</span></label>`).join('')}
              </div>` : ''}
              <div class="buy-row">
                ${qtyHtml(1, 'id="productQty"')}
                <button class="btn btn-red btn-buy" type="button" id="addProduct">Add to Cart - <span id="buyPrice">${money(p.price)}</span></button>
              </div>
            </form>
          </div>
        </div>

        <hr class="divider" />
        <h2 class="display section-title reveal" style="margin-bottom:22px">${pairTitle}</h2>
        <div class="pairings">
          ${pairs.map((pid, i) => { const q = byId[pid]; return `
          <article class="card pair-card reveal" style="--d:${i * 100}ms" data-card="${q.id}">
            <a class="card-media" href="#/product/${q.id}" aria-label="${esc(q.name)} details"><img src="${q.alt || q.wide || q.img}" alt="${esc(q.name)}" loading="lazy" /></a>
            <div class="card-body">
              <h3 class="card-title"><a href="#/product/${q.id}">${esc(q.name)}</a></h3>
              <span class="price">${money(q.price)}</span>
              <button class="btn btn-red btn-xs" data-add="${q.id}">Add to Cart</button>
            </div>
          </article>`; }).join('')}
        </div>
      </div>
    </div>`;
  }

  function productUnit() {
    const p = byId[productState.id];
    return cart.unitPrice({ id: p.id, size: productState.size, addons: [...productState.addons] });
  }
  function refreshProductPrice() {
    const unit = productUnit();
    animateNumber($('#productPrice'), unit);
    animateNumber($('#buyPrice'), unit * productState.qty);
  }
  function bindProduct() {
    const form = $('#productForm');
    if (!form) return;
    form.addEventListener('change', e => {
      if (e.target.name === 'size') productState.size = e.target.value;
      if (e.target.name === 'addon') e.target.checked ? productState.addons.add(e.target.value) : productState.addons.delete(e.target.value);
      refreshProductPrice();
    });
    $('#productQty').addEventListener('click', e => {
      const b = e.target.closest('[data-qty]');
      if (!b) return;
      const next = Math.max(1, Math.min(99, productState.qty + Number(b.dataset.qty)));
      if (next === productState.qty) return;
      productState.qty = next;
      flipOutput($('#productQty output'), next);
      refreshProductPrice();
    });
    $('#addProduct').addEventListener('click', e => {
      const p = byId[productState.id];
      cart.add(p.id, { size: productState.size, addons: [...productState.addons], qty: productState.qty });
      flyToCart($('.product-media img'));
      addedFeedback(e.currentTarget, `Added ✓`);
      toastAdded(p, productState.qty);
    });
  }

  /* --- Cart --- */
  function cartView() {
    const slots = ensurePickup();
    return `
    <div class="page cart-page">
      <div class="container">
        <div class="cart-layout">
          <div>
            <h1 class="display page-title">Your Cart</h1>
            <p class="page-sub fade-up" style="--d:.15s">Good food is a few clicks away.</p>
            <div id="cartBody" style="margin-top:30px">${cartItemsHtml()}</div>
          </div>
          <aside class="summary fade-up" style="--d:.2s" aria-label="Order summary">
            <h2>Order Summary</h2>
            <div id="summaryLines"></div>
            <h3>Pickup Details</h3>
            <div class="pickup">
              <button type="button" class="pickup-btn" id="pickupBtn" aria-expanded="false" aria-controls="pickupPanel">
                ${icon.pin}
                <div><strong id="pickupWhen"></strong><span id="pickupWhere"></span></div>
                ${icon.chevron}
              </button>
              <div class="pickup-panel" id="pickupPanel">
                <div>
                  <label for="pickupLoc">Location</label>
                  <select class="select" id="pickupLoc">
                    ${locations.map(l => `<option value="${l.id}" ${l.id === cart.pickup.locationId ? 'selected' : ''}>${esc(l.name)} — ${esc(l.address)}</option>`).join('')}
                  </select>
                  <label>Pickup time</label>
                  <div class="times" id="pickupTimes">${timesHtml(slots)}</div>
                </div>
              </div>
            </div>
            <button class="btn btn-red btn-block place-btn" id="placeOrder">Place Order</button>
            <p class="note">Fresh burgers. Hot and ready.</p>
          </aside>
        </div>
      </div>
    </div>`;
  }

  function cartItemsHtml() {
    if (!cart.lines.length) {
      return `<div class="empty-cart">
        <svg class="empty-burger" viewBox="0 0 120 100" aria-hidden="true">
          <path d="M14 48C14 24 36 10 60 10s46 14 46 38z" fill="#D9822B"/>
          <circle cx="40" cy="28" r="2.4" fill="#fff6e0"/><circle cx="58" cy="22" r="2.4" fill="#fff6e0"/><circle cx="76" cy="30" r="2.4" fill="#fff6e0"/>
          <path d="M10 54c10 6 20-4 30 2s20-4 30 2 20-4 30 2 10-2 10-2v-6H10z" fill="#5BA543"/>
          <rect x="10" y="58" width="100" height="12" rx="6" fill="#F6B520"/>
          <rect x="12" y="66" width="96" height="12" rx="6" fill="#5B2A17"/>
          <path d="M14 82h92c0 8-14 12-46 12S14 90 14 82z" fill="#D9822B"/>
        </svg>
        <h2>Your cart is hungry</h2>
        <p>Nothing here yet. Let's fix that.</p>
        <a href="#/menu" class="btn btn-red">Browse the Menu</a>
      </div>`;
    }
    return `<div class="cart-items" id="cartItems">${cart.lines.map((l, i) => cartItemHtml(l, i)).join('')}</div>
      <div class="cart-actions">
        <a href="#/menu" class="btn btn-outline">${icon.arrowLeft} Continue Shopping</a>
        <button class="clear-btn" type="button" id="clearCart">${icon.trash} Clear Cart</button>
      </div>`;
  }

  function cartItemHtml(l, i) {
    const p = byId[l.id];
    const unit = cart.unitPrice(l);
    const opts = lineLabel(l);
    return `<article class="cart-item" data-key="${esc(l.key)}" style="--d:${i * 90}ms">
      <a class="cart-thumb" href="#/product/${p.id}"><img src="${p.img}" alt="${esc(p.name)}" /></a>
      <div class="info">
        <h3><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
        <p>${esc(p.desc)}</p>
        ${opts.length ? `<div class="chips">${opts.map(o => `<span class="chip">${esc(o)}</span>`).join('')}</div>` : ''}
      </div>
      ${qtyHtml(l.qty, `data-line="${esc(l.key)}"`, true)}
      <div class="line-price"><span class="price" data-line-total>${money(unit * l.qty)}</span><small data-each>${l.qty > 1 ? money(unit) + ' each' : ''}</small></div>
      <button class="icon-btn" type="button" data-remove="${esc(l.key)}" aria-label="Remove ${esc(p.name)}">${icon.trash}</button>
    </article>`;
  }

  function timesHtml(slots) {
    if (!slots.length) return '<p>No pickup times available.</p>';
    return slots.map(s => `<button type="button" class="time ${cart.pickup.slot === s.toISOString() ? 'active' : ''}" data-slot="${s.toISOString()}">${fmtTime(s)}</button>`).join('');
  }

  function renderSummary(animate = true) {
    const el = $('#summaryLines');
    if (!el) return;
    const t = cart.totals();
    const prev = el.dataset.ready === '1';
    el.innerHTML = `
      <div class="sum-lines">
        ${cart.lines.length ? cart.lines.map(l => `<div class="sum-line"><span>${esc(byId[l.id].name)} x${l.qty}</span><span>${money(cart.unitPrice(l) * l.qty)}</span></div>`).join('') : '<div class="sum-line"><span>No items yet</span><span>$0.00</span></div>'}
      </div>
      <div class="sum-sep"></div>
      <div class="sum-lines">
        <div class="sum-line"><span>Subtotal</span><span class="count-up" id="sumSubtotal" data-value="${prev ? el.dataset.sub : 0}">${money(t.subtotal)}</span></div>
        ${t.discount ? `<div class="sum-line discount"><span>First order: free fries 🍟</span><span>−${money(t.discount)}</span></div>` : ''}
        <div class="sum-line"><span>Tax (${Math.round(TAX_RATE * 100)}%)</span><span class="count-up" id="sumTax" data-value="${prev ? el.dataset.tax : 0}">${money(t.tax)}</span></div>
      </div>
      <div class="sum-sep"></div>
      <div class="sum-total"><span class="display">Total</span><span class="price count-up" id="sumTotal" data-value="${prev ? el.dataset.total : 0}">${money(t.total)}</span></div>
      <div class="sum-sep"></div>`;
    if (animate) {
      animateNumber($('#sumSubtotal'), t.subtotal);
      animateNumber($('#sumTax'), t.tax);
      animateNumber($('#sumTotal'), t.total);
    }
    Object.assign(el.dataset, { ready: '1', sub: t.subtotal, tax: t.tax, total: t.total });
    const btn = $('#placeOrder');
    if (btn) btn.disabled = !cart.lines.length;
  }

  function renderPickupLabel() {
    const loc = locById[cart.pickup.locationId];
    const d = cart.pickup.slot ? new Date(cart.pickup.slot) : null;
    $('#pickupWhen').textContent = d ? `Pickup ${dayWord(d)}, ${fmtTime(d)}` : 'No times available';
    $('#pickupWhere').textContent = loc.name;
  }

  function bindCart() {
    const page = $('.cart-page');
    renderSummary();
    renderPickupLabel();

    page.addEventListener('click', e => {
      const qb = e.target.closest('[data-qty]');
      if (qb && qb.closest('[data-line]')) {
        const wrap = qb.closest('[data-line]');
        const key = wrap.dataset.line;
        const line = cart.lines.find(l => l.key === key);
        if (!line) return;
        const next = line.qty + Number(qb.dataset.qty);
        if (next < 1) { removeLine(key); return; }
        if (next > 99) return;
        cart.setQty(key, next);
        updateCartBadge(true);
        flipOutput($('output', wrap), next);
        const item = wrap.closest('.cart-item');
        const unit = cart.unitPrice(line);
        animateNumber($('[data-line-total]', item), unit * next);
        $('[data-each]', item).textContent = next > 1 ? money(unit) + ' each' : '';
        renderSummary();
        return;
      }
      const rm = e.target.closest('[data-remove]');
      if (rm) { removeLine(rm.dataset.remove); return; }
      if (e.target.closest('#clearCart')) {
        const items = $$('.cart-item');
        items.forEach((it, i) => setTimeout(() => it.classList.add('removing'), i * 70));
        setTimeout(() => { cart.clear(); $('#cartBody').innerHTML = cartItemsHtml(); renderSummary(); toast({ title: 'Cart cleared', text: 'Fresh start. Hungry again?' }); }, items.length * 70 + 380);
        return;
      }
      const slot = e.target.closest('[data-slot]');
      if (slot) {
        cart.pickup.slot = slot.dataset.slot; cart.save();
        $$('.time', page).forEach(t => t.classList.toggle('active', t === slot));
        renderPickupLabel();
        return;
      }
      if (e.target.closest('#pickupBtn')) {
        const btn = $('#pickupBtn');
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', open);
        $('#pickupPanel').classList.toggle('open', open);
        return;
      }
      if (e.target.closest('#placeOrder')) placeOrder();
    });
    $('#pickupLoc').addEventListener('change', e => {
      cart.pickup.locationId = e.target.value;
      cart.pickup.slot = null;
      const slots = ensurePickup(); cart.save();
      $('#pickupTimes').innerHTML = timesHtml(slots);
      renderPickupLabel();
    });
  }

  function removeLine(key) {
    const item = $(`.cart-item[data-key="${CSS.escape(key)}"]`);
    const p = byId[(cart.lines.find(l => l.key === key) || {}).id];
    cart.remove(key);
    updateCartBadge(true);
    renderSummary();
    const done = () => {
      if (item) item.remove();
      if (!cart.lines.length) $('#cartBody').innerHTML = cartItemsHtml();
    };
    if (item && !reduceMotion) { item.classList.add('removing'); setTimeout(done, 400); } else done();
    if (p) toast({ title: `${p.name} removed`, img: p.img });
  }

  /* --- Place order flow --- */
  function placeOrder() {
    if (!cart.lines.length) return;
    ensurePickup();
    const t = cart.totals();
    const loc = locById[cart.pickup.locationId];
    const when = cart.pickup.slot ? new Date(cart.pickup.slot) : null;
    const orderNo = 'SB-' + Math.floor(1000 + Math.random() * 9000);
    const count = cart.count();

    openModal(`
      <h2 class="display" id="modalTitle">Firing up the grill…</h2>
      <p>Hang tight while we send your order to the kitchen.</p>
      <div style="margin:26px 0 6px"><div class="progress"><span id="orderProgress"></span></div><div class="progress-label" id="orderStep">Sending order…</div></div>
    `, { dismissable: false });

    const steps = ['Sending order to the kitchen…', 'Smashing patties…', 'Toasting the brioche…', 'Bagging it up…'];
    steps.forEach((s, i) => setTimeout(() => {
      const bar = $('#orderProgress'); const lbl = $('#orderStep');
      if (bar) bar.style.width = ((i + 1) / steps.length) * 100 + '%';
      if (lbl) lbl.textContent = s;
    }, i * 520 + 60));

    setTimeout(() => {
      cart.firstOrderDone = true;
      cart.clear();
      updateCartBadge(true);
      $('#modalCard').innerHTML = `
        <button class="icon-btn modal-close" data-close aria-label="Close">${icon.close}</button>
        <svg class="check-anim" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="none" stroke="#2f7d32" stroke-width="5"/><path d="m26 43 11 11 22-23" fill="none" stroke="#2f7d32" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h2 class="display" id="modalTitle">Order confirmed!</h2>
        <p>Thanks! We'll have your ${count} ${count === 1 ? 'item' : 'items'} hot and ready.</p>
        <div class="order-no">${orderNo}</div>
        <div class="order-meta">
          <div><small>Pickup</small><strong>${when ? `${dayWord(when)[0].toUpperCase() + dayWord(when).slice(1)}, ${fmtTime(when)}` : 'ASAP'}</strong></div>
          <div><small>Location</small><strong>${esc(loc.name)}</strong></div>
          <div><small>Address</small><strong>${esc(loc.address)}</strong></div>
          <div><small>Total paid at pickup</small><strong>${money(t.total)}</strong></div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="#/" class="btn btn-outline btn-sm" data-close>Back to Home</a>
          <a href="#/menu" class="btn btn-red btn-sm" data-close>Order More</a>
        </div>`;
      $('#modal').dataset.dismissable = '1';
      confetti();
      // Re-render the cart page in the background so it shows the empty state.
      if (currentRoute.name === 'cart') { $('#cartBody').innerHTML = cartItemsHtml(); renderSummary(false); }
    }, steps.length * 520 + 300);
  }

  /* --- Locations --- */
  let activeLoc = null;
  function locationsView() {
    activeLoc = cart.pickup.locationId;
    const today = new Date().getDay();
    return `
    <div class="page loc-page">
      <div class="container">
        <h1 class="display page-title">Locations</h1>
        <p class="page-sub fade-up" style="--d:.15s">Four griddles. One family recipe. Find your nearest stack.</p>
        <div class="loc-layout">
          <div class="loc-list">
            ${locations.map((l, i) => {
              const open = isOpenNow(l);
              const [o, c] = l.hours[today];
              const selected = l.id === cart.pickup.locationId;
              return `
              <article class="loc-card reveal ${l.id === activeLoc ? 'active' : ''}" style="--d:${i * 90}ms" data-loc="${l.id}" tabindex="0" aria-label="${esc(l.name)}">
                <div>
                  <h3>${esc(l.name)}</h3>
                  <p class="addr">${esc(l.address)}, ${esc(l.city)}</p>
                </div>
                <span class="status ${open ? 'open' : 'closed'}">${open ? 'Open now' : 'Closed'}</span>
                <div class="loc-meta">
                  <span>${icon.clock} Today ${fmtHour(o)} – ${fmtHour(c)}</span>
                  <span>${icon.phone} <a href="tel:${l.phone.replace(/\D/g, '')}">${esc(l.phone)}</a></span>
                  <span>${esc(l.note)}</span>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;grid-column:1/-1">
                  <button class="btn btn-red btn-xs ${selected ? 'is-selected' : ''}" data-pickup="${l.id}">${selected ? '✓ Your pickup spot' : 'Pick up here'}</button>
                  <a class="btn btn-outline btn-xs" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address + ', ' + l.city)}">Directions</a>
                </div>
              </article>`;
            }).join('')}
          </div>
          <div class="map reveal" aria-label="Map of Smokestack locations">
            ${mapSvg()}
            ${locations.map((l, i) => `<button class="pin ${l.id === activeLoc ? 'active' : ''}" data-pin="${l.id}" style="left:${l.x}%;top:${l.y}%;--d:${400 + i * 140}ms" aria-label="${esc(l.name)}">
              <span class="pin-label">${esc(l.name)}</span>
              <svg viewBox="0 0 40 50" aria-hidden="true"><path d="M20 49S37 31 37 18A17 17 0 0 0 3 18c0 13 17 31 17 31Z" fill="currentColor" stroke="#fff" stroke-width="2.5"/><circle cx="20" cy="18" r="7" fill="#fff"/></svg>
            </button>`).join('')}
            <div class="map-badge">📍 Springfield area</div>
          </div>
        </div>
      </div>
    </div>`;
  }
  function mapSvg() {
    return `<svg class="streets" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <rect width="100" height="100" fill="#f4e3c6"/>
      <path d="M58 0C52 18 70 30 62 48S48 74 60 100" fill="none" stroke="#9fc7d9" stroke-width="7"/>
      <rect x="8" y="58" width="22" height="18" rx="3" fill="#cfe2b2"/>
      <rect x="76" y="8" width="16" height="12" rx="3" fill="#cfe2b2"/>
      <g stroke="#fff" stroke-width="2.2" fill="none">
        <path d="M0 46H100"/><path d="M0 22H100"/><path d="M0 70H100"/><path d="M0 88H100"/>
        <path d="M24 0V100"/><path d="M40 0V100"/><path d="M76 0V100"/><path d="M90 0V100"/><path d="M8 0V100"/>
      </g>
      <g stroke="#f6b520" stroke-width="3.2" fill="none" opacity=".85"><path d="M0 46H100"/><path d="M40 0V100"/></g>
      <path d="M0 100 100 0" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 2" opacity=".7"/>
    </svg>`;
  }
  function bindLocations() {
    const page = $('.loc-page');
    const setActive = id => {
      activeLoc = id;
      $$('.loc-card', page).forEach(c => c.classList.toggle('active', c.dataset.loc === id));
      $$('.pin', page).forEach(p => p.classList.toggle('active', p.dataset.pin === id));
    };
    page.addEventListener('click', e => {
      const pick = e.target.closest('[data-pickup]');
      if (pick) {
        const id = pick.dataset.pickup;
        cart.pickup.locationId = id; cart.pickup.slot = null; ensurePickup(); cart.save();
        $$('[data-pickup]', page).forEach(b => {
          const on = b.dataset.pickup === id;
          b.classList.toggle('is-selected', on);
          b.textContent = on ? '✓ Your pickup spot' : 'Pick up here';
        });
        setActive(id);
        toast({ title: `Pickup set to ${locById[id].name}`, text: locById[id].address, action: cart.count() ? { href: '#/cart', label: 'View cart' } : { href: '#/menu', label: 'Order now' } });
        return;
      }
      const pin = e.target.closest('[data-pin]');
      if (pin) {
        setActive(pin.dataset.pin);
        const card = $(`.loc-card[data-loc="${pin.dataset.pin}"]`, page);
        if (card && window.innerWidth <= 1024) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const card = e.target.closest('[data-loc]');
      if (card && !e.target.closest('a')) setActive(card.dataset.loc);
    });
    page.addEventListener('keydown', e => {
      const card = e.target.closest('[data-loc]');
      if (card && (e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); setActive(card.dataset.loc); }
    });
  }

  function notFoundView() {
    return `<div class="page"><div class="container empty-cart" style="margin-top:40px">
      <div class="empty-emoji" style="font-size:4rem" aria-hidden="true">🍔</div>
      <h2>This page fell off the grill</h2>
      <p>We couldn't find what you were looking for.</p>
      <a href="#/menu" class="btn btn-red">Back to the Menu</a>
    </div></div>`;
  }

  /* ---------- Animations & feedback ---------- */
  function animateNumber(el, to, duration = 600) {
    if (!el) return;
    const from = parseFloat(el.dataset.value || String(el.textContent).replace(/[^0-9.]/g, '')) || 0;
    el.dataset.value = to;
    if (reduceMotion || Math.abs(to - from) < 0.005) { el.textContent = money(to); return; }
    const start = performance.now();
    cancelAnimationFrame(el._raf);
    const step = now => {
      const k = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = money(from + (to - from) * e);
      if (k < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  function countUpStats(root) {
    $$('[data-count]', root).forEach(el => {
      if (el._counted) return; el._counted = true;
      const to = parseFloat(el.dataset.count); const suffix = el.dataset.suffix || '';
      const decimals = String(el.dataset.count).includes('.') ? 1 : 0;
      if (reduceMotion) { el.textContent = to.toFixed(decimals) + suffix; return; }
      const start = performance.now();
      const step = now => {
        const k = Math.min(1, (now - start) / 1400);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * e).toFixed(decimals) + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function flipOutput(out, value) {
    out.textContent = value;
    out.classList.remove('flip'); void out.offsetWidth; out.classList.add('flip');
  }

  function addedFeedback(btn, label = 'Added ✓') {
    if (!btn || btn._busy) return;
    btn._busy = true;
    const html = btn.innerHTML;
    btn.classList.add('is-added');
    btn.textContent = label;
    setTimeout(() => {
      btn.classList.remove('is-added'); btn.innerHTML = html; btn._busy = false;
      if (btn.id === 'addProduct') refreshProductPrice();
    }, 1200);
  }

  function flyToCart(img) {
    const target = $('#cartLink');
    if (!img || !target || reduceMotion) { updateCartBadge(true); return; }
    const from = img.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const size = Math.min(110, from.width, from.height);
    const ghost = document.createElement('div');
    ghost.className = 'fly';
    ghost.style.width = ghost.style.height = size + 'px';
    ghost.style.left = from.left + from.width / 2 - size / 2 + 'px';
    ghost.style.top = from.top + from.height / 2 - size / 2 + 'px';
    ghost.innerHTML = `<img src="${img.currentSrc || img.src}" alt="" />`;
    document.body.appendChild(ghost);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const anim = ghost.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(0.7) rotate(180deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(360deg)`, opacity: 0.6 }
    ], { duration: 850, easing: 'cubic-bezier(.5,0,.3,1)' });
    anim.onfinish = () => { ghost.remove(); updateCartBadge(true); };
  }

  function toast({ title, text = '', img, action }) {
    const stack = $('#toastStack');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${img ? `<img src="${img}" alt="" />` : `<span class="toast-icon">${icon.cart.replace('width="20"', 'width="20" style="color:#fff"')}</span>`}
      <div><strong>${esc(title)}</strong>${text ? `<span>${esc(text)}</span>` : ''}</div>
      ${action ? `<a href="${action.href}">${esc(action.label)}</a>` : ''}`;
    stack.appendChild(t);
    while (stack.children.length > 3) stack.firstElementChild.remove();
    const kill = () => { t.classList.add('out'); setTimeout(() => t.remove(), 300); };
    const timer = setTimeout(kill, 3200);
    t.addEventListener('click', e => { if (e.target.closest('a')) { clearTimeout(timer); kill(); } });
  }
  function toastAdded(p, qty = 1) {
    toast({ title: `${qty > 1 ? qty + ' × ' : ''}${p.name} added`, text: `Cart total ${money(cart.totals().total)}`, img: p.img, action: { href: '#/cart', label: 'View cart' } });
  }

  function confetti() {
    if (reduceMotion) return;
    const colors = ['#c8231e', '#f6b520', '#d9531e', '#3a160c', '#5ba543', '#fff8ee'];
    for (let i = 0; i < 90; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      document.body.appendChild(c);
      const drift = (Math.random() - 0.5) * 300;
      c.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${drift}px, ${window.innerHeight + 40}px) rotate(${Math.random() * 900}deg)`, opacity: 0.9 }
      ], { duration: 1800 + Math.random() * 1600, delay: Math.random() * 400, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => c.remove();
    }
  }

  function ripple(e) {
    const btn = e.target.closest('.btn');
    if (!btn || reduceMotion) return;
    const r = btn.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = s + 'px';
    span.style.left = e.clientX - r.left - s / 2 + 'px';
    span.style.top = e.clientY - r.top - s / 2 + 'px';
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
  }

  /* ---------- Modal ---------- */
  let lastFocus = null;
  function openModal(html, { dismissable = true } = {}) {
    const m = $('#modal');
    lastFocus = document.activeElement;
    $('#modalCard').innerHTML = html;
    m.dataset.dismissable = dismissable ? '1' : '0';
    m.hidden = false; m.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    $('#modalCard').setAttribute('tabindex', '-1');
    $('#modalCard').focus();
  }
  function closeModal() {
    const m = $('#modal');
    if (m.hidden) return;
    m.classList.add('closing');
    setTimeout(() => { m.hidden = true; m.classList.remove('closing'); document.body.style.overflow = ''; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }, 240);
  }
  $('#modal').addEventListener('click', e => {
    if (e.target.closest('[data-close]') && $('#modal').dataset.dismissable === '1') closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modal').dataset.dismissable === '1') closeModal(); });

  /* ---------- Reveal on scroll ---------- */
  let observer = null;
  function initReveal(root) {
    const els = $$('.reveal', root);
    if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(el => el.classList.add('in')); countUpStats(root); return; }
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          if ($('[data-count]', en.target)) countUpStats(en.target);
          observer.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  }

  /* ---------- Hero parallax ---------- */
  function bindHero() {
    const vis = $('#heroVisual');
    if (!vis || reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
    const burger = $('#heroBurger');
    vis.addEventListener('mousemove', e => {
      const r = vis.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      burger.style.transition = 'transform .2s ease-out';
      burger.style.transform = `translate(${x * 18}px, ${y * 14}px) rotate(${x * 4}deg)`;
    });
    vis.addEventListener('mouseleave', () => { burger.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)'; burger.style.transform = ''; });
  }

  /* ---------- Router ---------- */
  let currentRoute = { name: null };
  function parseRoute() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    const [a, b] = parts;
    if (!a) return { name: 'home' };
    if (a === 'menu') return { name: 'menu', category: b || 'burgers' };
    if (a === 'product' && b) return { name: 'product', id: b };
    if (a === 'cart') return { name: 'cart' };
    if (a === 'locations') return { name: 'locations' };
    return { name: 'notfound' };
  }

  function updateNav(name) {
    const nav = $('#mainNav');
    const map = { home: 'home', menu: 'menu', product: 'menu', cart: 'cart', locations: 'locations' };
    let active = null;
    $$('a[data-nav]', nav).forEach(a => {
      const on = a.dataset.nav === map[name];
      a.classList.toggle('active', on);
      if (on) { a.setAttribute('aria-current', 'page'); active = a; } else a.removeAttribute('aria-current');
    });
    const ind = $('.nav-indicator', nav);
    if (active) moveIndicator(nav, active, ind); else ind.style.opacity = 0;
  }

  function render() {
    const route = parseRoute();
    closeNav();
    if (route.name === 'menu' && currentRoute.name === 'menu' && $('.menu-page')) {
      currentRoute = route;
      setMenuCategory(route.category);
      return;
    }
    const prev = $('.page', app);
    const swap = () => {
      currentRoute = route;
      let html;
      switch (route.name) {
        case 'home': html = homeView(); break;
        case 'menu': html = menuView(route.category); break;
        case 'product': html = productView(route.id); break;
        case 'cart': html = cartView(); break;
        case 'locations': html = locationsView(); break;
        default: html = notFoundView();
      }
      app.innerHTML = html;
      window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
      document.title = titleFor(route);
      updateNav(route.name);
      if (route.name === 'home') bindHero();
      if (route.name === 'menu') bindMenu();
      if (route.name === 'product' && byId[route.id]) bindProduct();
      if (route.name === 'cart') bindCart();
      if (route.name === 'locations') bindLocations();
      initReveal(app);
    };
    if (prev && !reduceMotion) { prev.classList.add('leaving'); setTimeout(swap, 200); } else swap();
  }
  function titleFor(r) {
    const base = 'Smokestack Burger Co.';
    if (r.name === 'menu') return `Menu — ${base}`;
    if (r.name === 'product' && byId[r.id]) return `${byId[r.id].name} — ${base}`;
    if (r.name === 'cart') return `Your Cart (${cart.count()}) — ${base}`;
    if (r.name === 'locations') return `Locations — ${base}`;
    return `${base} — Stacked right. Served hot.`;
  }

  /* ---------- Global wiring ---------- */
  function closeNav() {
    $('#mainNav').classList.remove('open');
    $('#navToggle').setAttribute('aria-expanded', 'false');
  }
  $('#navToggle').addEventListener('click', e => {
    const open = $('#mainNav').classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', e => {
    ripple(e);
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      const p = byId[add.dataset.add];
      if (!p) return;
      cart.add(p.id);
      const card = add.closest('[data-card]');
      flyToCart(card ? $('img', card) : null);
      addedFeedback(add);
      toastAdded(p);
      if (currentRoute.name === 'cart') { $('#cartBody').innerHTML = cartItemsHtml(); renderSummary(); }
    }
  });

  // Re-render the same route when its link is clicked again (e.g. "Menu" from the menu page scrolls to top).
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#/"]');
    if (a && a.getAttribute('href') === location.hash) { closeNav(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });

  $('#newsletterForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#newsletterEmail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      input.classList.remove('invalid'); void input.offsetWidth; input.classList.add('invalid');
      toast({ title: 'Hmm, that email looks off', text: 'Please double-check and try again.' });
      return;
    }
    input.classList.remove('invalid');
    input.value = '';
    toast({ title: "You're on the list! 🍔", text: 'Watch your inbox for deals and drops.' });
  });

  const header = $('#siteHeader');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    updateNav(currentRoute.name);
    const tabs = $('.tabs');
    if (tabs) moveIndicator(tabs, $('.tab.active', tabs), $('.tab-indicator', tabs));
  });
  window.addEventListener('hashchange', render);
  window.addEventListener('storage', e => { if (e.key === 'sb:cart') { cart.lines = storage.get('cart', []); updateCartBadge(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => updateNav(currentRoute.name));

  $('#year').textContent = new Date().getFullYear();
  updateCartBadge();
  onScroll();
  render();
})();
