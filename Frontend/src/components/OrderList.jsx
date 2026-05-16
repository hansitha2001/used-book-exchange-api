import React, { useEffect, useState } from 'react'
import { post, patch, del } from '../api/client'

export default function OrderList({ orders, books, onRefresh, onMessage }) {
  const [form, setForm] = useState({
    book: books[0]?._id || '',
    type: 'buy',
    offeredBook: '',
    agreedPrice: 0,
    message: '',
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (books.length && !form.book) {
      setForm((prev) => ({ ...prev, book: books[0]._id }))
    }
  }, [books])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const saveOrder = async (event) => {
    event.preventDefault()
    setError(null)
    const result = await post('/orders', {
      book: form.book,
      type: form.type,
      offeredBook: form.offeredBook || undefined,
      agreedPrice: Number(form.agreedPrice),
      message: form.message,
    })
    if (!result.success) {
      setError(result.message || 'Could not create order')
      return
    }
    onRefresh()
    onMessage('Order created successfully.')
    setForm((prev) => ({ ...prev, agreedPrice: 0, message: '' }))
  }

  const updateStatus = async (orderId, status) => {
    const result = await patch(`/orders/${orderId}/status`, { status })
    if (!result.success) {
      onMessage(result.message || 'Could not update order', 'error')
      return
    }
    onRefresh()
    onMessage('Order status updated.')
  }

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return
    const result = await del(`/orders/${orderId}`)
    if (!result.success) {
      onMessage(result.message || 'Could not delete order', 'error')
      return
    }
    onRefresh()
    onMessage('Order removed.')
  }

  return (
    <div>
      <div className="panel-header">
        <h2>Create Order</h2>
      </div>
      <form className="form" onSubmit={saveOrder}>
        <label>
          Book
          <select name="book" value={form.book} onChange={handleChange} required>
            {books.map((book) => (
              <option key={book._id} value={book._id}>{book.title}</option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="buy">buy</option>
            <option value="exchange">exchange</option>
          </select>
        </label>
        {form.type === 'exchange' && (
          <label>
            Offered Book ID
            <input name="offeredBook" value={form.offeredBook} onChange={handleChange} placeholder="Optional book id" />
          </label>
        )}
        <label>
          Agreed Price
          <input type="number" name="agreedPrice" value={form.agreedPrice} onChange={handleChange} min="0" step="0.01" />
        </label>
        <label>
          Message
          <textarea name="message" value={form.message} onChange={handleChange} rows="3" />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Create Order</button>
      </form>

      <div className="panel-header">
        <h2>Order List</h2>
      </div>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="list-grid">
          {orders.map((order) => (
            <article key={order._id} className="card">
              <h3>{order.book?.title || 'Unknown book'}</h3>
              <p className="meta">Type: {order.type} · Status: {order.status}</p>
              <p>Buyer: {order.buyer?.name || order.buyer || 'Anonymous'}</p>
              <p>Seller: {order.seller?.name || order.seller || 'Unknown'}</p>
              <p>Price: ${order.agreedPrice ?? order.book?.price ?? 0}</p>
              <div className="card-actions">
                <button onClick={() => updateStatus(order._id, 'accepted')}>Accept</button>
                <button onClick={() => updateStatus(order._id, 'rejected')}>Reject</button>
                <button className="danger" onClick={() => deleteOrder(order._id)}>Cancel</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
