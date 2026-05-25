import { test, expect } from "../fixtures";

test.describe("Bins API", () => {
  test("GET /api/bins returns empty array for new user", async ({ apiContext }) => {
    const res = await apiContext.get("/api/bins");
    expect(res.ok()).toBeTruthy();
    const bins = await res.json();
    expect(Array.isArray(bins)).toBe(true);
  });

  test("POST /api/bins creates a bin", async ({ apiContext }) => {
    const res = await apiContext.post("/api/bins", {
      data: { name: "E2E Box", location: "Garage" },
    });
    expect(res.status()).toBe(201);
    const bin = await res.json();
    expect(bin.name).toBe("E2E Box");
    expect(bin.location).toBe("Garage");
  });

  test("GET /api/bins/:id returns bin with items", async ({ apiContext }) => {
    const created = await apiContext.post("/api/bins", {
      data: { name: "Detail Box", location: "Shelf" },
    });
    const { id } = await created.json();

    const res = await apiContext.get(`/api/bins/${id}`);
    expect(res.ok()).toBeTruthy();
    const bin = await res.json();
    expect(bin.id).toBe(id);
    expect(Array.isArray(bin.items)).toBe(true);
  });

  test("PUT /api/bins/:id updates a bin", async ({ apiContext }) => {
    const created = await apiContext.post("/api/bins", {
      data: { name: "Old Name", location: "Attic" },
    });
    const { id } = await created.json();

    const res = await apiContext.put(`/api/bins/${id}`, {
      data: { location: "Basement" },
    });
    expect(res.ok()).toBeTruthy();
    const updated = await res.json();
    expect(updated.location).toBe("Basement");
  });

  test("DELETE /api/bins/:id removes a bin", async ({ apiContext }) => {
    const created = await apiContext.post("/api/bins", {
      data: { name: "To Delete", location: "Trash" },
    });
    const { id } = await created.json();

    const del = await apiContext.delete(`/api/bins/${id}`);
    expect(del.status()).toBe(204);

    const get = await apiContext.get(`/api/bins/${id}`);
    expect(get.status()).toBe(404);
  });

  test("GET /api/bins returns 401 when unauthenticated", async ({ playwright }) => {
    const unauthContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      storageState: { cookies: [], origins: [] },
    });
    const res = await unauthContext.get("/api/bins");
    expect(res.status()).toBe(401);
    await unauthContext.dispose();
  });
});
