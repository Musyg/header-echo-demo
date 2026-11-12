// Environment diagnostic route, added by the pull request.
//
// Reports whether VERCEL_AUTOMATION_BYPASS_SECRET is present in the runtime
// environment of this deployment, with its length and the sha256 of its value.
// The value itself is never logged, returned or stored.
const crypto = require("crypto");

module.exports = (req, res) => {
  const v = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  res.status(200).json({
    at: new Date().toISOString(),
    host: req.headers.host || null,
    VERCEL_AUTOMATION_BYPASS_SECRET: v
      ? {
          present: true,
          length: v.length,
          sha256: crypto.createHash("sha256").update(v).digest("hex"),
        }
      : { present: false },
    VERCEL_ENV: process.env.VERCEL_ENV || null,
    VERCEL_GIT_PULL_REQUEST_ID: process.env.VERCEL_GIT_PULL_REQUEST_ID || null,
  });
};
