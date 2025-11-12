import { applyD1Migrations, env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import { create as createOrganization } from "@/models/organizations";
import { create } from "@/models/companies";

describe("API Companies", () => {
  const HOST = "http://localhost:8787/v1/companies";
  const ORGANIZATION = {
    name: "Organization 1",
    slug: "organization-1",
    status: 1,
  } satisfies OrganizationBody;
  const COMPANY = {
    legal_type_id: "lt-0001",
    name: "Company 1",
    email: "company1@example.test",
    phone: "+48100100100",
    address: "Main Street 1, 00-001 Warszawa",
    website: "https://company1.example",
    vat: "PL1111111111",
    registration_date: "2021-03-01",
  } satisfies CompanyBody;

  beforeAll(async () => {
    await applyD1Migrations(env.D1, env.MIGRATIONS);
  });

  it("Dispatches POST fetch event - Create company", async () => {
    const organization = await createOrganization(env.D1, ORGANIZATION);

    if (!organization || !organization.id) {
      throw new Error("Failed to create organization for company tests");
    }

    const response = await SELF.fetch(HOST, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Organization": organization.id },
      body: JSON.stringify(COMPANY),
    });

    const { data } = await response.json<{ data: Company }>();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(COMPANY.name);
    expect(data.email).toBe(COMPANY.email);
    expect(data.legal_type_id).toBe(COMPANY.legal_type_id);
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches GET fetch event - Get company", async () => {
    const organization = await createOrganization(env.D1, ORGANIZATION);

    if (!organization || !organization.id) {
      throw new Error("Failed to create Organization for Company tests");
    }

    await create(env.D1, organization.id, COMPANY);

    const response = await SELF.fetch(`${HOST}/${COMPANY.name}`, {
      headers: { "X-Organization": organization.id },
    });

    const { data } = await response.json<{ data: Company }>();
    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(COMPANY.name);
    expect(data.email).toBe(COMPANY.email);
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches PUT fetch event - Update company", async () => {
    const organization = await createOrganization(env.D1, ORGANIZATION);

    if (!organization || !organization.id) {
      throw new Error("Failed to create Organization for Company tests");
    }

    const payload = {
      name: "Updated Company 1",
      phone: "+48999111222",
      website: "https://updated-company1.example",
    } satisfies Partial<CompanyBody>;

    await create(env.D1, organization.id, COMPANY);

    const response = await SELF.fetch(`${HOST}/${COMPANY.name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Organization": organization.id },
      body: JSON.stringify(payload),
    });

    const { data } = await response.json<{ data: Company }>();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(payload.name);
    expect(data.phone).toBe(payload.phone);
    expect(data.website).toBe(payload.website);
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeDefined();
  });

  it("Dispatches DELETE fetch event - Delete organization", async () => {
    const organization = await createOrganization(env.D1, ORGANIZATION);

    if (!organization || !organization.id) {
      throw new Error("Failed to create Organization for Company tests");
    }

    await create(env.D1, organization.id, COMPANY);

    const response = await SELF.fetch(`${HOST}/${COMPANY.name}`, {
      method: "DELETE",
      headers: { "X-Organization": organization.id },
    });

  const { data } = await response.json<{ data: Company }>();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(COMPANY.name);
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });
});
