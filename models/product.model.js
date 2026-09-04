const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new Schema({
  title: { type: String },
  author: { type: String },
  genre: { type: String },
  description: { type: String },
  price: { type: Number },
  stock: { type: Number},
  image: { type: String },
}, {
  timestamps: true
})

module.exports = mongoose.model('products', productSchema)