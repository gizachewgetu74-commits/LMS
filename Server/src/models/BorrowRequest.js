// src/models/BorrowRequest.js
const { promisePool } = require('../config/db');

class BorrowRequest {
    // Student requests a book
    static async create({ studentId, bookId }) {
        const [result] = await promisePool.query(
            `INSERT INTO borrow_requests (student_id, book_id, status, requested_at)
             VALUES (?, ?, 'pending', NOW())`,
            [studentId, bookId]
        );
        return { id: result.insertId, studentId, bookId, status: 'pending' };
    }

    // All requests for one student (with book info joined)
    static async findByStudent(studentId) {
        const [rows] = await promisePool.query(
            `SELECT br.*, b.title, b.author, b.coverImage
             FROM borrow_requests br
             JOIN books b ON b.id = br.book_id
             WHERE br.student_id = ?
             ORDER BY br.requested_at DESC`,
            [studentId]
        );
        return rows;
    }

    // All requests (admin view) with student + book info
    static async findAll() {
        const [rows] = await promisePool.query(
            `SELECT br.*, b.title, b.author,
                    s.firstName, s.lastName, s.email, s.idNumber
             FROM borrow_requests br
             JOIN books b ON b.id = br.book_id
             JOIN students s ON s.id = br.student_id
             ORDER BY br.requested_at DESC`
        );
        return rows;
    }

    // Check if student already has a pending/approved request for this book
    static async findExisting(studentId, bookId) {
        const [rows] = await promisePool.query(
            `SELECT * FROM borrow_requests
             WHERE student_id = ? AND book_id = ? AND status IN ('pending','approved')
             LIMIT 1`,
            [studentId, bookId]
        );
        return rows[0] || null;
    }

    // Find a single request by id (used for stock updates on approve/return)
    static async findById(id) {
        const [rows] = await promisePool.query(
            `SELECT * FROM borrow_requests WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    // Update status (approved / rejected / returned)
    static async updateStatus(id, status) {
        const [result] = await promisePool.query(
            `UPDATE borrow_requests SET status = ?, decided_at = NOW() WHERE id = ?`,
            [status, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = BorrowRequest;