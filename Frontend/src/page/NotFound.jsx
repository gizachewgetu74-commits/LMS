// page/404.jsx (or page/Notfound.jsx)
import { useNavigate } from 'react-router-dom'

function Notfound() {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="notfound-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <button onClick={handleGoHome} className="login-btn student-btn">
        Go Back Home
      </button>
    </div>
  )
}

export default Notfound