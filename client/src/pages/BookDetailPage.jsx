import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState('buy');
  const [offeredBook, setOfferedBook] = useState('');
  const [message, setMessage] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/books/${id}`);
        if (!cancelled) setBook(res.data);
      } catch (e) {
        if (!cancelled) {
          showToast(e.message, true);
          setBook(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, showToast]);

  useEffect(() => {
    if (!user?._id) {
      setMyBooks([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const ur = await apiGet(`/users/${user._id}`);
        const listed = ur.data?.listedBooks || [];
        const filtered = listed.filter((x) => x.isAvailable && String(x._id) !== String(id));
        if (!cancelled) setMyBooks(filtered);
      } catch {
        if (!cancelled) setMyBooks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  async function submitOrder(e) {
    e.preventDefault();
    if (!user) return;
    const payload = {
      book: id,
      buyer: user._id,
      type: orderType,
      message: message.trim() || undefined,
    };
    if (agreedPrice.trim()) payload.agreedPrice = Number(agreedPrice);
    if (orderType === 'exchange') {
      if (!offeredBook) {
        showToast('Choose a book to offer in exchange.', true);
        return;
      }
      payload.offeredBook = offeredBook;
    }
    try {
      await apiPost('/orders', payload);
      showToast('Order request submitted.');
      navigate('/orders');
    } catch (err) {
      showToast(err.message, true);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;
  if (!book) {
    return (
      <div className="empty-state">
        <p>Book not found.</p>
        <Link to="/" className="link">
          Back to browse
        </Link>
      </div>
    );
  }

  const img = book.images?.[0];
  const isOwn = user && sellerId(book.seller) === String(user._id);
  const canOrder = book.isAvailable && user && !isOwn;

  return (
    <>
      <p className="muted">
        <Link to="/" className="link">
          ← Back to browse
        </Link>
      </p>
      <div className="detail-layout">
        <div>
          <div className="detail-hero">
            {img ? <img src={img} alt="" /> : <span className="detail-hero-placeholder">📚</span>}
          </div>
          <div className="detail-panel" style={{ marginTop: '1.25rem' }}>
            <h1 style={{ marginBottom: '0.25rem' }}>{book.title}</h1>
            <p className="muted" style={{ margin: '0 0 1rem' }}>
              by {book.author}
              {book.publishedYear ? ` · ${book.publishedYear}` : ''}
              {book.language ? ` · ${book.language}` : ''}
            </p>
            <div className="badges" style={{ marginBottom: '1rem' }}>
              <span className="badge badge-condition">{conditionLabel(book.condition)}</span>
              {book.isAvailableForExchange ? <span className="badge badge-exchange">Open to exchange</span> : null}
              {!book.isAvailable ? <span className="badge">Unavailable</span> : null}
            </div>
            {book.description ? <p>{book.description}</p> : null}
            {book.isbn ? (
              <p className="muted" style={{ fontSize: '0.875rem' }}>
                ISBN: {book.isbn}
              </p>
            ) : null}
          </div>
        </div>
        <aside className="detail-panel">
          <p className="price" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            {formatMoney(book.price)}
          </p>
          <div className="stack-sm muted" style={{ marginBottom: '1rem', fontSize: '0.9375rem' }}>
            <span>
              Seller: <strong style={{ color: 'var(--ink)' }}>{book.seller?.name}</strong>
            </span>
            {book.seller?.location ? <span>{book.seller.location}</span> : null}
            {book.seller?.contactNumber ? <span>{book.seller.contactNumber}</span> : null}
          </div>

          {!book.isAvailable ? <p className="muted">This listing is not available.</p> : null}
          {!user ? (
            <p className="muted">
              Select or create a profile under <Link to="/register">Account</Link> to place an order.
            </p>
          ) : null}
          {isOwn ? <p className="muted">This is your listing.</p> : null}

          {canOrder ? (
            <form className="form-stack" onSubmit={submitOrder}>
              <div className="field">
                <label htmlFor="order-type">Request type</label>
                <select
                  id="order-type"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  required
                >
                  <option value="buy">Purchase</option>
                  <option value="exchange" disabled={!book.isAvailableForExchange}>
                    Exchange {!book.isAvailableForExchange ? '(not offered)' : ''}
                  </option>
                </select>
              </div>
              {orderType === 'exchange' ? (
                <div className="field">
                  <label htmlFor="offered-book">Your book to offer</label>
                  <select id="offered-book" value={offeredBook} onChange={(e) => setOfferedBook(e.target.value)} required>
                    <option value="">Select…</option>
                    {myBooks.map((bk) => (
                      <option key={bk._id} value={bk._id}>
                        {bk.title} — {conditionLabel(bk.condition)}
                      </option>
                    ))}
                  </select>
                  <p className="muted" style={{ fontSize: '0.8125rem', margin: 0 }}>
                    List a book first if you have nothing to trade.
                  </p>
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="order-msg">Message (optional)</label>
                <textarea id="order-msg" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Pickup preference, timing…" />
              </div>
              <div className="field">
                <label htmlFor="agreed-price">Agreed price (optional)</label>
                <input
                  id="agreed-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={String(book.price)}
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Submit request
                </button>
              </div>
            </form>
          ) : null}
        </aside>
      </div>
    </>
  );
}
