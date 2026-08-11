const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// GET all books (with optional search, category, filter)
router.get('/', bookController.getBooks);

// GET categories
router.get('/categories', bookController.getCategories);

// GET statistics
router.get('/stats', bookController.getStats);

// GET single book by ID
router.get('/:id', bookController.getBookById);

// POST create new book
router.post('/', bookController.createBook);

// PUT update book
router.put('/:id', bookController.updateBook);

// DELETE book
router.delete('/:id', bookController.deleteBook);

module.exports = router;