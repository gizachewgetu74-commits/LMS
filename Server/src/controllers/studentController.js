const Student = require('../models/Student');

// Helper function to generate password
const generatePassword = (firstName) => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `${firstName.toLowerCase()}#${randomDigits}`;
};

// Get all students
const getStudents = async (req, res) => {
    try {
        const { search } = req.query;
        const students = await Student.findAll(search || '');
        
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students',
            error: error.message
        });
    }
};

// Get single student by ID
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student',
            error: error.message
        });
    }
};

// Create new student
const createStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide firstName, lastName, and email'
            });
        }
        
        // Validate email format
        if (!email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }
        
        // Check if email already exists
        const existingStudent = await Student.findByEmail(email);
        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: 'Student with this email already exists'
            });
        }
        
        // Generate password if not provided
        const finalPassword = password || generatePassword(firstName);
        
        // Create student
        const newStudent = await Student.create({
            firstName,
            lastName,
            email,
            password: finalPassword
        });
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: newStudent,
            generatedPassword: finalPassword // Send back the password for display
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create student',
            error: error.message
        });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, password } = req.body;
        
        // Check if student exists
        const existingStudent = await Student.findById(id);
        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Check if email is taken by another student
        if (email && email !== existingStudent.email) {
            const studentWithEmail = await Student.findByEmail(email);
            if (studentWithEmail && studentWithEmail.id !== parseInt(id)) {
                return res.status(409).json({
                    success: false,
                    message: 'Email is already taken by another student'
                });
            }
        }
        
        // Prepare update data
        const updateData = {
            firstName: firstName || existingStudent.firstName,
            lastName: lastName || existingStudent.lastName,
            email: email || existingStudent.email,
            password: password || undefined
        };
        
        const updated = await Student.update(id, updateData);
        
        if (!updated) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update student'
            });
        }
        
        // Get updated student
        const updatedStudent = await Student.findById(id);
        
        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update student',
            error: error.message
        });
    }
};

// Regenerate password
const regeneratePassword = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if student exists
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Generate new password
        const newPassword = generatePassword(student.firstName);
        
        // Update password
        const updated = await Student.updatePassword(id, newPassword);
        
        if (!updated) {
            return res.status(500).json({
                success: false,
                message: 'Failed to regenerate password'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Password regenerated successfully',
            newPassword: newPassword,
            data: {
                id: student.id,
                studentId: student.studentId,
                firstName: student.firstName,
                lastName: student.lastName
            }
        });
    } catch (error) {
        console.error('Error regenerating password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate password',
            error: error.message
        });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if student exists
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        const deleted = await Student.delete(id);
        
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete student'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Student deleted successfully',
            data: {
                id: student.id,
                studentId: student.studentId,
                firstName: student.firstName,
                lastName: student.lastName
            }
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete student',
            error: error.message
        });
    }
};

module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    regeneratePassword,
    deleteStudent
};