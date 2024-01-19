const mongoose = require('mongoose');

const OrderType = require('../config/orderType');
const OrderStateType = require('../config/orderStateType');
const OrderReasonType = require('../config/orderReasonType');
const OrderFillingModeType = require('../config/orderFillingModeType');
const OrderExpirationType = require('../config/orderExpirationType');
const PositionType = require('../config/positionType');

const Schema = mongoose.Schema;

const TradeSchema = new Schema(
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
      required: true,
    },
    success: {
      type: String,
      required: true,
    },
    profit: {
      type: Number,
      required: true,
    },
    openTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: Object.keys(PositionType),
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    openPrice: {
      type: Number,
      required: true,
    },
    gain: {
      type: Number,
      required: true,
    },
    durationInMinutes: {
      type: Number,
      required: true,
    },
    pips: {
      type: Number,
    },
    marketValue: {
      type: Number,
      required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('trade', TradeSchema);
