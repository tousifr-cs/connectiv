import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Save,
  Loader2,
  User,
  MapPin,
  Globe,
  Clock,
  Zap,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Video,
  Mic,
  Mail,
} from "lucide-react";

const SESSION_TYPE_LABELS: Record<string, string> = {
  video_call: "Video Call",
  audio_consult: "Audio Consultation",
  dm_bundle: "DM Bundle",
  deep_dive: "Deep Dive",
};

const SESSION_TYPE_ICONS: Record<string, typeof Video> = {
  video_call: Video,
  audio_consult: Mic,
  dm_bundle: Mail,
  deep_dive: Clock,
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation as useBrowserLocation } from "@/hooks/use-location";
import type { UserProfileResponse, BookingWithPro } from "@shared/schema";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfileResponse>({
    queryKey: ["/api/me/profile"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const { data: bookings } = useQuery<BookingWithPro[]>({
    queryKey: ["/api/me/bookings"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/bookings");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    headline: "",
    bio: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    timezone: "",
    website: "",
  });

  const browserLocation = useBrowserLocation();

  useEffect(() => {
    if (profile?.user) {
      setForm({
        displayName: profile.user.displayName ?? "",
        headline: profile.user.headline ?? "",
        bio: profile.user.bio ?? "",
        location: profile.user.location ?? "",
        latitude: profile.user.latitude ?? null,
        longitude: profile.user.longitude ?? null,
        timezone: profile.user.timezone ?? "",
        website: profile.user.website ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (browserLocation.latitude && browserLocation.longitude) {
      setForm((prev) => ({
        ...prev,
        latitude: browserLocation.latitude,
        longitude: browserLocation.longitude,
        location: browserLocation.address ?? prev.location,
      }));
    }
  }, [browserLocation.latitude, browserLocation.longitude, browserLocation.address]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await authedFetch("/api/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: data.displayName || undefined,
          headline: data.headline || null,
          bio: data.bio || null,
          location: data.location || null,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone || null,
          website: data.website || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/profile"] });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      setEditing(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (!authLoading && !user) {
    setLocation("/auth");
    return null;
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      </div>
    );
  }

  const displayName = profile?.user.displayName ?? user?.displayName ?? "User";
  const initial = displayName[0]?.toUpperCase() ?? "U";
  const recentBookings = (bookings ?? []).slice(0, 3);
  const activeCount = (bookings ?? []).filter(
    (b) =>
      (b.status === "payment_pending" ||
        b.status === "payment_received") &&
      b.proResponseStatus !== "declined",
  ).length;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto max-w-[900px] px-4 py-8">
        {/* Profile Header */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 ring-2 ring-emerald-500/30">
                <AvatarImage
                  src={profile?.user.photoUrl ?? user?.photoURL ?? ""}
                  alt={displayName}
                />
                <AvatarFallback className="text-xl">{initial}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{displayName}</h1>
                {profile?.user.headline && (
                  <p className="mt-0.5 text-sm text-zinc-400">{profile.user.headline}</p>
                )}
                <p className="mt-1 text-xs text-zinc-600">{user?.email}</p>
                <div className="mt-2 flex items-center gap-3">
                  {profile?.user.location && (
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3" /> {profile.user.location}
                    </span>
                  )}
                  {profile?.user.timezone && (
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" /> {profile.user.timezone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile?.isPro && (
                <Link href="/dashboard">
                  <Badge className="cursor-pointer border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    <Zap className="mr-1 h-3 w-3" /> Pro Portal
                  </Badge>
                </Link>
              )}
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="border-white/10 text-white hover:border-emerald-500/50 hover:text-emerald-400 bg-transparent"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {profile?.user.bio && !editing && (
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">{profile.user.bio}</p>
          )}
          {profile?.user.website && !editing && (
            <a
              href={profile.user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Globe className="h-3 w-3" /> {profile.user.website.replace(/^https?:\/\//, "")}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-[#0d0d0d] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" /> Edit Profile
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  className="border-white/10 text-zinc-400 hover:text-white bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending}
                  className="bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-zinc-400 text-xs">Display Name</Label>
                <Input
                  value={form.displayName}
                  onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                  className="mt-1 border-white/10 bg-black text-white focus:border-emerald-500"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Headline</Label>
                <Input
                  value={form.headline}
                  onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
                  placeholder="e.g. Senior Engineer @ Google"
                  className="mt-1 border-white/10 bg-black text-white focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-zinc-400 text-xs">Bio</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Tell others a bit about yourself..."
                  className="mt-1 border-white/10 bg-black text-white focus:border-emerald-500"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Location</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        location: e.target.value,
                        latitude: null,
                        longitude: null,
                      }))
                    }
                    placeholder="e.g. San Francisco, CA"
                    className="border-white/10 bg-black text-white focus:border-emerald-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={browserLocation.requestLocation}
                    disabled={browserLocation.loading}
                    className="shrink-0 border-white/10 text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-400 bg-transparent"
                  >
                    {browserLocation.loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1.5 hidden sm:inline">Detect</span>
                  </Button>
                </div>
                {browserLocation.error && (
                  <p className="mt-1 text-xs text-red-400">{browserLocation.error}</p>
                )}
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Timezone</Label>
                <Input
                  value={form.timezone}
                  onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                  placeholder="e.g. America/New_York"
                  className="mt-1 border-white/10 bg-black text-white focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-zinc-400 text-xs">Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://yoursite.com"
                  className="mt-1 border-white/10 bg-black text-white focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats + Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            <p className="text-xs text-zinc-500">Total Bookings</p>
            <p className="mt-1 text-2xl font-bold text-white">{bookings?.length ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            <p className="text-xs text-zinc-500">Active Sessions</p>
            <p className="mt-1 text-2xl font-bold text-white">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            <p className="text-xs text-zinc-500">Account Status</p>
            <div className="mt-1 flex items-center gap-2">
              {profile?.isPro ? (
                <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <Zap className="mr-1 h-3 w-3" /> Pro
                </Badge>
              ) : (
                <Badge className="border-white/10 bg-white/5 text-zinc-400">Member</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings Preview */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Recent Bookings</h2>
            <Link href="/inbox">
              <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-8 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-zinc-700" />
              <p className="mt-3 text-sm text-zinc-500">No bookings yet.</p>
              <Link href="/pros">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-white/10 text-white hover:border-emerald-500/50 bg-transparent"
                >
                  Browse Pros
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map((b) => {
                const Icon = SESSION_TYPE_ICONS[b.sessionType] ?? CalendarDays;
                const initials = b.proDisplayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#0d0d0d] px-4 py-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={b.proImageUrl} alt={b.proDisplayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{b.proDisplayName}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {SESSION_TYPE_LABELS[b.sessionType] ?? b.sessionType} &middot; {b.topic}
                      </p>
                    </div>
                    <Badge
                      className={`border text-[10px] ${
                        b.status === "payment_received"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : b.status === "payment_pending"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-white/10 bg-white/5 text-zinc-400"
                      }`}
                    >
                      {b.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Become Pro CTA */}
        {!profile?.isPro && (
          <div className="mt-8 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-[#0d0d0d] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Share your expertise</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Become a pro and start offering sessions to others.
                </p>
              </div>
              <Link href="/become-pro">
                <Button className="bg-emerald-500 font-semibold text-black hover:bg-emerald-400">
                  <Zap className="mr-2 h-4 w-4" /> Become a Pro
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
