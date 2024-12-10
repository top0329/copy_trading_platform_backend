const axios = require('axios');
const dotenv = require('dotenv');
const Account = require('../models/Account');
const User = require('../models/User');

dotenv.config();

const token = process.env.METAAPI_TOKEN;
function generateTransactionId() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let transactionId = '';

  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    transactionId += characters.charAt(randomIndex);
  }

  return transactionId;
}

module.exports = async function registerAccount(
  login,
  password,
  name,
  server,
  copyFactoryRoles,
  platform,
  user
) {
  try {
    const transactionId = generateTransactionId();
    let url =
      'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts';
    let config = {
      headers: {
        'auth-token': token,
        'Content-Type': 'application/json',
        'transaction-id': transactionId,
      },
    };
    if (user.role === 'User') {
      console.log('user');
      const data = JSON.stringify({
        quoteStreamingIntervalInSeconds: 0.5,
        region: 'new-york',
        login: login,
        password: password,
        name: name,
        server: server,
        magic: 0,
        copyFactoryRoles: ['SUBSCRIBER'],
        platform: platform,
        resourceSlots: 2,
        metastatsApiEnabled: true,
      });
      const res = await axios.post(url, data, config);
      const newAccount = new Account({
        user: user.id,
        accountId: res.data.id,
        state: res.data.state,
        quoteStreamingIntervalInSeconds: 0.5,
        region: 'new-york',
        login: login,
        password: password,
        name: name,
        server: server,
        magic: 0,
        copyFactoryRoles: ['SUBSCRIBER'],
        platform: platform,
        resourceSlots: 2,
        metastatsApiEnabled: true,
      });
      await newAccount.save();
    }
    if (user.role === 'Provider') {
      const userData = await User.findById(user._id);
      if (userData.providerAccountLimit > 0) {
        console.log('user');
        const data = JSON.stringify({
          quoteStreamingIntervalInSeconds: 0.5,
          region: 'new-york',
          login: login,
          password: password,
          name: name,
          server: server,
          magic: 0,
          copyFactoryRoles: copyFactoryRoles,
          platform: platform,
          resourceSlots: 2,
          metastatsApiEnabled: true,
        });
        const res = await axios.post(url, data, config);
        const newAccount = new Account({
          user: user.id,
          accountId: res.data.id,
          state: res.data.state,
          quoteStreamingIntervalInSeconds: 0.5,
          region: 'new-york',
          login: login,
          password: password,
          name: name,
          server: server,
          magic: 0,
          copyFactoryRoles: copyFactoryRoles,
          platform: platform,
          resourceSlots: 2,
          metastatsApiEnabled: true,
        });
        await newAccount.save();
        await User.findByIdAndUpdate(user._id, { providerAccountLimit: userData.providerAccountLimit - 1 });
      } else {
        return new Error('Provider account limit reached');
      }
    }
    if (user.role === 'Admin') {
      const newAccount = new Account({
        user: user.id,
        accountId: res.data.id,
        state: res.data.state,
        quoteStreamingIntervalInSeconds: 0.5,
        region: 'new-york',
        login: login,
        password: password,
        name: name,
        server: server,
        magic: 0,
        copyFactoryRoles: copyFactoryRoles,
        platform: platform,
        resourceSlots: 2,
        metastatsApiEnabled: true,
      });
      await newAccount.save();
    }

    return res.data;
  } catch (err) {
    console.log(err);
    return new Error('failed');
  }
};
