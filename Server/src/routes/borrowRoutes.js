// src/routes/borrowRoutes.js
const express = require('express');
const router = express.Router();
const {
    requestBorrow,
    getStudentRequests,
    getAllRequests,
    decideRequest
} = require('../controllers/borrowController');

router.post('/', requestBorrow);
router.get('/student/:studentId', getStudentRequests);
router.get('/', getAllRequests);
router.put('/:id/decide', decideRequest);

module.exports = router;