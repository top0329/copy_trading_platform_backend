const express = require('express');
const History = require('../../models/History');

const router = express();

router.get('/', async (req, res) => {
  try {
    const historyData = await History.find();
    res.json(historyData);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
