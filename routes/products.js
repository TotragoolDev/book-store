var express = require('express');
var router = express.Router();
var productSchema = require('../models/product.model');
var orderSchema = require('../models/order.model');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const mongoose = require('mongoose');

const verifyToken = require('../middleware/jwt_decode');
const adminOnly = require('../middleware/adminOnly.js');

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ status: 400, message: 'Invalid id', data: [] });
  }
  next();
};

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
    let { title, author, genre, description, price, stock } = req.body
    let products = new productSchema({
      title: title,
      author: author,
      genre: genre,
      description: description,
      price: price,
      stock: stock,
      image: req.file ? `/images/${req.file.filename}` : undefined
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

router.put('/:id', verifyToken, adminOnly, validateId, upload.single('image'), async function (req, res) {
  try {
    const { id } = req.params;
    const { title, author, genre, description, price, stock } = req.body;

    const updateData = { title, author, genre, description, price, stock };

    if (req.file) {
      updateData.image = `/images/${req.file.filename}`;
    }

    const product = await productSchema.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found',
        data: []
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Product updated successfully',
      data: product
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

router.delete('/:id', verifyToken, adminOnly, validateId, async function (req, res) {
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
      message: 'Product deleted successfully',
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

router.get('/:id', verifyToken, validateId, async (req, res) => {
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

router.get('/:id/orders', verifyToken, validateId, async (req, res) => {
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

    let orders = await orderSchema
    .find({ product: id, user: userId })
    .populate('product', 'title')
    .populate('user', 'username');

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

router.post('/:id/orders', verifyToken, validateId, async function (req, res) {
  try {
    let { id } = req.params;
    let userId = req.auth.user.id;
    let qty = Number(req.body.quantity);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid product id',
        data: []
      });
    }

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        status: 400,
        message: 'Quantity must be a positive integer',
        data: []
      });
    }

    let product = await productSchema.findOneAndUpdate(
      { _id: id, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!product) {
      let exists = await productSchema.exists({ _id: id });
      return exists
        ? res.status(400).json({
          status: 400,
          message: 'The quantity exceeds the available stock',
          data: []
        })
        : res.status(404).json({
          status: 404,
          message: 'Product not found',
          data: []
        });
    }

    let order;
    try {
      order = await orderSchema.create({
        user: userId,
        product: id,
        quantity: qty,
        totalPrice: product.price * qty
      });
    } catch (err) {
      await productSchema.updateOne({ _id: id }, { $inc: { stock: qty } });
      throw err;
    }

    await order.populate([
      { path: 'product', select: 'title' },
      { path: 'user', select: 'username' }
    ]);

    return res.status(201).json({
      status: 201,
      message: 'Order created successfully',
      data: order
    });

  } catch (err) {
    console.error('Create order failed:', err);
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
});

module.exports = router;