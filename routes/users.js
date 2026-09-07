var express = require('express');
var router = express.Router();
const userSchema = require('../models/user.model');
const verifyToken = require('../middleware/jwt_decode');
const adminOnly = require('../middleware/adminOnly.js');
const mongoose = require('mongoose');

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ status: 400, message: 'Invalid user id', data: null });
  }
  next();
};

router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    let users = await userSchema.find().select('-password');
    
    return res.status(200).json({
      status: 200,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
});


router.put('/:id/approve', verifyToken, adminOnly, validateId, async function (req, res) {
  try {
    let { status } = req.body;
    let { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 400,
        message: 'Status must be approved or rejected',
        data: null
      });
    }


    let user = await userSchema.findByIdAndUpdate(id, {status}, {new: true})

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
        data: null
      })
    };

    return res.status(200).json({
      status: 200,
      message: status === 'approved'
        ? 'User approved successfully'
        : 'User rejected successfully',
      data: { username: user.username, status: user.status }
    });

  }catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: []
    });
  }
})

module.exports = router;
