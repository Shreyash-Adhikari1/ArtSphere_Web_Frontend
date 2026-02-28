import { test, expect } from "@playwright/test";

test("authenticate and save session", async ({ page }) => {
  await page.goto("/login");

  // Use your real test user credentials here
  await page.getByPlaceholder("Email").fill("artit@mail.com");
  await page.getByPlaceholder("Password").fill("arti@123");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/auth\/dashboard$/);

  // Save cookies/localStorage into a file for reuse
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
