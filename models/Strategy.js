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
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('strategy', StrategySchema);
