import { applyD1Migrations, env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import { create as createTenant } from "@/models/tenants";
import { create } from "@/models/companies";

describe("API Companies", () => {
  const HOST = "http://localhost:8787/v1/companies";
  const TENANT = { name: "Tenant 1", slug: "tenant-1", status: 1 } satisfies TenantBody;
  const COMPANY = { name: "Company 1" } satisfies CompanyBody;

  beforeAll(async () => {
    await applyD1Migrations(env.D1, env.MIGRATIONS);
  });

  it("Dispatches POST fetch event - Create company", async () => {
    const tenant = await createTenant(env.D1, TENANT);

    if (!tenant || !tenant.tid) {
      throw new Error("Failed to create tenant for company tests");
    }

    const response = await SELF.fetch(HOST, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant": tenant.tid },
      body: JSON.stringify(COMPANY),
    });

    const { data } = await response.json<{ data: Company }>();

    expect(response.status).toBe(201);
    expect(data.cid).toBeDefined();
    expect(data.name).toBe(COMPANY.name);
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches GET fetch event - Get company", async () => {
    const tenant = await createTenant(env.D1, TENANT);

    if (!tenant || !tenant.tid) {
      throw new Error("Failed to create Tenant for Company tests");
    }

    await create(env.D1, tenant.tid, COMPANY);

    const response = await SELF.fetch(`${HOST}/${COMPANY.name}`, {
      headers: { "X-Tenant": tenant.tid },
    });

    const { data } = await response.json<{ data: Company }>();

    expect(response.status).toBe(200);
    expect(data.cid).toBeDefined();
    expect(data.name).toBe(COMPANY.name);
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches PUT fetch event - Update company", async () => {
    const tenant = await createTenant(env.D1, TENANT);

    if (!tenant || !tenant.tid) {
      throw new Error("Failed to create Tenant for Company tests");
    }

    const name = "Updated Company 1";

    await create(env.D1, tenant.tid, COMPANY);

    const response = await SELF.fetch(`${HOST}/${COMPANY.name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Tenant": tenant.tid },
      body: JSON.stringify({
        name,
      }),
    });

    const { data } = await response.json<{ data: Company }>();

    expect(response.status).toBe(200);
    expect(data.cid).toBeDefined();
    expect(data.name).toBe(name);
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeDefined();
  });

  it("Dispatches DELETE fetch event - Delete tenant", async () => {
    const tenant = await createTenant(env.D1, TENANT);

    if (!tenant || !tenant.tid) {
      throw new Error("Failed to create Tenant for Company tests");
    }

    await create(env.D1, tenant.tid, COMPANY);

    const response = await SELF.fetch(`${HOST}/${COMPANY.name}`, {
      method: "DELETE",
      headers: { "X-Tenant": tenant.tid },
    });

    const { data } = await response.json<{ data: Company }>();

    expect(response.status).toBe(200);
    expect(data.cid).toBeDefined();
    expect(data.name).toBe(COMPANY.name);
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });
});
