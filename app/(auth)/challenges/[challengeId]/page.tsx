"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/(public)/_components/Sidebar";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

type Challenge = {
  _id: string;
  challengerId?: { _id: string; username?: string; avatar?: string };
  challengeTitle: string;
  challengeDescription: string;
  challengeMedia?: string;
  submissionCount: number;
  status: "open" | "closed";
  endsAt: string;
};

function resolveChallengeMedia(base: string, media?: string) {
  if (!media) return null;
  if (media.startsWith("http://") || media.startsWith("https://")) return media;
  if (media.startsWith("/uploads/")) return `${base}${media}`;
  return `${base}/uploads/challenge-images/${media}`;
}

function resolveAvatarUrl(base: string, avatar?: string) {
  if (!avatar) return "/images/default-avatar.png";
  if (avatar.startsWith("http://") || avatar.startsWith("https://"))
    return avatar;
  if (avatar.startsWith("/uploads/")) return `${base}${avatar}`;
  return `${base}/uploads/profile-image/${avatar}`;
}

export default function ChallengeDetailPage() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const router = useRouter();
  const { challengeId } = useParams<{ challengeId: string }>();
  const id = useMemo(() => String(challengeId || ""), [challengeId]);

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/challenge/${id}`, { cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Failed to load challenge");
        }

        const ch = data?.challenge;
        if (!ch?._id) throw new Error("Challenge not found");

        setChallenge(ch);
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex bg-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-5xl mx-auto font-serif text-gray-400">
          Loading challenge…
        </main>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="flex bg-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-5xl mx-auto font-serif">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-black font-bold hover:opacity-80"
            type="button"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="text-red-600">{error || "Challenge not found"}</div>
        </main>
      </div>
    );
  }

  const cover = resolveChallengeMedia(BASE, challenge.challengeMedia);
  const avatar = resolveAvatarUrl(BASE, challenge.challengerId?.avatar);
  const open = challenge.status === "open";

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-5xl mx-auto font-serif">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-black font-bold hover:opacity-80"
          type="button"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Hero */}
        <div className="bg-[#FFF6ED] rounded-3xl border border-orange-50 shadow-sm overflow-hidden">
          <div className="relative h-64 bg-white border-b border-orange-50">
            {cover ? (
              <img
                src={cover}
                alt="challenge cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/artsphere_logo.png";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageIcon size={40} />
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${open ? "bg-white/90 text-black" : "bg-black/80 text-white"}`}
              >
                {open ? "OPEN" : "CLOSED"}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              <Sparkles className="text-[#C974A6]" size={22} />
              {challenge.challengeTitle}
            </h1>

            <p className="text-gray-600 mt-3 whitespace-pre-wrap">
              {challenge.challengeDescription}
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt="creator"
                  className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/default-avatar.png";
                  }}
                />
                <div className="leading-tight">
                  <p className="text-sm font-bold text-black">
                    @{challenge.challengerId?.username || "creator"}
                  </p>
                  <p className="text-xs text-gray-400 inline-flex items-center gap-1">
                    <Calendar size={14} />
                    ends: {new Date(challenge.endsAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-black inline-flex items-center gap-1 justify-end">
                    <Trophy size={16} className="text-[#C974A6]" />
                    {challenge.submissionCount ?? 0}
                  </p>
                  <p className="text-xs text-gray-400">submissions</p>
                </div>

                {/* Submit button (UI now; wiring once you send submission routes) */}
                <button
                  disabled={!open}
                  className={`px-6 py-2 rounded-full font-bold transition ${
                    open
                      ? "bg-[#C974A6] text-white hover:opacity-90"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  type="button"
                  onClick={() => {
                    // Next step: open "Choose existing post / Create new post" flow
                    alert(
                      "Submit flow wiring comes next (need submission endpoints).",
                    );
                  }}
                >
                  Submit to challenge
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder: submissions grid */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-black mb-3">Submissions</h2>
          <div className="bg-white border rounded-3xl p-8 text-center text-gray-400 italic">
            Submissions UI is ready — once you send the submission endpoints,
            I’ll wire the grid and the “submit post” flow.
          </div>
        </div>
      </main>
    </div>
  );
}
