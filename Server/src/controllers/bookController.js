const Book = require('../models/Book');

// Get all books
const getBooks = async (req, res) => {
    try {
        const { search, category, filter } = req.query;
        const books = await Book.findAll(search || '', category || '', filter || '');
        
        res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch books',
            error: error.message
        });
    }
};

// Get single book by ID
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch book',
            error: error.message
        });
    }
};

// Get categories
const getCategories = async (req, res) => {
    try {
        const categories = await Book.getCategories();
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// Get statistics
const getStats = async (req, res) => {
    try {
        const total = await Book.getTotalCount();
        const available = await Book.getAvailableCount();
        const lowStock = await Book.getLowStockCount();
        
        res.status(200).json({
            success: true,
            data: {
                totalBooks: total,
                availableBooks: available,
                lowStock: lowStock,
                unavailableBooks: total - available
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

// Create new book
const createBook = async (req, res) => {
    try {
        const bookData = req.body;
        
        // Validate required fields
        if (!bookData.title || !bookData.author || !bookData.isbn) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, author, and ISBN'
            });
        }
        
        // Check if ISBN already exists
        if (bookData.isbn) {
            const existingBook = await Book.findByISBN(bookData.isbn);
            if (existingBook) {
                return res.status(409).json({
                    success: false,
                    message: 'A book with this ISBN already exists'
                });
            }
        }
        
        // Set availableQuantity to quantity if not provided
        if (!bookData.availableQuantity) {
            bookData.availableQuantity = bookData.quantity || 1;
        }
        
        const newBook = await Book.create(bookData);
        
        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: newBook
        });
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create book',
            error: error.message
        });
    }
};

// Update book
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const bookData = req.body;
        
        // Check if book exists
        const existingBook = await Book.findById(id);
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        
        // Check if ISBN is taken by another book
        if (bookData.isbn && bookData.isbn !== existingBook.isbn) {
            const bookWithISBN = await Book.findByISBN(bookData.isbn);
            if (bookWithISBN && bookWithISBN.id !== parseInt(id)) {
                return res.status(409).json({
                    success: false,
                    message: 'ISBN is already taken by another book'
                });
            }
        }
        
        // Preserve existing values if not provided
        const updatedData = {
            title: bookData.title || existingBook.title,
            author: bookData.author || existingBook.author,
            isbn: bookData.isbn || existingBook.isbn,
            category: bookData.category || existingBook.category,
            quantity: bookData.quantity || existingBook.quantity,
            availableQuantity: bookData.availableQuantity || existingBook.availableQuantity,
            location: bookData.location || existingBook.location,
            description: bookData.description || existingBook.description,
            coverImage: bookData.coverImage || existingBook.coverImage,
            publisher: bookData.publisher || existingBook.publisher,
            publicationYear: bookData.publicationYear || existingBook.publicationYear,
            pages: bookData.pages || existingBook.pages,
            language: bookData.language || existingBook.language
        };
        
        const updated = await Book.update(id, updatedData);
        
        if (!updated) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update book'
            });
        }
        
        // Get updated book
        const updatedBook = await Book.findById(id);
        
        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: updatedBook
        });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update book',
            error: error.message
        });
    }
};

// Delete book
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if book exists
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        
        const deleted = await Book.delete(id);
        
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete book'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
            data: {
                id: book.id,
                title: book.title,
                author: book.author
            }
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete book',
            error: error.message
        });
    }
};

module.exports = {
    getBooks,
    getBookById,
    getCategories,
    getStats,
    createBook,
    updateBook,
    deleteBook
};