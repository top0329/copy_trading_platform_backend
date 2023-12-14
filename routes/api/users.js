const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const User = require('../../models/User');
const auth = require('../../middleware/auth');
const Role = require('../../config/role');
const sendMail = require('../../utils/sendMail');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.get('/all', auth([Role.User, Role.Admin]), async (req, res) => {
  const users = User.find({});
  res.json(users);
  // console.log(users);
  // console.log('/all hi');
});

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/register',
  [
    check('fullname', 'Name is required').notEmpty(),
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
    const { fullname, email, password } = req.body;
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
        fullname,
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
      const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
      console.log(baseUrl);
      const content = `
        <div style="text-align: center">
      <div>Hi 👋</div>
      <div><h3>Get started by verifying your account</h3></div>
      <div>
        <pre style="font-size: 16px">
        We are excited to have you at Marinex🚢. We need your confirmation that
        you will be using this email to access the platform
      </pre
        >
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
          href="${baseUrl}/api/users/verify-email/${result.emailVerifyToken}"
        >
          Verify Your Email Address
        </a>
      </div>
    </div>`;
      sendMail(result.email, content);
      res.status(201).json({
        msg: 'User created successfully',
        user: user,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
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
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    GET api/users/verify-email/{token}
// @desc     Authenticate user & get token
// @access   Public

router.get('/verify-email/{token}', async (req, res) => {
  const user = await User.findOne({
    emailVerifyToken: request.params.token,
  });
  if (user) {
    if (user.emailVerifyExpire > Date.now()) {
      console.log('verify email-->', user._id);
      user.emailVerified = true;
      await user.save();
      // return success.toLocaleString();a
      return res.send({ msg: 'success' });
    }
  }
  return res.send({ mgs: 'failed' });
  // return failed.toLocaleString();
});

module.exports = router;
