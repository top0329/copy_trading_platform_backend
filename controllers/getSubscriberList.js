const axios = require("axios");
const dotenv = require("dotenv");
const Subscriber = require("../models/Subscriber");

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function getSubscriberList() {
  const res = await axios.get(
    "https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/subscribers",
    {
      headers: { "auth-token": token },
    }
  );

  res.data.forEach(async (subscriber) => {
    await Subscriber.findOneAndUpdate({subscriberId:subscriber._id}, {})
  });

  return res;
}
