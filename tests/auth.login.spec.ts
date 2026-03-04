import { test, expect } from "@playwright/test";

test.describe("Login Page UI Validation", () => {
  test("1) Login page renders correctly", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByTestId("login-title")).toBeVisible();
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeVisible();
  });

  test("2) Submitting empty form shows required field errors", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-email-error")).toBeVisible();
    await expect(page.getByTestId("login-password-error")).toHaveText(
      "Password is required",
    );
  });

  test("3) Invalid email format shows email validation error", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Email").fill("adhikarishreyashgmail.com");
    await page.getByPlaceholder("Email").press("Tab"); // trigger blur
    await page.getByPlaceholder("Password").fill("123456");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText(/Invalid email/i)).toBeVisible();
  });

  test("4) Forgot password link navigates correctly", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-forgot-link").click();
    await expect(page).toHaveURL(/\/request-password-reset$/);
  });

  test("5) Signup link navigates correctly", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-signup-link").click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
