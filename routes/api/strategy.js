const express = require('express');
const getStrategyID = require('../../controllers/getStrategyID');
const registerStrategy = require('../../controllers/registerStrategy');
const axios = require('axios');
const Strategy = require('../../models/Strategy');
const Account = require('../../models/Account');
const auth = require('../../middleware/auth');
const Role = require('../../config/role');
const Subscriber = require('../../models/Subscriber');

const router = express();

//Get Strategy List from MetaAPI
router.get(
  '/strategy-list',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    const data = await getStrategyID();
    const result = data.data;
    res.json(result);
  }
);

router.get('/strategies', auth([Role.User, Role.Admin]), async (req, res) => {
  const { page, pagecount, sort, type } = req.query;
  console.log(
    'strategy 1 file=>>>>>>>>>>>>>>>>>>>>',
    page ? pagecount * (page - 1) : 0
  );
  try {
    const count = await Strategy.count();
    const data = await Strategy.aggregate([
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
          strategyId: 1,
          accountId: 1,
          name: 1,
          live: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      // {$sort: ...},
      { $skip: page ? pagecount * (page - 1) : 0 },
      { $limit: pagecount ? parseInt(pagecount) : 10 },
    ]);

    //console.log(data);
    res.json({ data, count });
  } catch (err) {
    console.log(err);
  }
});

router.get('/strategies-subscribers/:id', async (req, res) => {
  const { page, pagecount, sort, type } = req.query;
  const id = req.params.id;
  console.log(
    'strategy 2 file=>>>>>>>>>>>>>>>>>>>>',
    page ? pagecount * (page - 1) : 0
  );

  console.log(id);
  try {
    const count = await Subscriber.find({ strategyIds: { $in: [id] } }).count();

    console.log(count);
    const data = await Subscriber.aggregate([
      { $match: { strategyIds: { $in: [id] } } },
      {
        $lookup: {
          from: Account.collection.name,
          localField: 'subscriberId',
          foreignField: 'accountId',
          as: 'subscriber',
        },
      },
      {
        $project: {
          'subscriber.name': 1,
          'subscriber.login': 1,
          name: 1,
          subscriberId: 1,
          createdAt: 1,
          updatedAt: 1,
          strategyIds: 1,
        },
      },
      // {$sort: ...},
      { $skip: page ? pagecount * (page - 1) : 0 },
      { $limit: pagecount ? parseInt(pagecount) : 10 },
    ]);

    //console.log(data);
    res.json({ data, count });
  } catch (err) {
    console.log(err);
  }
});

router.get('/:link', async (req, res) => {
  console.log(req.params.link);
  try {
    const response = await Strategy.findOne({ strategyLink: req.params.link });
    if (response) {
      res.json({ status: 'OK', data: response.accountId });
    } else {
      res.json({ status: 'EX' });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: 'ERR' });
  }
});

router.get('/strategies/:id', async (req, res) => {
  try {
    const data = await Strategy.findOne({ strategyId: req.params.id });
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

router.get('/:id', auth([Role.User, Role.Admin]), async (req, res) => {
  const data = await Strategy.findOne({ strategyId: req.params.id });
  res.json(data);
});

//funtion that register stretegy with Signal Provider ID. Here StrategyName and strategyDescription is just for string and get from customer. If not want, can give standard name and description.
router.post(
  '/register-strategy',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    const { providerID, StrategyName, strategyDescription } = req.body;
    const data = await registerStrategy(
      providerID,
      StrategyName,
      strategyDescription
    );
    const result = data;
    res.json({ RegisterStrategy: result });
  }
);

router.put('/:id', auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const response = await Strategy.findByIdAndUpdate(req.params.id, req.body);
    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(505).json('failed');
  }
});

router.delete(
  '/:strategyId',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      const response = await axios.delete(
        `https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/strategies/${req.params.strategyId}`,
        {
          headers: { 'auth-token': process.env.METAAPI_TOKEN },
        }
      );
      console.log(response.data);
      await Strategy.findOneAndDelete({ strategyId: req.params.strategyId });
      const result = await Subscriber.find({
        strategyIds: req.params.strategyId,
      });
      for (let i = 0; i < result.length; i++) {
        if (result[i].strategyIds.length > 1) {
          await axios.delete(
            `https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/subscribers/${result[i].subscriberId}/subscriptions/${req.params.id}`,
            {
              headers: { 'auth-token': process.env.METAAPI_TOKEN },
            }
          );
          await Subscriber.updateOne(
            { subscriberId: result[i].subscriberId },
            { $pull: { strategyIds: req.params.strategyId } }
          );
        } else {
          await axios.delete(
            `https://copyfactory-api-v1.new-york.agiliumtrade.ai/users/current/configuration/subscribers/${result[i].subscriberId}`,
            {
              headers: { 'auth-token': process.env.METAAPI_TOKEN },
            }
          );
          await Subscriber.findOneAndDelete({
            subscriberId: result[i].subscriberId,
          });
        }
      }
      res.status(200).json({ msg: 'Strategy deleted successfully' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: 'Internal Server Error' });
    }
  }
);

module.exports = router;
