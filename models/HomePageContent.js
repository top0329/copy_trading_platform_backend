const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Roles = require('../config/role');

const ContentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('content', ContentSchema);
