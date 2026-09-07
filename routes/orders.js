var express = require('express');
var router = express.Router();
var orderSchema = require('../models/order.model');

const verifyToken = require('../middleware/jwt_decode');

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.auth.user.id;

    const orders = await orderSchema
      .find({ user: userId })
      .populate('product', 'title price image')
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      message: 'Orders retrieved successfully',
      data: orders
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
});

module.exports = router;
