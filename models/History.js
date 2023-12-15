const mongoose = require('mongoose');

const DealType = require('../config/dealType');
const DealEntryType = require('../config/dealEntryType');
const DealReason = require('../config/dealReasonType');

const Schema = mongoose.Schema;

const HistorySchema = new Schema(
  {
    accountID: {
      // type: Schema.Types.ObjectId,
      type: String,
      ref: 'account',
    },
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.keys(DealType),
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    swap: {
      type: Number,
    },
    profit: {
      type: Number,
    },
    symbol: {
      type: String,
    },
    orderId: {
      type: String,
    },
    positionId: {
      type: String,
    },
    volume: {
      type: Number,
    },
    price: {
      type: Number,
    },
    entryType: {
      type: String,
      enum: Object.keys(DealEntryType),
    },
    reason: {
      type: String,
      enum: Object.keys(DealReason),
    },
    stopLoss: {
      type: Number,
    },
    takeProfit: {
      type: Number,
    },
    comment: {
      type: String,
    },
    magic: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('history', HistorySchema);
