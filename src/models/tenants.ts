import { validator } from "hono/validator";

import { uuidv7 } from "uuidv7";

import { sort, order, limit, offset, filter } from "@/helpers/query";

export const status = ["inactive", "active", "pending"] satisfies Readonly<TenantStatus[]>;

const active = status.indexOf("active") satisfies number;

const fields = ["name", "slug", "status"] satisfies Array<keyof TenantFields>;

const selecting = filter<Tenant>(["tid", "name", "slug", "status", "created_at", "updated_at"]);

const map = (tenant: Partial<TenantRow>): Partial<Tenant> => ({
  ...tenant,
  status: tenant.status ? status[tenant.status] : undefined,
  created_at: tenant.created_at ? new Date(tenant.created_at) : undefined,
  updated_at: tenant.updated_at ? new Date(tenant.updated_at) : undefined,
});

export const validateBody = validator("json", (value, _) =>
  Object.entries(value)
    .filter(([_, field]) => !!field)
    .filter(([key, _]) => fields.includes(key as keyof TenantFields))
    .reduce(
      (acc, [key, field]) => ({
        ...acc,
        [key]: key === "status" ? Number(field) : field,
      }),
      {} as TenantBody
    )
);

export const get = async (d1: Bindings["D1"], options: QueryOptions) => {
  const { results } = await d1
    .prepare(
      `
        SELECT 
          ${selecting(options.filter)}
        FROM tenants
        WHERE status = ?
        ORDER BY ${sort(fields)(options.sort)} ${order(options.order)}
        LIMIT ?
        OFFSET ?
      `
    )
    .bind(active, limit(options.size), offset(options.page, options.size))
    .all<Partial<TenantRow>>();

  return results.map(map);
};

export const getBySlug = async (
  d1: Bindings["D1"],
  slug: Tenant["slug"],
  options: QueryOptions
) => {
  const result = await d1
    .prepare(
      `
        SELECT 
          ${selecting(options.filter)}
        FROM tenants
        WHERE status = ?
        AND slug = ?
        LIMIT 1
      `
    )
    .bind(active, slug)
    .first<TenantRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const create = async (d1: Bindings["D1"], { name, slug, status }: TenantBody) => {
  const result = await d1
    .prepare(
      `
        INSERT INTO tenants (tid, name, slug, status)
        VALUES (?, ?, ?, ?)
        RETURNING
          tid,
          name,
          slug,
          status,
          created_at,
          updated_at
      `
    )
    .bind(uuidv7(), name, slug, status)
    .first<TenantRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const updateBySlug = async (
  d1: Bindings["D1"],
  slug: Tenant["slug"],
  entries: (string | number)[][]
) => {
  const result = await d1
    .prepare(
      `
        UPDATE tenants
        SET
          ${entries.map(([key, _]) => key).join(", \n")},
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ?
        RETURNING
          tid,
          name,
          slug,
          status,
          created_at,
          updated_at
      `
    )
    .bind(...entries.map(([_, value]) => value), slug)
    .first<TenantRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const deleteBySlug = async (d1: Bindings["D1"], slug: Tenant["slug"]) => {
  const result = await d1
    .prepare(
      `
        DELETE FROM tenants
        WHERE slug = ?
        RETURNING
          tid,
          name,
          slug,
          status,
          created_at,
          updated_at
      `
    )
    .bind(slug)
    .first<TenantRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export default {
  validateBody,
  get,
  getBySlug,
  create,
  updateBySlug,
  deleteBySlug,
};
