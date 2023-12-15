const Account = require('../models/Account');
const Trade = require('../models/Trade');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function syncTrade() {
  const date = new Date();
  const endTime = date.toISOString();
  date.setSeconds(date.getSeconds() - 60);
  const startTime = date.toISOString();
  console.log('syncTrade', startTime);
  console.log('syncTrade', endTime);
  const res = await axios.get(
    'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts',
    {
      headers: { 'auth-token': token },
    }
  );
  const account = res.data;

  // const account = await Account.find();
  for (let i = 0; i < account.length; i++) {
    if (account[i].connectionStatus == 'CONNECTED') {
      const res = await axios.get(
        `https://mt-client-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${account[i]._id}/history-orders/time/${startTime}/${endTime}`,
        {
          headers: { 'auth-token': token },
        }
      );
      for (let j = 0; j < res.data.length; j++) {
        res.data[j].accountID = account[i]._id;
        const newTrade = new Trade(res.data[j]);
        await newTrade.save();
        console.log(newTrade);
      }
    }
  }
  console.log('Trade end-------------');
};
