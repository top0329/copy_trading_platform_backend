const axios = require('axios');
const dotenv = require('dotenv');
const Subscriber = require('../models/Subscriber');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function updateSignals(
  SubscriberName,
  subscriberID,
  strategyIds
) {
  let url = `https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/subscribers/${subscriberID}`;
  const data = JSON.stringify({
    name: SubscriberName,
    subscriptions: strategyIds.map((id) => {
      return { strategyId: id };
    }),
  });
  console.log(data);
  let config = {
    headers: { 'auth-token': token, 'Content-Type': 'application/json' },
  };
  const res = await axios.put(url, data, config);
  const newSubscriber = new Subscriber({
    subscriberId: subscriberID,
    name: SubscriberName,
  });
  await newSubscriber.save();

  return 'Successful';
};
