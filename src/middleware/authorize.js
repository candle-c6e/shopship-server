export const authorize = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: true,
      msg: 'Your are not authorize.',
      result: []
    })
  }

  next()
}