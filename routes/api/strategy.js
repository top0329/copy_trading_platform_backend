const express = require('express');
const getStrategyID = require('../../controllers/getStrategyID');
const registerStrategy = require('../../controllers/registerStrategy');
const axios = require("axios");

const router = express();

router.get('/', (req, res) => {
  res.json({ response: 'GET StrtegyID Works!' });
});

//Get Strategy List from MetaAPI
router.get('/strategy-list', async (req, res) => {
  const data = await getStrategyID();
  const result = data.data;
  res.json({ StrategyList: result });
});

//funtion that register stretegy with Signal Provider ID. Here StrategyName and strategyDescription is just for string and get from customer. If not want, can give standard name and description.
router.post('/register-strategy', async (req, res) => {
  const { providerID, StrategyName, strategyDescription } = req.body;
  const data = await registerStrategy(
    providerID,
    StrategyName,
    strategyDescription
  );
  const result = data;
  res.json({ RegisterStrategy: result });
});

module.exports = router;
