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
  const COMPANY = { name: "Company 1" } satisfies CompanyBody;

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
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches PUT fetch event - Update company", async () => {
    const organization = await createOrganization(env.D1, ORGANIZATION);

    if (!organization || !organization.id) {
      throw new Error("Failed to create Organization for Company tests");
    }

    const name = "Updated Company 1";

    await create(env.D1, organization.id, COMPANY);

    const response = await SELF.fetch(`${HOST}/${COMPANY.name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Organization": organization.id },
      body: JSON.stringify({
        name,
      }),
    });

    const { data } = await response.json<{ data: Company }>();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(name);
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
