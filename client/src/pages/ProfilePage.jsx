import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPut } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatMoney } from '../utils/format';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet(`/users/${user._id}`);
        if (!cancelled) setProfile(res.data);
      } catch (e) {
        if (!cancelled) showToast(e.message, true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, showToast]);

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

  if (loading || !profile) return <p className="muted">Loading…</p>;

  const listed = profile.listedBooks || [];

  async function onSave(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const r = await apiPut(`/users/${user._id}`, Object.fromEntries(fd.entries()));
      const d = r.data;
      setUser({ _id: d._id, name: d.name, email: d.email });
      setProfile((p) => ({ ...p, ...d }));
      showToast('Profile updated');
    } catch (err) {
      showToast(err.message, true);
    }
  }

  return (
    <>
      <h1>Your profile</h1>
      <div className="two-col">
        <div className="detail-panel">
          <h2>Edit details</h2>
          <form className="form-stack" onSubmit={onSave}>
            <div className="field">
              <label htmlFor="p-name">Name</label>
              <input id="p-name" name="name" required defaultValue={profile.name} />
            </div>
            <div className="field">
              <label htmlFor="p-phone">Contact</label>
              <input id="p-phone" name="contactNumber" defaultValue={profile.contactNumber || ''} />
            </div>
            <div className="field">
              <label htmlFor="p-loc">Location</label>
              <input id="p-loc" name="location" defaultValue={profile.location || ''} />
            </div>
            <div className="field">
              <label htmlFor="p-bio">Bio</label>
              <textarea id="p-bio" name="bio" maxLength={300} defaultValue={profile.bio || ''} />
            </div>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </form>
        </div>
        <div className="detail-panel">
          <h2>Your listings</h2>
          {listed.length === 0 ? (
            <p className="muted">
              No books yet.{' '}
              <Link to="/list" className="link">
                List one
              </Link>
              .
            </p>
          ) : (
            <ul className="stack-sm" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {listed.map((b) => (
                <li key={b._id}>
                  <Link className="link" to={`/book/${b._id}`}>
                    {b.title}
                  </Link>{' '}
                  — {formatMoney(b.price)} · {b.isAvailable ? 'available' : 'sold / held'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
