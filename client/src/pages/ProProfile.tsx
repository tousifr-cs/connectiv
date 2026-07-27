import { useState, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { usePro } from "@/hooks/use-pros";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { useMutation } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Pro } from "@shared/schema";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lightbulb,
  Pencil,
  Headphones,
  MessageSquare,
} from "lucide-react";

const LABEL_TO_SESSION_TYPE: Record<string, string> = {
  video_call: "video_call",
  audio_consult: "audio_consult",
  dm_bundle: "dm_bundle",
  deep_dive: "deep_dive",
};

const SESSION_META: Record<
  string,
  { label: string; icon: typeof Lightbulb; duration: string; description: string }
> = {
  video_call: {
    label: "Strategy Sprint",
    icon: Lightbulb,
    duration: "15 MINUTES",
    description: "A focused video session to align on your goals and next steps.",
  },
  audio_consult: {
    label: "Audio Consultation",
    icon: Headphones,
    duration: "30 MINUTES",
    description: "In-depth audio guidance for detailed project feedback.",
  },
  dm_bundle: {
    label: "DM Bundle",
    icon: MessageSquare,
    duration: "5 MESSAGES",
    description: "Async messaging for quick feedback and actionable advice.",
  },
  deep_dive: {
    label: "Portfolio Review",
    icon: Pencil,
    duration: "60 MINUTES",
    description: "Candid, high-level feedback on your visual output.",
  },
};

const RATINGS_MAP = [4.9, 5.0, 4.8, 4.7, 4.9, 4.6, 4.8, 5.0];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const TIME_SLOTS = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"];

function getProRating(id: number): number {
  return RATINGS_MAP[id % RATINGS_MAP.length] ?? 4.8;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);
  return days;
}

function getAvailableDays(proId: number, year: number, month: number): Set<number> {
  const available = new Set<number>();
  const today = new Date();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let d = 1; d <= totalDays; d++) {
    if (isCurrentMonth && d < today.getDate()) continue;
    const dow = new Date(year, month, d).getDay();
    if (dow === 0) continue;
    if ((d * 7 + proId * 3) % 4 === 0) available.add(d);
  }
  return available;
}

// ─── Calendar ───────────────────────────────────────────────────────────────

