"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-serif">
      <nav className="flex justify-between items-center px-12 py-6">
        <h1 className="text-[#C974A6] text-3xl font-bold">ArtSphere</h1>
        <div className="space-x-8 text-black font-medium">
          <Link href="/login" className="hover:text-[#C974A6] transition">
            Login
          </Link>
          <Link
            href="/register"
            className="bg-[#C974A6] text-white px-8 py-2.5 rounded-full shadow-md hover:brightness-95 transition"
          >
            Join Now
          </Link>
        </div>
      </nav>

      <main className="flex flex-col lg:flex-row items-center justify-between px-12 lg:px-24 py-16 gap-12">
        <div className="max-w-xl space-y-8">
          <h2 className="text-7xl font-bold leading-tight text-black">
            A safe space for{" "}
            <span className="text-[#C974A6]">student artists.</span>
          </h2>
          <p className="text-gray-600 text-xl leading-relaxed">
            Connect with fellow creators, share your journey, and grow your
            portfolio in a community built specifically for students.
          </p>
          <div className="flex gap-4">
            <Link
              href="/register"
              className="bg-[#C974A6] text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="border-2 border-[#C974A6] text-[#C974A6] px-10 py-4 rounded-full text-lg font-bold hover:bg-[#F3E8EE] transition"
            >
              View Gallery
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="w-125 h-125 rounded-full bg-[#FFF6ED] flex items-center justify-center border-2 border-[#F3E8EE]">
            <Image
              src="/images/artsphere_logo.png"
              alt="ArtSphere"
              width={450}
              height={450}
              className="object-contain p-8"
              priority
            />
          </div>
        </div>
      </main>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-4xl font-bold text-black mb-4">
                Get started in 3 steps
              </h3>
              <p className="text-gray-500 text-lg">
                A quick tour of what you can do inside ArtSphere.
              </p>
            </div>

            <Link
              href="/register"
              className="text-[#C974A6] font-bold hover:underline underline-offset-4"
            >
              Join now →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: "/images/onboarding/onboarding_welc.png",
                title: "Welcome to ArtSphere",
                description:
                  "Discover amazing art from talented student creators and build your own space.",
              },
              {
                image: "/images/onboarding/onboarding_connect.png",
                title: "Connect with Artists",
                description:
                  "Follow, like, and comment to support creators and grow your circle.",
              },
              {
                image: "/images/onboarding/onboarding_share.png",
                title: "Share Your Own Art",
                description:
                  "Upload your work, get feedback, and turn your portfolio into a story.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#FFF6ED] p-6 rounded-4xl border border-[#F3E8EE] shadow-sm hover:shadow-xl transition-shadow group"
              >
                <div className="relative w-full h-60 overflow-hidden rounded-3xl bg-white mb-5 flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-6 group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>

                <div className="px-1">
                  <p className="font-bold text-black text-xl mb-2">
                    {item.title}
                  </p>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-5">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 text-[#C974A6] font-bold hover:underline underline-offset-4"
                    >
                      Try it →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-12 lg:mx-24 mb-24 p-12 rounded-[3rem] bg-[#C974A6] text-center text-white">
        <h2 className="text-5xl font-bold mb-6">Ready to share your art?</h2>
        <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
          Join thousands of students and get constructive feedback in a
          toxicity-free environment.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-[#C974A6] px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-[#F3E8EE] transition"
        >
          Create Your Portfolio
        </Link>
      </section>

      <div className="bg-[#F3E8EE] py-10 mt-12">
        <div className="flex justify-around max-w-6xl mx-auto text-[#C974A6] font-bold">
          <p>✓ Student Verified</p>
          <p>✓ Constructive Feedback</p>
          <p>✓ Zero Toxicity</p>
        </div>
      </div>
    </div>
  );
}
