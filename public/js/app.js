(function () {
  const LS_USER = 'ube_current_user';

  function getUser() {
    try {
      const raw = localStorage.getItem(LS_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setUser(u) {
    if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
    else localStorage.removeItem(LS_USER);
  }

  function toast(message, isError) {
    const host = document.getElementById('toast-host');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'toast' + (isError ? ' error' : '');
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 4200);
  }

  function esc(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function formatMoney(n) {
    if (n == null || Number.isNaN(Number(n))) return '—';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n));
  }

  function conditionLabel(c) {
    const map = { new: 'Like new', good: 'Good', fair: 'Fair', worn: 'Worn' };
    return map[c] || c || '—';
  }

  function updateNav() {
    const hash = (location.hash || '#/').slice(1) || '/';
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const path = href.replace('#', '') || '/';
      const active = hash === path || (path !== '/' && hash.startsWith(path));
      a.setAttribute('aria-current', active ? 'page' : 'false');
    });
    const slot = document.getElementById('user-slot');
    const u = getUser();
    if (slot) {
      slot.innerHTML = u
        ? `<span>Signed in as <strong title="${esc(u.email)}">${esc(u.name)}</strong></span>`
        : '<span class="muted">No profile</span>';
    }
  }

  function parseHash() {
    const raw = (location.hash || '#/').replace(/^#/, '') || '/';
    const parts = raw.split('/').filter(Boolean);
    const route = parts[0] || 'home';
    const id = parts[1];
    return { route, id, raw };
  }

  async function render() {
    updateNav();
    const main = document.getElementById('main');
    if (!main) return;
    const { route, id } = parseHash();
    main.innerHTML = '<p class="muted">Loading…</p>';
    try {
      if (route === 'home' || route === '') await renderHome(main);
      else if (route === 'book' && id) await renderBook(main, id);
      else if (route === 'register') await renderRegister(main);
      else if (route === 'list') await renderListBook(main);
      else if (route === 'profile') await renderProfile(main);
      else if (route === 'orders') await renderOrders(main);
      else {
        main.innerHTML = `<div class="empty-state"><h2>Page not found</h2><p><a class="link" href="#/">Back to browse</a></p></div>`;
      }
    } catch (e) {
      main.innerHTML = `<div class="empty-state"><h2>Something went wrong</h2><p>${esc(e.message)}</p><p><a class="link" href="#/">Try again</a></p></div>`;
      toast(e.message, true);
    }
    main.focus();
  }

  async function renderHome(main) {
    const params = new URLSearchParams(window.__catalogParams__ || '');
    const page = Number(params.get('page') || '1');
    const limit = 12;
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    ['category', 'condition', 'minPrice', 'maxPrice', 'search'].forEach((k) => {
      const v = params.get(k);
      if (v) qs.set(k, v);
    });
    if (params.get('exchange') === '1') qs.set('exchange', 'true');

    const [booksRes, catsRes] = await Promise.all([api.get(`/books?${qs}`), api.get('/categories')]);
    const books = booksRes.data || [];
    const categories = catsRes.data || [];
    const total = booksRes.total || 0;
    const pages = booksRes.pages || 1;

    const filters = {
      category: params.get('category') || '',
      condition: params.get('condition') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      search: params.get('search') || '',
      exchange: params.get('exchange') === '1',
    };

    function applyFilters(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const p = new URLSearchParams();
      p.set('page', '1');
      [['category', fd.get('category')], ['condition', fd.get('condition')], ['minPrice', fd.get('minPrice')], ['maxPrice', fd.get('maxPrice')], ['search', fd.get('search')]].forEach(([k, v]) => {
        if (v) p.set(k, String(v).trim());
      });
      if (fd.get('exchange')) p.set('exchange', '1');
      window.__catalogParams__ = p.toString();
      location.hash = '#/';
      render();
    }

    main.innerHTML = `
      <h1>Browse listings</h1>
      <p class="page-intro">Filter by category, condition, price, or full-text search. Books marked for exchange can be swapped for one of your listings.</p>
      <form class="toolbar" id="catalog-filters">
        <div class="field">
          <label for="f-search">Search</label>
          <input id="f-search" name="search" type="search" placeholder="Title, author…" value="${esc(filters.search)}" />
        </div>
        <div class="field">
          <label for="f-cat">Category</label>
          <select id="f-cat" name="category">
            <option value="">All</option>
            ${categories.map((c) => `<option value="${esc(c._id)}" ${filters.category === c._id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-cond">Condition</label>
          <select id="f-cond" name="condition">
            <option value="">Any</option>
            ${['new', 'good', 'fair', 'worn'].map((c) => `<option value="${c}" ${filters.condition === c ? 'selected' : ''}>${esc(conditionLabel(c))}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-min">Min $</label>
          <input id="f-min" name="minPrice" type="number" min="0" step="0.01" value="${esc(filters.minPrice)}" />
        </div>
        <div class="field">
          <label for="f-max">Max $</label>
          <input id="f-max" name="maxPrice" type="number" min="0" step="0.01" value="${esc(filters.maxPrice)}" />
        </div>
        <div class="field">
          <label for="f-ex">Exchange</label>
          <label style="flex-direction:row;align-items:center;gap:0.35rem;margin-top:0.35rem">
            <input id="f-ex" name="exchange" type="checkbox" value="1" ${filters.exchange ? 'checked' : ''} /> Exchange only
          </label>
        </div>
        <button type="submit" class="btn btn-primary">Apply</button>
        <button type="button" class="btn btn-ghost" id="clear-filters">Reset</button>
      </form>
      ${
        books.length === 0
          ? '<div class="empty-state"><p>No books match your filters.</p><p><a href="#/" class="link" id="reset-empty">Clear filters</a></p></div>'
          : `<div class="book-grid">${books.map(bookCard).join('')}</div>
             <div class="pagination">
               <button type="button" class="btn btn-ghost btn-sm" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">Previous</button>
               <span class="muted">Page ${page} of ${pages} · ${total} total</span>
               <button type="button" class="btn btn-ghost btn-sm" ${page >= pages ? 'disabled' : ''} data-page="${page + 1}">Next</button>
             </div>`
      }
    `;

    main.querySelector('#catalog-filters').addEventListener('submit', applyFilters);
    main.querySelector('#clear-filters').addEventListener('click', () => {
      window.__catalogParams__ = '';
      location.hash = '#/';
      render();
    });
    const re = main.querySelector('#reset-empty');
    if (re) re.addEventListener('click', () => { window.__catalogParams__ = ''; location.hash = '#/'; render(); });
    main.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const np = btn.getAttribute('data-page');
        const p = new URLSearchParams(window.__catalogParams__ || '');
        p.set('page', np);
        window.__catalogParams__ = p.toString();
        render();
      });
    });
  }

  function bookCard(b) {
    const img = b.images && b.images[0];
    const cat = b.category && b.category.name;
    return `
      <article class="card">
        <a href="#/book/${esc(b._id)}" class="card-cover" style="text-decoration:none;color:inherit">
          ${img ? `<img src="${esc(img)}" alt="" loading="lazy" />` : '<span aria-hidden="true">📖</span>'}
        </a>
        <div class="card-body">
          <h2 class="card-title"><a href="#/book/${esc(b._id)}" class="link" style="color:inherit;text-decoration:none">${esc(b.title)}</a></h2>
          <p class="card-meta">${esc(b.author)}${cat ? ` · ${esc(cat)}` : ''}</p>
          <div class="badges">
            <span class="badge badge-condition">${esc(conditionLabel(b.condition))}</span>
            ${b.isAvailableForExchange ? '<span class="badge badge-exchange">Exchange OK</span>' : ''}
          </div>
          <div class="price-row">
            <span class="price">${formatMoney(b.price)}</span>
            <a href="#/book/${esc(b._id)}" class="btn btn-primary btn-sm">View</a>
          </div>
        </div>
      </article>
    `;
  }

  async function renderBook(main, bookId) {
    const res = await api.get(`/books/${bookId}`);
    const b = res.data;
    const u = getUser();
    const img = b.images && b.images[0];

    let myBooks = [];
    if (u) {
      try {
        const ur = await api.get(`/users/${u._id}`);
        myBooks = (ur.data.listedBooks || []).filter((x) => x.isAvailable && String(x._id) !== String(bookId));
      } catch {
        myBooks = [];
      }
    }

    main.innerHTML = `
      <p class="muted"><a href="#/" class="link">← Back to browse</a></p>
      <div class="detail-layout">
        <div>
          <div class="detail-hero">
            ${img ? `<img src="${esc(img)}" alt="" />` : '<span class="detail-hero-placeholder" aria-hidden="true">📚</span>'}
          </div>
          <div style="margin-top:1.25rem" class="detail-panel">
            <h1 style="margin-bottom:0.25rem">${esc(b.title)}</h1>
            <p class="muted" style="margin:0 0 1rem">by ${esc(b.author)}${b.publishedYear ? ` · ${esc(b.publishedYear)}` : ''}${b.language ? ` · ${esc(b.language)}` : ''}</p>
            <div class="badges" style="margin-bottom:1rem">
              <span class="badge badge-condition">${esc(conditionLabel(b.condition))}</span>
              ${b.isAvailableForExchange ? '<span class="badge badge-exchange">Open to exchange</span>' : ''}
              ${b.isAvailable ? '' : '<span class="badge">Unavailable</span>'}
            </div>
            ${b.description ? `<p>${esc(b.description)}</p>` : ''}
            ${b.isbn ? `<p class="muted" style="font-size:0.875rem">ISBN: ${esc(b.isbn)}</p>` : ''}
          </div>
        </div>
        <aside class="detail-panel">
          <p class="price" style="font-size:1.75rem;margin-bottom:0.5rem">${formatMoney(b.price)}</p>
          <div class="stack-sm muted" style="margin-bottom:1rem;font-size:0.9375rem">
            <span>Seller: <strong style="color:var(--ink)">${esc(b.seller && b.seller.name)}</strong></span>
            ${b.seller && b.seller.location ? `<span>${esc(b.seller.location)}</span>` : ''}
            ${b.seller && b.seller.contactNumber ? `<span>${esc(b.seller.contactNumber)}</span>` : ''}
          </div>
          ${
            !b.isAvailable
              ? '<p class="muted">This listing is not available.</p>'
              : !u
                ? '<p class="muted">Select or create a profile under <a href="#/register" class="link">Account</a> to place an order.</p>'
                : String((b.seller && b.seller._id) || b.seller) === String(u._id)
                  ? '<p class="muted">This is your listing.</p>'
                  : `
            <form id="order-form" class="form-stack">
              <div class="field">
                <label for="order-type">Request type</label>
                <select id="order-type" name="type" required>
                  <option value="buy">Purchase</option>
                  <option value="exchange" ${b.isAvailableForExchange ? '' : 'disabled'}>Exchange ${b.isAvailableForExchange ? '' : '(not offered)'}</option>
                </select>
              </div>
              <div class="field" id="offered-wrap" style="display:none">
                <label for="offered-book">Your book to offer</label>
                <select id="offered-book" name="offeredBook">
                  <option value="">Select…</option>
                  ${myBooks.map((bk) => `<option value="${esc(bk._id)}">${esc(bk.title)} — ${esc(conditionLabel(bk.condition))}</option>`).join('')}
                </select>
                <p class="muted" style="font-size:0.8125rem;margin:0">List a book first if you have nothing to trade.</p>
              </div>
              <div class="field">
                <label for="order-msg">Message (optional)</label>
                <textarea id="order-msg" name="message" maxlength="500" placeholder="Pickup preference, timing…"></textarea>
              </div>
              <div class="field">
                <label for="agreed-price">Agreed price (optional)</label>
                <input id="agreed-price" name="agreedPrice" type="number" min="0" step="0.01" placeholder="${esc(b.price)}" />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Submit request</button>
              </div>
            </form>
          `
          }
        </aside>
      </div>
    `;

    const form = main.querySelector('#order-form');
    const typeSel = main.querySelector('#order-type');
    const offeredWrap = main.querySelector('#offered-wrap');
    if (typeSel && offeredWrap) {
      const sync = () => {
        offeredWrap.style.display = typeSel.value === 'exchange' ? 'flex' : 'none';
      };
      typeSel.addEventListener('change', sync);
      sync();
    }
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const type = fd.get('type');
        const payload = {
          book: bookId,
          buyer: u._id,
          type,
          message: fd.get('message') || undefined,
        };
        const ap = fd.get('agreedPrice');
        if (ap) payload.agreedPrice = Number(ap);
        if (type === 'exchange') {
          const ob = fd.get('offeredBook');
          if (!ob) {
            toast('Choose a book to offer in exchange.', true);
            return;
          }
          payload.offeredBook = ob;
        }
        try {
          await api.post('/orders', payload);
          toast('Order request submitted.');
          location.hash = '#/orders';
        } catch (err) {
          toast(err.message, true);
        }
      });
    }
  }

  async function renderRegister(main) {
    const usersRes = await api.get('/users');
    const users = usersRes.data || [];

    main.innerHTML = `
      <h1>Account</h1>
      <p class="page-intro">Demo app: pick an existing profile or register a new user. Passwords are not hashed in this API sample.</p>
      <div class="two-col" style="margin-bottom:2rem">
        <div class="detail-panel">
          <h2>Use existing profile</h2>
          <form id="pick-user" class="form-stack">
            <div class="field">
              <label for="existing">User</label>
              <select id="existing" required>
                <option value="">Select…</option>
                ${users.map((x) => `<option value="${esc(x._id)}">${esc(x.name)} — ${esc(x.email)}</option>`).join('')}
              </select>
            </div>
            <button type="submit" class="btn btn-primary">Continue</button>
          </form>
        </div>
        <div class="detail-panel">
          <h2>Register</h2>
          <form id="reg-form" class="form-stack">
            <div class="field"><label for="r-name">Name</label><input id="r-name" name="name" required maxlength="100" /></div>
            <div class="field"><label for="r-email">Email</label><input id="r-email" name="email" type="email" required /></div>
            <div class="field"><label for="r-pass">Password</label><input id="r-pass" name="password" type="password" minlength="6" required /></div>
            <div class="field"><label for="r-phone">Contact (optional)</label><input id="r-phone" name="contactNumber" placeholder="+1 555 0100" /></div>
            <div class="field"><label for="r-loc">Location (optional)</label><input id="r-loc" name="location" maxlength="100" /></div>
            <div class="field"><label for="r-bio">Bio (optional)</label><textarea id="r-bio" name="bio" maxlength="300"></textarea></div>
            <button type="submit" class="btn btn-primary">Create account</button>
          </form>
        </div>
      </div>
      <p class="muted"><button type="button" class="btn btn-ghost btn-sm" id="sign-out">Sign out</button></p>
    `;

    main.querySelector('#pick-user').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = main.querySelector('#existing').value;
      const sel = users.find((x) => String(x._id) === id);
      if (!sel) return;
      setUser({ _id: sel._id, name: sel.name, email: sel.email });
      toast(`Continuing as ${sel.name}`);
      updateNav();
      location.hash = '#/';
    });

    main.querySelector('#reg-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      try {
        const r = await api.post('/users', body);
        const d = r.data;
        setUser({ _id: d._id, name: d.name, email: d.email });
        toast('Welcome! You are signed in.');
        updateNav();
        location.hash = '#/';
      } catch (err) {
        toast(err.message, true);
      }
    });

    main.querySelector('#sign-out').addEventListener('click', () => {
      setUser(null);
      updateNav();
      toast('Signed out');
      render();
    });
  }

  async function renderListBook(main) {
    const u = getUser();
    if (!u) {
      main.innerHTML = `<div class="empty-state"><h2>Sign in required</h2><p><a class="link" href="#/register">Create or pick a profile</a> before listing a book.</p></div>`;
      return;
    }
    const cats = (await api.get('/categories')).data || [];
    if (!cats.length) {
      main.innerHTML = `
        <h1>List a book</h1>
        <div class="empty-state">
          <p>No categories in the database yet. Create at least one category via <code>POST /api/categories</code> (e.g. name &quot;Fiction&quot;) or seed your MongoDB, then reload this page.</p>
          <p><a class="link" href="#/">Back to browse</a></p>
        </div>`;
      return;
    }

    main.innerHTML = `
      <h1>List a book</h1>
      <p class="page-intro">Create a listing tied to your profile. ISBN must be valid if provided (10 or 13 digits).</p>
      <div class="detail-panel" style="max-width:640px">
        <form id="book-form" class="form-stack">
          <div class="two-col">
            <div class="field"><label for="b-title">Title</label><input id="b-title" name="title" required maxlength="200" /></div>
            <div class="field"><label for="b-author">Author</label><input id="b-author" name="author" required maxlength="150" /></div>
          </div>
          <div class="two-col">
            <div class="field"><label for="b-isbn">ISBN (optional)</label><input id="b-isbn" name="isbn" placeholder="9780306406157" /></div>
            <div class="field"><label for="b-year">Published year</label><input id="b-year" name="publishedYear" type="number" min="1000" max="${new Date().getFullYear()}" /></div>
          </div>
          <div class="field"><label for="b-desc">Description</label><textarea id="b-desc" name="description" maxlength="1000"></textarea></div>
          <div class="two-col">
            <div class="field">
              <label for="b-cat">Category</label>
              <select id="b-cat" name="category" required>
                <option value="">Select…</option>
                ${cats.map((c) => `<option value="${esc(c._id)}">${esc(c.name)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="b-cond">Condition</label>
              <select id="b-cond" name="condition" required>
                ${['new', 'good', 'fair', 'worn'].map((c) => `<option value="${c}">${esc(conditionLabel(c))}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="two-col">
            <div class="field"><label for="b-price">Price</label><input id="b-price" name="price" type="number" min="0" step="0.01" required /></div>
            <div class="field"><label for="b-lang">Language</label><input id="b-lang" name="language" value="English" /></div>
          </div>
          <div class="field">
            <label style="flex-direction:row;align-items:center;gap:0.35rem">
              <input name="isAvailableForExchange" type="checkbox" value="true" /> Available for exchange
            </label>
          </div>
          <div class="field"><label for="b-img">Image URLs (optional, one per line)</label><textarea id="b-img" name="imagesRaw" placeholder="https://…"></textarea></div>
          <input type="hidden" name="seller" value="${esc(u._id)}" />
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Publish listing</button>
            <a href="#/" class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>
    `;

    main.querySelector('#book-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const imagesRaw = fd.get('imagesRaw');
      const images = imagesRaw
        ? String(imagesRaw)
            .split(/\n|,/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const body = {
        title: fd.get('title'),
        author: fd.get('author'),
        category: fd.get('category'),
        condition: fd.get('condition'),
        price: Number(fd.get('price')),
        seller: fd.get('seller'),
        description: fd.get('description') || undefined,
        language: fd.get('language') || 'English',
        isAvailableForExchange: fd.get('isAvailableForExchange') === 'true',
        images,
      };
      const isbn = fd.get('isbn');
      if (isbn && String(isbn).trim()) body.isbn = String(isbn).trim();
      const py = fd.get('publishedYear');
      if (py) body.publishedYear = Number(py);
      try {
        await api.post('/books', body);
        toast('Book listed.');
        location.hash = '#/';
      } catch (err) {
        toast(err.message, true);
      }
    });
  }

  async function renderProfile(main) {
    const u = getUser();
    if (!u) {
      main.innerHTML = `<div class="empty-state"><h2>No profile</h2><p><a class="link" href="#/register">Account</a></p></div>`;
      return;
    }
    const res = await api.get(`/users/${u._id}`);
    const profile = res.data;
    const listed = profile.listedBooks || [];

    main.innerHTML = `
      <h1>Your profile</h1>
      <div class="two-col">
        <div class="detail-panel">
          <h2>Edit details</h2>
          <form id="prof-form" class="form-stack">
            <div class="field"><label for="p-name">Name</label><input id="p-name" name="name" required value="${esc(profile.name)}" /></div>
            <div class="field"><label for="p-phone">Contact</label><input id="p-phone" name="contactNumber" value="${esc(profile.contactNumber || '')}" /></div>
            <div class="field"><label for="p-loc">Location</label><input id="p-loc" name="location" value="${esc(profile.location || '')}" /></div>
            <div class="field"><label for="p-bio">Bio</label><textarea id="p-bio" name="bio" maxlength="300">${esc(profile.bio || '')}</textarea></div>
            <button type="submit" class="btn btn-primary">Save</button>
          </form>
        </div>
        <div class="detail-panel">
          <h2>Your listings</h2>
          ${
            listed.length === 0
              ? '<p class="muted">No books yet. <a href="#/list" class="link">List one</a>.</p>'
              : `<ul class="stack-sm" style="list-style:none;padding:0;margin:0">
                  ${listed
                    .map(
                      (b) =>
                        `<li><a class="link" href="#/book/${esc(b._id)}">${esc(b.title)}</a> — ${formatMoney(b.price)} · ${b.isAvailable ? 'available' : 'sold / held'}</li>`
                    )
                    .join('')}
                </ul>`
          }
        </div>
      </div>
    `;

    main.querySelector('#prof-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const r = await api.put(`/users/${u._id}`, Object.fromEntries(fd.entries()));
        const d = r.data;
        setUser({ _id: d._id, name: d.name, email: d.email });
        toast('Profile updated');
        updateNav();
        render();
      } catch (err) {
        toast(err.message, true);
      }
    });
  }

  async function renderOrders(main) {
    const u = getUser();
    if (!u) {
      main.innerHTML = `<div class="empty-state"><h2>No profile</h2><p><a class="link" href="#/register">Account</a></p></div>`;
      return;
    }
    const [asBuyer, asSeller] = await Promise.all([
      api.get(`/orders?buyer=${encodeURIComponent(u._id)}`),
      api.get(`/orders?seller=${encodeURIComponent(u._id)}`),
    ]);
    const buyerOrders = asBuyer.data || [];
    const sellerOrders = asSeller.data || [];

    function orderBlock(title, list, role) {
      if (!list.length) return `<h2 style="margin-top:1.5rem">${esc(title)}</h2><p class="muted">None yet.</p>`;
      return `
        <h2 style="margin-top:1.5rem">${esc(title)}</h2>
        <div class="order-list">
          ${list
            .map((o) => {
              const book = o.book;
              const other = role === 'buyer' ? o.seller : o.buyer;
              const status = o.status;
              return `
              <div class="order-card" data-order-id="${esc(o._id)}">
                <h3>${book ? esc(book.title) : 'Book'} — <span class="muted">${esc(o.type)}</span></h3>
                <p class="muted" style="margin:0;font-size:0.875rem">
                  ${role === 'buyer' ? 'Seller' : 'Buyer'}: ${other ? esc(other.name) : '—'} · Status: <strong>${esc(status)}</strong>
                </p>
                ${o.offeredBook && o.offeredBook.title ? `<p class="muted" style="font-size:0.875rem">Offered: ${esc(o.offeredBook.title)}</p>` : ''}
                <div class="order-actions">
                  ${
                    role === 'seller' && status === 'pending'
                      ? `<button type="button" class="btn btn-primary btn-sm" data-act="accepted">Accept</button>
                         <button type="button" class="btn btn-ghost btn-sm" data-act="rejected">Reject</button>`
                      : ''
                  }
                  ${
                    role === 'seller' && status === 'accepted'
                      ? `<button type="button" class="btn btn-ghost btn-sm" data-act="completed">Mark completed</button>`
                      : ''
                  }
                  ${role === 'buyer' && status === 'pending' ? `<button type="button" class="btn btn-danger btn-sm" data-del>Cancel request</button>` : ''}
                </div>
              </div>`;
            })
            .join('')}
        </div>
      `;
    }

    main.innerHTML = `
      <h1>Orders</h1>
      <p class="page-intro">As seller you can accept, reject, or complete. Buyers can cancel while pending.</p>
      ${orderBlock('Incoming (you sell)', sellerOrders, 'seller')}
      ${orderBlock('Outgoing (you buy / exchange)', buyerOrders, 'buyer')}
    `;

    main.querySelectorAll('.order-card').forEach((card) => {
      const id = card.getAttribute('data-order-id');
      card.querySelectorAll('[data-act]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const status = btn.getAttribute('data-act');
          try {
            await api.patch(`/orders/${id}/status`, { status });
            toast(`Order ${status}.`);
            render();
          } catch (err) {
            toast(err.message, true);
          }
        });
      });
      const del = card.querySelector('[data-del]');
      if (del) {
        del.addEventListener('click', async () => {
          try {
            await api.del(`/orders/${id}`);
            toast('Order cancelled.');
            render();
          } catch (err) {
            toast(err.message, true);
          }
        });
      }
    });
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('load', () => {
    if (!location.hash) location.hash = '#/';
    else render();
  });
})();
