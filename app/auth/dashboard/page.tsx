"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/(public)/_components/Sidebar";
import FeedPosts, { type FeedPost } from "@/app/(auth)/_components/FeedPosts";

type FeedType = "discover" | "following";

export default function HomePage() {
  const [feed, setFeed] = useState<FeedType>("discover");

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFeed(nextFeed: FeedType) {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        nextFeed === "discover"
          ? "/api/post/posts"
          : "/api/post/posts/following";

      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load feed");
      }

      const list: FeedPost[] = data.posts ?? data.data ?? [];
      setPosts(list);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed(feed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);

  if (loading) {
    return (
      <div className="flex bg-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl mx-auto font-serif">
          Loading feed…
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl mx-auto font-serif text-red-600">
          {error}
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-4xl mx-auto font-serif">
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-100 mb-6">
          <button
            type="button"
            onClick={() => setFeed("discover")}
            className={`pb-2 ${
              feed === "discover"
                ? "border-b-2 border-black font-bold"
                : "text-gray-400"
            }`}
          >
            Discover
          </button>

          <button
            type="button"
            onClick={() => setFeed("following")}
            className={`pb-2 ${
              feed === "following"
                ? "border-b-2 border-black font-bold"
                : "text-gray-400"
            }`}
          >
            Following
          </button>
        </div>

        <h2 className="text-xl font-bold mb-6 text-black">
          {feed === "discover" ? "Trending Posts" : "Following Feed"}
        </h2>

        <FeedPosts posts={posts} setPosts={setPosts} />
      </main>
    </div>
  );
}
