const { promisePool } = require('../config/db');

// Helper function to generate student ID
const generateStudentId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `STU${year}${random}`;
};

// Student Model with all database operations
const Student = {
    // Create a new student
    create: async (studentData) => {
        const { firstName, lastName, email, password } = studentData;
        const studentId = generateStudentId();
        
        const query = `
            INSERT INTO students (studentId, firstName, lastName, email, password) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await promisePool.query(query, [
            studentId,
            firstName,
            lastName,
            email,
            password
        ]);
        
        return { id: result.insertId, studentId, ...studentData };
    },

    // Get all students with optional search
    findAll: async (search = '') => {
        let query = 'SELECT * FROM students';
        const params = [];
        
        if (search) {
            query += ` WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR studentId LIKE ?`;
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

    // Find student by studentId
    findByStudentId: async (studentId) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM students WHERE studentId = ?',
            [studentId]
        );
        return rows[0] || null;
    },

    // Find student by email
    findByEmail: async (email) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM students WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    },

    // Update student
    update: async (id, studentData) => {
        const { firstName, lastName, email, password } = studentData;
        
        let query = 'UPDATE students SET firstName = ?, lastName = ?, email = ?';
        const params = [firstName, lastName, email];
        
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