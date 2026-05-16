import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiGet('/users')
      .then((r) => setUsers(r.data || []))
      .catch((e) => showToast(e.message, true));
  }, [showToast]);

  function pickUser(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = fd.get('userId');
    const sel = users.find((x) => String(x._id) === id);
    if (!sel) return;
    setUser({ _id: sel._id, name: sel.name, email: sel.email });
    showToast(`Continuing as ${sel.name}`);
    navigate('/');
  }

  async function register(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    try {
      const r = await apiPost('/users', body);
      const d = r.data;
      setUser({ _id: d._id, name: d.name, email: d.email });
      showToast('Welcome! You are signed in.');
      navigate('/');
    } catch (err) {
      showToast(err.message, true);
    }
  }

  return (
    <>
      <h1>Account</h1>
      <p className="page-intro">
        Demo: pick an existing profile or register. The API stores passwords in plain text in this sample — do not use real
        secrets.
      </p>

      <div className="two-col" style={{ marginBottom: '2rem' }}>
        <div className="detail-panel">
          <h2>Use existing profile</h2>
          <form className="form-stack" onSubmit={pickUser}>
            <div className="field">
              <label htmlFor="existing">User</label>
              <select id="existing" name="userId" required defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                {users.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.name} — {x.email}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Continue
            </button>
          </form>
        </div>

        <div className="detail-panel">
          <h2>Register</h2>
          <form className="form-stack" onSubmit={register}>
            <div className="field">
              <label htmlFor="r-name">Name</label>
              <input id="r-name" name="name" required maxLength={100} />
            </div>
            <div className="field">
              <label htmlFor="r-email">Email</label>
              <input id="r-email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="r-pass">Password</label>
              <input id="r-pass" name="password" type="password" minLength={6} required />
            </div>
            <div className="field">
              <label htmlFor="r-phone">Contact (optional)</label>
              <input id="r-phone" name="contactNumber" placeholder="+1 555 0100" />
            </div>
            <div className="field">
              <label htmlFor="r-loc">Location (optional)</label>
              <input id="r-loc" name="location" maxLength={100} />
            </div>
            <div className="field">
              <label htmlFor="r-bio">Bio (optional)</label>
              <textarea id="r-bio" name="bio" maxLength={300} />
            </div>
            <button type="submit" className="btn btn-primary">
              Create account
            </button>
          </form>
        </div>
      </div>

      <p className="muted">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setUser(null);
            showToast('Signed out');
          }}
        >
          Sign out
        </button>
        {user ? (
          <span style={{ marginLeft: '0.75rem' }}>
            Active: <strong>{user.name}</strong>
          </span>
        ) : null}
      </p>
      <p>
        <Link to="/" className="link">
          Back to browse
        </Link>
      </p>
    </>
  );
}
