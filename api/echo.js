// Echoes a safe subset of request headers back to the caller, as JSON.
module.exports = (req, res) => {
  res.status(200).json({
    at: new Date().toISOString(),
    path: req.url,
    host: req.headers.host || null,
    userAgent: req.headers["user-agent"] || null,
  });
};
