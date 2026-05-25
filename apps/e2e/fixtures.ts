import { test as base, expect, type APIRequestContext } from "@playwright/test";

type Fixtures = {
  // Authenticated regular-user API context (points at localhost:3001)
  apiContext: APIRequestContext;
  // Authenticated admin API context (points at localhost:3001)
  adminApiContext: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      storageState: "playwright/.auth/user.json",
    });
    await use(context);
    await context.dispose();
  },

  adminApiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      storageState: "playwright/.auth/admin.json",
    });
    await use(context);
    await context.dispose();
  },
});

export { expect };
