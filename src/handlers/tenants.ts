import { Hono } from "hono/tiny";
import { HTTPException } from "hono/http-exception";

import { validateBody, get, getBySlug, create, deleteBySlug, updateBySlug } from "@/models/tenants";

export default new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const { sort, order, size, page } = c.req.query();
    const filter = c.req.queries("filter");

    const data = await get(c.env.D1, { sort, order, size, page, filter });

    return c.json({ data });
  })
  .get("/:slug", async (c) => {
    const { slug } = c.req.param();
    const filter = c.req.queries("filter");

    const data = await getBySlug(c.env.D1, slug, { filter });

    if (!data) {
      throw new HTTPException(404);
    }

    return c.json({ data });
  })
  .post("/", validateBody, async (c) => {
    const body = c.req.valid("json");

    try {
      const data = await create(c.env.D1, body);

      return c.json({ data }, 201);
    } catch (e: any) {
      if (e.message === "D1_ERROR: UNIQUE constraint failed: tenants.slug: SQLITE_CONSTRAINT") {
        return c.redirect(`/v1/tenants/${body.slug}`, 303);
      }
    }
  })
  .put("/:slug", validateBody, async (c) => {
    const { slug } = c.req.param();
    const filter = c.req.queries("filter");

    const check = await getBySlug(c.env.D1, slug, { filter });

    if (!check) {
      throw new HTTPException(404);
    }

    const body = c.req.valid("json");
    const entries = Object.entries(body)
      .filter(([key, value]) => value !== check[key as keyof Omit<Tenant, "tid">])
      .map(([key, value]) => [`${key} = ?`, value]);

    if (!entries.length) {
      return c.redirect(`/v1/tenants/${slug}`, 303);
    }

    try {
      const data = await updateBySlug(c.env.D1, slug, entries);

      if (!data) {
        throw new HTTPException(404);
      }

      return c.json({ data });
    } catch (e: any) {
      if (e.message === "D1_ERROR: UNIQUE constraint failed: tenants.slug: SQLITE_CONSTRAINT") {
        throw new HTTPException(409);
      }
    }
  })
  .delete("/:slug", async (c) => {
    const { slug } = c.req.param();

    const data = await deleteBySlug(c.env.D1, slug);

    if (!data) {
      throw new HTTPException(404);
    }

    return c.json({ data });
  });
