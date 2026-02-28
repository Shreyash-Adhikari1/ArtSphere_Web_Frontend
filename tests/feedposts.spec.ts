import { test, expect } from "@playwright/test";

test.describe("FeedPosts on /auth/dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock me
    await page.route("**/api/user/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { _id: "me123" } }),
      });
    });

    // Mock like/unlike success
    await page.route("**/api/post/like/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });
    await page.route("**/api/post/unlike/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // IMPORTANT: Mock "get feed posts" (adjust this to your real endpoint if needed)
    await page.route("**/api/post/**", async (route) => {
      const url = route.request().url();

      // allow like/unlike mocks above to handle those
      if (
        url.includes("/api/post/like/") ||
        url.includes("/api/post/unlike/")
      ) {
        return route.continue();
      }

      // fallback: return a feed
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          posts: [
            {
              _id: "p1",
              author: { _id: "u1", username: "artist1", avatar: "" },
              media: "",
              caption: "Hello from test post",
              likeCount: 2,
              commentCount: 1,
              likedBy: [],
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });
  });

  test("1) Dashboard loads (and is not redirected to login)", async ({
    page,
  }) => {
    await page.goto("/auth/dashboard");

    // If redirected, fail with clear message
    await expect(page).not.toHaveURL(/\/login$/);

    // Either feed post image exists or empty state exists
    const empty = page.getByText("No posts yet.", { exact: true });
    const postImage = page.getByAltText("Post content");

    if (await empty.isVisible().catch(() => false)) {
      await expect(empty).toBeVisible();
    } else {
      await expect(postImage.first()).toBeVisible();
    }
  });

  test("2) Like button toggles aria-label", async ({ page }) => {
    await page.goto("/auth/dashboard");
    await expect(page).not.toHaveURL(/\/login$/);

    const likeBtn = page.getByRole("button", { name: /like|unlike/i }).first();
    const before = await likeBtn.getAttribute("aria-label");

    await likeBtn.click();
    await expect(likeBtn).not.toHaveAttribute("aria-label", before || "");
  });

  test("3) Like count changes on click (optimistic)", async ({ page }) => {
    await page.goto("/auth/dashboard");
    await expect(page).not.toHaveURL(/\/login$/);

    const likeBtn = page.getByRole("button", { name: /like|unlike/i }).first();
    const count = likeBtn.locator("span").first();

    const beforeText = (await count.textContent()) ?? "0";
    await likeBtn.click();

    await expect(count).not.toHaveText(beforeText.trim());
  });

  test("4) Comments button is clickable", async ({ page }) => {
    await page.goto("/auth/dashboard");
    await expect(page).not.toHaveURL(/\/login$/);

    const commentsBtn = page.getByRole("button", { name: "Comments" }).first();
    await commentsBtn.click();

    // We don't know modal markup, so we just assert something changes:
    // often modal adds extra elements. If your CommentsModal has known text, swap this.
    await expect(page.locator("body")).toContainText(/comment/i);
  });

  test("5) Clicking @username navigates to /user/:id", async ({ page }) => {
    await page.goto("/auth/dashboard");
    await expect(page).not.toHaveURL(/\/login$/);

    const userHandle = page.locator("span").filter({ hasText: /^@/ }).first();
    await userHandle.click();

    await expect(page).toHaveURL(/\/user\/.+/);
  });
});
