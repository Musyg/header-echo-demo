# header-echo-demo

A tiny demo that echoes selected request headers back as JSON. Handy when
reviewing how command line tools and proxies forward headers to a deployment.

## Routes

- `GET /api/content` returns the content that production serves.
- `GET /api/echo` returns the headers the server received.
