import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { conditionLabel } from '../utils/format';

const CONDITIONS = ['new', 'good', 'fair', 'worn'];

export default function ListBookPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiGet('/categories')
      .then((r) => setCategories(r.data || []))
      .catch((e) => showToast(e.message, true));
  }, [showToast]);

  if (!user) {
    return (
      <div className="empty-state">
        <h2>Sign in required</h2>
        <p>
          <Link className="link" to="/register">
            Create or pick a profile
          </Link>{' '}
          before listing a book.
        </p>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <>
        <h1>List a book</h1>
        <div className="empty-state">
          <p>
            No categories in the database yet. Create at least one category (e.g. POST <code>/api/categories</code> with{' '}
            <code>{`{ "name": "Fiction" }`}</code>), then reload.
          </p>
          <p>
            <Link to="/" className="link">
              Back to browse
            </Link>
          </p>
        </div>
      </>
    );
  }

  async function onSubmit(e) {
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
      seller: user._id,
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
      await apiPost('/books', body);
      showToast('Book listed.');
      navigate('/');
    } catch (err) {
      showToast(err.message, true);
    }
  }

  const year = new Date().getFullYear();

  return (
    <>
      <h1>List a book</h1>
      <p className="page-intro">ISBN is optional; if provided it must match the API validation (10 or 13 digits).</p>
      <div className="detail-panel" style={{ maxWidth: 640 }}>
        <form className="form-stack" onSubmit={onSubmit}>
          <div className="two-col">
            <div className="field">
              <label htmlFor="b-title">Title</label>
              <input id="b-title" name="title" required maxLength={200} />
            </div>
            <div className="field">
              <label htmlFor="b-author">Author</label>
              <input id="b-author" name="author" required maxLength={150} />
            </div>
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="b-isbn">ISBN (optional)</label>
              <input id="b-isbn" name="isbn" placeholder="9780306406157" />
            </div>
            <div className="field">
              <label htmlFor="b-year">Published year</label>
              <input id="b-year" name="publishedYear" type="number" min={1000} max={year} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="b-desc">Description</label>
            <textarea id="b-desc" name="description" maxLength={1000} />
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="b-cat">Category</label>
              <select id="b-cat" name="category" required defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="b-cond">Condition</label>
              <select id="b-cond" name="condition" required>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {conditionLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="b-price">Price</label>
              <input id="b-price" name="price" type="number" min="0" step="0.01" required />
            </div>
            <div className="field">
              <label htmlFor="b-lang">Language</label>
              <input id="b-lang" name="language" defaultValue="English" />
            </div>
          </div>
          <div className="field">
            <label className="inline-check">
              <input name="isAvailableForExchange" type="checkbox" value="true" /> Available for exchange
            </label>
          </div>
          <div className="field">
            <label htmlFor="b-img">Image URLs (optional, one per line)</label>
            <textarea id="b-img" name="imagesRaw" placeholder="https://…" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Publish listing
            </button>
            <Link to="/" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
