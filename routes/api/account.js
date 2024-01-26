const express = require('express');
const registerAccount = require('../../controllers/registerAccount');
const Account = require('../../models/Account');
const History = require('../../models/History');
const Strategy = require('../../models/Strategy');
const getAccountInformation = require('../../controllers/getAccountInformation');
const auth = require('../../middleware/auth');
const Role = require('../../config/role');
const axios = require('axios');
const Trade = require('../../models/Trade');

const router = express();

router.get('/all-accounts', auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const allAccounts = await Account.find();
    res.json(allAccounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
/**
 * send account by req.user
 */
router.get('/accounts', auth([Role.User, Role.Admin]), async (req, res) => {
  const { page, pagecount, sort, type } = req.query;
  try {
    console.log(
      'account file=>>>>>>>>>>>>>>>>>>>>',
      page ? pagecount * (page - 1) : 0
    );
    let count = 0;
    if (req.user.role === 'Admin') {
      count = await Account.find().count();
    } else {
      count = await Account.find().count({ user: req.user._id });
    }
    const data = await Account.aggregate([
      {
        $match: req.user.role !== 'Admin' ? { user: req.user._id } : {},
      },
      {
        $lookup: {
          from: Trade.collection.name,
          localField: 'accountId',
          foreignField: 'accountId',
          as: 'volume',
        },
      },
      {
        $lookup: {
          from: History.collection.name,
          localField: 'accountId',
          foreignField: 'accountId',
          as: 'profit',
        },
      },
      {
        $addFields: {
          volume: {
            $sum: '$volume.volume',
          },
          count: {
            $size: '$volume',
          },
        },
      },
      {
        $project: {
          volume: 1,
          count: 1,
          accountId: 1,
          'profit.type': 1,
          'profit.profit': 1,
          'profit.closeTime': 1,
          login: 1,
          name: 1,
          platform: 1,
          balance: 1,
          equity: 1,
          total: 1,
          user: 1,
          connectionStatus: 1,
        },
      },
      {
        $project: {
          volume: 1,
          accountId: 1,
          count: 1,
          profit: {
            $filter: {
              input: '$profit',
              as: 'profit',
              cond: {
                $or: [
                  { $eq: ['$$profit.type', 'DEAL_TYPE_BUY'] },
                  { $eq: ['$$profit.type', 'DEAL_TYPE_SELL'] },
                ],
              },
            },
          },
          login: 1,
          name: 1,
          platform: 1,
          balance: 1,
          equity: 1,
          total: 1,
          user: 1,
          connectionStatus: 1,
        },
      },
      {
        $addFields: {
          total: {
            $sum: '$profit.profit',
          },
        },
      },

      { $skip: page ? pagecount * (page - 1) : 0 },
      { $limit: pagecount ? parseInt(pagecount) : 10 },
    ]);
    // console.log(data);
    res.json({ data, count });
  } catch (err) {
    console.log(err);
  }
});
/**
 * @route api/account/accountInfo/:id
 * @desc  send accountInfo using accountId
 */
router.get('/accountInfo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const totalTrades = await History.find({ accountId: id }).count();

    if (totalTrades === 0) {
      return res.json({});
    }

    const win = await History.find({ success: 'won', accountId: id }).count();
    const loss = await History.find({ success: 'lost', accountId: id }).count();
    let lots = await History.aggregate([
      {
        $match: { accountId: id },
      },
      {
        $group: {
          _id: null,
          sum: { $sum: '$volume' },
        },
      },
    ]);

    const longs = await History.find({
      accountId: id,
      type: 'DEAL_TYPE_BUY',
    }).count();
    const longsWon = await History.find({
      accountId: id,
      type: 'DEAL_TYPE_BUY',
      success: 'won',
    }).count();

    const shorts = await History.find({
      accountId: id,
      type: 'DEAL_TYPE_SELL',
    }).count();
    const shortsWon = await History.find({
      accountId: id,
      type: 'DEAL_TYPE_SELL',
      success: 'won',
    }).count();

    const bestTrade = await History.find({
      accountId: id,
      $or: [{ type: 'DEAL_TYPE_SELL' }, { type: 'DEAL_TYPE_BUY' }],
    }).sort('-profit');

    const worstTrade = await History.find({
      accountId: id,
      $or: [{ type: 'DEAL_TYPE_SELL' }, { type: 'DEAL_TYPE_BUY' }],
    }).sort('profit');

    const averageWin = await History.aggregate([
      { $match: { accountId: id, success: 'won' } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$profit' },
        },
      },
    ]);

    const averageLoss = await History.aggregate([
      { $match: { accountId: id, success: 'lost' } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$profit' },
        },
      },
    ]);

    const deposit = await History.aggregate([
      {
        $match: { accountId: id, type: 'DEAL_TYPE_BALANCE' },
      },
      {
        $group: {
          _id: null,
          sum: { $sum: '$profit' },
        },
      },
    ]);

    const account = await Account.findOne({ accountId: id });

    res.json({
      lots: lots.length > 0 ? lots[0].sum : 0,
      loss,
      win,
      totalTrades,
      longs,
      longsWon,
      shorts,
      shortsWon,
      bestTrade: bestTrade[0],
      worstTrade: worstTrade[0],
      averageWin: averageWin.length > 0 ? averageWin[0].avg : 0,
      averageLoss: averageLoss.length > 0 ? averageLoss[0].avg : 0,

      deposit: deposit.length > 0 ? deposit[0].sum : 0,
      balance: account.balance,
      broker: account.broker,
      server: account.server,
      leverage: account.leverage,
      accountType: account.type,
    });
  } catch (err) {
    console.log(err);
  }
});
router.get('/accountInfo/view/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const totalTrades = await History.find({ accountId: id }).count();

    if (totalTrades === 0) {
      res.json({});
    }

    const win = await History.find({ success: 'won', accountId: id }).count();
    const loss = await History.find({ success: 'lost', accountId: id }).count();
    let lots = await History.aggregate([
      {
        $match: { accountId: id },
      },
      {
        $group: {
          _id: null,
          sum: { $sum: '$volume' },
        },
      },
    ]);

    const longs = await History.find({
      accountId: id,
      type: 'DEAL_TYPE_BUY',
    }).count();
    const longsWon = await History.find({
      accountId: id,
      type: 'DEAL_TYPE_BUY',
      success: 'won',
    }).count();

    const shorts = await History.find({
      accountId: id,
      type: 'DEAL_TYPE_SELL',
    }).count();
    const shortsWon = await History.find({
      accountId: id,
      type: 'DEAL_TYPE_SELL',
      success: 'won',
    }).count();

    const bestTrade = await History.find({
      accountId: id,
      $or: [{ type: 'DEAL_TYPE_SELL' }, { type: 'DEAL_TYPE_BUY' }],
    }).sort('-profit');

    const worstTrade = await History.find({
      accountId: id,
      $or: [{ type: 'DEAL_TYPE_SELL' }, { type: 'DEAL_TYPE_BUY' }],
    }).sort('profit');

    const averageWin = await History.aggregate([
      { $match: { accountId: id, success: 'won' } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$profit' },
        },
      },
    ]);

    const averageLoss = await History.aggregate([
      { $match: { accountId: id, success: 'lost' } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$profit' },
        },
      },
    ]);

    const deposit = await History.aggregate([
      {
        $match: { accountId: id, type: 'DEAL_TYPE_BALANCE' },
      },
      {
        $group: {
          _id: null,
          sum: { $sum: '$profit' },
        },
      },
    ]);

    const account = await Account.findOne({ accountId: id });

    res.json({
      lots: lots.length > 0 ? lots[0].sum : 0,
      loss,
      win,
      totalTrades,
      longs,
      longsWon,
      shorts,
      shortsWon,
      bestTrade: bestTrade[0],
      worstTrade: worstTrade[0],
      averageWin: averageWin.length > 0 ? averageWin[0].avg : 0,
      averageLoss: averageLoss.length > 0 ? averageLoss[0].avg : 0,

      deposit: deposit.length > 0 ? deposit[0].sum : 0,
      balance: account.balance,
      broker: account.broker,
      server: account.server,
      leverage: account.leverage,
      accountType: account.type,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/accounts/:id', auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const data = await Account.aggregate([
      {
        $match: { accountId: req.params.id },
      },
      {
        $lookup: {
          from: Trade.collection.name,
          localField: 'accountId',
          foreignField: 'accountId',
          as: 'volume',
        },
      },
      {
        $lookup: {
          from: History.collection.name,
          localField: 'accountId',
          foreignField: 'accountId',
          as: 'profit',
        },
      },
      {
        $addFields: {
          volume: {
            $sum: '$volume.volume',
          },
          count: {
            $size: '$volume',
          },
        },
      },
      {
        $project: {
          volume: 1,
          count: 1,
          accountId: 1,
          'profit.type': 1,
          'profit.profit': 1,
          'profit.closeTime': 1,
          login: 1,
          name: 1,
          platform: 1,
          balance: 1,
          equity: 1,
          total: 1,
          updatedAt: 1,
        },
      },
      {
        $project: {
          volume: 1,
          accountId: 1,
          count: 1,
          profit: {
            $filter: {
              input: '$profit',
              as: 'profit',
              cond: {
                $or: [
                  { $eq: ['$$profit.type', 'DEAL_TYPE_BUY'] },
                  { $eq: ['$$profit.type', 'DEAL_TYPE_SELL'] },
                  { $eq: ['$$profit.type', 'DEAL_TYPE_BALANCE'] },
                ],
              },
            },
          },
          login: 1,
          name: 1,
          platform: 1,
          balance: 1,
          equity: 1,
          total: 1,
          updatedAt: 1,
        },
      },
      {
        $addFields: {
          total: {
            $sum: '$profit.profit',
          },
        },
      },
    ]);
    res.json(data[0]);
  } catch (err) {
    console.log(err);
  }
});
//for view users
router.get('/accounts/view/:id', async (req, res) => {
  try {
    const { name } = await Strategy.findOne({ accountId: req.params.id });
    const data = await Account.aggregate([
      {
        $match: { accountId: req.params.id },
      },
      {
        $lookup: {
          from: Trade.collection.name,
          localField: 'accountId',
          foreignField: 'accountId',
          as: 'volume',
        },
      },
      {
        $lookup: {
          from: History.collection.name,
          localField: 'accountId',
          foreignField: 'accountId',
          as: 'profit',
        },
      },
      {
        $addFields: {
          volume: {
            $sum: '$volume.volume',
          },
          count: {
            $size: '$volume',
          },
        },
      },
      {
        $project: {
          volume: 1,
          count: 1,
          accountId: 1,
          'profit.type': 1,
          'profit.profit': 1,
          'profit.closeTime': 1,
          login: 1,
          name: 1,
          platform: 1,
          balance: 1,
          equity: 1,
          total: 1,
          updatedAt: 1,
        },
      },
      {
        $project: {
          volume: 1,
          accountId: 1,
          count: 1,
          profit: {
            $filter: {
              input: '$profit',
              as: 'profit',
              cond: {
                $or: [
                  { $eq: ['$$profit.type', 'DEAL_TYPE_BUY'] },
                  { $eq: ['$$profit.type', 'DEAL_TYPE_SELL'] },
                  { $eq: ['$$profit.type', 'DEAL_TYPE_BALANCE'] },
                ],
              },
            },
          },
          login: 1,
          name: 1,
          platform: 1,
          balance: 1,
          equity: 1,
          total: 1,
          updatedAt: 1,
        },
      },
      {
        $addFields: {
          total: {
            $sum: '$profit.profit',
          },
        },
      },
    ]);
    res.json({ ...data[0], strategyName: name });
  } catch (err) {
    console.log(err);
  }
});

