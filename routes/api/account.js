const express = require('express');
const registerAccount = require('../../controllers/registerAccount');
const Account = require('../../models/Account');
const getAccountInformation = require('../../controllers/getAccountInformation');

const router = express();

router.get('/', (req, res) => {
  res.json({ response: 'GET StrtegyID Works!' });
});

router.post('/register-account', async (req, res) => {
  const { login, password, name, server, platform, copyFactoryRoles } =
    req.body;
  const data = await registerAccount(
    login,
    password,
    name,
    server,
    copyFactoryRoles,
    platform
  );
  const result = data;
  res.json({ AccountRegister: result });
});

router.get('/all-accounts', async (req, res) => {
  try {
    const allAccounts = await Account.find();
    res.json(allAccounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/update-account-information/:id', async (req, res) => {
  try {
    const accountData = await getAccountInformation(req.params.id);
    const accont = await Account.findOne({ accountID: req.params.id });
    res.json(accont);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
