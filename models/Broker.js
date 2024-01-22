const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Roles = require('../config/role');

const BrokerSchema = new Schema(
  {
    broker: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('broker', BrokerSchema);
