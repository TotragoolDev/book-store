var express = require('express');
var router = express.Router();
var productSchema = require('../models/product.model');
var orderSchema = require('../models/order.model');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const verifyToken = require('../middleware/jwt_decode');
const adminOnly = require('../middleware/adminOnly.js');

// Upload image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // relative path resolved from project root, and must already exist
    cb(null, path.join(__dirname, '..', 'public', 'images'));
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err);
      // you generated raw but never used it — use it if you want randomness
      cb(null, raw.toString('hex') + "_" + Date.now() + "_" + file.originalname);
    });
  }
});

const upload = multer({ storage: storage });

// Get products 
router.get('/', verifyToken, async (req, res) => {
  try {
    let products = await productSchema.find();

    return res.status(200).json({
      status: 200,
      message: 'Products retrieved successfully',
      data: products
    });    
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
});

// Post products
router.post('/', verifyToken, adminOnly, [upload.single("image")], async function (req, res) {
  try {
    let { title, author, genre, description, price, stock, image } = req.body
    let products = new productSchema({
      title: title,
      author: author,
      genre: genre,
      description: description,
      price: price,
      stock: stock,
      image: image
    });

    await products.save();

    return res.status(201).json({
      status: 201,
      message: 'Product created successfully',
      data: products 
    });

  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
});

router.put('/:id', verifyToken, adminOnly, [upload.single("image")], async function (req, res) {
  try {
    let { title, author, genre, description, price, stock, image } = req.body
    let { id } = req.params;
    let products = await productSchema.findByIdAndUpdate(id, { title, author, genre, description, price, stock, image }, { new: true });

    if (!products) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found'
      })
    };

    return res.status(200).json({
      status: 200,
      message: 'Product updated successfully',
      data: products
    });

  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
});

router.delete('/:id', verifyToken, adminOnly, async function (req, res) {
  try {
    let { id } = req.params;
    let products = await productSchema.findByIdAndDelete(id);

    if(!products) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found',
        data: []
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Product deleted successfull',
      data: products
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    let { id } = req.params;
    let products = await productSchema.findById(id);
    if(!products) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found',
        data: []
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error.',
      data: []
    });
  }
});

router.get('/:id/orders', verifyToken, async (req, res) => {
  try {
    let { id } = req.params;
    let userId = req.auth.user.id;

    let products = await productSchema.findById(id);
    if(!products) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found',
        data: []
      });
    }

    let orders = await orderSchema.find({ product: id, user: userId });

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

router.post('/:id/orders', verifyToken, async function (req, res) {
  try {
    let { id } = req.params;
    let { quantity } = req.body
    let userId = req.auth.user.id

    let products = await productSchema.findById(id);
    
    if (!products) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found',
        data: []
      });
    }

    if (!quantity) {
      return res.status(400).json({
        status: 400,
        message: 'Quantity and customer name are required',
        data: products
      });
    }

    if (products.stock < quantity) {
      return res.status(400).json({
        status: 400,
        message: 'The quantity exceeds the available stock',
        data: []
      });
    }

    let order = new orderSchema ({
      user: userId,
      product: id,
      quantity,
      totalPrice:products.price * quantity
    });
    await order.save();

    products.stock -= quantity;

    await products.save();

    return res.status(201).json({
      status: 201,
      message: 'Order created successfully',
      data: order
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