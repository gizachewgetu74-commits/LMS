// pages/Admin/BorrowRequests.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

function BorrowRequests({ onUpdate }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [toast, setToast] = useState('')

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/borrows`)
      setRequests(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const decide = async (id, status) => {
    try {
      await axios.put(`${API}/borrows/${id}/decide`, { status })
      showToast(`Request ${status} ✔`)
      fetchRequests()
      onUpdate?.()
    } catch (err) {
      showToast('⚠ Failed to update request')
    }
  }

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <div className="br-wrapper">
      <div className="br-header">
        <h3><i className="fas fa-handshake"></i> Borrow Requests</h3>
        <div className="br-filters">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button
              key={f}
              className={`br-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="br-count">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="br-loading">
          <i className="fas fa-spinner fa-spin"></i> Loading requests…
        </div>
      ) : filtered.length === 0 ? (
        <div className="br-empty">
          <i className="fas fa-inbox"></i>
          <p>No {filter !== 'all' ? filter : ''} requests</p>
        </div>
      ) : (
        <div className="br-list">
          {filtered.map(r => (
            <div key={r.id} className={`br-card ${r.status}`}>
              <div className="br-card-left">
                <div className="br-avatar">
                  {(r.firstName?.[0] || '?')}{(r.lastName?.[0] || '')}
                </div>
                <div className="br-student">
                  <strong>{r.firstName} {r.lastName}</strong>
                  <small>{r.email}</small>
                  <small className="br-id">ID: {r.idNumber}</small>
                </div>
              </div>

              <div className="br-card-mid">
                <i className="fas fa-book"></i>
                <div>
                  <strong>{r.title}</strong>
                  <small>by {r.author}</small>
                </div>
              </div>

              <div className="br-card-right">
                <span className={`br-status ${r.status}`}>{r.status}</span>
                <small className="br-date">
                  {r.requested_at ? new Date(r.requested_at).toLocaleDateString() : ''}
                </small>

                {r.status === 'pending' && (
                  <div className="br-actions">
                    <button className="br-btn approve" onClick={() => decide(r.id, 'approved')}>
                      <i className="fas fa-check"></i> Approve
                    </button>
                    <button className="br-btn reject" onClick={() => decide(r.id, 'rejected')}>
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </div>
                )}

                {r.status === 'approved' && (
                  <button className="br-btn return" onClick={() => decide(r.id, 'returned')}>
                    <i className="fas fa-undo"></i> Mark Returned
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="br-toast">{toast}</div>}
    </div>
  )
}

export default BorrowRequests