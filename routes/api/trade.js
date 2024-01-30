const express = require('express');
const Trade = require('../../models/Trade');
const Account = require('../../models/Account');
const auth = require('../../middleware/auth');
const Role = require('../../config/role');

const router = express();

router.get('/', auth([Role.User, Role.Admin]), async (req, res) => {
  const { page, pagecount, sort, type } = req.query;
  console.log(
    'trade 1 file=>>>>>>>>>>>>>>>>>>>>',
    page ? pagecount * (page - 1) : 0
  );
  try {
    const count = await Trade.find(req.user.role !== "Admin" ? { "account.user": req.user._id } : {}).count();

    const data = await Trade.aggregate([
      {
        $lookup: {
          from: Account.collection.name,
          localField: 'accountId',
          foreignField: 'accountId',
          as: 'account',
        },
      },
      {
        $match: req.user.role !== "Admin" ? { "account.user": req.user._id } : {}
      },
      {
        $project: {
          'account.name': 1,
          'account.login': 1,
          'account.user': 1,
          id: 1,
          type: 1,
          volume: 1,
          profit: 1,
          success: 1,
          openTime: 1,
          symbol: 1,
          gain: 1,
          openPrice: 1,
          durationInMinutes: 1,
          marketValue: 1,
          positionId: 1,
          riskInBalancePercent: 1,
          riskInPips: 1,
        },
      },
      // {$sort: ...},
      { $skip: page ? pagecount * (page - 1) : 0 },
      { $limit: pagecount ? parseInt(pagecount) : 10 },
    ]);

    console.log(data)

    res.json({ data, count });
  } catch (err) {
    console.log(err);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { page, pagecount, sort, type } = req.query;
  console.log(
    'trade 2 file=>>>>>>>>>>>>>>>>>>>>',
    page ? pagecount * (page - 1) : 0
  );
  try {
    const count = await Trade.find({ accountId: id }).count();
    const data = await Trade.aggregate([
      { $match: { accountId: id } },
      {
        $lookup: {
          from: Account.collection.name,
          localField: 'accountId',
          foreignField: 'accountId',
          as: 'account',
        },
      },
      {
        $project: {
          'account.name': 1,
          'account.login': 1,
          id: 1,
          type: 1,
          volume: 1,
          profit: 1,
          success: 1,
          openTime: 1,
          symbol: 1,
          gain: 1,
          openPrice: 1,
          durationInMinutes: 1,
          marketValue: 1,
          positionId: 1,
          riskInBalancePercent: 1,
          riskInPips: 1,
          accountId: 1,
        },
      },
      // {$sort: ...},
      { $skip: page ? pagecount * (page - 1) : 0 },
      { $limit: pagecount ? parseInt(pagecount) : 10 },
    ]);

    res.json({ data, count });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
