// Diagnostic route. Reports which custom request headers reached the function
// and whether an upstream check answers the same with and without them.
// Header values and upstream bodies are never returned, only lengths and digests.
const crypto = require("crypto");

const UPSTREAM =
  "https://header-echo-demo-pw4p5kftg-gil-mu-s-projects.vercel.app/api/content";
const PLATFORM = [
  "x-forwarded-", "x-real-ip", "x-vercel-id", "x-vercel-ip-", "x-vercel-proxy-",
  "x-vercel-deployment-url", "x-vercel-forwarded-for", "x-vercel-proxied-for",
  "x-vercel-ja", "x-vercel-oidc-token", "x-vercel-sc-", "x-vercel-internal-",
  "x-vercel-function-", "x-matched-path", "x-invoke-", "x-middleware-",
];
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

module.exports = async (req, res) => {
  const custom = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (!name.startsWith("x-")) continue;
    if (PLATFORM.some((p) => name.startsWith(p))) continue;
    custom[name] = String(value);
  }
  const report = {
    at: new Date().toISOString(),
    run: "no-authorization",
    host: req.headers.host || null,
    customHeaders: Object.fromEntries(
      Object.entries(custom).map(([n, v]) => [n, { length: v.length, sha256: sha(v) }])
    ),
    upstream: null,
  };
  try {
    const plain = await fetch(UPSTREAM, { redirect: "manual" });
    const withHeaders = await fetch(UPSTREAM, { headers: custom, redirect: "manual" });
    const body = await withHeaders.text();
    report.upstream = {
      url: UPSTREAM,
      statusPlain: plain.status,
      statusWithCustomHeaders: withHeaders.status,
      bytes: Buffer.byteLength(body),
      bodySha256: sha(body),
    };
  } catch (err) {
    report.upstream = { error: err.name };
  }
  res.status(200).json(report);
};
