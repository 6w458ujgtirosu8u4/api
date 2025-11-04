import { Hono } from "hono/tiny";
import { HTTPException } from "hono/http-exception";

import {
  validateBody,
  validateHeader,
  get,
  getByName,
  create,
  deleteByName,
  updateByName,
} from "@/models/companies";

export default new Hono<{ Bindings: Bindings }>()
  .get("/", validateHeader, async (c) => {
    const { organization_id } = c.req.valid("header");

    if (!organization_id) {
      throw new HTTPException(400);
    }

    const { sort, order, size, page } = c.req.query();
    const filter = c.req.queries("filter");

    const data = await get(c.env.D1, organization_id, { sort, order, size, page, filter });

    return c.json({ data });
  })
  .get("/:name", validateHeader, async (c) => {
    const { organization_id } = c.req.valid("header");

    if (!organization_id) {
      throw new HTTPException(400);
    }

    const { name } = c.req.param();
    const filter = c.req.queries("filter");

    const data = await getByName(c.env.D1, organization_id, name, { filter });

    if (!data) {
      throw new HTTPException(404);
    }

    return c.json({ data });
  })
  .post("/", validateHeader, validateBody, async (c) => {
    const { organization_id } = c.req.valid("header");
    const body = c.req.valid("json");

    try {
      const data = await create(c.env.D1, organization_id, body);

      return c.json({ data }, 201);
    } catch (e: any) {
      if (e.message === "D1_ERROR: FOREIGN KEY constraint failed: SQLITE_CONSTRAINT") {
        throw new HTTPException(404);
      }

      if (e.message === "D1_ERROR: UNIQUE constraint failed: companies.name: SQLITE_CONSTRAINT") {
        return c.redirect(`/v1/companies/${body.name}`, 303);
      }
    }
  })
  .put("/:name", validateHeader, validateBody, async (c) => {
    const { organization_id } = c.req.valid("header");
    const { name } = c.req.param();

    const check = await getByName(c.env.D1, organization_id, name);

    if (!check) {
      throw new HTTPException(404);
    }

    const body = c.req.valid("json");
    const entries = Object.entries(body)
      .filter(([key, value]) => value !== check[key as keyof Omit<Company, "id" | "organization_id">])
      .map(([key, value]) => [`${key} = ?`, value]);

    if (!entries.length) {
      return c.redirect(`/v1/companies/${name}`, 303);
    }

    try {
      const data = await updateByName(c.env.D1, organization_id, name, entries);

      if (!data) {
        throw new HTTPException(404);
      }

      return c.json({ data });
    } catch (e: any) {
      if (e.message === "D1_ERROR: UNIQUE constraint failed: organizations.slug: SQLITE_CONSTRAINT") {
        throw new HTTPException(409);
      }
    }
  })
  .delete("/:name", validateHeader, async (c) => {
    const { organization_id } = c.req.valid("header");
    const { name } = c.req.param();

    const data = await deleteByName(c.env.D1, organization_id, name);

    if (!data) {
      throw new HTTPException(404);
    }

    return c.json({ data });
  });
