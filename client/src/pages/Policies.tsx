import { Navbar } from "@/components/Navbar";

const sections = [
  {
    id: "terms",
    title: "Terms",
    body:
      "Bookings on ProConnectiv are manually reviewed and reconciled during beta. Paying for a booking reserves the requested slot, but final session acceptance still depends on pro availability and review.",
  },
  {
    id: "privacy",
    title: "Privacy",
    body:
      "We store booking records, payment references, and support notes so we can reconcile hosted payments, provide support, and maintain an audit trail. We do not process or store card details directly in the app for this beta workflow.",
  },
  {
    id: "refund-policy",
    title: "Refund Policy",
    body:
      "If a pro declines a paid booking or the session cannot be delivered, ProConnectiv will review the case and process a refund through the original payment workflow where applicable. Completed sessions are generally non-refundable unless there is a clear delivery issue.",
  },
];

export default function Policies() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
          ProConnectiv beta policies
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Policies</h1>
        <p className="mt-3 text-sm text-zinc-500">
          These sections explain how hosted payments, booking reconciliation,
          privacy, and refunds work during the beta launch.
        </p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 scroll-mt-24"
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
