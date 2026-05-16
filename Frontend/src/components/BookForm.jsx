import React, { useEffect, useState } from 'react'
import { post, put } from '../api/client'

const initialForm = {
  title: '',
  author: '',
  isbn: '',
  description: '',
  category: '',
  condition: 'good',
  price: 0,
  isAvailableForExchange: false,
  images: '',
  language: 'English',
  publishedYear: new Date().getFullYear(),
}

export default function BookForm({ categories, book, onSaved, onCancelled }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        description: book.description || '',
        category: book.category?._id || book.category || '',
        condition: book.condition || 'good',
        price: book.price || 0,
        isAvailableForExchange: book.isAvailableForExchange || false,
        images: (book.images || []).join(', '),
        language: book.language || 'English',
        publishedYear: book.publishedYear || new Date().getFullYear(),
      })
      setError(null)
    } else {
      setForm(initialForm)
    }
  }, [book])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const payload = {
      ...form,
      price: Number(form.price),
      publishedYear: Number(form.publishedYear),
      images: form.images ? form.images.split(',').map((item) => item.trim()).filter(Boolean) : [],
    }

    const response = book? await put(`/books/${book._id}`, payload) : await post('/books', payload)
    setIsSubmitting(false)

    if (!response.success) {
      setError(response.message || 'Unable to save book')
      return
    }
    onSaved()
    setForm(initialForm)
  }

  return (
    <div>
      <div className="panel-header">
        <h2>{book ? 'Edit book' : 'Add a new book'}</h2>
        {book && <button className="secondary" onClick={onCancelled}>Cancel</button>}
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Author
          <input name="author" value={form.author} onChange={handleChange} required />
        </label>
        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </label>
        <label>
          Condition
          <select name="condition" value={form.condition} onChange={handleChange} required>
            <option value="new">new</option>
            <option value="good">good</option>
            <option value="fair">fair</option>
            <option value="worn">worn</option>
          </select>
        </label>
        <label>
          Price
          <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" required />
        </label>
        <label>
          Available for exchange
          <input type="checkbox" name="isAvailableForExchange" checked={form.isAvailableForExchange} onChange={handleChange} />
        </label>
        <label>
          Images (comma-separated URLs)
          <input name="images" value={form.images} onChange={handleChange} />
        </label>
        <label>
          Language
          <input name="language" value={form.language} onChange={handleChange} />
        </label>
        <label>
          Published Year
          <input type="number" name="publishedYear" value={form.publishedYear} onChange={handleChange} min="1000" max={new Date().getFullYear()} />
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>{book ? 'Update book' : 'Save book'}</button>
      </form>
    </div>
  )
}
