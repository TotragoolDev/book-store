const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 401,
        message: 'No token, authorization denied',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.auth = decoded;

    return next();
  }catch{
    return res.status(401).json({
      status: 401,
      message: 'Auth failed',
      data: null
    })
  }
}