const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate } = require('../middleware/auth');
const { authorizeLevel } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', feedbackController.listFeedback);
router.post('/', authorizeLevel('mentor'), feedbackController.createFeedback);
router.get('/:id', feedbackController.getFeedback);
router.put('/:id', authorizeLevel('mentor'), feedbackController.updateFeedback);

module.exports = router;
