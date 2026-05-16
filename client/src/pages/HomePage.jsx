import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGet } from '../api/client';
import BookCard from '../components/BookCard';
import { useToast } from '../context/ToastContext';

const CONDITIONS = ['new', 'good', 'fair', 'worn'];

export default function HomePage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ books: [], total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page') || '1');
  const limit = 12;

  const filters = useMemo(
    () => ({
      category: searchParams.get('category') || '',
      condition: searchParams.get('condition') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      search: searchParams.get('search') || '',
      exchange: searchParams.get('exchange') === '1',
    }),
    [searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('limit', String(limit));
      if (filters.category) qs.set('category', filters.category);
      if (filters.condition) qs.set('condition', filters.condition);
      if (filters.minPrice) qs.set('minPrice', filters.minPrice);
      if (filters.maxPrice) qs.set('maxPrice', filters.maxPrice);
      if (filters.search) qs.set('search', filters.search);
      if (filters.exchange) qs.set('exchange', 'true');

      const [booksRes, catsRes] = await Promise.all([apiGet(`/books?${qs}`), apiGet('/categories')]);
      setData({
        books: booksRes.data || [],
        total: booksRes.total || 0,
        pages: booksRes.pages || 1,
      });
      setCategories(catsRes.data || []);
    } catch (e) {
      showToast(e.message, true);
      setData({ books: [], total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  }, [filters, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  function onFilterSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const next = new URLSearchParams();
    next.set('page', '1');
    if (fd.get('category')) next.set('category', String(fd.get('category')));
    if (fd.get('condition')) next.set('condition', String(fd.get('condition')));
    if (fd.get('minPrice')) next.set('minPrice', String(fd.get('minPrice')).trim());
    if (fd.get('maxPrice')) next.set('maxPrice', String(fd.get('maxPrice')).trim());
    if (fd.get('search')) next.set('search', String(fd.get('search')).trim());
    if (fd.get('exchange')) next.set('exchange', '1');
    setSearchParams(next);
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams());
  }

  function goPage(np) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(np));
    setSearchParams(next);
  }

  const conditionLabel = (c) =>
    ({ new: 'Like new', good: 'Good', fair: 'Fair', worn: 'Worn' })[c] || c;

  if (loading && !data.books.length) {
    return <p className="muted">Loading…</p>;
  }

  return (
    <>
      <h1>Browse listings</h1>
      <p className="page-intro">
        Filter by category, condition, price, or full-text search. Listings marked for exchange can be swapped for one of your
        books.
      </p>

      <form className="toolbar" onSubmit={onFilterSubmit} key={searchParams.toString()}>
        <div className="field">
          <label htmlFor="f-search">Search</label>
          <input id="f-search" name="search" type="search" placeholder="Title, author…" defaultValue={filters.search} />
        </div>
        <div className="field">
          <label htmlFor="f-cat">Category</label>
          <select id="f-cat" name="category" defaultValue={filters.category}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-cond">Condition</label>
          <select id="f-cond" name="condition" defaultValue={filters.condition}>
            <option value="">Any</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {conditionLabel(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-min">Min $</label>
          <input id="f-min" name="minPrice" type="number" min="0" step="0.01" defaultValue={filters.minPrice} />
        </div>
        <div className="field">
          <label htmlFor="f-max">Max $</label>
          <input id="f-max" name="maxPrice" type="number" min="0" step="0.01" defaultValue={filters.maxPrice} />
        </div>
        <div className="field">
          <label htmlFor="f-ex">Exchange</label>
          <label className="inline-check">
            <input id="f-ex" name="exchange" type="checkbox" value="1" defaultChecked={filters.exchange} /> Exchange only
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
        <button type="button" className="btn btn-ghost" onClick={resetFilters}>
          Reset
        </button>
      </form>

      {data.books.length === 0 ? (
        <div className="empty-state">
          <p>No books match your filters.</p>
          <button type="button" className="link" onClick={resetFilters} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="book-grid">
            {data.books.map((b) => (
              <BookCard key={b._id} book={b} />
            ))}
          </div>
          <div className="pagination">
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => goPage(page - 1)}>
              Previous
            </button>
            <span className="muted">
              Page {page} of {data.pages} · {data.total} total
            </span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => goPage(page + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
