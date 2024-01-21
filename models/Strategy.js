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
      openTrades: { type: Boolean, default: true },
      tradeHistory: { type: Boolean, default: true },
      balanceInformation: { type: Boolean, default: true },
      broker: { type: Boolean, default: true },
      accountDetails: { type: Boolean, default: true },
      ticket: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('strategy', StrategySchema);
