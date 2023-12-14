const express = require('express');
const getSubscriberList = require('../../controllers/getSubscriberList');
const updateSignals = require('../../controllers/updateSignals');
const Subscriber = require('../../models/Subscriber');
const axios = require('axios');

const router = express();

router.get('/', (req, res) => {
  res.json({ response: 'GET Subscriber Works!' });
});

// Get Strategy List from MetaAPI
router.get('/subscriber-list', async (req, res) => {
  let data = await getSubscriberList();
  const result = data.data;
  res.json({ Subscriber: result });
});

// function that register for receive signals with strategy ID. can be several signals. Must give Subscriber name for update.
router.post('/update-signals', async (req, res) => {
  // let body = req.body;
  const { SubscriberName, SubscriberID, strategyIDs } = req.body;

  const data = await updateSignals(
    SubscriberName,
    SubscriberID,
    strategyIDs
  );
  const result = data;
  res.json({ Subscriber: result });
});

module.exports = router;
