const { promisePool } = require('../config/db');

// Student Model with all database operations
const Student = {
    // Create a new student
    create: async (studentData) => {
        const { idNumber, firstName, lastName, email, password } = studentData;

        const query = `
            INSERT INTO students (idNumber, firstName, lastName, email, password) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await promisePool.query(query, [
            idNumber,
            firstName,
            lastName,
            email,
            password
        ]);

        return { id: result.insertId, idNumber, ...studentData };
    },

    // Get all students with optional search
    findAll: async (search = '') => {
        let query = 'SELECT * FROM students';
        const params = [];

        if (search) {
            query += ` WHERE idNumber LIKE ? OR firstName LIKE ? OR lastName LIKE ? OR email LIKE ?`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        query += ' ORDER BY createdAt DESC';

        const [rows] = await promisePool.query(query, params);
        return rows;
    },

    // Find student by ID
    findById: async (id) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM students WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    // Find student by idNumber
    findByIdNumber: async (idNumber) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM students WHERE idNumber = ?',
            [idNumber]
        );
        return rows[0] || null;
    },

    // Find student by email  ✅ kept here, uses promisePool
    findByEmail: async (email) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM students WHERE email = ? LIMIT 1',
            [email]
        );
        return rows[0] || null;
    },

    // Update student
    update: async (id, studentData) => {
        const { idNumber, firstName, lastName, email, password } = studentData;

        let query = 'UPDATE students SET idNumber = ?, firstName = ?, lastName = ?, email = ?';
        const params = [idNumber, firstName, lastName, email];

        if (password) {
            query += ', password = ?';
            params.push(password);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await promisePool.query(query, params);
        return result.affectedRows > 0;
    },

    // Update password only
    updatePassword: async (id, newPassword) => {
        const [result] = await promisePool.query(
            'UPDATE students SET password = ? WHERE id = ?',
            [newPassword, id]
        );
        return result.affectedRows > 0;
    },

    // Delete student
    delete: async (id) => {
        const [result] = await promisePool.query(
            'DELETE FROM students WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Student;