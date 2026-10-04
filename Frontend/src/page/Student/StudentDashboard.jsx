// pages/Student/StudentDashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StudentDashboard.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function StudentDashboard() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [books, setBooks] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('catalog')

  // Load logged-in student
  useEffect(() => {
    const raw = localStorage.getItem('student')
    if (!raw) {
      navigate('/login')
      return
    }
    setStudent(JSON.parse(raw))
  }, [navigate])

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      const res = await fetch(`${API}/books?${params.toString()}`)
      const data = await res.json()
      if (data.success) setBooks(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/books/categories`)
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } catch (err) { /* ignore */ }
  }

  const fetchRequests = async (studentId) => {
    try {
      const res = await fetch(`${API}/borrows/student/${studentId}`)
      const data = await res.json()
      if (data.success) setRequests(data.data)
    } catch (err) { /* ignore */ }
  }

  useEffect(() => { fetchBooks() }, [search, category])
  useEffect(() => { fetchCategories() }, [])
  useEffect(() => {
    if (student?.id) fetchRequests(student.id)
  }, [student])

  const handleBorrow = async (book) => {
    if (!student) return
    try {
      const res = await fetch(`${API}/borrows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, bookId: book.id })
      })
      const data = await res.json()
      if (data.success) {
        setToast(`Request submitted for "${book.title}" ✔ Awaiting admin approval`)
        fetchRequests(student.id)
      } else {
        setToast(`⚠ ${data.message}`)
      }
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setToast('⚠ Network error')
      setTimeout(() => setToast(''), 3000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('student')
    navigate('/')
  }

  const requestStatusFor = (bookId) => {
    const r = requests.find(r => r.book_id === bookId && ['pending', 'approved'].includes(r.status))
    return r?.status || null
  }

  // Stats for cards
  const stats = {
    totalBooks: books.length,
    available: books.filter(b => b.availableQuantity > 0).length,
    myRequests: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return (
          <div className="panel-row">
            <div className="panel">
              <div className="panel-header">
                <h3>
                  <i className="fas fa-handshake"></i> My Borrow Requests
                </h3>
                <button
                  className="refresh-btn-small"
                  onClick={() => student && fetchRequests(student.id)}
                >
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="no-activity">
                  <i className="fas fa-inbox"></i>
                  <p>No requests yet</p>
                </div>
              ) : (
                <div className="activity-list">
                  {requests.map(r => (
                    <div key={r.id} className={`activity-item ${r.status}`}>
                      <div className={`activity-icon ${r.status === 'approved' ? 'book' : r.status === 'pending' ? 'borrow' : 'student'}`}>
                        <i className={`fas ${
                          r.status === 'approved' ? 'fa-check-circle'
                          : r.status === 'pending' ? 'fa-hourglass-half'
                          : 'fa-times-circle'
                        }`}></i>
                      </div>
                      <div className="activity-info">
                        <span className="activity-user">{r.title}</span>
                        <span className="activity-action">by {r.author}</span>
                      </div>
                      <span className={`sd-badge ${r.status}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className="panel-row">
            <div className="panel">
              <div className="panel-header">
                <h3>
                  <i className="fas fa-user-circle"></i> Profile Information
                </h3>
              </div>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span>Full Name</span>
                  <strong>{student.firstName} {student.lastName}</strong>
                </div>
                <div className="profile-info-item">
                  <span>Student ID</span>
                  <strong>{student.idNumber}</strong>
                </div>
                <div className="profile-info-item">
                  <span>Email</span>
                  <strong>{student.email}</strong>
                </div>
                <div className="profile-info-item">
                  <span>Role</span>
                  <strong>Student</strong>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard
                icon="fa-book"
                value={stats.totalBooks}
                label="Total Books"
                color="blue"
                loading={loading}
              />
              <StatCard
                icon="fa-check-circle"
                value={stats.available}
                label="Available Now"
                color="green"
                loading={loading}
              />
              <StatCard
                icon="fa-handshake"
                value={stats.myRequests}
                label="My Requests"
                color="orange"
                loading={loading}
              />
              <StatCard
                icon="fa-hourglass-half"
                value={stats.pending}
                label="Pending Approval"
                color="purple"
                loading={loading}
              />
            </div>

            {/* Catalog Panel */}
            <div className="panel-row">
              <div className="panel">
                <div className="panel-header">
                  <h3>
                    <i className="fas fa-book-open"></i> Library Catalog
                  </h3>
                  <div className="sd-filters">
                    <input
                      placeholder="Search title, author, ISBN..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="">All Categories</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i> Loading books...
                  </div>
                ) : books.length === 0 ? (
                  <div className="no-activity">
                    <i className="fas fa-inbox"></i>
                    <p>No books found.</p>
                  </div>
                ) : (
                  <div className="sd-grid">
                    {books.map(book => {
                      const free = book.availableQuantity > 0
                      const reqStatus = requestStatusFor(book.id)
                      const disabled = !free || !!reqStatus

                      return (
                        <div key={book.id} className="sd-book">
                          <div className="sd-cover">
                            {book.coverImage
                              ? <img src={book.coverImage} alt={book.title} />
                              : <div className="sd-cover-fallback">{book.title?.[0]}</div>}
                          </div>
                          <div className="sd-book-body">
                            <h3>{book.title}</h3>
                            <p className="sd-author">by {book.author}</p>
                            <p className="sd-meta">
                              <span>{book.category || 'Uncategorized'}</span>
                              <span className={free ? 'ok' : 'no'}>
                                {free ? `${book.availableQuantity} available` : 'Unavailable'}
                              </span>
                            </p>
                            <button
                              className="sd-borrow"
                              disabled={disabled}
                              onClick={() => handleBorrow(book)}
                            >
                              {reqStatus === 'pending' && '⏳ Pending approval'}
                              {reqStatus === 'approved' && '✅ Approved'}
                              {!reqStatus && (free ? 'Borrow' : 'Not available')}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )
    }
  }

  if (!student) return null

  return (
    <div className="dashboard student-dashboard">
      <header className="dashboard-header">
        <div className="logo-area">
          <img src="/logo.jpg" alt="LMS Logo" className="logo-img" />
          <h2>Student Dashboard</h2>
        </div>
        <div className="header-user">
          <span className="header-user-name">
            <i className="fas fa-user-graduate"></i> {student.firstName} {student.lastName}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <TabButton
          active={activeTab === 'catalog'}
          onClick={() => setActiveTab('catalog')}
          icon="fa-book-open"
          label="Catalog"
        />
        <TabButton
          active={activeTab === 'requests'}
          onClick={() => setActiveTab('requests')}
          icon="fa-handshake"
          label="My Requests"
          badge={stats.pending}
        />
        <TabButton
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
          icon="fa-user-circle"
          label="Profile"
        />
      </div>

      <div className="dashboard-content">{renderContent()}</div>

      {toast && <div className="sd-toast">{toast}</div>}
    </div>
  )
}

/* ---------- Small components ---------- */
const StatCard = ({ icon, value, label, color, loading }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="stat-body">
      <span className="stat-number">{loading ? '…' : value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
)

const TabButton = ({ active, onClick, icon, label, badge }) => (
  <button className={`tab-btn ${active ? 'active' : ''}`} onClick={onClick}>
    <i className={`fas ${icon}`}></i> {label}
    {badge > 0 && <span className="tab-badge">{badge}</span>}
  </button>
)

export default StudentDashboard