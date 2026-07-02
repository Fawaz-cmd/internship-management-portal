const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize, authorizeLevel } = require('../middleware/rbac');

router.use(authenticate);

router.get('/stats', authorize('super_admin', 'hr_coordinator', 'program_manager'), userController.getStats);
router.get('/audit-logs', authorize('super_admin', 'hr_coordinator'), userController.getAllAuditLogs);
router.get('/', authorizeLevel('mentor'), userController.listUsers);
router.post('/', authorizeLevel('hr_coordinator'), userController.createUser);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', authorize('super_admin', 'hr_coordinator'), userController.deactivateUser);
router.get('/:id/audit-logs', authorize('super_admin', 'hr_coordinator'), userController.getUserAuditLogs);

module.exports = router;
