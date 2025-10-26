import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import { uuidv7 } from "uuidv7";

const fields = ["name"] satisfies Array<keyof CompanyFields>;

const field = (sort: string) => fields.find((field) => field === sort) || fields.at(0)!;

const order = (order: string) => (order?.toLocaleUpperCase() === "DESC" ? "DESC" : "ASC");

const limit = (page: string) => Number(page || 1);

const offset = (page: string, size: string) => (limit(page) - 1) * Number(size || 99999999);

const map = (company: CompanyRow): Company => ({
  ...company,
  created_at: new Date(company.created_at),
  updated_at: company.updated_at ? new Date(company.updated_at) : null,
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

export const validateHeader = validator("header", (value, c) => {
  const tenant = value["x-tenant"];

  if (!tenant) {
    throw new HTTPException(401);
  }

  return {
    tenant,
  };
});

type QueryOptions = {
  sort: string;
  order: string;
  size: string;
  page: string;
};

export const get = async (d1: Bindings["D1"], tenant: Company["tid"], options: QueryOptions) => {
  const { results } = await d1
    .prepare(
      `
        SELECT
          cid,
          name,
          created_at,
          updated_at
        FROM companies
        WHERE tid = ?
        ORDER BY ${field(options.sort)} ${order(options.order)}
        LIMIT ?
        OFFSET ?
      `
    )
    .bind(tenant, limit(options.size), offset(options.page, options.size))
    .all<CompanyRow>();

  return results.map<Company>(map);
};

export const getByName = async (
  d1: Bindings["D1"],
  tenant: Company["tid"],
  name: Company["name"]
) => {
  const result = await d1
    .prepare(
      `
        SELECT 
          cid,
          name,
          created_at,
          updated_at
        FROM companies
        WHERE tid = ?
        AND name = ?
        LIMIT 1
      `
    )
    .bind(tenant, name)
    .first<CompanyRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

type Body = Omit<CompanyRow, "cid" | "tid" | "created_at" | "updated_at">;

export const create = async (d1: Bindings["D1"], tenant: Company["tid"], { name }: Body) => {
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
