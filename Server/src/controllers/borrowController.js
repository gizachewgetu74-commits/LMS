const BorrowRequest = require('../models/BorrowRequest');
const Book = require('../models/Book');
const { promisePool } = require('../config/db');
// Student requests a book
const requestBorrow = async (req, res) => {
    try {
        const { studentId, bookId } = req.body;

        if (!studentId || !bookId) {
            return res.status(400).json({ success: false, message: 'studentId and bookId required' });
        }

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

        if (book.availableQuantity < 1) {
            return res.status(400).json({ success: false, message: 'Book is not available' });
        }

        const existing = await BorrowRequest.findExisting(studentId, bookId);
        if (existing) {
            return res.status(409).json({ success: false, message: 'You already requested this book' });
        }

        const request = await BorrowRequest.create({ studentId, bookId });
        res.status(201).json({ success: true, message: 'Borrow request submitted. Awaiting admin approval.', data: request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to submit request', error: error.message });
    }
};

// Get requests for one student
const getStudentRequests = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requests = await BorrowRequest.findByStudent(studentId);
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
    }
};

// Admin: get all
const getAllRequests = async (req, res) => {
    try {
        const requests = await BorrowRequest.findAll();
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
    }
};

const decideRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'returned'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await BorrowRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const ok = await BorrowRequest.updateStatus(id, status);
        if (!ok) return res.status(404).json({ success: false, message: 'Request not found' });

        // Adjust stock
        if (status === 'approved' && request.status !== 'approved') {
            // decrease available quantity
            await promisePool.query(
                'UPDATE books SET availableQuantity = availableQuantity - 1 WHERE id = ? AND availableQuantity > 0',
                [request.book_id]
            );
        } else if (status === 'returned' && request.status === 'approved') {
            // increase available quantity
            await promisePool.query(
                'UPDATE books SET availableQuantity = availableQuantity + 1 WHERE id = ?',
                [request.book_id]
            );
        }

        res.status(200).json({ success: true, message: `Request ${status}` });
    } catch (error) {
        console.error('decideRequest error:', error);
        res.status(500).json({ success: false, message: 'Failed to update request', error: error.message });
    }
};



module.exports = { requestBorrow, getStudentRequests, getAllRequests, decideRequest };