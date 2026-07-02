const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/upcoming', meetingController.getUpcoming);
router.get('/', meetingController.listMeetings);
router.post('/', meetingController.createMeeting);
router.get('/:id', meetingController.getMeeting);
router.put('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);

module.exports = router;
