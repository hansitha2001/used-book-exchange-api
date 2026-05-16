import React, { useEffect, useState } from 'react'
import { get, post, put, del } from '../api/client'

export default function CategoryList({ categories, onRefresh, onMessage }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!categories.length) onRefresh()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitCategory = async (event) => {
    event.preventDefault()
    setError(null)
    const result = editing
      ? await put(`/categories/${editing._id}`, form)
      : await post('/categories', form)
    if (!result.success) {
      setError(result.message || 'Could not save category')
      return
    }
    setForm({ name: '', description: '' })
    setEditing(null)
    onRefresh()
    onMessage(editing ? 'Category updated.' : 'Category created.')
  }

  const editCategory = (category) => {
    setEditing(category)
    setForm({ name: category.name, description: category.description || '' })
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    const result = await del(`/categories/${id}`)
    if (!result.success) {
      onMessage(result.message || 'Could not delete category.', 'error')
      return
    }
    onRefresh()
    onMessage('Category deleted.')
  }

  return (
    <div>
      <div className="panel-header">
        <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
      </div>
      <form className="form" onSubmit={submitCategory}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); }}>Cancel</button>}
        </div>
      </form>

      <div className="list-grid">
        {categories.map((category) => (
          <article key={category._id} className="card">
            <h3>{category.name}</h3>
            <p>{category.description || 'No description'}</p>
            <div className="card-actions">
              <button onClick={() => editCategory(category)}>Edit</button>
              <button className="danger" onClick={() => deleteCategory(category._id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
