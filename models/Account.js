const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    accountId: {
      type: String,
      required: true,
      // unique: true,
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
    metastatsApiEnabled: {
      type: Boolean,
      default: false,
    },
    riskManagementApiEnabled: {
      type: Boolean,
      default: false,
    },
    symbols: [
      {
        type: String,
      },
    ],
    manualTrades: {
      type: Boolean,
    },
    reliability: {
      type: String,
    },
    baseCurrency: {
      type: String,
    },
    comment: {
      type: String,
      maxlength: [16, 'Comment cannot exceed 16 characters'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('account', AccountSchema);
