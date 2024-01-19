const express = require('express');
const getSubscriberList = require('../../controllers/getSubscriberList');
const updateSignals = require('../../controllers/updateSignals');
const Subscriber = require('../../models/Subscriber');
const axios = require('axios');
const auth = require('../../middleware/auth');
const Role = require('../../config/role');

const router = express();

// Get Strategy List from MetaAPI
router.get(
  '/subscriber-list',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    let data = await getSubscriberList();
    const result = data.data;
    res.json({ Subscriber: result });
  }
);

router.get('/subscribers', auth([Role.User, Role.Admin]), async (req, res) => {
  let data = await Subscriber.find();
  res.json(data);
});

router.get('/:id', auth([Role.User, Role.Admin]), async (req, res) => {
  let data = await Subscriber.findOne({ subscriberId: req.params.id });
  res.json(data);
});

router.get('/strategy/:id', auth([Role.User, Role.Admin]), async (req, res) => {
  let data = await Subscriber.find({ strategyIds: req.params.id });
  res.json(data);
});

// function that register for receive signals with strategy ID. can be several signals. Must give Subscriber name for update.
router.post(
  '/update-signals',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      const { SubscriberName, SubscriberID, strategyIDs } = req.body;

      const data = await updateSignals(SubscriberName, SubscriberID, strategyIDs);
      const result = data;
      res.status(200).json({ Subscriber: result });
    } catch (err) {
      console.log(err);
      res.status(500).send('Server Error');
    }
  }
);

router.put(
  '/update-symbol-filter/:subscriberId',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      const response = await axios.put(
        `https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/subscribers/${req.params.subscriberId}`,
        req.body,
        {
          headers: {
            'auth-token': process.env.METAAPI_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await Subscriber.findOneAndUpdate(
        { subscriberId: req.params.subscriberId },
        { subscriptions: req.body.subscriptions }
      );
      res.status(200).json({ msg: 'Successfully updated!', data: response.data });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.delete('/:id', auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const response = await axios.delete(
      `https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/subscribers/${req.params.id}`,
      {
        headers: { 'auth-token': process.env.METAAPI_TOKEN },
      }
    );
    const subscriber = await Subscriber.findOneAndDelete({
      subscriberId: req.params.id,
    });
    res.json(subscriber);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
