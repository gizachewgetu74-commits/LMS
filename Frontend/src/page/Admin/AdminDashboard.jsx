// pages/Admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import StudentManagement from './StudentManagemnt'
import BookManagement from './BookManagement'

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    booksBorrowed: 0,
    overdue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch book stats
      const bookStatsResponse = await axios.get('http://localhost:5000/api/books/stats')
      const bookStats = bookStatsResponse.data.data
      
      // Fetch student count
      const studentsResponse = await axios.get('http://localhost:5000/api/students')
      const totalMembers = studentsResponse.data.count || 0
      
      // Update stats with real data
      setStats({
        totalBooks: bookStats.totalBooks || 0,
        totalMembers: totalMembers,
        booksBorrowed: bookStats.totalBooks - bookStats.availableBooks || 0,
        overdue: 0, // Will implement later with borrowing system
      })
      
      // Generate recent activity (will be replaced with real data later)
      generateRecentActivity()
      
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback to default values if API fails
      setStats({
        totalBooks: 0,
        totalMembers: 0,
        booksBorrowed: 0,
        overdue: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate recent activity (placeholder - will be replaced with real activity data)
  const generateRecentActivity = async () => {
    try {
      // Fetch recent students
      const studentsResponse = await axios.get('http://localhost:5000/api/students')
      const recentStudents = studentsResponse.data.data?.slice(0, 3) || []
      
      // Fetch recent books
      const booksResponse = await axios.get('http://localhost:5000/api/books')
      const recentBooks = booksResponse.data.data?.slice(0, 2) || []
      
      // Create activity items
      const activities = []
      
      // Add student registrations
      recentStudents.forEach((student, index) => {
        activities.push({
          id: `student-${index}`,
          user: `${student.firstName} ${student.lastName}`,
          action: `Registered as new student (ID: ${student.idNumber})`,
          time: new Date(student.createdAt).toLocaleString(),
          type: 'student'
        })
      })
      
      // Add book additions
      recentBooks.forEach((book, index) => {
        activities.push({
          id: `book-${index}`,
          user: 'System',
          action: `Added new book: "${book.title}" by ${book.author}`,
          time: new Date(book.createdAt).toLocaleString(),
          type: 'book'
        })
      })
      
      // Sort by time (newest first)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time))
      
      setRecentActivity(activities.slice(0, 5)) // Show latest 5 activities
      
    } catch (error) {
      console.error('Error generating activity:', error)
      // Set default activities
      setRecentActivity([
        { id: 1, user: 'System', action: 'Dashboard loaded', time: new Date().toLocaleString(), type: 'system' }
      ])
    }
  }

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    fetchStats()
    
    const interval = setInterval(() => {
      fetchStats()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'students':
        return <StudentManagement />
      case 'books':
        return <BookManagement />
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <i className="fas fa-book"></i>
                <span className="stat-number">{loading ? '...' : stats.totalBooks}</span>
                <span className="stat-label">Total Books</span>
              </div>
              <div className="stat-card">
                <i className="fas fa-users"></i>
                <span className="stat-number">{loading ? '...' : stats.totalMembers}</span>
                <span className="stat-label">Total Members</span>
              </div>
              <div className="stat-card">
                <i className="fas fa-handshake"></i>
                <span className="stat-number">{loading ? '...' : stats.booksBorrowed}</span>
                <span className="stat-label">Books Borrowed</span>
              </div>
              <div className="stat-card">
                <i className="fas fa-exclamation-triangle"></i>
                <span className="stat-number">{loading ? '...' : stats.overdue}</span>
                <span className="stat-label">Overdue Books</span>
              </div>
            </div>

            {/* Recent Activity Panel */}
            <div className="panel-row">
              <div className="panel">
                <h3><i className="fas fa-clock"></i> Recent Activity</h3>
                {loading ? (
                  <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i> Loading activities...
                  </div>
                ) : (
                  <div className="activity-list">
                    {recentActivity.length > 0 ? (
                      recentActivity.map(activity => (
                        <div key={activity.id} className="activity-item">
                          <div className="activity-info">
                            <span className="activity-user">
                              {activity.type === 'student' && <i className="fas fa-user-graduate"></i>}
                              {activity.type === 'book' && <i className="fas fa-book"></i>}
                              {activity.type === 'system' && <i className="fas fa-cog"></i>}
                              {activity.user}
                            </span>
                            <span className="activity-action">{activity.action}</span>
                          </div>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="no-activity">
                        <i className="fas fa-inbox"></i>
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Refresh button */}
                <div className="panel-footer">
                  <button 
                    className="refresh-btn-small" 
                    onClick={fetchStats}
                    disabled={loading}
                  >
                    <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                    {loading ? ' Refreshing...' : ' Refresh'}
                  </button>
                </div>
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
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-chart-pie"></i> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <i className="fas fa-user-graduate"></i> Student Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <i className="fas fa-book"></i> Book Management
        </button>
      </div>

      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminDashboard