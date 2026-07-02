const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/programs', require('./programs'));
router.use('/tasks', require('./tasks'));
router.use('/projects', require('./projects'));
router.use('/progress', require('./progress'));
router.use('/attendance', require('./attendance'));
router.use('/notifications', require('./notifications'));
router.use('/meetings', require('./meetings'));
router.use('/feedback', require('./feedback'));

module.exports = router;
