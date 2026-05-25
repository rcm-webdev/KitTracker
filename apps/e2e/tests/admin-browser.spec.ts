import { test, expect } from "../fixtures";
import type { Locator } from "@playwright/test";

// Override storageState so these browser tests use the admin session
test.use({ storageState: "playwright/.auth/admin.json" });

test.describe("Admin Dashboard browser", () => {
  test("admin is redirected to /admin/users from /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/admin/users");
  });

  test("admin is redirected to /admin/users from user-facing routes", async ({ page }) => {
    await page.goto("/bins/new");
    await expect(page).toHaveURL("/admin/users");
  });

  test("admin dashboard shows user table", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("th", { hasText: "Email" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Status" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Actions" })).toBeVisible();
  });

  test("admin's own row has disabled action buttons", async ({ page }) => {
    await page.goto("/admin/users");
    // Find the row that contains the admin email
    const adminRow = page.locator("tr", { hasText: "admin@strawhats.test" });
    await expect(adminRow.locator("button", { hasText: "Deactivate" })).toBeDisabled();
    await expect(adminRow.locator("button", { hasText: "Delete" })).toBeDisabled();
  });

  test("delete modal requires typing email to enable delete button", async ({ page }) => {
    await page.goto("/admin/users");
    // Wait for table data to load before counting rows
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    const rowCount = await rows.count();
    let targetRow: Locator | null = null;
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const deleteBtn = row.locator("button", { hasText: "Delete" });
      if (await deleteBtn.isEnabled()) {
        targetRow = row;
        break;
      }
    }
    expect(targetRow).not.toBeNull();

    const email = await targetRow!.locator("td").first().innerText();
    await targetRow!.locator("button", { hasText: "Delete" }).click();

    // Modal appears
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Delete button is disabled before typing
    const deleteBtn = modal.locator("button", { hasText: "Delete Account" });
    await expect(deleteBtn).toBeDisabled();

    // Type wrong email — still disabled
    await modal.locator('input[type="email"]').fill("wrong@example.com");
    await expect(deleteBtn).toBeDisabled();

    // Type correct email — enabled
    await modal.locator('input[type="email"]').fill(email);
    await expect(deleteBtn).toBeEnabled();

    // Cancel — modal closes
    await modal.locator("button", { hasText: "Cancel" }).click();
    await expect(modal).not.toBeVisible();
  });
});
