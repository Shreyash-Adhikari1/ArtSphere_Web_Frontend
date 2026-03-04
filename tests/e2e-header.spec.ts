import { test, expect } from "@playwright/test";

test("x-e2e bypass allows dashboard", async ({ page }) => {
  await page.goto("/auth/dashboard");

  // If bypass works, it should NOT land on /login
  await expect(page).not.toHaveURL(/\/login$/);
});
