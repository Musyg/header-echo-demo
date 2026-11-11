// Header fingerprint route.
//
// For each request header it reports the name, the value length and the
// sha256 of the value. It never logs, returns or stores any header value.
// Useful to confirm which headers a proxy or a CLI adds to a request, and to
// match a value against one you already hold, without moving the value.
const crypto = require("crypto");

module.exports = (req, res) => {
  const seen = {};
  for (const [name, value] of Object.entries(req.headers)) {
    const v = Array.isArray(value) ? value.join(",") : String(value ?? "");
    seen[name] = {
      length: v.length,
      sha256: crypto.createHash("sha256").update(v).digest("hex"),
    };
  }
  res.status(200).json({
    at: new Date().toISOString(),
    host: req.headers.host || null,
    path: req.url,
    headers: seen,
  });
};
