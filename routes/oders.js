var express = require('express');
var router = express.Router();
var orderSchema = require('../models/order.model');

router.get('/', async (req, res) => {
  try {
    let orders = await orderSchema.find();

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
