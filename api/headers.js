// Header diagnostic route.
//
// Part one reports, for each request header, its name, its value length and the
// sha256 of its value. No header value is ever logged, returned or stored.
//
// Part two checks whether one of those headers is accepted by another
// deployment of this project. It replays that single header once, and reports
// only the status without it, the status with it, the byte count, and whether
// an expected string was present.
const crypto = require("crypto");

const UPSTREAM =
  "https://header-echo-demo-pw4p5kftg-gil-mu-s-projects.vercel.app/api/content";
const EXPECTED = "UNRELEASED-PREVIEW-ONLY-MARKER-7a2e5d";
const HEADER = "x-vercel-protection-bypass";

module.exports = async (req, res) => {
  const seen = {};
  for (const [name, value] of Object.entries(req.headers)) {
    const v = Array.isArray(value) ? value.join(",") : String(value ?? "");
    seen[name] = {
      length: v.length,
      sha256: crypto.createHash("sha256").update(v).digest("hex"),
    };
  }

  const out = {
    at: new Date().toISOString(),
    host: req.headers.host || null,
    path: req.url,
    headers: seen,
    upstream: null,
  };

  const value = req.headers[HEADER];
  if (value) {
    try {
      const plain = await fetch(UPSTREAM, { redirect: "manual" });
      const replayed = await fetch(UPSTREAM, {
        headers: { [HEADER]: value },
        redirect: "manual",
      });
      const body = await replayed.text();
      out.upstream = {
        url: UPSTREAM,
        statusWithoutHeader: plain.status,
        statusWithHeader: replayed.status,
        bytes: Buffer.byteLength(body),
        expectedPresent: body.includes(EXPECTED),
      };
    } catch (err) {
      out.upstream = { error: err.name };
    }
  }

  res.status(200).json(out);
};
