const mongoose = require('mongoose');

const DealType = require('../config/dealType');
const DealEntryType = require('../config/dealEntryType');
const DealReason = require('../config/dealReasonType');

const Schema = mongoose.Schema;

const HistorySchema = new Schema(
  {
    accountId: {
      // type: Schema.Types.ObjectId,
      type: String,
      ref: 'account',
    },
    id: {
      type: String,
      required: true,
    },
    positionId: {
      type: String,
    },
    volume: {
      type: Number,
    },
    durationInMinutes: {
      type: Number,
    },
    profit: {
      type: Number,
    },
    gain: {
      type: Number,
    },
    success: {
      type: String,
    },
    openTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: Object.keys(DealType),
      required: true,
    },
    symbol: {
      type: String,
    },
    closeTime: {
      type: Date,
      required: true,
    },
    openPrice: {
      type: Number,
    },
    closePrice: {
      type: Number,
    },
    pips: {
      type: Number,
    },
    riskInBalancePercent: {
      type: Number,
    },
    riskInPips: {
      type: Number,
    },
    comment: {
      type: String,
    },
    marketValue: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('history', HistorySchema);
