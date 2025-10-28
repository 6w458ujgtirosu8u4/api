import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import { uuidv7 } from "uuidv7";

import { sort, order, limit, offset, filter } from "@/helpers/query";

const selecting = filter<Company>(["cid", "name", "created_at", "updated_at"]);

const fields = ["name"] satisfies Array<keyof CompanyFields>;

const map = (company: Partial<CompanyRow>): Partial<Company> => ({
  ...company,
  created_at: company.created_at ? new Date(company.created_at) : undefined,
  updated_at: company.updated_at ? new Date(company.updated_at) : undefined,
});

export const validateBody = validator("json", (value, _) =>
  Object.entries(value)
    .filter(([_, field]) => !!field)
    .filter(([key, _]) => fields.includes(key as keyof CompanyFields))
    .reduce(
      (acc, [key, field]) => ({
        ...acc,
        [key]: field,
      }),
      {} as CompanyFields
    )
);

export const validateHeader = validator("header", (value, _) => {
  const tenant = value["x-tenant"];

  if (!tenant) {
    throw new HTTPException(401);
  }

  return {
    tenant,
  };
});

export const get = async (d1: Bindings["D1"], tenant: Company["tid"], options: QueryOptions) => {
  const { results } = await d1
    .prepare(
      `
        SELECT
          ${selecting(options.filter)}
        FROM companies
        WHERE tid = ?
        ORDER BY ${sort(fields)(options.sort)} ${order(options.order)}
        LIMIT ?
        OFFSET ?
      `
    )
    .bind(tenant, limit(options.size), offset(options.page, options.size))
    .all<Partial<CompanyRow>>();

  return results.map(map);
};

export const getByName = async (
  d1: Bindings["D1"],
  tenant: Company["tid"],
  name: Company["name"],
  options: QueryOptions = {}
) => {
  const result = await d1
    .prepare(
      `
        SELECT 
          ${selecting(options.filter)}
        FROM companies
        WHERE tid = ?
        AND name = ?
        LIMIT 1
      `
    )
    .bind(tenant, name)
    .first<Partial<CompanyRow>>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const create = async (d1: Bindings["D1"], tenant: Company["tid"], { name }: CompanyBody) => {
  const result = await d1
    .prepare(
      `
        INSERT INTO companies (cid, tid, name)
        VALUES (?, ?, ?)
        RETURNING
          cid,
          name,
          created_at,
          updated_at
      `
    )
    .bind(uuidv7(), tenant, name)
    .first<CompanyRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const updateByName = async (
  d1: Bindings["D1"],
  tenant: Company["tid"],
  name: Company["name"],
  entries: (string | number)[][]
) => {
  const result = await d1
    .prepare(
      `
        UPDATE companies
        SET
          ${entries.map(([key, _]) => key).join(", \n")},
          updated_at = CURRENT_TIMESTAMP
        WHERE tid = ?
        AND name = ?
        RETURNING
          cid,
          name,
          created_at,
          updated_at
      `
    )
    .bind(...entries.map(([_, value]) => value), tenant, name)
    .first<CompanyRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const deleteByName = async (
  d1: Bindings["D1"],
  tenant: Company["tid"],
  name: Company["name"]
) => {
  const result = await d1
    .prepare(
      `
        DELETE FROM companies
        WHERE tid = ?
        AND name = ?
        RETURNING
          cid,
          name,
          created_at,
          updated_at
      `
    )
    .bind(tenant, name)
    .first<CompanyRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export default {
  validateBody,
  validateHeader,
  get,
  getByName,
  create,
  updateByName,
  deleteByName,
};
