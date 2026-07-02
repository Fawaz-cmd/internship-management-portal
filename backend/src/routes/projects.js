const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { authorizeLevel } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', projectController.listProjects);
router.post('/', authorizeLevel('team_lead'), projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', authorizeLevel('team_lead'), projectController.updateProject);
router.delete('/:id', authorizeLevel('program_manager'), projectController.deleteProject);
router.post('/:id/members', authorizeLevel('team_lead'), projectController.addMember);
router.delete('/:id/members/:userId', authorizeLevel('team_lead'), projectController.removeMember);
router.post('/:id/sprints', authorizeLevel('team_lead'), projectController.createSprint);
router.put('/:id/sprints/:sprintId', authorizeLevel('team_lead'), projectController.updateSprint);
router.post('/:id/deliverables', authorizeLevel('intern'), projectController.createDeliverable);
router.put('/:id/deliverables/:deliverableId', authorizeLevel('intern'), projectController.updateDeliverable);

module.exports = router;
