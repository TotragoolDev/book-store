const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String },
  genre: { type: String },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String },
}, {
  timestamps: true
})

module.exports = mongoose.model('products', productSchema)