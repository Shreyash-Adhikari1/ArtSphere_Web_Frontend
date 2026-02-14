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
  X,
  Loader2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import SubmitToChallengeModal from "../_components/SubmitToChallengeModal";

/* =================== Types =================== */

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

type Post = {
  _id: string;
  author?: { _id?: string; username?: string; avatar?: string };
  media?: string;
  caption?: string;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  isChallengeSubmission?: boolean;
};

type Submission = {
  _id: string;
  submitterId: string; // ObjectId string
  challengeId: string;
  submittedPostId: Post; // populated in repo
  createdAt?: string;
};

/* =================== Helpers =================== */

function resolveAvatarUrl(base: string, avatar?: string) {
  if (!avatar) return "/images/default-avatar.png";
  if (avatar.startsWith("http://") || avatar.startsWith("https://"))
    return avatar;
  if (avatar.startsWith("/uploads/")) return `${base}${avatar}`;
  return `${base}/uploads/profile-image/${avatar}`;
}

function resolveChallengeMedia(base: string, media?: string) {
  if (!media) return null;
  if (media.startsWith("http://") || media.startsWith("https://")) return media;
  if (media.startsWith("/uploads/")) return `${base}${media}`;
  return `${base}/uploads/challenge-images/${media}`;
}

/**
 * Submissions can be:
 * - existing posts (uploads/post-images)
 * - created submission posts (uploads/challenge-submissions)
 *
 * You didn't include isChallengeSubmission in populate, so we use heuristics:
 * - if filename starts with "challenge-submissions-" OR contains "challenge-submissions"
 * - else assume post-images
 */
function resolvePostMedia(
  base: string,
  post?: { media?: string; isChallengeSubmission?: boolean },
) {
  const media = post?.media;
  if (!media) return "/images/artsphere_logo.png";
  if (media.startsWith("http://") || media.startsWith("https://")) return media;
  if (media.startsWith("/uploads/")) return `${base}${media}`;

  const looksLikeSubmission =
    post?.isChallengeSubmission === true ||
    media.startsWith("challenge-submissions-") ||
    media.includes("challenge-submissions");

  if (looksLikeSubmission)
    return `${base}/uploads/challenge-submissions/${media}`;
  return `${base}/uploads/post-images/${media}`;
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/** Tries multiple endpoints and returns first successful JSON */
async function fetchFirstOk(endpoints: string[]) {
  for (const url of endpoints) {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return safeJson(res);
  }
  throw new Error("Could not load posts (unknown my-posts endpoint).");
}

/* =================== Page =================== */

export default function ChallengeDetailPage() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const router = useRouter();
  const { challengeId } = useParams<{ challengeId: string }>();
  const id = useMemo(() => String(challengeId || ""), [challengeId]);

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState("");

  const [subsLoading, setSubsLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Submit modal
  const [submitOpen, setSubmitOpen] = useState(false);

  async function loadChallenge() {
    // 1) Try new endpoint (recommended): GET /api/challenge/:challengeId
    const direct = await fetch(`/api/challenge/${id}`, { cache: "no-store" });
    if (direct.ok) {
      const data = await safeJson(direct);
      const ch = data?.challenge ?? data?.data ?? data;
      if (ch?._id) return ch as Challenge;
    }

    // 2) Fallback: GET /getall then filter
    const res = await fetch("/api/challenge/getall", { cache: "no-store" });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || "Failed to load challenge");

    const list: Challenge[] = data?.challenges ?? [];
    const found = list.find((c) => String(c._id) === id);
    if (!found) throw new Error("Challenge not found");
    return found;
  }

  async function loadSubmissions() {
    setSubsLoading(true);
    try {
      const res = await fetch(`/api/submission/get/${id}`, {
        cache: "no-store",
      });
      const data = await safeJson(res);

      if (!res.ok || data?.success === false) {
        // If user isn't logged in or auth required fails, you'll see it here.
        throw new Error(data?.message || "Failed to load submissions");
      }

      const list: Submission[] = data?.submission ?? data?.submissions ?? [];
      setSubmissions(Array.isArray(list) ? list : []);
    } finally {
      setSubsLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const ch = await loadChallenge();
        setChallenge(ch);
        await loadSubmissions();
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  open ? "bg-white/90 text-black" : "bg-black/80 text-white"
                }`}
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

                <button
                  disabled={!open}
                  className={`px-6 py-2 rounded-full font-bold transition ${
                    open
                      ? "bg-[#C974A6] text-white hover:opacity-90"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  type="button"
                  onClick={() => setSubmitOpen(true)}
                >
                  Submit to challenge
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions */}
        <div className="mt-8">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-lg font-bold text-black">Submissions</h2>
            <button
              type="button"
              onClick={loadSubmissions}
              className="text-sm font-bold text-black hover:opacity-80"
            >
              Refresh
            </button>
          </div>

          {subsLoading ? (
            <div className="bg-white border rounded-3xl p-10 text-center text-gray-400">
              Loading submissions…
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-white border rounded-3xl p-10 text-center text-gray-400 italic">
              No submissions yet. Be the first 👀
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {submissions.map((s) => {
                const post = s.submittedPostId;
                const img = resolvePostMedia(BASE, post);

                return (
                  <div
                    key={s._id}
                    className="relative aspect-square bg-gray-100 overflow-hidden rounded-2xl border cursor-pointer"
                    title={post?.caption || ""}
                    onClick={() => {
                      // Optional: navigate to post details page if you have it
                      // router.push(`/post/${post._id}`)
                      // For now: open author profile quickly
                      const authorId = post?.author?._id;
                      if (authorId) router.push(`/user/${authorId}`);
                    }}
                  >
                    <img
                      src={img}
                      alt="submission"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/artsphere_logo.png";
                      }}
                    />

                    {/* tiny overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                      <div className="text-[10px] bg-black/50 px-2 py-1 rounded-full">
                        @{post?.author?.username ?? "artist"}
                      </div>
                      <div className="text-[10px] bg-black/50 px-2 py-1 rounded-full">
                        ♥ {post?.likeCount ?? 0} · 💬 {post?.commentCount ?? 0}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {submitOpen && (
          <SubmitToChallengeModal
            base={BASE}
            challengeId={id}
            onClose={() => setSubmitOpen(false)}
            onSubmitted={async () => {
              setSubmitOpen(false);
              await loadSubmissions();
              const ch = await loadChallenge();
              setChallenge(ch);
            }}
          />
        )}
      </main>
    </div>
  );
}
