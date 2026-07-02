const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/daily', progressController.submitDailyUpdate);
router.get('/daily', progressController.getDailyUpdates);
router.post('/weekly', progressController.submitWeeklyReport);
router.get('/weekly', progressController.getWeeklyReports);
router.put('/weekly/:id/review', progressController.reviewWeeklyReport);
router.get('/skills', progressController.getSkills);
router.post('/skills', progressController.addSkill);
router.get('/analytics', progressController.getAnalytics);

module.exports = router;
