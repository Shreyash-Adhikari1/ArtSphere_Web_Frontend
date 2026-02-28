import { test, expect } from "@playwright/test";

test.describe("PostGrid on /profile", () => {
  test.beforeEach(async ({ page }) => {
    // Mock profile user
    await page.route("**/api/user/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            _id: "u-me",
            username: "me",
            fullName: "Me User",
            bio: "bio",
            avatar: "",
            postCount: 2,
            followingCount: 10,
            followerCount: 20,
          },
        }),
      });
    });

    // Mock image endpoint so <img> doesn't fail
    await page.route("**/api/image?path=**", async (route) => {
      const pngBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X9l0sAAAAASUVORK5CYII=";

      await route.fulfill({
        status: 200,
        headers: { "content-type": "image/png" },
        body: Buffer.from(pngBase64, "base64"),
      });
    });
  });

  test("1) Empty state: shows 'No posts yet' when my-posts returns empty", async ({
    page,
  }) => {
    await page.route("**/api/post/posts/my-posts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, posts: [] }),
      });
    });

    await page.goto("/profile");
    await expect(page.getByText("No posts yet", { exact: true })).toBeVisible();
  });

  test("2) Renders the correct number of grid tiles (only PostGrid tiles)", async ({
    page,
  }) => {
    await page.route("**/api/post/posts/my-posts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          posts: [
            { _id: "p1", media: "a.jpg", likeCount: 4, commentCount: 1 },
            { _id: "p2", media: "b.jpg", likeCount: 2, commentCount: 0 },
          ],
        }),
      });
    });

    await page.goto("/profile");

    const tileImages = page.locator('img[alt="post"]');
    const noMediaTiles = page.getByText("No media", { exact: true });

    const imgCount = await tileImages.count();
    const noMediaCount = await noMediaTiles.count();

    expect(imgCount + noMediaCount).toBe(2);
  });

  test("3) Uses /api/image?path=... and encodes normal vs challenge paths", async ({
    page,
  }) => {
    await page.route("**/api/post/posts/my-posts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          posts: [
            {
              _id: "normal1",
              media: "normal image.jpg",
              likeCount: 1,
              commentCount: 1,
            },
            {
              _id: "challenge1",
              media: "challenge image.jpg",
              isChallengeSubmission: true,
              likeCount: 9,
              commentCount: 2,
            },
          ],
        }),
      });
    });

    await page.goto("/profile");

    const imgs = page.locator('img[alt="post"]');
    await expect(imgs).toHaveCount(2);

    const src1 = await imgs.nth(0).getAttribute("src");
    const src2 = await imgs.nth(1).getAttribute("src");

    expect(src1).toContain("/api/image?path=");
    expect(decodeURIComponent(src1 || "")).toContain(
      "/uploads/post-images/normal image.jpg",
    );

    expect(src2).toContain("/api/image?path=");
    expect(decodeURIComponent(src2 || "")).toContain(
      "/uploads/challenge-submissions/challenge image.jpg",
    );
  });

  test("4) Hover overlay reveals like/comment counts (showHoverOverlay=true)", async ({
    page,
  }) => {
    await page.route("**/api/post/posts/my-posts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          posts: [
            { _id: "p1", media: "a.jpg", likeCount: 12, commentCount: 3 },
          ],
        }),
      });
    });

    await page.goto("/profile");

    const firstTile = page.locator('button[type="button"]').first();
    await firstTile.hover();

    // Overlay shows counts as text (12 and 3)
    await expect(page.getByText("12", { exact: true })).toBeVisible();
    await expect(page.getByText("3", { exact: true })).toBeVisible();
  });

  test("5) Clicking a tile opens PostDetailsModal", async ({ page }) => {
    await page.route("**/api/post/posts/my-posts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          posts: [{ _id: "p1", media: "a.jpg", likeCount: 1, commentCount: 1 }],
        }),
      });
    });

    await page.goto("/profile");

    // click first grid tile (by the image inside it)
    await page.locator('img[alt="post"]').first().click();

    await expect(page.getByTestId("post-details-modal")).toBeVisible();
  });
});
