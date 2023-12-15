const mongoose = require('mongoose');

const OrderType = require('../config/orderType');
const OrderStateType = require('../config/orderStateType');
const OrderReasonType = require('../config/orderReasonType');
const OrderFillingModeType = require('../config/orderFillingModeType');
const OrderExpirationType = require('../config/orderExpirationType');

const Schema = mongoose.Schema;

const TradeSchema = new Schema(
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
      enum: Object.keys(OrderType),
      required: true,
    },
    state: {
      type: String,
      enum: Object.keys(OrderStateType),
      required: true,
    },
    symbol: {
      type: String,
    },
    time: {
      type: Date,
      required: true,
    },
    openPrice: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
    },
    currentVolume: {
      type: Number,
    },
    positionId: {
      type: String,
    },
    doneTime: {
      type: Date,
    },
    reason: {
      type: String,
      enum: Object.keys(OrderReasonType),
    },
    fillingMode: {
      type: String,
      enum: Object.keys(OrderFillingModeType),
    },
    entryType: {
      type: String,
      enum: Object.keys(OrderExpirationType),
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

module.exports = mongoose.model('trade', TradeSchema);
