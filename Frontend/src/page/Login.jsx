// page/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImg from '../assets/hero.png'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      // 🔑 Admin login (still hardcoded — or move to backend later)
      if (email === 'gizachew@gmail.com' && password === '12345678') {
        localStorage.setItem('userRole', 'admin')
        localStorage.setItem('userEmail', email)
        navigate('/admin-dashboard')
        return
      }

      // 🎓 Student login — hit the backend
      const res = await fetch('http://localhost:5000/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid email or password')
        return
      }

      // Save student info for the dashboard
      localStorage.setItem('userRole', 'student')
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('student', JSON.stringify(data.user))

      navigate('/student-dashboard')
    } catch (err) {
      console.error(err)
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => navigate('/')

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={heroImg} alt="Library" className="hero-icon" />
          <h1>Library Management System</h1>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="login-btn student-btn"
            disabled={loading}
          >
            <i className="fas fa-sign-in-alt"></i>
            {loading ? ' Logging in...' : ' Login'}
          </button>

          <button
            type="button"
            onClick={handleBackToHome}
            className="back-btn"
          >
            ← Back to Home
          </button>
        </form>

        <div className="login-footer">
          <span>📚 Manage · Organize · Discover</span>
        </div>
      </div>
    </div>
  )
}

export default Login