router.get('/info', auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const response = await axios.get(
      'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts',
      {
        headers: { 'auth-token': process.env.METAAPI_TOKEN },
      }
    );

    // console.log(response.data[0]);
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

router.get('/my-accounts', auth([Role.User, Role.Admin]), async (req, res) => {
  const { page, pagecount, sort, type } = req.query;

  try {
    const count = await Account.count();
    const data = await Account.find(
      req.user.role !== 'Admin' ? { user: req.user._id } : {}
    )
      .skip(page ? pagecount * (page - 1) : 0)
      .limit(pagecount ? parseInt(pagecount) : 10);

    //console.log(data);
    res.json({ data, count });
  } catch (err) {
    console.log(err);
  }
});

router.get('/:id', auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const account = await Account.findOne({
      accountId: req.params.id,
    });
    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post(
  '/register-account',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      const { login, password, name, server, platform, copyFactoryRoles } =
        req.body;
      const user = req.user;
      const data = await registerAccount(
        login,
        password,
        name,
        server,
        copyFactoryRoles,
        platform,
        user
      );
      const result = data;
      res.json({ AccountRegister: result });
    } catch (err) {
      console.log(err);
      res.status(500).send('Server Error');
    }
  }
);

router.put(
  '/update-all-accounts-information',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      let data = await Account.find();
      data.forEach(async ({ accountId }) => {
        await getAccountInformation(accountId);
      });
      res.json({});
    } catch (err) {
      // console.log(err);
    }
  }
);

router.put(
  '/update-account-information/:id',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      const accountData = await getAccountInformation(req.params.id);
      res.json(accountData);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.put(
  '/update-account-name/:id',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      const { accountName, server } = req.body;
      const response = await axios.put(
        `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${req.params.id}`,
        {
          name: accountName,
          server: server,
        },
        {
          headers: { 'auth-token': process.env.METAAPI_TOKEN },
        }
      );
      console.log(response.data);
      const result = await Account.findOneAndUpdate(
        { accountId: req.params.id },
        { name: accountName }
      );
      res.json(result);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.delete(
  '/delete/:id',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      const response = await axios.delete(
        `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${req.params.id}`,
        {
          headers: { 'auth-token': process.env.METAAPI_TOKEN },
        }
      );
      const result = await Account.findOneAndDelete({
        accountId: req.params.id,
      });

      res.json(response.data);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
);

module.exports = router;
