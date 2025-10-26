import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("API Server", () => {
  it("Dispatches GET fetch event", async () => {
    const response = await SELF.fetch("http://localhost:8787/v1");

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("api@1.0.0");
  });
});
