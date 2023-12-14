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
      // required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('strategy', StrategySchema);
