import { validator } from "hono/validator";

import { uuidv7 } from "uuidv7";

import { sort, order, limit, offset, filter } from "@/helpers/query";

export const status = ["inactive", "active", "pending"] satisfies Readonly<OrganizationStatus[]>;

const active = status.indexOf("active") satisfies number;

const fields = ["name", "slug", "status"] satisfies Array<keyof OrganizationFields>;

const selecting = filter<Organization>(["id", "name", "slug", "status", "created_at", "updated_at"]);

const map = (organization: Partial<OrganizationRow>): Partial<Organization> => ({
  ...organization,
  status: organization.status ? status[organization.status] : undefined,
  created_at: organization.created_at ? new Date(organization.created_at) : undefined,
  updated_at: organization.updated_at ? new Date(organization.updated_at) : undefined,
});

export const validateBody = validator("json", (value, _) =>
  Object.entries(value)
    .filter(([_, field]) => !!field)
    .filter(([key, _]) => fields.includes(key as keyof OrganizationFields))
    .reduce(
      (acc, [key, field]) => ({
        ...acc,
        [key]: key === "status" ? Number(field) : field,
      }),
      {} as OrganizationBody
    )
);

export const get = async (d1: Bindings["D1"], options: QueryOptions) => {
  const { results } = await d1
    .prepare(
      `
        SELECT 
          ${selecting(options.filter)}
        FROM organizations
        WHERE status = ?
        ORDER BY ${sort(fields)(options.sort)} ${order(options.order)}
        LIMIT ?
        OFFSET ?
      `
    )
    .bind(active, limit(options.size), offset(options.page, options.size))
    .all<Partial<OrganizationRow>>();

  return results.map(map);
};

export const getBySlug = async (
  d1: Bindings["D1"],
  slug: Organization["slug"],
  options: QueryOptions
) => {
  const result = await d1
    .prepare(
      `
        SELECT 
          ${selecting(options.filter)}
        FROM organizations
        WHERE status = ?
        AND slug = ?
        LIMIT 1
      `
    )
    .bind(active, slug)
    .first<OrganizationRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const create = async (d1: Bindings["D1"], { name, slug, status }: OrganizationBody) => {
  const result = await d1
    .prepare(
      `
        INSERT INTO organizations (id, name, slug, status)
        VALUES (?, ?, ?, ?)
        RETURNING
          id,
          name,
          slug,
          status,
          created_at,
          updated_at
      `
    )
    .bind(uuidv7(), name, slug, status)
    .first<OrganizationRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const updateBySlug = async (
  d1: Bindings["D1"],
  slug: Organization["slug"],
  entries: (string | number)[][]
) => {
  const result = await d1
    .prepare(
      `
        UPDATE organizations
        SET
          ${entries.map(([key, _]) => key).join(", \n")},
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ?
        RETURNING
          id,
          name,
          slug,
          status,
          created_at,
          updated_at
      `
    )
    .bind(...entries.map(([_, value]) => value), slug)
    .first<OrganizationRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const deleteBySlug = async (d1: Bindings["D1"], slug: Organization["slug"]) => {
  const result = await d1
    .prepare(
      `
        DELETE FROM organizations
        WHERE slug = ?
        RETURNING
          id,
          name,
          slug,
          status,
          created_at,
          updated_at
      `
    )
    .bind(slug)
    .first<OrganizationRow>();

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
