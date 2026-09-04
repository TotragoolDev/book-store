var express = require('express');
var router = express.Router();
const userSchema = require('../models/user.model');
const verifyToken = require('../middleware/jwt_decode');
const adminOnly = require('../middleware/adminOnly.js');

router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    let users = await userSchema.find();
    
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


router.put('/:id/approve', verifyToken, adminOnly, async function (req, res) {
  try {
    let { status } = req.body;
    let { id } = req.params;
    let user = await userSchema.findByIdAndUpdate(id, {status}, {new: true})

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      })
    };

    return res.status(200).json({
      status: 200,
      message: 'User approved successfully',
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
