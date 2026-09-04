var express = require('express');
var router = express.Router();
const userSchema = require('../models/user.model');


router.get('/', async (req, res) => {
  const users = await userSchema.find();
  res.json( {data: users} );
});


router.put('/:id/approve', async function (req, res) {
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
