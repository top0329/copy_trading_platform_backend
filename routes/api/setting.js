const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const fs = require('fs');

const User = require('../../models/User');
const auth = require('../../middleware/auth');
const Role = require('../../config/role');
const sendMail = require('../../utils/sendMail');
const Strategy = require('../../models/Strategy');
const Account = require('../../models/Account');
const Subscriber = require('../../models/Subscriber');
const HomePageContent = require('../../models/HomePageContent');
const SiteSetting = require('../../models/SiteSetting');

const Broker = require('../../models/Broker');

/**
 * @route   GET api/settings/site-setting
 * @desc    Get user info from id
 * @access  ADMIN
 */
router.get('/site-setting', auth([Role.Admin]), async (req, res) => {
  try {
    const settings = await SiteSetting.find();
    res.json({ status: 'OK', data: settings });
  } catch (err) {
    console.log(err);
    res.json({ status: 'ERR' });
  }
});

/**
 * @route   GET api/settings/homepage-content
 * @desc    Get user info from id
 * @access  ADMIN
 */
router.get('/homepage-content', auth([Role.Admin]), async (req, res) => {
  try {
    const contents = await HomePageContent.find().sort('-updatedAt');
    if (contents.length > 0) {
      res.json(contents[0]);
    } else {
      res.json({ title: '', body: '' });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: 'ERR' });
  }
});

/**
 * @route GET api/settings/brokers
 * @description
 * @access ADMIN
 */
router.get(
  '/brokers',
  auth([Role.Admin, Role.Provider, Role.User]),
  async (req, res) => {
    try {
      const data = await Broker.find().sort({ broker: 1 });
      res.json({ status: 'OK', data: data });
    } catch (e) {
      console.log(e);
      res.json({ status: 'ERR' });
    }
  }
);

/**
 * @route POST api/settings/brokers
 * @description
 * @access ADMIN
 */
router.post('/brokers', auth([Role.Admin]), async (req, res) => {
  console.log('asdfasdf');
  try {
    const data = await new Broker({ broker: req.body.broker }).save();
    res.json({ status: 'OK', data: data });
  } catch (e) {
    console.log(e);
    res.json({ status: 'ERR' });
  }
});

/**
 * @route POST api/settings/homepage-content
 * @description
 * @access ADMIN
 */
router.post('/homepage-content', auth([Role.Admin]), async (req, res) => {
  try {
    const data = await new HomePageContent(req.body).save();
    res.json({ status: 'OK', data: data });
  } catch (e) {
    console.log(e);
    res.json({ status: 'ERR' });
  }
});

/**
 * @route   PUT api/settings/site-setting
 * @desc    Get user info from id
 * @access  ADMIN
 */
router.put('/site-setting', auth([Role.Admin]), async (req, res) => {
  try {
    const { userRegistration, maxAccount } = req.body;
    console.log(userRegistration, maxAccount);

    const _userRegistration = await SiteSetting.findOne({
      key: 'userRegistration',
    });
    if (_userRegistration) {
      await SiteSetting.findOneAndUpdate(
        { key: 'userRegistration' },
        { value: userRegistration }
      );
    } else {
      await new SiteSetting({
        key: 'userRegistration',
        value: userRegistration,
      }).save();
    }

    const _maxAccount = await SiteSetting.findOne({ key: 'maxAccount' });
    if (_maxAccount) {
      await SiteSetting.findOneAndUpdate(
        { key: 'maxAccount' },
        { value: maxAccount }
      );
    } else {
      await new SiteSetting({ key: 'maxAccount', value: maxAccount }).save();
    }

    res.json({ status: 'OK' });
  } catch (err) {
    console.log(err);
    res.json({ status: 'ERR' });
  }
});

/**
 * @route PUT api/settings/homepage-content
 * @description
 * @access ADMIN
 */
router.put('/homepage-content/:id', auth([Role.Admin]), async (req, res) => {
  try {
    await HomePageContent.findByIdAndUpdate(req.params.id, req.body);
    res.json({ status: 'OK' });
  } catch (e) {
    console.log(e);
    res.json({ status: 'ERR' });
  }
});

/**
 * @route DELETE api/settings/homepage-content/:id
 * @description
 * @access ADMIN
 */
router.delete('/homepage-content/:id', auth([Role.Admin]), async (req, res) => {
  try {
    await HomePageContent.deleteOne({ _id: req.params.id });
    res.json({ status: 'OK' });
  } catch (e) {
    console.log(e);
    res.json({ status: 'ERR' });
  }
});

/**
 * @route DELETE api/settings/brokers/:id
 * @description
 * @access ADMIN
 */
router.delete('/brokers/:id', auth([Role.Admin]), async (req, res) => {
  try {
    await Broker.findByIdAndDelete(req.params.id);
    res.json({ status: 'OK' });
  } catch (e) {
    console.log(e);
    res.json({ status: 'ERR' });
  }
});

module.exports = router;
