const axios = require('axios');
const dotenv = require('dotenv');
const Strategy = require('../models/Strategy');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function registerStrategy(
  providerID,
  StrategyName,
  strategyDescription
) {
  const newStrategyID = await generateNewID();
  // const newStrategyID = dZFw;
  const newStrategyIDstring = newStrategyID.data.id;
  // const newStrategyIDstring = "dZFw";
  console.log('newStrategyID====>', newStrategyIDstring);
  let url = `https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/strategies/${newStrategyIDstring}`;
  let data = JSON.stringify({
    name: StrategyName,
    description: strategyDescription,
    accountId: providerID,
  });
  let config = {
    headers: { 'auth-token': token, 'Content-Type': 'application/json' },
  };
  const response = await axios
    .put(url, data, config)
    .then(async (res) => {
      const newStrategy = new Strategy({
        strategyId: newStrategyIDstring,
        name: StrategyName,
        description: strategyDescription,
        accountId: providerID,
      });
      await newStrategy.save();
    })
    .catch((err) => {
      return err;
    });
  return newStrategyIDstring;
};

async function generateNewID() {
  const newID = await axios.get(
    'https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/unused-strategy-id',
    {
      headers: { 'auth-token': token },
    }
  );

  return newID;
}
