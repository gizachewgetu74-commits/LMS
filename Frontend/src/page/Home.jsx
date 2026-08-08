// page/Home.jsx
import { useNavigate } from 'react-router-dom'
import heroImg from '../assets/hero.png'

function Home() {
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={heroImg} alt="Library" className="hero-icon" />
          <h1>Library Management System</h1>
          <p>Welcome to the Library Management System</p>
        </div>
        <div className="login-buttons">
          <button onClick={handleLoginClick} className="login-btn student-btn">
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
        </div>
        <div className="login-footer">
          <span>📚 Manage · Organize · Discover</span>
        </div>
      </div>
    </div>
  )
}

export default Home