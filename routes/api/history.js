const express = require('express');
const History = require('../../models/History');
const auth = require('../../middleware/auth');
const Role = require('../../config/role');
const Account = require('../../models/Account');

const router = express();

router.get(
  '/',
  auth([Role.User, Role.Provider, Role.Admin]),
  async (req, res) => {
    const { page, pagecount, sort, type } = req.query;

    try {
      console.log(
        'history 1 file=>>>>>>>>>>>>>>>>>>>>',
        page ? pagecount * (page - 1) : 0
      );
      const count = await History.find(
        req.user.role !== 'Admin' ? { 'account.user': req.user._id } : {}
      ).count();
      const data = await History.aggregate([
        {
          $lookup: {
            from: Account.collection.name,
            localField: 'accountId',
            foreignField: 'accountId',
            as: 'account',
          },
        },
        {
          $match:
            req.user.role !== 'Admin' ? { 'account.user': req.user._id } : {},
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
            closeTime: 1,
            openPrice: 1,
            closePrice: 1,
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

      res.json({ data, count });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { page, pagecount, sort, type } = req.query;
  console.log(
    'history 2 file=>>>>>>>>>>>>>>>>>>>>',
    page ? pagecount * (page - 1) : 0
  );
  try {
    const count = await History.find({ accountId: id }).count();
    const data = await History.aggregate([
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
          closeTime: 1,
          openPrice: 1,
          closePrice: 1,
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

    res.json({ data, count });
  } catch (err) {
    console.log(err);
  }
});

router.get('/all/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await History.find({ accountId: id });
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

//for view user
router.get('/all/view/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await History.find({ accountId: id });
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
