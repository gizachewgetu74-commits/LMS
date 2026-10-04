// pages/Admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import StudentManagement from './StudentManagemnt'
import BookManagement from './BookManagement'
import BorrowRequests from './BorrowRequests'
import './AdminDashboard.css'

const API = 'http://localhost:5000/api'

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    booksBorrowed: 0,
    overdue: 0,
    pendingRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true)

      const [bookStatsRes, studentsRes, requestsRes] = await Promise.all([
        axios.get(`${API}/books/stats`),
        axios.get(`${API}/students`),
        axios.get(`${API}/borrows`).catch(() => ({ data: { data: [] } })),
      ])

      const bookStats = bookStatsRes.data.data
      const totalMembers = studentsRes.data.count || 0
      const allRequests = requestsRes.data.data || []
      const pending = allRequests.filter(r => r.status === 'pending').length
      const approved = allRequests.filter(r => r.status === 'approved').length

      setPendingCount(pending)
      setStats({
        totalBooks: bookStats.totalBooks || 0,
        totalMembers,
        booksBorrowed: approved,
        overdue: 0,
        pendingRequests: pending,
      })

      generateRecentActivity(allRequests)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Build recent activity feed
  const generateRecentActivity = async (requests = []) => {
    try {
      const [studentsRes, booksRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/books`),
      ])

      const recentStudents = studentsRes.data.data?.slice(0, 3) || []
      const recentBooks = booksRes.data.data?.slice(0, 2) || []

      const activities = []

      recentStudents.forEach((s, i) => {
        activities.push({
          id: `student-${i}`,
          user: `${s.firstName} ${s.lastName}`,
          action: `Registered as new student (ID: ${s.idNumber})`,
          time: s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Recently',
          type: 'student',
        })
      })

      recentBooks.forEach((b, i) => {
        activities.push({
          id: `book-${i}`,
          user: 'System',
          action: `Added new book: "${b.title}" by ${b.author}`,
          time: b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Recently',
          type: 'book',
        })
      })

      requests.slice(0, 3).forEach((r, i) => {
        activities.push({
          id: `req-${i}`,
          user: `${r.firstName || 'Student'} ${r.lastName || ''}`.trim(),
          action: `Requested "${r.title}" — status: ${r.status}`,
          time: r.requested_at ? new Date(r.requested_at).toLocaleString() : 'Recently',
          type: 'borrow',
        })
      })

      activities.sort((a, b) => new Date(b.time) - new Date(a.time))
      setRecentActivity(activities.slice(0, 6))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentManagement />
      case 'books':
        return <BookManagement />
      case 'requests':
        return <BorrowRequests onUpdate={fetchStats} />
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
                icon="fa-users"
                value={stats.totalMembers}
                label="Total Members"
                color="green"
                loading={loading}
              />
              <StatCard
                icon="fa-handshake"
                value={stats.booksBorrowed}
                label="Books Borrowed"
                color="orange"
                loading={loading}
              />
              <StatCard
                icon="fa-hourglass-half"
                value={stats.pendingRequests}
                label="Pending Requests"
                color="purple"
                loading={loading}
              />
            </div>

            {/* Recent Activity */}
            <div className="panel-row">
              <div className="panel">
                <div className="panel-header">
                  <h3>
                    <i className="fas fa-clock"></i> Recent Activity
                  </h3>
                  <button
                    className="refresh-btn-small"
                    onClick={fetchStats}
                    disabled={loading}
                  >
                    <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                    {loading ? ' Refreshing...' : ' Refresh'}
                  </button>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i> Loading activities...
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="activity-list">
                    {recentActivity.map((a) => (
                      <div key={a.id} className={`activity-item ${a.type}`}>
                        <div className={`activity-icon ${a.type}`}>
                          <i className={`fas ${
                            a.type === 'student' ? 'fa-user-graduate'
                            : a.type === 'book' ? 'fa-book'
                            : a.type === 'borrow' ? 'fa-handshake'
                            : 'fa-cog'
                          }`}></i>
                        </div>
                        <div className="activity-info">
                          <span className="activity-user">{a.user}</span>
                          <span className="activity-action">{a.action}</span>
                        </div>
                        <span className="activity-time">{a.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-activity">
                    <i className="fas fa-inbox"></i>
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="dashboard admin-dashboard">
      <header className="dashboard-header">
        <div className="logo-area">
          <img src="/logo.jpg" alt="LMS Logo" className="logo-img" />
          <h2>Admin Dashboard</h2>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </header>

      <div className="admin-tabs">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="fa-chart-pie" label="Overview" />
        <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon="fa-user-graduate" label="Students" />
        <TabButton active={activeTab === 'books'} onClick={() => setActiveTab('books')} icon="fa-book" label="Books" />
        <TabButton
          active={activeTab === 'requests'}
          onClick={() => setActiveTab('requests')}
          icon="fa-handshake"
          label="Borrow Requests"
          badge={pendingCount}
        />
      </div>

      <div className="dashboard-content">{renderContent()}</div>
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

export default AdminDashboard