import React, { useEffect, useState } from 'react'
import BookList from './components/BookList'
import BookForm from './components/BookForm'
import CategoryList from './components/CategoryList'
import OrderList from './components/OrderList'
import './index.css'

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function App() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('books')
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchBooks = async () => {
    setLoading(true)
    const res = await fetch(`${apiBase}/books`)
    const data = await res.json()
    setBooks(data.data || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const res = await fetch(`${apiBase}/categories`)
    const data = await res.json()
    setCategories(data.data || [])
  }

  const fetchOrders = async () => {
    const res = await fetch(`${apiBase}/orders`)
    const data = await res.json()
    setOrders(data.data || [])
  }

  useEffect(() => {
    fetchBooks()
    fetchCategories()
    fetchOrders()
  }, [])

  const handleSelectBook = (book) => {
    setSelectedBook(book)
    setActiveTab('books')
  }

  const handleRefresh = () => {
    fetchBooks()
    fetchCategories()
    fetchOrders()
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="app">
      <header>
        <h1>Used Book Exchange</h1>
      </header>

      <div className="tabs">
        <button className={activeTab === 'books' ? 'active' : ''} onClick={() => setActiveTab('books')}>
          Books
        </button>
        <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
          Categories
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          Orders
        </button>
      </div>

      {message && <div className={`toast ${message.type}`}>{message.text}</div>}

      {activeTab === 'books' && (
        <div className="grid">
          <section className="panel">
            <BookForm
              categories={categories}
              book={selectedBook}
              onSaved={() => {
                handleRefresh()
                setSelectedBook(null)
                showMessage('Book saved successfully.')
              }}
              onCancelled={() => setSelectedBook(null)}
            />
          </section>
          <section className="panel">
            <BookList
              books={books}
              categories={categories}
              onEdit={handleSelectBook}
              onDeleted={() => {
                fetchBooks()
                showMessage('Book deleted successfully.')
              }}
            />
          </section>
        </div>
      )}

      {activeTab === 'categories' && (
        <section className="panel">
          <CategoryList categories={categories} onRefresh={fetchCategories} onMessage={showMessage} />
        </section>
      )}

      {activeTab === 'orders' && (
        <section className="panel">
          <OrderList orders={orders} books={books} categories={categories} onRefresh={fetchOrders} onMessage={showMessage} />
        </section>
      )}
    </div>
  )
}
