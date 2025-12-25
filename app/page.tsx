import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-serif">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-6">
        <h1 className="text-[#C974A6] text-3xl font-bold">ArtSphere</h1>
        <div className="space-x-8 text-black font-medium">
          <Link href="/login" className="hover:text-[#C974A6] transition">Login</Link>
          <Link href="/register" className="bg-[#C974A6] text-white px-8 py-2.5 rounded-full shadow-md hover:brightness-95 transition">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col lg:flex-row items-center justify-between px-12 lg:px-24 py-16 gap-12">
        <div className="max-w-xl space-y-8">
          <h2 className="text-7xl font-bold leading-tight text-black">
            A safe space for <span className="text-[#C974A6]">student artists.</span>
          </h2>
          <p className="text-gray-600 text-xl leading-relaxed">
            Connect with fellow creators, share your journey, and grow your portfolio
            in a community built specifically for students.
          </p>
          <div className="flex gap-4">
            <Link href="/register" className="bg-[#C974A6] text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg hover:scale-105 transition-transform">
              Get Started
            </Link>
            <Link href="/login" className="border-2 border-[#C974A6] text-[#C974A6] px-10 py-4 rounded-full text-lg font-bold hover:bg-[#F3E8EE] transition">
              View Gallery
            </Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative">
          <div className="w-[500px] h-[500px] rounded-full bg-[#FFF6ED] flex items-center justify-center border-2 border-[#F3E8EE]">
            <Image
              src="/images/artsphere_logo.png"
              alt=""
              width={450}
              height={450}
              className="object-contain p-8"
              priority
            />
          </div>
        </div>
      </main>
      {/* Live Preview / Gallery Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-4xl font-bold text-black mb-4">Explore the Gallery</h3>
              <p className="text-gray-500 text-lg">See what student artists are creating right now.</p>
            </div>
            <Link href="/register" className="text-[#C974A6] font-bold hover:underline underline-offset-4">
              View all masterpieces →
            </Link>
          </div>

          {/* Art Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-[#FFF6ED] p-4 rounded-[2rem] border border-[#F3E8EE] shadow-sm hover:shadow-xl transition-shadow group"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-white mb-4">
                  <Image
                    src={`/images/preview-${item}.png`} // Ensure you have preview-1.png, etc.
                    alt="Art Preview"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex justify-between items-center px-2">
                  <div>
                    <p className="font-bold text-black">Midnight Sketches</p>
                    <p className="text-sm text-gray-500">by @artist_student</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#C974A6]">
                    <span className="text-sm font-bold">♥</span>
                    <span className="text-xs font-bold text-black">24</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="mx-12 lg:mx-24 mb-24 p-12 rounded-[3rem] bg-[#C974A6] text-center text-white">
        <h2 className="text-5xl font-bold mb-6">Ready to share your art?</h2>
        <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
          Join thousands of students and get constructive feedback in a toxicity-free environment.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-[#C974A6] px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-[#F3E8EE] transition"
        >
          Create Your Portfolio
        </Link>
      </section>

      {/* Small Footer/Feature bar */}
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