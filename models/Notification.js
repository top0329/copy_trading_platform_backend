const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    isNotViewed: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('notification', NotificationSchema);
