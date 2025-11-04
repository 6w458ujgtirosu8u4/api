import { applyD1Migrations, env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

import { create, status } from "@/models/organizations";

describe("API Organization", () => {
  const HOST = "http://localhost:8787/v1/organizations";
  const ORGANIZATION = {
    name: "Organization 1",
    slug: "organization-1",
    status: 1,
  } satisfies OrganizationBody;

  beforeAll(async () => {
    await applyD1Migrations(env.D1, env.MIGRATIONS);
  });

  it("Dispatches POST fetch event - Create tenant", async () => {
    const response = await SELF.fetch(HOST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ORGANIZATION),
    });

    const { data } = await response.json<{ data: Organization }>();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(ORGANIZATION.name);
    expect(data.slug).toBe(ORGANIZATION.slug);
    expect(data.status).toBe(status.at(ORGANIZATION.status));
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches GET fetch event - Get organization", async () => {
    await create(env.D1, ORGANIZATION);

    const response = await SELF.fetch(`${HOST}/${ORGANIZATION.slug}`);

    const { data } = await response.json<{ data: Organization }>();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(ORGANIZATION.name);
    expect(data.slug).toBe(ORGANIZATION.slug);
    expect(data.status).toBe(status.at(ORGANIZATION.status));
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });

  it("Dispatches PUT fetch event - Update organization", async () => {
    const name = "Updated Organization 1";

    await create(env.D1, ORGANIZATION);

    const response = await SELF.fetch(`${HOST}/${ORGANIZATION.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
      }),
    });

    const { data } = await response.json<{ data: Organization }>();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(name);
    expect(data.slug).toBe(ORGANIZATION.slug);
    expect(data.status).toBe(status.at(ORGANIZATION.status));
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeDefined();
  });

  it("Dispatches DELETE fetch event - Delete organization", async () => {
    await create(env.D1, ORGANIZATION);

    const response = await SELF.fetch(`${HOST}/${ORGANIZATION.slug}`, {
      method: "DELETE",
    });

    const { data } = await response.json<{ data: Organization }>();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.name).toBe(ORGANIZATION.name);
    expect(data.slug).toBe(ORGANIZATION.slug);
    expect(data.status).toBe(status.at(ORGANIZATION.status));
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeUndefined();
  });
});
