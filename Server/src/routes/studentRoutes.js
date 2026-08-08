const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// GET all students (with optional search)
router.get('/', studentController.getStudents);

// GET single student by ID
router.get('/:id', studentController.getStudentById);

// POST create new student
router.post('/', studentController.createStudent);

// PUT update student
router.put('/:id', studentController.updateStudent);

// PUT regenerate password
router.put('/:id/regenerate-password', studentController.regeneratePassword);

// DELETE student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;