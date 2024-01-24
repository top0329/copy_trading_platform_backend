const axios = require('axios');
const dotenv = require('dotenv');
const Account = require('../models/Account');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function getAccountInformation(accountId) {
  try {
    const provisioningData = await axios.get(
      `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${accountId}`,
      {
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );
    const accountInformation = await axios.get(
      `https://mt-client-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${accountId}/account-information`,
      {
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );
    const symbols = await axios.get(
      `https://mt-client-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${accountId}/symbols`,
      {
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      }
    );
    const accountData = await Account.findOneAndUpdate(
      { accountId: accountId },
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
        symbols: symbols.data,
        connectionStatus: provisioningData.data.connectionStatus,
        manualTrades: provisioningData.data.manualTrades,
        reliability: provisioningData.data.reliability,
        baseCurrency: provisioningData.data.baseCurrency,
      },
      {
        new: true,
        upsert: true,
      }
    );
    console.log(accountData)
    return accountData;
  } catch (e) {
    console.log('err in updating...');
  }
};
