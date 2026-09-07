const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: {type: String, required: true},
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: {type: String,enum: ['pending', 'approved', 'rejected'],default: 'pending'}
}, {
  timestamps: true
})

module.exports = mongoose.model('users', userSchema)