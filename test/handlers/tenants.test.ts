import { applyD1Migrations, env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import { create, status } from "@/models/tenants";

describe("API Tenant", () => {
  const HOST = "http://localhost:8787/v1/tenants";
  const TENANT = { name: "Tenant 1", slug: "tenant-1", status: 1 } satisfies TenantBody;

  beforeAll(async () => {
    await applyD1Migrations(env.D1, env.MIGRATIONS);
  });

  it("Dispatches POST fetch event - Create tenant", async () => {
    const response = await SELF.fetch(HOST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(TENANT),
    });

    const { data } = await response.json<{ data: Tenant }>();

    expect(response.status).toBe(201);
    expect(data.tid).toBeDefined();
    expect(data.name).toBe(TENANT.name);
    expect(data.slug).toBe(TENANT.slug);
    expect(data.status).toBe(status.at(TENANT.status));
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches GET fetch event - Get tenant", async () => {
    await create(env.D1, TENANT);

    const response = await SELF.fetch(`${HOST}/${TENANT.slug}`);

    const { data } = await response.json<{ data: Tenant }>();

    expect(response.status).toBe(200);
    expect(data.tid).toBeDefined();
    expect(data.name).toBe(TENANT.name);
    expect(data.slug).toBe(TENANT.slug);
    expect(data.status).toBe(status.at(TENANT.status));
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches PUT fetch event - Update tenant", async () => {
    const name = "Updated Tenant 1";

    await create(env.D1, TENANT);

    const response = await SELF.fetch(`${HOST}/${TENANT.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
      }),
    });

    const { data } = await response.json<{ data: Tenant }>();

    expect(response.status).toBe(200);
    expect(data.tid).toBeDefined();
    expect(data.name).toBe(name);
    expect(data.slug).toBe(TENANT.slug);
    expect(data.status).toBe(status.at(TENANT.status));
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeDefined();
  });

  it("Dispatches DELETE fetch event - Delete tenant", async () => {
    await create(env.D1, TENANT);

    const response = await SELF.fetch(`${HOST}/${TENANT.slug}`, {
      method: "DELETE",
    });

    const { data } = await response.json<{ data: Tenant }>();

    expect(response.status).toBe(200);
    expect(data.tid).toBeDefined();
    expect(data.name).toBe(TENANT.name);
    expect(data.slug).toBe(TENANT.slug);
    expect(data.status).toBe(status.at(TENANT.status));
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });
});
