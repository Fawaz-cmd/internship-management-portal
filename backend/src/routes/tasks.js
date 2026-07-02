const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { authorize, authorizeLevel } = require('../middleware/rbac');
const upload = require('../config/multer');

router.use(authenticate);

router.get('/kanban', taskController.getKanban);
router.get('/', taskController.listTasks);
router.post('/', authorizeLevel('team_lead'), taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', authorizeLevel('team_lead'), taskController.deleteTask);
router.post('/:id/comments', taskController.addComment);
router.post('/:id/attachments', upload.single('file'), taskController.addAttachment);

module.exports = router;
