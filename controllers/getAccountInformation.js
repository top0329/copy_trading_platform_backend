const axios = require('axios');
const dotenv = require('dotenv');
const Account = require('../models/Account');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function getAccountInformatioin(accountID) {
  const accountInformation = await axios.get(
    `https://mt-client-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${accountID}/account-information`,
    {
      headers: {
        'auth-token': token,
        'Content-Type': 'application/json',
      },
    }
  );
  const accountData = await Account.findOneAndUpdate(
    { accountID: accountID },
    {
      broker: accountInformation.data.broker,
      currency: accountInformation.data.currency,
      balance: accountInformation.data.balance,
      equity: accountInformation.data.equity,
      margin: accountInformation.data.margin,
      freeMargin: accountInformation.data.freeMargin,
      leverage: accountInformation.data.leverage,
      type: accountInformation.data.type,
      credit: accountInformation.data.credit,
      marginMode: accountInformation.data.marginMode,
      tradeAllowed: accountInformation.data.tradeAllowed,
      investorMode: accountInformation.data.investorMode,
      accountCurrencyExchangeRate:
        accountInformation.data.accountCurrencyExchangeRate,
    },
    {
      new: true,
      upsert: true,
    }
  );
  return accountData;
};
