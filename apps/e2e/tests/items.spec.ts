import { test, expect } from "../fixtures";

test.describe("Items API", () => {
  let binId: string;

  test.beforeEach(async ({ apiContext }) => {
    const res = await apiContext.post("/api/bins", {
      data: { name: "Items Test Bin", location: "Shelf" },
    });
    const bin = await res.json();
    binId = bin.id;
  });

  test("POST /api/bins/:id/items creates an item", async ({ apiContext }) => {
    const res = await apiContext.post(`/api/bins/${binId}/items`, {
      data: { name: "Camaro 69" },
    });
    expect(res.status()).toBe(201);
    const item = await res.json();
    expect(item.name).toBe("Camaro 69");
    expect(item.binId).toBe(binId);
  });

  test("POST /api/bins/:id/items returns 400 when name missing", async ({ apiContext }) => {
    const res = await apiContext.post(`/api/bins/${binId}/items`, {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test("PUT /api/items/:id updates an item", async ({ apiContext }) => {
    const created = await apiContext.post(`/api/bins/${binId}/items`, {
      data: { name: "Original Name" },
    });
    const { id } = await created.json();

    const res = await apiContext.put(`/api/items/${id}`, {
      data: { name: "Updated Name" },
    });
    expect(res.ok()).toBeTruthy();
    const updated = await res.json();
    expect(updated.name).toBe("Updated Name");
  });

  test("DELETE /api/items/:id removes an item", async ({ apiContext }) => {
    const created = await apiContext.post(`/api/bins/${binId}/items`, {
      data: { name: "Delete Me" },
    });
    const { id } = await created.json();

    const del = await apiContext.delete(`/api/items/${id}`);
    expect(del.status()).toBe(204);
  });
});
