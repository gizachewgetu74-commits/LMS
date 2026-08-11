import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/books'

function BookManagement() {
    const [books, setBooks] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editingBook, setEditingBook] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [filterOption, setFilterOption] = useState('')
    const [stats, setStats] = useState({
        totalBooks: 0,
        availableBooks: 0,
        lowStock: 0,
        unavailableBooks: 0
    })

    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 1,
        availableQuantity: 1,
        location: '',
        description: '',
        coverImage: '',
        publisher: '',
        publicationYear: '',
        pages: '',
        language: 'English'
    })

    // Fetch books
    const fetchBooks = async () => {
        setLoading(true)
        try {
            const response = await axios.get(API_URL, {
                params: { 
                    search: searchTerm,
                    category: selectedCategory,
                    filter: filterOption
                }
            })
            setBooks(response.data.data)
        } catch (error) {
            console.error('Error fetching books:', error)
            alert(error.response?.data?.message || 'Failed to fetch books')
        } finally {
            setLoading(false)
        }
    }

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories`)
            setCategories(response.data.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`)
            setStats(response.data.data)
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    useEffect(() => {
        fetchBooks()
        fetchCategories()
        fetchStats()
    }, [searchTerm, selectedCategory, filterOption])

    // Handle add book
    const handleAddBook = async (e) => {
        e.preventDefault()
        
        if (!newBook.title || !newBook.author || !newBook.isbn) {
            alert('Please fill in all required fields')
            return
        }

        try {
            const response = await axios.post(API_URL, newBook)
            alert('Book added successfully!')
            setNewBook({
                title: '',
                author: '',
                isbn: '',
                category: '',
                quantity: 1,
                availableQuantity: 1,
                location: '',
                description: '',
                coverImage: '',
                publisher: '',
                publicationYear: '',
                pages: '',
                language: 'English'
            })
            setShowAddForm(false)
            fetchBooks()
            fetchStats()
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add book')
        }
    }

    // Handle edit book
    const handleEditBook = (book) => {
        setEditingBook(book)
        setNewBook({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            category: book.category || '',
            quantity: book.quantity,
            availableQuantity: book.availableQuantity,
            location: book.location || '',
            description: book.description || '',
            coverImage: book.coverImage || '',
            publisher: book.publisher || '',
            publicationYear: book.publicationYear || '',
            pages: book.pages || '',
            language: book.language || 'English'
        })
        setShowEditForm(true)
    }

    // Handle update book
    const handleUpdateBook = async (e) => {
        e.preventDefault()
        
        if (!newBook.title || !newBook.author || !newBook.isbn) {
            alert('Please fill in all required fields')
            return
        }

        try {
            await axios.put(`${API_URL}/${editingBook.id}`, newBook)
            alert('Book updated successfully!')
            setEditingBook(null)
            setNewBook({
                title: '',
                author: '',
                isbn: '',
                category: '',
                quantity: 1,
                availableQuantity: 1,
                location: '',
                description: '',
                coverImage: '',
                publisher: '',
                publicationYear: '',
                pages: '',
                language: 'English'
            })
            setShowEditForm(false)
            fetchBooks()
            fetchStats()
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update book')
        }
    }

    // Handle delete book
    const handleDeleteBook = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return

        try {
            await axios.delete(`${API_URL}/${id}`)
            alert('Book deleted successfully!')
            fetchBooks()
            fetchStats()
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete book')
        }
    }

    return (
        <div className="management-panel">
            <div className="panel-header">
                <h2><i className="fas fa-book"></i> Book Management</h2>
                <div className="panel-actions">
                    <input
                        type="text"
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select 
                        value={filterOption} 
                        onChange={(e) => setFilterOption(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Books</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="low-stock">Low Stock</option>
                    </select>
                    <button className="add-btn" onClick={() => setShowAddForm(true)}>
                        <i className="fas fa-plus"></i> Add Book
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid mini-stats">
                <div className="stat-card mini">
                    <span className="stat-number">{stats.totalBooks}</span>
                    <span className="stat-label">Total Books</span>
                </div>
                <div className="stat-card mini">
                    <span className="stat-number">{stats.availableBooks}</span>
                    <span className="stat-label">Available</span>
                </div>
                <div className="stat-card mini">
                    <span className="stat-number">{stats.lowStock}</span>
                    <span className="stat-label">Low Stock</span>
                </div>
                <div className="stat-card mini">
                    <span className="stat-number">{stats.unavailableBooks}</span>
                    <span className="stat-label">Unavailable</span>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i> Loading books...
                </div>
            )}

            {/* Add Book Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal large-modal">
                        <div className="modal-header">
                            <h3><i className="fas fa-plus-circle"></i> Add New Book</h3>
                            <button className="close-btn" onClick={() => {
                                setShowAddForm(false)
                                setNewBook({
                                    title: '',
                                    author: '',
                                    isbn: '',
                                    category: '',
                                    quantity: 1,
                                    availableQuantity: 1,
                                    location: '',
                                    description: '',
                                    coverImage: '',
                                    publisher: '',
                                    publicationYear: '',
                                    pages: '',
                                    language: 'English'
                                })
                            }}>×</button>
                        </div>
                        <form onSubmit={handleAddBook}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter book title"
                                        value={newBook.title}
                                        onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Author *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter author name"
                                        value={newBook.author}
                                        onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ISBN *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter ISBN"
                                        value={newBook.isbn}
                                        onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        placeholder="Enter category"
                                        value={newBook.category}
                                        onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="Enter quantity"
                                        value={newBook.quantity}
                                        onChange={(e) => setNewBook({...newBook, quantity: parseInt(e.target.value) || 1})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Available Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="Enter available quantity"
                                        value={newBook.availableQuantity}
                                        onChange={(e) => setNewBook({...newBook, availableQuantity: parseInt(e.target.value) || 1})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Publisher</label>
                                    <input
                                        type="text"
                                        placeholder="Enter publisher"
                                        value={newBook.publisher}
                                        onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Publication Year</label>
                                    <input
                                        type="number"
                                        placeholder="Enter publication year"
                                        value={newBook.publicationYear}
                                        onChange={(e) => setNewBook({...newBook, publicationYear: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pages</label>
                                    <input
                                        type="number"
                                        placeholder="Enter page count"
                                        value={newBook.pages}
                                        onChange={(e) => setNewBook({...newBook, pages: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Language</label>
                                    <input
                                        type="text"
                                        placeholder="Enter language"
                                        value={newBook.language}
                                        onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        placeholder="Enter shelf location"
                                        value={newBook.location}
                                        onChange={(e) => setNewBook({...newBook, location: e.target.value})}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Enter book description"
                                        value={newBook.description}
                                        onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Cover Image URL</label>
                                    <input
                                        type="text"
                                        placeholder="Enter cover image URL"
                                        value={newBook.coverImage}
                                        onChange={(e) => setNewBook({...newBook, coverImage: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => {
                                    setShowAddForm(false)
                                    setNewBook({
                                        title: '',
                                        author: '',
                                        isbn: '',
                                        category: '',
                                        quantity: 1,
                                        availableQuantity: 1,
                                        location: '',
                                        description: '',
                                        coverImage: '',
                                        publisher: '',
                                        publicationYear: '',
                                        pages: '',
                                        language: 'English'
                                    })
                                }}>Cancel</button>
                                <button type="submit" className="submit-btn">
                                    <i className="fas fa-save"></i> Add Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Book Modal */}
            {showEditForm && editingBook && (
                <div className="modal-overlay">
                    <div className="modal large-modal">
                        <div className="modal-header">
                            <h3><i className="fas fa-edit"></i> Edit Book</h3>
                            <button className="close-btn" onClick={() => {
                                setShowEditForm(false)
                                setEditingBook(null)
                                setNewBook({
                                    title: '',
                                    author: '',
                                    isbn: '',
                                    category: '',
                                    quantity: 1,
                                    availableQuantity: 1,
                                    location: '',
                                    description: '',
                                    coverImage: '',
                                    publisher: '',
                                    publicationYear: '',
                                    pages: '',
                                    language: 'English'
                                })
                            }}>×</button>
                        </div>
                        <form onSubmit={handleUpdateBook}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter book title"
                                        value={newBook.title}
                                        onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Author *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter author name"
                                        value={newBook.author}
                                        onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ISBN *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter ISBN"
                                        value={newBook.isbn}
                                        onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        placeholder="Enter category"
                                        value={newBook.category}
                                        onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="Enter quantity"
                                        value={newBook.quantity}
                                        onChange={(e) => setNewBook({...newBook, quantity: parseInt(e.target.value) || 1})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Available Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="Enter available quantity"
                                        value={newBook.availableQuantity}
                                        onChange={(e) => setNewBook({...newBook, availableQuantity: parseInt(e.target.value) || 1})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Publisher</label>
                                    <input
                                        type="text"
                                        placeholder="Enter publisher"
                                        value={newBook.publisher}
                                        onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Publication Year</label>
                                    <input
                                        type="number"
                                        placeholder="Enter publication year"
                                        value={newBook.publicationYear}
                                        onChange={(e) => setNewBook({...newBook, publicationYear: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pages</label>
                                    <input
                                        type="number"
                                        placeholder="Enter page count"
                                        value={newBook.pages}
                                        onChange={(e) => setNewBook({...newBook, pages: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Language</label>
                                    <input
                                        type="text"
                                        placeholder="Enter language"
                                        value={newBook.language}
                                        onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        placeholder="Enter shelf location"
                                        value={newBook.location}
                                        onChange={(e) => setNewBook({...newBook, location: e.target.value})}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Enter book description"
                                        value={newBook.description}
                                        onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Cover Image URL</label>
                                    <input
                                        type="text"
                                        placeholder="Enter cover image URL"
                                        value={newBook.coverImage}
                                        onChange={(e) => setNewBook({...newBook, coverImage: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => {
                                    setShowEditForm(false)
                                    setEditingBook(null)
                                    setNewBook({
                                        title: '',
                                        author: '',
                                        isbn: '',
                                        category: '',
                                        quantity: 1,
                                        availableQuantity: 1,
                                        location: '',
                                        description: '',
                                        coverImage: '',
                                        publisher: '',
                                        publicationYear: '',
                                        pages: '',
                                        language: 'English'
                                    })
                                }}>Cancel</button>
                                <button type="submit" className="submit-btn">
                                    <i className="fas fa-save"></i> Update Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Books Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Available</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length > 0 ? (
                            books.map(book => (
                                <tr key={book.id}>
                                    <td>
                                        <div className="book-info">
                                            {book.coverImage && (
                                                <img src={book.coverImage} alt={book.title} className="book-thumbnail" />
                                            )}
                                            <span className="book-title">{book.title}</span>
                                        </div>
                                    </td>
                                    <td>{book.author}</td>
                                    <td>{book.isbn}</td>
                                    <td><span className="category-tag">{book.category}</span></td>
                                    <td>{book.quantity}</td>
                                    <td>
                                        <span className={`availability-badge ${book.availableQuantity > 0 ? 'available' : 'unavailable'}`}>
                                            {book.availableQuantity}
                                        </span>
                                    </td>
                                    <td>{book.location}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-btn" 
                                            onClick={() => handleEditBook(book)}
                                            title="Edit Book"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteBook(book.id)}
                                            title="Delete Book"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-data">
                                    <i className="fas fa-search"></i> {loading ? 'Loading...' : 'No books found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="table-footer">
                    <span>Total Books: <strong>{books.length}</strong></span>
                    {!loading && (
                        <button className="refresh-btn" onClick={fetchBooks}>
                            <i className="fas fa-sync-alt"></i> Refresh
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BookManagement