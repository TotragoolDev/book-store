var express = require('express');
var router = express.Router();
var orderSchema = require('../models/order.model');

const verifyToken = require('../middleware/jwt_decode');

router.get('/', verifyToken, async (req, res) => {
  try {
    let userId = req.auth.user.id;
    let orders = await orderSchema.find({ user: userId }).populate('user', 'username');

    return res.status(200).json({
      status: 200,
      message: 'Orders retrieved successfully',
      data: orders
    });    
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
});

module.exports = router;
