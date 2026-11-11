// Content served by the production deployment.
module.exports = (req, res) => {
  res.status(200).send("PRODUCTION-CONTENT-OK\n");
};
