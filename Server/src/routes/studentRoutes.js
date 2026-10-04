const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Public login route — must be BEFORE /:id
router.post('/login', studentController.loginStudent);

// GET all students (with optional search)
router.get('/', studentController.getStudents);

// POST create new student
router.post('/', studentController.createStudent);

// GET single student by ID
router.get('/:id', studentController.getStudentById);

// PUT update student
router.put('/:id', studentController.updateStudent);

// PUT regenerate password
router.put('/:id/regenerate-password', studentController.regeneratePassword);

// DELETE student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;