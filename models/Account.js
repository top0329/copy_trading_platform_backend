const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    accountID: {
      type: String,
      required: true,
      unique: true,
    },
    login: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    server: {
      type: String,
      required: true,
    },
    magic: {
      type: Number,
      required: true,
    },
    connectionStatus: {
      type: String,
    },
    state: {
      type: String,
    },
    region: {
      type: String,
    },
    copyFactoryRoles: [
      {
        type: String,
        required: true,
      },
    ],
    copyFactoryResourceSlots: {
      type: Number,
    },
    quoteStreamingIntervalInSeconds: {
      type: Number,
    },
    broker: {
      type: String,
    },
    currency: {
      type: String,
    },
    platform: {
      type: String,
    },
    balance: {
      type: Number,
    },
    equity: {
      type: Number,
    },
    margin: {
      type: Number,
    },
    freeMargin: {
      type: Number,
    },
    leverage: {
      type: Number,
    },
    type: {
      type: String,
    },
    credit: {
      type: Number,
    },
    marginMode: {
      type: String,
    },
    tradeAllowed: {
      type: Boolean,
    },
    investorMode: {
      type: Boolean,
    },
    accountCurrencyExchangeRate: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('account', AccountSchema);
