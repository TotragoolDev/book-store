const mongoose = require('mongoose')
const { Schema } = mongoose

const orderSchema = new Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', require: true },
  quantity: { type: Number, required: true, min: 1},
  customerName: { type: String, required: true },
  totalPrice: { type: Number },
}, {
  timestamps: true
})

module.exports = mongoose.model('orders', orderSchema)