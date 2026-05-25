import { test, expect } from "../fixtures";

test.describe("Search API", () => {
  test.beforeAll(async ({ apiContext }) => {
    const bin = await (
      await apiContext.post("/api/bins", {
        data: { name: "Search Test Bin", location: "Office" },
      })
    ).json();

    await apiContext.post(`/api/bins/${bin.id}/items`, {
      data: { name: "Camaro 1969" },
    });
    await apiContext.post(`/api/bins/${bin.id}/items`, {
      data: { name: "Mustang Boss" },
    });
  });

  test("GET /api/search returns matching items", async ({ apiContext }) => {
    const res = await apiContext.get("/api/search?q=camaro");
    expect(res.ok()).toBeTruthy();
    const results = await res.json();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.name).toMatch(/camaro/i);
    expect(results[0].binName).toBeDefined();
    expect(results[0].binLocation).toBeDefined();
  });

  test("GET /api/search is case-insensitive", async ({ apiContext }) => {
    const res = await apiContext.get("/api/search?q=CAMARO");
    expect(res.ok()).toBeTruthy();
    const results = await res.json();
    expect(results.length).toBeGreaterThan(0);
  });

  test("GET /api/search returns empty array for no matches", async ({ apiContext }) => {
    const res = await apiContext.get("/api/search?q=xyznotfound999");
    expect(res.ok()).toBeTruthy();
    const results = await res.json();
    expect(results).toHaveLength(0);
  });

  test("GET /api/search returns 400 when q is missing", async ({ apiContext }) => {
    const res = await apiContext.get("/api/search");
    expect(res.status()).toBe(400);
  });
});
