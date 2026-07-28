import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-zinc-400 mt-4 leading-relaxed">
            This is a placeholder Terms of Service page. Replace this content with your final legal text before launch.
          </p>

          <div className="mt-10 space-y-4 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-zinc-100">1. Use of the Service</h2>
              <p className="text-zinc-400">
                You agree to use ProConnectiv in a way that complies with applicable laws and our community expectations.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-100">2. Limitations</h2>
              <p className="text-zinc-400">
                We provide the platform as-is. Details regarding availability, responsibility, and disputes should be included here.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

