import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export default function Careers() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Careers</h1>
          <p className="text-zinc-400 mt-4 leading-relaxed">
            We are building the place where experts and clients meet for focused video
            sessions — with escrow-protected payments and clear outcomes.
          </p>

          <div className="mt-10 space-y-4 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-zinc-100">Open roles</h2>
              <p className="text-zinc-400 mt-2">
                We are a small team in early beta. There are no open listings right now,
                but we welcome thoughtful introductions from people who care about
                marketplaces, video, and trust.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-100">Get in touch</h2>
              <p className="text-zinc-400 mt-2">
                Send your background and what you would like to work on to{" "}
                <a
                  href="mailto:proconnectivv@gmail.com"
                  className="text-zinc-200 underline underline-offset-4 hover:text-white"
                >
                  proconnectivv@gmail.com
                </a>
                .
              </p>
            </section>
          </div>

          <Link href="/contact">
            <Button className="mt-8 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 font-semibold">
              Contact us
            </Button>
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