function BookingCalendar({
  proId,
  selectedDate,
  onSelectDate,
}: {
  proId: number;
  selectedDate: { year: number; month: number; day: number } | null;
  onSelectDate: (d: { year: number; month: number; day: number }) => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const days = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const available = useMemo(
    () => getAvailableDays(proId, viewYear, viewMonth),
    [proId, viewYear, viewMonth]
  );

  function prev() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function next() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const isSelected = (d: number) =>
    selectedDate?.year === viewYear &&
    selectedDate?.month === viewMonth &&
    selectedDate?.day === d;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
        {DAY_HEADERS.map((d) => (
          <span key={d} className="text-[10px] font-semibold text-white/25 uppercase py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {days.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />;
          const isAvail = available.has(day);
          const isSel = isSelected(day);
          return (
            <button
              key={day}
              disabled={!isAvail}
              onClick={() => onSelectDate({ year: viewYear, month: viewMonth, day })}
              className={`w-8 h-8 mx-auto rounded-full text-xs font-medium transition-all duration-150 ${
                isSel
                  ? "bg-primary text-black font-bold"
                  : isAvail
                    ? "text-white hover:bg-primary/20 hover:text-primary cursor-pointer"
                    : "text-white/15 cursor-default"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Session Card ───────────────────────────────────────────────────────────

function SessionCard({
  sessionKey,
  price,
  selected,
  onSelect,
}: {
  sessionKey: string;
  price: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = SESSION_META[sessionKey];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <button
      onClick={onSelect}
      className={`text-left w-full p-5 rounded-xl border transition-all duration-200 ${
        selected
          ? "bg-primary/[0.08] border-primary/40"
          : "bg-white/[0.03] border-white/[0.08] hover:border-white/15"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          selected ? "bg-primary/20" : "bg-white/[0.06]"
        }`}>
          <Icon className={`w-4 h-4 ${selected ? "text-primary" : "text-white/50"}`} />
        </div>
        <span className="text-lg font-bold">${price}</span>
      </div>
      <h4 className="text-sm font-bold mb-1">{meta.label}</h4>
      <p className="text-xs text-white/40 leading-relaxed mb-3">{meta.description}</p>
      <span className={`text-[10px] font-bold tracking-[0.1em] uppercase ${
        selected ? "text-primary" : "text-white/30"
      }`}>
        {meta.duration}
      </span>
    </button>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function ProProfile() {
  const [, params] = useRoute("/pro/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: pro, isLoading, isError } = usePro(id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const bookingMutation = useMutation({
    mutationFn: async (data: {
      proId: number;
      sessionType: string;
      topic: string;
      message: string;
      price: number;
      scheduledAt?: string;
    }) => {
      const res = await authedFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (booking: { id: string }) => {
      toast({
        title: "Booking created",
        description: "Next step: complete payment securely through Payoneer.",
      });
      setLocation(`/bookings/${booking.id}/payment`);
    },
    onError: (err: Error) => {
      toast({
        title: "Booking failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const sessionTypes = useMemo(() => {
    if (!pro) return [];
    const types: { key: string; price: number }[] = [];
    if (pro.videoCallPrice) types.push({ key: "video_call", price: pro.videoCallPrice });
    if (pro.audioConsultPrice) types.push({ key: "audio_consult", price: pro.audioConsultPrice });
    if (pro.dmBundlePrice) types.push({ key: "dm_bundle", price: pro.dmBundlePrice });
    if (pro.deepDivePrice) types.push({ key: "deep_dive", price: pro.deepDivePrice });
    if (types.length === 0) types.push({ key: "video_call", price: pro.price });
    return types;
  }, [pro]);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !pro) return <ProfileNotFound />;

  const activeSession = selectedSession || sessionTypes[0]?.key || "video_call";
  const activePrice = sessionTypes.find((s) => s.key === activeSession)?.price ?? pro.price;
  const rating = getProRating(pro.id);

  const nameParts = pro.displayName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const categories = (pro.categories || "")
    .split(",")
    .filter(Boolean)
    .map((c) => c.trim());
  const badgeText = [
    pro.isVerified ? "VERIFIED EXPERT" : null,
    categories[0]?.toUpperCase(),
  ]
    .filter(Boolean)
    .join(" • ");

  function handleConfirmBooking() {
    if (!pro) return;
    if (!user) {
      setLocation("/auth");
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Select a date and time",
        description: "Please pick an available date and time slot.",
        variant: "destructive",
      });
      return;
    }

    const scheduled = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );
    const [timePart, ampm] = selectedTime.split(" ");
    const [hStr, mStr] = timePart.split(":");
    let hours = parseInt(hStr);
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    scheduled.setHours(hours, parseInt(mStr), 0, 0);

    const sessionType = LABEL_TO_SESSION_TYPE[activeSession] ?? "video_call";
    const meta = SESSION_META[activeSession];

    bookingMutation.mutate({
      proId: pro.id,
      sessionType,
      topic: `${meta?.label ?? "Session"} with ${pro.displayName}`,
      message: `Booked for ${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year} at ${selectedTime}`,
      price: activePrice,
      scheduledAt: scheduled.toISOString(),
    });
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end">
          {/* Left: Info */}
          <div className="order-2 lg:order-1">
            {badgeText && (
              <span className="inline-block px-3 py-1.5 rounded bg-primary text-black text-[10px] font-bold tracking-[0.1em] uppercase mb-6">
                {badgeText}
              </span>
            )}

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.9] mb-1">
              {firstName}
            </h1>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black italic uppercase tracking-tight leading-[0.9] text-primary mb-6">
              {lastName}
            </h1>

            <p className="text-sm sm:text-base text-white/45 leading-relaxed max-w-md">
              {pro.bio.split(".").slice(0, 2).join(".") + "."}
            </p>
          </div>

          {/* Right: Photo + Rating */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative overflow-hidden rounded-2xl aspect-[3/4] max-h-[480px] bg-white/[0.03]">
              <img
                src={pro.imageUrl}
                alt={pro.displayName}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-[#111111]/90 backdrop-blur-sm border border-white/[0.1] rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Star className="w-4 h-4 fill-primary text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">{rating}/5</p>
                <p className="text-[10px] font-semibold tracking-[0.1em] text-white/40 uppercase">
                  Client Rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT + BOOKING ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
          {/* Left column: About + Sessions */}
          <div className="space-y-10">
            {/* About */}
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <h2 className="text-[11px] font-bold tracking-[0.15em] text-white/50 uppercase shrink-0">
                  About the Expert
                </h2>
              </div>
              <p className="text-sm text-white/50 leading-[1.8] max-w-xl">
                {pro.bio}
              </p>
              {pro.availability && (
                <p className="text-sm text-white/50 leading-[1.8] max-w-xl mt-4">
                  <span className="text-white/70 font-medium">Availability:</span>{" "}
                  {pro.availability}
                </p>
              )}
            </div>

            {/* Expert Sessions */}
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <h2 className="text-[11px] font-bold tracking-[0.15em] text-white/50 uppercase shrink-0">
                  Expert Sessions
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {sessionTypes.map((st) => (
                  <SessionCard
                    key={st.key}
                    sessionKey={st.key}
                    price={st.price}
                    selected={activeSession === st.key}
                    onSelect={() => setSelectedSession(st.key)}
                  />
                ))}
              </div>

              {/* Custom Consultation CTA */}
              <div className="flex items-center justify-between p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-bold mb-0.5">Custom Consultation</h4>
                  <p className="text-xs text-white/35">
                    For enterprise projects and long-term brand transformation.
                  </p>
                </div>
                <Link href={`/request?pro=${pro.id}`}>
                  <button className="px-5 py-2.5 rounded-lg border-2 border-primary text-primary text-xs font-bold tracking-wider uppercase hover:bg-primary hover:text-black transition-colors shrink-0 ml-4">
                    Inquire Now
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right column: Booking Panel */}
          <div className="lg:sticky lg:top-[80px]">
            <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-base font-bold uppercase tracking-wide mb-5">
                Book a Session
              </h3>

              <BookingCalendar
                proId={pro.id}
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedTime(null);
                }}
              />

              {selectedDate && (
                <div className="mt-5">
                  <p className="text-[10px] font-bold tracking-[0.1em] text-white/35 uppercase mb-3">
                    Available Times (EST):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                          selectedTime === time
                            ? "bg-primary/15 border-2 border-primary text-primary"
                            : "bg-white/[0.04] border border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/70"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                disabled={bookingMutation.isPending || !selectedDate || !selectedTime}
                onClick={handleConfirmBooking}
                className="w-full mt-6 py-3.5 rounded-lg btn-gradient-fade text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {bookingMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Confirm Booking
              </button>

              <p className="text-center text-[10px] text-white/20 mt-3 tracking-wide uppercase">
                No commitment required until after confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          <div className="space-y-4 order-2 lg:order-1">
            <Skeleton className="h-6 w-48 bg-white/[0.04] rounded" />
            <Skeleton className="h-16 w-72 bg-white/[0.04] rounded" />
            <Skeleton className="h-16 w-64 bg-white/[0.04] rounded" />
            <Skeleton className="h-20 w-full max-w-md bg-white/[0.04] rounded" />
          </div>
          <div className="order-1 lg:order-2">
            <Skeleton className="aspect-[3/4] max-h-[480px] w-full bg-white/[0.04] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-white/40 text-sm mb-6">
          This expert profile doesn't exist or may have been removed.
        </p>
        <Link href="/">
          <Button variant="outline" className="border-white/20 text-white hover:border-primary hover:text-primary">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
