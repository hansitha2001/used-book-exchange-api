import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiDelete, apiGet, apiPatch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const [asBuyer, asSeller] = await Promise.all([
        apiGet(`/orders?buyer=${encodeURIComponent(user._id)}`),
        apiGet(`/orders?seller=${encodeURIComponent(user._id)}`),
      ]);
      setBuyerOrders(asBuyer.data || []);
      setSellerOrders(asSeller.data || []);
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  async function setStatus(id, status) {
    try {
      await apiPatch(`/orders/${id}/status`, { status });
      showToast(`Order ${status}.`);
      load();
    } catch (e) {
      showToast(e.message, true);
    }
  }

  async function cancelOrder(id) {
    try {
      await apiDelete(`/orders/${id}`);
      showToast('Order cancelled.');
      load();
    } catch (e) {
      showToast(e.message, true);
    }
  }

  if (!user) {
    return (
      <div className="empty-state">
        <h2>No profile</h2>
        <p>
          <Link className="link" to="/register">
            Account
          </Link>
        </p>
      </div>
    );
  }

  if (loading) return <p className="muted">Loading…</p>;

  function renderList(title, list, role) {
    if (!list.length) {
      return (
        <>
          <h2 style={{ marginTop: '1.5rem' }}>{title}</h2>
          <p className="muted">None yet.</p>
        </>
      );
    }
    return (
      <>
        <h2 style={{ marginTop: '1.5rem' }}>{title}</h2>
        <div className="order-list">
          {list.map((o) => {
            const book = o.book;
            const other = role === 'buyer' ? o.seller : o.buyer;
            const status = o.status;
            return (
              <div key={o._id} className="order-card">
                <h3>
                  {book?.title ?? 'Book'} — <span className="muted">{o.type}</span>
                </h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                  {role === 'buyer' ? 'Seller' : 'Buyer'}: {other?.name ?? '—'} · Status: <strong>{status}</strong>
                </p>
                {o.offeredBook?.title ? (
                  <p className="muted" style={{ fontSize: '0.875rem' }}>
                    Offered: {o.offeredBook.title}
                  </p>
                ) : null}
                <div className="order-actions">
                  {role === 'seller' && status === 'pending' ? (
                    <>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(o._id, 'accepted')}>
                        Accept
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus(o._id, 'rejected')}>
                        Reject
                      </button>
                    </>
                  ) : null}
                  {role === 'seller' && status === 'accepted' ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus(o._id, 'completed')}>
                      Mark completed
                    </button>
                  ) : null}
                  {role === 'buyer' && status === 'pending' ? (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => cancelOrder(o._id)}>
                      Cancel request
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Orders</h1>
      <p className="page-intro">As seller you can accept, reject, or complete. Buyers can cancel while an order is still pending.</p>
      {renderList('Incoming (you sell)', sellerOrders, 'seller')}
      {renderList('Outgoing (you buy / exchange)', buyerOrders, 'buyer')}
    </>
  );
}
