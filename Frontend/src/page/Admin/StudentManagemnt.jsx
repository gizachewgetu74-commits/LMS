// pages/Admin/StudentManagement.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'

// API Base URL - change this to your server URL
const API_URL = 'http://localhost:5000/api/students'

function StudentManagement() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  // Fetch students from API
  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await axios.get(API_URL, {
        params: { search: searchTerm }
      })
      setStudents(response.data.data)
    } catch (error) {
      console.error('Error fetching students:', error)
      alert(error.response?.data?.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  // Fetch students on component mount and when search changes
  useEffect(() => {
    fetchStudents()
  }, [searchTerm])

  // Auto-generate password: firstName + # + 4 random digits
  const generatePassword = (firstName) => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString()
    return `${firstName.toLowerCase()}#${randomDigits}`
  }

// እና handleAddStudent ውስጥ ያለውን ስህተት ለማየት
const handleAddStudent = async (e) => {
  e.preventDefault();
  
  if (!newStudent.firstName || !newStudent.lastName || !newStudent.email) {
    alert('Please fill in all required fields');
    return;
  }

  if (!newStudent.email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }

  try {
    console.log('📤 Sending data:', newStudent);
    const response = await axios.post(API_URL, {
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      email: newStudent.email,
      password: newStudent.password || generatePassword(newStudent.firstName)
    });
    console.log('📥 Response:', response.data);

    alert(`Student added successfully!\nPassword: ${response.data.generatedPassword}`);
    setNewStudent({ firstName: '', lastName: '', email: '', password: '' });
    setShowAddForm(false);
    fetchStudents();
  } catch (error) {
    console.error('❌ Error details:', error);
    console.error('Response:', error.response?.data);
    alert(error.response?.data?.message || 'Failed to add student');
  }
};

  const handleEditStudent = (student) => {
    setEditingStudent(student)
    setNewStudent({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      password: ''
    })
    setShowEditForm(true)
  }

  const handleUpdateStudent = async (e) => {
    e.preventDefault()
    
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.email) {
      alert('Please fill in all required fields')
      return
    }

    // Validate email format
    if (!newStudent.email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    try {
      const updateData = {
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        email: newStudent.email,
      }

      // Only include password if it's provided
      if (newStudent.password) {
        updateData.password = newStudent.password
      }

      await axios.put(`${API_URL}/${editingStudent._id}`, updateData)
      
      alert('Student updated successfully!')
      setEditingStudent(null)
      setNewStudent({ firstName: '', lastName: '', email: '', password: '' })
      setShowEditForm(false)
      fetchStudents() // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update student')
    }
  }

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return

    try {
      await axios.delete(`${API_URL}/${id}`)
      alert('Student deleted successfully!')
      fetchStudents() // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete student')
    }
  }

  const handleRegeneratePassword = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/regenerate-password`)
      alert(`New password for ${response.data.data.firstName}: ${response.data.newPassword}`)
      fetchStudents() // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to regenerate password')
    }
  }

  // Filter students based on search (client-side filtering)
  const filteredStudents = students.filter(student => 
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="management-panel">
      <div className="panel-header">
        <h2><i className="fas fa-user-graduate"></i> Student Management</h2>
        <div className="panel-actions">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            <i className="fas fa-plus"></i> Add Student
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i> Loading students...
        </div>
      )}

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3><i className="fas fa-user-plus"></i> Add New Student</h3>
              <button className="close-btn" onClick={() => {
                setShowAddForm(false)
                setNewStudent({ firstName: '', lastName: '', email: '', password: '' })
              }}>×</button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password (optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                />
                <small className="form-hint">
                  <i className="fas fa-info-circle"></i> 
                  Auto-generate: {newStudent.firstName ? `${newStudent.firstName.toLowerCase()}#XXXX` : 'firstname#XXXX'}
                </small>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowAddForm(false)
                  setNewStudent({ firstName: '', lastName: '', email: '', password: '' })
                }}>Cancel</button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-save"></i> Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditForm && editingStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3><i className="fas fa-user-edit"></i> Edit Student</h3>
              <button className="close-btn" onClick={() => {
                setShowEditForm(false)
                setEditingStudent(null)
                setNewStudent({ firstName: '', lastName: '', email: '', password: '' })
              }}>×</button>
            </div>
            <form onSubmit={handleUpdateStudent}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="text"
                  placeholder="Enter new password or leave blank to keep current"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                />
                <small className="form-hint">
                  <i className="fas fa-info-circle"></i> 
                  Current password: {editingStudent.password}
                </small>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowEditForm(false)
                  setEditingStudent(null)
                  setNewStudent({ firstName: '', lastName: '', email: '', password: '' })
                }}>Cancel</button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-save"></i> Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <tr key={student._id || student.id}>
                  <td><strong>{student.studentId}</strong></td>
                  <td>{student.firstName}</td>
                  <td>{student.lastName}</td>
                  <td>{student.email}</td>
                  <td>
                    <span className="password-display">
                      {student.password}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEditStudent(student)}
                      title="Edit Student"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="password-btn"
                      onClick={() => handleRegeneratePassword(student._id || student.id)}
                      title="Regenerate Password"
                    >
                      <i className="fas fa-key"></i>
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteStudent(student._id || student.id)}
                      title="Delete Student"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  <i className="fas fa-search"></i> {loading ? 'Loading...' : 'No students found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span>Total Students: <strong>{filteredStudents.length}</strong></span>
          {!loading && (
            <button className="refresh-btn" onClick={fetchStudents}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentManagement