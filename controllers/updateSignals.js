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
  let config = {
    headers: { 'auth-token': token, 'Content-Type': 'application/json' },
  };
  const data = JSON.stringify({
    name: SubscriberName,
    subscriptions: strategyIds.map((id) => {
      return {
        strategyId: id,
        symbolFilter: {
          included: [
            'AUDCAD',
            'AUDCHF',
            'AUDHKD',
            'AUDJPY',
            'AUDNZD',
            'AUDSGD',
            'AUDUSD',
            'CADCHF',
            'CADHKD',
            'CADJPY',
            'CADSGD',
            'CHFHKD',
            'CHFJPY',
            'CHFZAR',
            'EURAUD',
            'EURCAD',
            'EURCHF',
            'EURCZK',
            'EURDKK',
            'EURGBP',
            'EURHKD',
            'EURHUF',
            'EURJPY',
            'EURNOK',
            'EURNZD',
            'EURPLN',
            'EURSEK',
            'EURSGD',
            'EURTRY',
            'EURUSD',
            'EURZAR',
            'GBPAUD',
            'GBPCAD',
            'GBPCHF',
            'GBPHKD',
            'GBPJPY',
            'GBPNZD',
            'GBPPLN',
            'GBPSGD',
            'GBPUSD',
            'GBPZAR',
            'HKDJPY',
            'NZDCAD',
            'NZDCHF',
            'NZDHKD',
            'NZDJPY',
            'NZDSGD',
            'NZDUSD',
            'SGDCHF',
            'SGDJPY',
            'TRYJPY',
            'USDCAD',
            'USDCHF',
            'USDCNH',
            'USDCZK',
            'USDDKK',
            'USDHKD',
            'USDHUF',
            'USDJPY',
            'USDMXN',
            'USDNOK',
            'USDPLN',
            'USDSAR',
            'USDSEK',
            'USDSGD',
            'USDTHB',
            'USDTRY',
            'USDZAR',
            'ZARJPY',
          ],
          excluded: [],
        },
      };
    }),
  });
  await axios.put(url, data, config);
  const subscriberData = await axios.get(url, config);
  const newSubscriber = new Subscriber({
    subscriberId: subscriberID,
    name: SubscriberName,
    strategyIds: strategyIds,
    subscriptions: subscriberData.data.subscriptions,
  });

  await newSubscriber.save();

  return 'Successful';
};
