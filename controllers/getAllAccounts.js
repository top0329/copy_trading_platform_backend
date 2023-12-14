const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.METAAPI_TOKEN;

module.exports = async function getAllAccounts() {

  const res = await axios.get(
    'https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/strategies',
    {
      headers: { 'auth-token': token },
    }
  );

  return res;
};
