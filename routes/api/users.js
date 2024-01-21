const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const fs = require('fs');

const User = require('../../models/User');
const auth = require('../../middleware/auth');
const Role = require('../../config/role');
const sendMail = require('../../utils/sendMail');
const Strategy = require('../../models/Strategy');
const Account = require('../../models/Account');
const Subscriber = require('../../models/Subscriber');

// @route    GET api/users/:id
// @desc     Delete user data
// @access   admin

router.delete('/:id', auth([Role.Admin]), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ status: "OK" });
  } catch ( err ) {
    console.log(err)
    res.json( { status: "ERR" } )
  }
});

// @route    GET api/users
// @desc     Get all users
// @access   Public
router.get('/all', auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const { page, pagecount, sort, type } = req.query;
    console.log(page, pagecount, sort, type);
    const count = await User.count();
    const users = await User.aggregate([
      {
        $lookup: {
          from: Account.collection.name,
          localField: '_id',
          foreignField: 'user',
          as: 'accounts',
        },
      },
      {
        $lookup: {
          from: Strategy.collection.name,
          localField: 'accounts.accountId',
          foreignField: 'accountId',
          as: 'strategies',
        },
      },
      {
        $lookup: {
          from: Subscriber.collection.name,
          localField: 'accounts.accountId',
          foreignField: 'subscriberId',
          as: 'subscribers',
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          fullName: 1,
          maxAccount: 1,
          accounts: { $size: '$accounts' },
          strategies: { $size: '$strategies' },
          subscribers: { $size: '$subscribers' },
        },
      },
    ]);
    return res.json({ data: users, count });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }
});

// @route    GET api/users/me
// @desc     Get user data
// @access   Public

router.get('/me', auth([Role.User, Role.Admin]), async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });

  if (!user) {
    res.status(405).json({ msg: 'No user' });
  } else {
    res.json(user);
  }
});



// @route    GET api/users/verify-email/:token
// @desc     Authenticate user & get token
// @access   Public

router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerifyToken: req.params.token,
    });
    console.log(req.params.token);
    console.log(user.emailVerifyToken);
    if (user) {
      if (user.emailVerifyExpire > Date.now()) {
        user.emailVerified = true;
        await user.save();
        return res.send({ emailVerified: true });
      }
    }
    return res.send({ emailVerified: false });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }
});

// @route    GET api/users/verify-email-update/:token
// @desc     Authenticate user & get token
// @access   Public

router.get('/verify-email-update/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerifyToken: req.params.token,
    });
    console.log(req.params.token);
    console.log(user.emailVerifyToken);
    if (user) {
      if (user.emailVerifyExpire > Date.now()) {
        user.emailVerified = true;
        await user.save();
        return res.send({ emailVerified: true });
      }
    }
    return res.send({ emailVerified: false });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }
});

// @route    GET api/users/reset-password
// @desc     Reset password
// @access   Public

router.get('/reset-password/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const token = jwt.sign({ email: email }, config.get('jwtSecret'), {
      expiresIn: '3m',
    });
    const baseUrl = `http://45.8.22.219:5173`;
    const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your reset-password verification link. Please click the button below to reset your password:</p><a href="${baseUrl}/reset-password/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Reset Password</a></div>`;
    console.log(`send reset-password link to ${email}`);
    sendMail(email, content);
    return res.json({
      msg: 'Reset password link has sent to your email',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }
});

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/register',
  [
    check('fullName', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fullName, email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      const avatar = normalize(
        gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm',
        }),
        { forceHttps: true }
      );
      user = new User({
        fullName,
        email,
        avatar,
        password,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.emailVerifyToken = crypto.randomBytes(30).toString('hex');
      user.emailVerifyExpire = Date.now() + 3 * 60 * 1000;
      const result = await user.save();
      console.log(result);
      const baseUrl = `http://45.8.22.219:5173`;
      console.log(baseUrl);
      const content = `
        <div style="text-align: center">
      <div>Hi 👋</div>
      <div><h3>Get started by verifying your account</h3></div>
      <div>
        <pre style="font-size: 16px">
        We are excited to have you at Marinex🚢. We need your confirmation that
        you will be using this email to access the platform
        </pre>
          <p>Verify the email by clicking the button below:</p>
          <a
            style="
              background-color: rgb(28, 108, 253);
              padding: 10px 20px;
              color: white;
              border: none;
              border-radius: 10px;
              text-decoration: none;
            "
            href="${baseUrl}/auth/verify-email/${result.emailVerifyToken}"
          >
            Verify Your Email Address
          </a>
        </div>
      </div>`;
      sendMail(result.email, content);
      return res.status(201).json({
        msg: 'User created successfully',
        user: user,
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  }
);

// @route    POST api/users/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/login',
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Password' }] });
      }
      if (user.emailVerified) {
        const payload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: '1d' },
          (err, token) => {
            if (err) throw err;
            return res.json({ token: token, user: user });
          }
        );
      } else {
        user.emailVerifyToken = crypto.randomBytes(30).toString('hex');
        user.emailVerifyExpire = Date.now() + 3 * 60 * 1000;
        await user.save();

        const baseUrl = `http://45.8.22.219:5173`;
        const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/auth/verify-email/${user.emailVerifyToken}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
        console.log('email send -->');
        sendMail(user.email, content);
        return res.send({
          msg: 'Email verification has sent to your email',
        });
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
  }
);

