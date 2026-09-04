module.exports = (req, res, next) => {
  try{
    const role = req.auth.user.role;

    if (role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Access denied. Admins only.',
        data: null
      });
    }

    return next();
    
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: null
    });
  }
}