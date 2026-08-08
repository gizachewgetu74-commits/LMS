// pages/Admin/Dashboard.jsx (Updated with StudentManagement import)
import { useState } from 'react'
import StudentManagement from './StudentManagemnt'
function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats] = useState({
    totalBooks: 2841,
    totalMembers: 346,
    booksBorrowed: 124,
    overdue: 18,
  })

  const [recentActivity] = useState([
    { id: 1, user: 'Alice Johnson', action: 'Borrowed "Dune"', time: '2 min ago' },
    { id: 2, user: 'Bob Smith', action: 'Returned "1984"', time: '15 min ago' },
    { id: 3, user: 'Carol White', action: 'Registered new member', time: '1 hour ago' },
    { id: 4, user: 'David Brown', action: 'Overdue: "The Great Gatsby"', time: '3 hours ago' },
  ])

  const renderContent = () => {
    switch(activeTab) {
      case 'students':
        return <StudentManagement />
      case 'books':
        return <BookManagement />
      default:
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <i className="fas fa-book"></i>
                <span className="stat-number">{stats.totalBooks}</span>
                <span className="stat-label">Total Books</span>
              </div>
              <div className="stat-card">
                <i className="fas fa-users"></i>
                <span className="stat-number">{stats.totalMembers}</span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat-card">
                <i className="fas fa-handshake"></i>
                <span className="stat-number">{stats.booksBorrowed}</span>
                <span className="stat-label">Borrowed</span>
              </div>
              <div className="stat-card">
                <i className="fas fa-exclamation-triangle"></i>
                <span className="stat-number">{stats.overdue}</span>
                <span className="stat-label">Overdue</span>
              </div>
            </div>

            <div className="panel-row">
              <div className="panel">
                <h3><i className="fas fa-clock"></i> Recent Activity</h3>
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-info">
                        <span className="activity-user">{activity.user}</span>
                        <span className="activity-action">{activity.action}</span>
                      </div>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))}
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