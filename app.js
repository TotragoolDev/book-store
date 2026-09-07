var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
require('dotenv').config();
require('./db.js')

var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var productRouter = require('./routes/products');
var orderRouter = require('./routes/orders');

var app = express();

// setup cors
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);

// catch 404 and forward to error handler
app.use((req, res) => {
  res.status(404).json({ status: 404, message: 'Endpoint not found', data: null });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.status === 404 ? 'Not found' : 'Server Error',
    data: null
  });
});

module.exports = app;
