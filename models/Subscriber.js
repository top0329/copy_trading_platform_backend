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
  },
  { timestamps: true }
);

module.exports = mongoose.model('subscriber', SubscriberSchema);
