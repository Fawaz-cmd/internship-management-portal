const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', programController.listPrograms);
router.post('/', authorize('super_admin', 'hr_coordinator', 'program_manager'), programController.createProgram);
router.get('/:id', programController.getProgram);
router.put('/:id', authorize('super_admin', 'hr_coordinator', 'program_manager'), programController.updateProgram);
router.delete('/:id', authorize('super_admin', 'hr_coordinator'), programController.deleteProgram);

module.exports = router;
