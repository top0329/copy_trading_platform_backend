const axios = require('axios');
const dotenv = require('dotenv');
const Account = require('../models/Account');
const { _sleep } = require('../utils/utils');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

async function getAccountInformation(accountId) {
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
    return accountData;
  } catch (e) {
    console.log('err in updating...');
    const accountData = await Account.findOneAndUpdate(
      { accountId: accountId },
      {
        connectionStatus: 'DISCONNECTED',
      },
      {
        new: true,
        upsert: true,
      }
    );
    return new Error("Err in updating");
  }
};

async function _updateAccountInformation(id) {
  for (let i = 0; i < 10; i++) {
    await _sleep(10);
    try {
      await getAccountInformation(id);
      console.log("update success----------->", { id, i });
      break;
    } catch (err) {
      console.log("update failed------------>", i);
    }
  }
}

module.exports = {
  _updateAccountInformation,
  getAccountInformation
}