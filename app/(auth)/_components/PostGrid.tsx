"use client";

import { Heart } from "lucide-react";

export type GridPost = {
  _id: string;
  media?: string;
  isChallengeSubmission?: boolean;
  likeCount?: number;
  commentCount?: number;
};

function resolvePostPath(post: GridPost) {
  if (!post.media) return null;
  if (post.isChallengeSubmission)
    return `/uploads/challenge-submissions/${post.media}`;
  return `/uploads/post-images/${post.media}`;
}

export default function PostGrid({
  posts,
  onPostClick,
  showHoverOverlay = false,
}: {
  posts: GridPost[];
  onPostClick: (post: GridPost) => void;
  showHoverOverlay?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {posts.length > 0 ? (
        posts.map((post) => {
          const path = resolvePostPath(post);

          return (
            <button
              key={post._id}
              type="button"
              onClick={() => onPostClick(post)}
              className={`relative aspect-square bg-gray-100 overflow-hidden text-left ${
                showHoverOverlay ? "group" : ""
              }`}
            >
              {path ? (
                <img
                  src={`/api/image?path=${encodeURIComponent(path)}`}
                  alt="post"
                  className={`w-full h-full object-cover ${
                    showHoverOverlay
                      ? "group-hover:scale-110 transition duration-500"
                      : ""
                  }`}
                  onError={(e) => {
                    e.currentTarget.src = "/images/artsphere_logo.png";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No media
                </div>
              )}

              {/* Hover overlay (only if enabled) */}
              {showHoverOverlay && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-6 text-white font-bold">
                    {post.likeCount != null && (
                      <div className="flex items-center gap-2">
                        <Heart size={18} fill="white" />
                        <span>{post.likeCount}</span>
                      </div>
                    )}
                    {post.commentCount != null && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💬</span>
                        <span>{post.commentCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })
      ) : (
        <div className="col-span-3 text-center py-20 text-gray-400 italic">
          No posts yet
        </div>
      )}
    </div>
  );
}
