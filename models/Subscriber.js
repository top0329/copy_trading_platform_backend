const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SubscriberSchema = new Schema(
  {
    subscriberId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    strategyIds: [
      {
        type: String,
      },
    ],
    subscriptions: [
      {
        allowedSides: [
          {
            type: String,
          },
        ],
        strategyId: {
          type: String,
        },
        symbolFilter: {
          included: [{ type: String }],
          excluded: [{ type: String }],
        },
        riskLimits: [
          {
            type: { type: String },
            applyTo: { type: String },
            maxAbsoluteRisk: { type: Number },
            maxRelativeRisk: { type: Number },
            closePositions: { type: Boolean },
            startTime: { type: Date },
          },
        ],
        symbolMapping: [
          {
            to: { type: String },
            from: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('subscriber', SubscriberSchema);
