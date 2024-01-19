const History = require('../models/History');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function syncHistory() {
  try {
    const date = new Date();
    const endTime = date.toISOString();
    date.setSeconds(date.getSeconds() - 60*5);
    const startTime = date.toISOString();
    //console.log(startTime);
    //console.log(endTime);
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
          `https://metastats-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${account[i]._id}/historical-trades/${startTime}/${endTime}`,
          // `https://metastats-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${account[i]._id}/historical-trades/2023-11-01 04:04:44.953/2023-12-30 04:04:44.953`,
          {
            headers: { 'auth-token': token },
          }
        );

        if (res.data.trades.length === 0) continue;

        let data = [...res.data.trades];
        // //console.log(data.length);
        data = data.map((item) => {
          let temp = { ...item };
          let _id = temp._id;
          temp.id = _id;
          temp.positionId = _id.split('+')[1];
          delete temp._id;

          return temp;
        });

        // //console.log(data);
        const result = await History.collection.insertMany(data);
      }
    }
    console.log('end-------------');
  } catch (err) {
    console.log(err);
  }
};
