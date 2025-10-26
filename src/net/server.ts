import { Hono } from "hono";

import routes from "@/net/router";

export default new Hono<{ Bindings: Bindings }>().route("/", routes) satisfies ExportedHandler<Env>;
