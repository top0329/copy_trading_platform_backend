const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Roles = require('../config/role');

const UserSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: {
      type: String,
    },
    emailVerifyExpire: {
      type: Date,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.keys(Roles),
      default: Roles.User,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('user', UserSchema);
