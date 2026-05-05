import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 mt-4 leading-relaxed">
            This is a placeholder Privacy Policy page. Replace this content with your final legal text before launch.
          </p>

          <div className="mt-10 space-y-4 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-zinc-100">
                1. Information we collect
              </h2>
              <p className="text-zinc-400">
                Include what data you collect and how you use it (account data, session data, communications, and analytics).
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-100">
                2. How we protect your information
              </h2>
              <p className="text-zinc-400">
                Describe security safeguards, retention periods, and user rights.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

