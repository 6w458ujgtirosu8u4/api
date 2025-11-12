import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import { uuidv7 } from "uuidv7";

import { sort, order, limit, offset, filter } from "@/helpers/query";

const selectFields: Array<keyof Company> = [
  "id",
  "organization_id",
  "legal_type_id",
  "name",
  "email",
  "phone",
  "address",
  "website",
  "vat",
  "registration_date",
  "created_at",
  "updated_at",
];

const selecting = filter<Company>(selectFields);

const fields = [
  "name",
  "email",
  "phone",
  "address",
  "website",
  "vat",
  "registration_date",
  "legal_type_id",
] satisfies Array<keyof CompanyFields>;

const requiredFields: Array<keyof CompanyBody> = [
  "legal_type_id",
  "name",
  "email",
  "phone",
  "address",
];

const map = (company: Partial<CompanyRow>): Partial<Company> => ({
  ...company,
  created_at: company.created_at ? new Date(company.created_at) : undefined,
  updated_at: company.updated_at ? new Date(company.updated_at) : undefined,
});

export const validateBody = validator("json", (value, _) =>
  Object.entries(value)
    .filter(([_, field]) => field !== undefined && field !== null && field !== "")
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
  const organization_id = value["x-organization"];

  if (!organization_id) {
    throw new HTTPException(401);
  }

  return {
    organization_id,
  };
});

export const get = async (d1: Bindings["D1"], organization_id: Company["organization_id"], options: QueryOptions) => {
  const { results } = await d1
    .prepare(
      `
        SELECT
          ${selecting(options.filter)}
        FROM companies
        WHERE organization_id = ?
        ORDER BY ${sort(fields)(options.sort)} ${order(options.order)}
        LIMIT ?
        OFFSET ?
      `
    )
    .bind(organization_id, limit(options.size), offset(options.page, options.size))
    .all<Partial<CompanyRow>>();

  return results.map(map);
};

export const getByName = async (
  d1: Bindings["D1"],
  organization_id: Company["organization_id"],
  name: Company["name"],
  options: QueryOptions = {}
) => {
  const result = await d1
    .prepare(
      `
        SELECT 
          ${selecting(options.filter)}
        FROM companies
        WHERE organization_id = ?
        AND name = ?
        LIMIT 1
      `
    )
    .bind(organization_id, name)
    .first<Partial<CompanyRow>>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const create = async (d1: Bindings["D1"], organization_id: Company["organization_id"], body: CompanyBody) => {
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new HTTPException(422, { message: `${field} is required` });
    }
  }

  const result = await d1
    .prepare(
      `
        INSERT INTO companies (
          id,
          organization_id,
          legal_type_id,
          name,
          email,
          phone,
          address,
          website,
          vat,
          registration_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING
          id,
          organization_id,
          legal_type_id,
          name,
          email,
          phone,
          address,
          website,
          vat,
          registration_date,
          created_at,
          updated_at
      `
    )
    .bind(
      uuidv7(),
      organization_id,
      body.legal_type_id,
      body.name,
      body.email,
      body.phone,
      body.address,
      body.website ?? null,
      body.vat ?? null,
      body.registration_date ?? null
    )
    .first<CompanyRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const updateByName = async (
  d1: Bindings["D1"],
  organization_id: Company["organization_id"],
  name: Company["name"],
  entries: (string | number | null)[][]
) => {
  if (!entries.length) {
    return getByName(d1, organization_id, name);
  }

  const result = await d1
    .prepare(
      `
        UPDATE companies
        SET
          ${entries.map(([key, _]) => key).join(", \n")},
          updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = ?
        AND name = ?
        RETURNING
          id,
          organization_id,
          legal_type_id,
          name,
          email,
          phone,
          address,
          website,
          vat,
          registration_date,
          created_at,
          updated_at
      `
    )
    .bind(...entries.map(([_, value]) => value), organization_id, name)
    .first<CompanyRow>();

  if (!result) {
    return null;
  }

  return map(result);
};

export const deleteByName = async (
  d1: Bindings["D1"],
  organization_id: Company["organization_id"],
  name: Company["name"]
) => {
  const result = await d1
    .prepare(
      `
        DELETE FROM companies
        WHERE organization_id = ?
        AND name = ?
        RETURNING
          id,
          name,
          created_at,
          updated_at
      `
    )
    .bind(organization_id, name)
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
