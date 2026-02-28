import { test, expect, Page } from "@playwright/test";

test.describe("Register Page UI Validation", () => {
  const fullName = (page: Page) =>
    page.getByPlaceholder("Full Name", { exact: true });

  const username = (page: Page) =>
    page.getByPlaceholder("Username", { exact: true });

  const email = (page: Page) => page.getByPlaceholder("Email", { exact: true });

  const phone = (page: Page) =>
    page.getByPlaceholder("Phone Number", { exact: true });

  const address = (page: Page) =>
    page.getByPlaceholder("Address", { exact: true });

  const password = (page: Page) =>
    page.getByPlaceholder("Password", { exact: true });

  const confirmPassword = (page: Page) =>
    page.getByPlaceholder("Confirm Password", { exact: true });

  const signupBtn = (page: Page) =>
    page.getByRole("button", { name: /^signup$/i });

  test("1) Register page renders correctly", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: /signup/i })).toBeVisible();

    await expect(fullName(page)).toBeVisible();
    await expect(username(page)).toBeVisible();
    await expect(email(page)).toBeVisible();
    await expect(phone(page)).toBeVisible();
    await expect(address(page)).toBeVisible();
    await expect(password(page)).toBeVisible();
    await expect(confirmPassword(page)).toBeVisible();

    await expect(signupBtn(page)).toBeVisible();
    await expect(page.getByRole("link", { name: /login!/i })).toBeVisible();
  });

  test("2) Submitting empty form shows validation errors", async ({ page }) => {
    await page.goto("/register");

    await signupBtn(page).click();

    // Use exact matching to avoid strict-mode duplicates
    await expect(
      page.getByText("Name is required", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Username is required", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Invalid email address", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Invalid phone number", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Address is required", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters", { exact: true }),
    ).toBeVisible();
  });

  test("3) Invalid email shows correct message", async ({ page }) => {
    await page.goto("/register");

    await fullName(page).fill("Test User");
    await username(page).fill("testuser");
    await email(page).fill("abc"); // invalid
    await phone(page).fill("9812345678");
    await address(page).fill("Kathmandu");

    await password(page).fill("password123");
    await confirmPassword(page).fill("password123");

    await signupBtn(page).click();

    await expect(
      page.getByText("Invalid email address", { exact: true }),
    ).toBeVisible();
  });

  test("4) Password mismatch shows mismatch message", async ({ page }) => {
    await page.goto("/register");

    await fullName(page).fill("Test User");
    await username(page).fill("testuser");
    await email(page).fill("test@mail.com");
    await phone(page).fill("9812345678");
    await address(page).fill("Kathmandu");

    await password(page).fill("password123");
    await confirmPassword(page).fill("password456");

    await signupBtn(page).click();

    await expect(
      page.getByText("Passwords don't match", { exact: true }),
    ).toBeVisible();
  });

  test("5) Valid form submits and navigates to login", async ({ page }) => {
    await page.goto("/register");

    await fullName(page).fill("Test User");
    await username(page).fill("testuser");
    await email(page).fill("test@mail.com");
    await phone(page).fill("9812345678");
    await address(page).fill("Kathmandu");

    await password(page).fill("password123");
    await confirmPassword(page).fill("password123");

    await signupBtn(page).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
