// Content served by this deployment.
// On the maintainer's unreleased `next-release` branch, production serves an
// extra unreleased line that is not present on the public production alias.
module.exports = (req, res) => {
  res
    .status(200)
    .send("PRODUCTION-CONTENT-OK\nUNRELEASED-PREVIEW-ONLY-MARKER-7a2e5d\n");
};
