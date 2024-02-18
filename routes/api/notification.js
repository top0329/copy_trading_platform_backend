const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Role = require('../../config/role');
const Notification = require('../../models/Notification');

/**
 * @route   GET api/notification
 * @desc    Get notification data
 * @access  ADMIN
 */
router.get('/', auth([Role.Admin]), async (req, res) => {
  try {
    const notificationData = await Notification.find({
      isNotViewed: true,
    }).populate('user', 'fullName');
    res.json({ status: 'OK', data: notificationData });
  } catch (err) {
    console.log(err);
    res.json({ status: 'ERR' });
  }
});

router.put('/', auth([Role.Admin]), async (req, res) => {
  try {
    const notificationData = await Notification.updateMany(
      {},
      { $set: { isNotViewed: false } }
    );
    res.json({ status: 'OK', data: notificationData });
  } catch (err) {
    console.log(err);
    res.json({ status: 'ERR' });
  }
});

module.exports = router;
