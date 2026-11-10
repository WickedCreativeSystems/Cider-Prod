// Stand-in for Stripe's "is this checkout paid" answer, for the local capture only.
import http from "node:http";
http.createServer((q, r) => {
  const m = q.url.match(/^\/v1\/checkout\/sessions\/(cs_test_[A-Za-z0-9]+)$/);
  r.setHeader("content-type", "application/json");
  if (!m) { r.statusCode = 404; return r.end("{}"); }
  r.end(JSON.stringify({ id: m[1], payment_link: "plink_1URWb4Ro6ix1hE5veJB0U832", payment_status: "paid" }));
}).listen(8894, "127.0.0.1", () => console.log("stand-in for Stripe on 8894"));
