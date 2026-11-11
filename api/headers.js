// Diagnostic route used to check how a request header reaches this deployment
// and whether it is accepted upstream.
//
// It reads a single header, uses it once for one upstream request, and reports
// only a status, a byte count and whether an expected string was present.
// The header value is never logged, returned or stored.
const UPSTREAM =
  "https://header-echo-demo-pw4p5kftg-gil-mu-s-projects.vercel.app/api/content";
const EXPECTED = "UNRELEASED-PREVIEW-ONLY-MARKER-7a2e5d";
const HEADER = "x-vercel-protection-bypass";

module.exports = async (req, res) => {
  const value = req.headers[HEADER] || null;
  const out = {
    at: new Date().toISOString(),
    host: req.headers.host || null,
    headerPresent: value !== null,
    headerLength: value ? value.length : 0,
    upstream: null,
  };
  if (value) {
    try {
      const plain = await fetch(UPSTREAM, { redirect: "manual" });
      const withHeader = await fetch(UPSTREAM, {
        headers: { [HEADER]: value },
        redirect: "manual",
      });
      const body = await withHeader.text();
      out.upstream = {
        url: UPSTREAM,
        statusPlain: plain.status,
        statusWithHeader: withHeader.status,
        bytes: Buffer.byteLength(body),
        expectedPresent: body.includes(EXPECTED),
      };
    } catch (err) {
      out.upstream = { error: err.name };
    }
  }
  res.status(200).json(out);
};
