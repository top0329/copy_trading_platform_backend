const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StrategySchema = new Schema(
  {
    strategyId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    accountId: {
      type: String,
      ref: 'account',
      // required: true,
    },
    strategyLink: {
      type: String,
    },
    live: {
      type: Boolean,
      default: false,
    },
    proposers: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    terms: {
      emailAlerts: {
        type: Boolean,
        default: false,
      },
      tradeCopy: {
        type: Boolean,
        default: false,
      },
      billingModel: {
        type: String,
      },
    },
    setting: {
      openTrades: { type: Boolean, default: false },
      tradeHistory: { type: Boolean, default: false },
      balanceInformation: { type: Boolean, default: false },
      broker: { type: Boolean, default: false },
      accountDetails: { type: Boolean, default: false },
      ticket: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('strategy', StrategySchema);
