const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Roles = require('../config/role');

const SiteSettingSchema = new Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
    },
    value: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('setting', SiteSettingSchema);
