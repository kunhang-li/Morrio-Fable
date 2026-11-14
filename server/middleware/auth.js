function auth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Missing x-user-id header' });
  }
  req.userId = parseInt(userId, 10);
  next();
}

module.exports = auth;