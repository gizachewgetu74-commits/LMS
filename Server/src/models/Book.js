const { promisePool } = require('../config/db');

const Book = {
    // Create a new book
    create: async (bookData) => {
        const { 
            title, 
            author, 
            isbn, 
            category, 
            quantity, 
            availableQuantity, 
            location, 
            description, 
            coverImage,
            publisher,
            publicationYear,
            pages,
            language
        } = bookData;

        const query = `
            INSERT INTO books (
                title, author, isbn, category, quantity, 
                availableQuantity, location, description, coverImage,
                publisher, publicationYear, pages, language
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await promisePool.query(query, [
            title, 
            author, 
            isbn, 
            category, 
            quantity, 
            availableQuantity || quantity, 
            location || '',
            description || '',
            coverImage || '',
            publisher || '',
            publicationYear || null,
            pages || null,
            language || 'English'
        ]);

        return { id: result.insertId, ...bookData };
    },

    // Get all books with optional search and filter
    findAll: async (search = '', category = '', filter = '') => {
        let query = 'SELECT * FROM books WHERE 1=1';
        const params = [];

        if (search) {
            query += ` AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (category) {
            query += ` AND category = ?`;
            params.push(category);
        }

        if (filter === 'available') {
            query += ` AND availableQuantity > 0`;
        } else if (filter === 'unavailable') {
            query += ` AND availableQuantity = 0`;
        } else if (filter === 'low-stock') {
            query += ` AND availableQuantity <= 3 AND availableQuantity > 0`;
        }

        query += ' ORDER BY title ASC';

        const [rows] = await promisePool.query(query, params);
        return rows;
    },

    // Find book by ID
    findById: async (id) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM books WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    // Find book by ISBN
    findByISBN: async (isbn) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM books WHERE isbn = ?',
            [isbn]
        );
        return rows[0] || null;
    },

    // Update book
    update: async (id, bookData) => {
        const { 
            title, author, isbn, category, quantity, 
            availableQuantity, location, description, coverImage,
            publisher, publicationYear, pages, language
        } = bookData;

        const query = `
            UPDATE books SET 
                title = ?, author = ?, isbn = ?, category = ?, 
                quantity = ?, availableQuantity = ?, location = ?, 
                description = ?, coverImage = ?, publisher = ?,
                publicationYear = ?, pages = ?, language = ?
            WHERE id = ?
        `;

        const [result] = await promisePool.query(query, [
            title, author, isbn, category, quantity, 
            availableQuantity || quantity, location || '',
            description || '', coverImage || '',
            publisher || '', publicationYear || null,
            pages || null, language || 'English',
            id
        ]);

        return result.affectedRows > 0;
    },

    // Update available quantity (for borrowing/returning)
    updateAvailableQuantity: async (id, newAvailableQuantity) => {
        const [result] = await promisePool.query(
            'UPDATE books SET availableQuantity = ? WHERE id = ?',
            [newAvailableQuantity, id]
        );
        return result.affectedRows > 0;
    },

    // Delete book
    delete: async (id) => {
        const [result] = await promisePool.query(
            'DELETE FROM books WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    },

    // Get categories for filter
    getCategories: async () => {
        const [rows] = await promisePool.query(
            'SELECT DISTINCT category FROM books WHERE category IS NOT NULL AND category != "" ORDER BY category'
        );
        return rows.map(row => row.category);
    },

    // Get total count
    getTotalCount: async () => {
        const [rows] = await promisePool.query(
            'SELECT COUNT(*) as total FROM books'
        );
        return rows[0].total;
    },

    // Get available count
    getAvailableCount: async () => {
        const [rows] = await promisePool.query(
            'SELECT COUNT(*) as available FROM books WHERE availableQuantity > 0'
        );
        return rows[0].available;
    },

    // Get low stock count
    getLowStockCount: async () => {
        const [rows] = await promisePool.query(
            'SELECT COUNT(*) as lowStock FROM books WHERE availableQuantity <= 3 AND availableQuantity > 0'
        );
        return rows[0].lowStock;
    }
};

module.exports = Book;