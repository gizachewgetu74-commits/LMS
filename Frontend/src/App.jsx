// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Home from './page/Home'
import Login from './page/Login'
import AdminDashboard from './page/Admin/AdminDashboard'
import StudentDashboard from './page/Student/Dashboard'
import Notfound from './page/NotFound'
function App() {
  const userRole = localStorage.getItem('userRole')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin-dashboard" 
          element={
            userRole === 'admin' ? 
            <AdminDashboard /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/student-dashboard" 
          element={
            userRole === 'student' ? 
            <StudentDashboard /> : 
            <Navigate to="/login" />
          } 
        />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App