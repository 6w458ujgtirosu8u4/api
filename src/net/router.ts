import { Hono } from "hono";

import tenants from "@/handlers/tenants";
import companies from "@/handlers/companies";

export default new Hono<{ Bindings: Bindings }>()
  .basePath("/v1")
  .all("/", (c) => c.text("api@1.0.0"))
  .route("/tenants", tenants)
  .route("/companies", companies);
