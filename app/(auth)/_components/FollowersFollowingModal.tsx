"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type SimpleUser = {
  _id: string;
  username?: string;
  fullName?: string;
  avatar?: string;
};

function extractArray(data: any) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const candidates = [
    data.following,
    data.followers,
    data.users,
    data.data,
    data.result,
    data.items,
    data.list,
  ];

  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

function normalizeUsers(list: any[]): SimpleUser[] {
  return list
    .map((item: any) => {
      if (!item) return null;

      // direct user object
      if (item._id && (item.username || item.fullName || item.avatar)) {
        return {
          _id: String(item._id),
          username: item.username,
          fullName: item.fullName,
          avatar: item.avatar,
        };
      }

      // follow doc: follower populated
      if (item.follower && item.follower._id) {
        return {
          _id: String(item.follower._id),
          username: item.follower.username,
          fullName: item.follower.fullName,
          avatar: item.follower.avatar,
        };
      }

      // follow doc: following populated
      if (item.following && item.following._id) {
        return {
          _id: String(item.following._id),
          username: item.following.username,
          fullName: item.following.fullName,
          avatar: item.following.avatar,
        };
      }

      // id-only fallbacks
      if (item._id) return { _id: String(item._id) };
      if (item.follower) return { _id: String(item.follower) };
      if (item.following) return { _id: String(item.following) };

      return null;
    })
    .filter(Boolean) as SimpleUser[];
}

export default function FollowersFollowingModal({
  open,
  kind,
  userId,
  onClose,
}: {
  open: boolean;
  kind: "followers" | "following";
  userId: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!userId) return;

    (async () => {
      setLoading(true);
      setError("");
      setUsers([]);

      try {
        const endpoint =
          kind === "followers"
            ? `/api/follow/${userId}/followers`
            : `/api/follow/${userId}/following`;

        const res = await fetch(endpoint, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Failed to load list");
        }

        const raw = extractArray(data);
        setUsers(normalizeUsers(raw));
      } catch (e: any) {
        setError(e?.message || "Failed to load list");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, kind, userId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
        type="button"
      />

      {/* modal */}
      <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-lg">
            {kind === "followers" ? "Followers" : "Following"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-400">Loading…</div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">{error}</div>
          ) : users.length > 0 ? (
            <div className="divide-y">
              {users.map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-5 py-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border">
                    <img
                      src={
                        u.avatar
                          ? `/api/image?path=${encodeURIComponent(
                              `/uploads/profile-image/${u.avatar}`,
                            )}`
                          : "/images/artsphere_logo.png"
                      }
                      className="w-full h-full object-cover"
                      alt="avatar"
                      onError={(e) => {
                        e.currentTarget.src = "/images/artsphere_logo.png";
                      }}
                    />
                  </div>

                  <div className="leading-tight">
                    <p className="font-semibold text-sm">
                      {u.username ? `@${u.username}` : "Unknown user"}
                    </p>
                    {u.fullName && (
                      <p className="text-xs text-gray-500">{u.fullName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 italic">
              No {kind} yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
