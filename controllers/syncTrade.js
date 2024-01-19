const Account = require('../models/Account');
const Trade = require('../models/Trade');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function syncTrade() {
  try {
    Trade.collection.deleteMany({});
    const res = await axios.get(
      'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts',
      {
        headers: { 'auth-token': token },
      }
    );
    const account = res.data;
    for (let i = 0; i < account.length; i++) {
      if (account[i].connectionStatus == 'CONNECTED') {
        const res = await axios.get(
          `https://metastats-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${account[i]._id}/open-trades`,
          {
            headers: { 'auth-token': token },
          }
        );
        // //console.log(res.data.openTrades);
        if (res.data.openTrades.length === 0) continue;

        let data = [...res.data.openTrades];
        data = data.map((item) => {
          let temp = { ...item };
          let _id = temp._id;
          temp.id = _id;
          temp.positionId = _id.split('+')[1];
          delete temp._id;

          return temp;
        });

        // //console.log(data.length);
        const result = await Trade.collection.insertMany(data);
      }
    }
  } catch (err) {
    console.log(err);
  }
};
