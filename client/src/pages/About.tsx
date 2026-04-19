import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            About ProConnect
          </h1>
          <p className="text-zinc-400 mt-4 leading-relaxed">
            ProConnect helps you strategically reconnect with people you value.
          </p>

          <div className="mt-10 space-y-4 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-zinc-100">What we do</h2>
              <p className="text-zinc-400">
                ProConnect supports verified conversations and structured connection flows, so you can meet the right people with confidence.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-100">Why it matters</h2>
              <p className="text-zinc-400">
                You deserve clarity, privacy, and intentional communication. We built ProConnect to make connecting feel safe, simple, and effective.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

