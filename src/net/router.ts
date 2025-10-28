import { Hono } from "hono/tiny";

import tenants from "@/handlers/tenants";
import companies from "@/handlers/companies";

export default new Hono<{ Bindings: Bindings }>()
  .basePath("/v1")
  .all("/", (c) => c.text("api@1.0.0"))
  .use(async (c, next) => {
    const start = performance.now();
    await next();
    const end = performance.now();
    c.res.headers.set("X-Response-Time", `${end - start}ms`);
  })
  .route("/tenants", tenants)
  .route("/companies", companies);