// @route    POST api/users/re-send/email-verification
// @desc     Resend verification code
// @access   Private

router.post('/re-send/email-verification', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email: email });
    if (user) {
      user.emailVerifyToken = crypto.randomBytes(30).toString('hex');
      user.emailVerifyExpire = Date.now() + 3 * 60 * 1000;
      await user.save();
      const baseUrl = `http://45.8.22.219:5173`;
      const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/auth/verify-email/${user.emailVerifyToken}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
      sendMail(user.email, content);
      return res.json({
        msg: 'Email verification has sent to your email',
      });
    }
    return res.status(404).json({ errors: [{ msg: 'User not found' }] });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }
});

// @route    POST api/users/reset-password
// @desc     Reset password
// @access   Private

router.post('/reset-password', async (req, res) => {
  try {
    const { password, token } = req.body;
    const decoded = jwt.decode(token.token);
    if (decoded === null) {
      return res.status(400).json({ msg: 'Reset password failed' });
    }
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      return res.status(400).json({ msg: 'Reset password failed' });
    }
    const user = await User.findOne({ email: decoded.email });

    if (user) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      try {
        await user.save();
        return res.json({ msg: 'Reset password successfully' });
      } catch (error) {
        return res.status(400).json({ msg: 'Reset password failed' });
      }
    }
    return res.status(404).json({ msg: 'No user found with that email' });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }
});

// @route    PUT api/users/me
// @desc     Update user data
// @access   Private

router.put('/me', auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const oldUser = await User.findOne({ _id: req.user.id });
    if (oldUser.email === req.body.email) {
      oldUser.fullName = req.body.fullName;
      const user = await oldUser.save();
      return res.json(user);
    } else {
      oldUser.fullName = req.body.fullName;
      oldUser.email = req.body.email;
      oldUser.emailVerified = false;
      oldUser.emailVerifyToken = crypto.randomBytes(30).toString('hex');
      oldUser.emailVerifyExpire = Date.now() + 3 * 60 * 1000;
      const baseUrl = `http://45.8.22.219:5173`;
      const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/email-verify-update/${oldUser.emailVerifyToken}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
      sendMail(oldUser.email, content);
      console.log(oldUser.email);
      const user = await oldUser.save();
      console.log(user);
      return res.send({
        msg: 'Email verification has sent to your email',
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }
});

// @route    GET api/users/me
// @desc     Get user data
// @access   Public

router.put(
  '/update-password',
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const { password } = req.user;
      const isMatch = await bcrypt.compare(oldPassword, password);
      console.log(req.user);
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(newPassword, salt);
        const user = await User.findOneAndUpdate(
          { _id: req.user.id },
          { password: password }
        );
        const payload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: '1d' },
          (err, token) => {
            if (err) throw err;
            return res.json({ token: token, user: user });
          }
        );
        return res.json({ msg: 'Password updated successfully!' });
      } else {
        return res.status(400).json({ msg: 'Invalid old password!' });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send('Server error');
    }
  }
);

module.exports = router;
