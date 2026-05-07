import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Contact Us
          </h1>
          <p className="text-zinc-400 mt-4 leading-relaxed">
            Have a question or need help? Reach out and our team will get back to you.
          </p>

          <div className="mt-10 p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-100">Email</h2>
            <p className="text-zinc-400 mt-2 leading-relaxed">
              Add your support email here.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:hello@proconnectiv.com"
                className="inline-flex"
              >
                <Button variant="default" className="bg-primary text-black hover:brightness-110">
                  Email Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

