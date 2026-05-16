import React from 'react'
import { del } from '../api/client'

export default function BookList({ books, categories, onEdit, onDeleted }) {
  const getCategoryName = (catId) => {
    const category = categories.find((item) => item._id === catId)
    return category ? category.name : 'Unknown'
  }

  const handleDelete = async (bookId) => {
    if (!window.confirm('Delete this book?')) return
    const result = await del(`/books/${bookId}`)
    if (result.success) {
      onDeleted()
    } else {
      alert(result.message || 'Unable to delete book')
    }
  }

  return (
    <div>
      <div className="panel-header">
        <h2>Book Listings</h2>
        <p>{books.length} books found</p>
      </div>
      {books.length === 0 ? (
        <p>No books available yet. Add one using the form.</p>
      ) : (
        <div className="list-grid">
          {books.map((book) => (
            <article key={book._id} className="card">
              <div className="card-body">
                <h3>{book.title}</h3>
                <p className="meta">{book.author} · {getCategoryName(book.category?._id || book.category)}</p>
                <p>{book.description || 'No description provided.'}</p>
                <p className="meta">Condition: {book.condition} · Price: ${book.price.toFixed(2)}</p>
                <p className="meta">Status: {book.isAvailable ? 'Available' : 'Sold'}</p>
              </div>
              <div className="card-actions">
                <button onClick={() => onEdit(book)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(book._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
