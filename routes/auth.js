var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var userSchema = require('../models/user.model');
var config = require('../config');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await userSchema.findOne({username});
    if (user) {
      return res.status(400).json({
        status: 400,
        message: 'User already exists',
        data: null
      })
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new userSchema({
      username,
      password: hashedPassword
    });

    await user.save();

    return res.status(201).json({
      status: 201,
      message: 'User registered successfully',
      data: { username: user.username }
    });

  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
    });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await userSchema.findOne({ username });

    if (!username || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Username and password are required',
        data: null
      })
    }

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials',
        data: null
      })
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials',
        data: null
      })
    };

    if (user.status === 'pending') {
      return res.status(403).json({
        status: 403,
        message: 'Your account is pending admin approval',
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        status: 403,
        message: 'Your account has been rejected',
      });
    }

    const payload = {
      user: { id: user.id }
    };

    jwt.sign(payload, config.jwtSecret, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      return res.status(201).json({
        status: 201,
        message: 'Token created successfully', 
        data: { token } 
        });
    });
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
    });
  }
})

module.exports = router;