// page/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImg from '../assets/hero.png'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    // Sample user credentials
    const users = [
      {
        email: 'abey@gmail.com',
        password: '12345678',
        role: 'student'
      },
      {
        email: 'gizachew@gmail.com',
        password: '12345678',
        role: 'admin'
      }
    ]

    // Check if user exists
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
      // Store user role and email in localStorage
      localStorage.setItem('userRole', user.role)
      localStorage.setItem('userEmail', user.email)
      
      // Navigate to appropriate dashboard
      if (user.role === 'student') {
        navigate('/student-dashboard')
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard')
      }
    } else {
      // Check if email exists but password is wrong
      const userExists = users.find(u => u.email === email)
      if (userExists) {
        setError('Invalid password. Please try again.')
      } else {
        setError('Invalid email or password. Please try again.')
      }
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

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

          <button type="submit" className="login-btn student-btn">
            <i className="fas fa-sign-in-alt"></i> Login
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