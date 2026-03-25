import { useState } from "react";
import {
  Save,
  Loader2,
  User,
  DollarSign,
  Globe,
  Tag,
  MapPin,
  Clock,
  Languages,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout, useCreatorProfile } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Creator } from "@shared/schema";

const PLATFORMS = [
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "github", label: "GitHub" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
];

export default function DashboardSettings() {
  const { creator } = useCreatorProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<Creator>>(() => ({
    displayName: creator?.displayName ?? "",
    headline: creator?.headline ?? "",
    bio: creator?.bio ?? "",
    socialHandle: creator?.socialHandle ?? "",
    socialPlatform: creator?.socialPlatform ?? "twitter",
    availability: creator?.availability ?? "",
    categories: creator?.categories ?? "",
    location: creator?.location ?? "",
    timezone: creator?.timezone ?? "",
    languages: creator?.languages ?? "",
    website: creator?.website ?? "",
    responseTime: creator?.responseTime ?? "",
    videoCallPrice: creator?.videoCallPrice,
    audioConsultPrice: creator?.audioConsultPrice,
    dmBundlePrice: creator?.dmBundlePrice,
    deepDivePrice: creator?.deepDivePrice,
  }));

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Creator>) => {
      const res = await authedFetch("/api/me/creator", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/me/creator"], updated);
      toast({ title: "Saved", description: "Your profile has been updated." });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate({
      displayName: form.displayName,
      headline: form.headline || null,
      bio: form.bio,
      socialHandle: form.socialHandle,
      socialPlatform: form.socialPlatform,
      availability: form.availability,
      categories: form.categories,
      location: form.location || null,
      timezone: form.timezone || null,
      languages: form.languages || null,
      website: form.website || null,
      responseTime: form.responseTime || null,
      videoCallPrice: form.videoCallPrice ?? null,
      audioConsultPrice: form.audioConsultPrice ?? null,
      dmBundlePrice: form.dmBundlePrice ?? null,
      deepDivePrice: form.deepDivePrice ?? null,
    } as Partial<Creator>);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs text-zinc-600">
            <span className="text-emerald-500/60">Creator Portal</span>
            <span className="mx-1.5">/</span>
            Settings
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Update your creator profile and pricing.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
        >
          {saveMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <User className="h-4 w-4 text-emerald-400" />
            Profile Information
          </div>

          <div className="space-y-4 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            <div>
              <Label className="text-zinc-400">Display Name</Label>
              <Input
                value={form.displayName ?? ""}
                onChange={(e) => update("displayName", e.target.value)}
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <Label className="text-zinc-400">Headline</Label>
              <Input
                value={form.headline ?? ""}
                onChange={(e) => update("headline", e.target.value)}
                placeholder="e.g. Growth Marketing Expert"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
              <p className="mt-1 text-xs text-zinc-600">
                A short tagline that appears under your name
              </p>
            </div>

            <div>
              <Label className="text-zinc-400">Bio</Label>
              <Textarea
                value={form.bio ?? ""}
                onChange={(e) => update("bio", e.target.value)}
                rows={4}
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <Label className="text-zinc-400">Availability</Label>
              <Input
                value={form.availability ?? ""}
                onChange={(e) => update("availability", e.target.value)}
                placeholder="e.g. Mon-Fri, 2PM-6PM EST"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <Label className="text-zinc-400">Categories</Label>
              <Input
                value={form.categories ?? ""}
                onChange={(e) => update("categories", e.target.value)}
                placeholder="e.g. Tech,Web Dev,Career Coaching"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
              <p className="mt-1 text-xs text-zinc-600">
                Comma-separated list of categories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <MapPin className="h-4 w-4 text-emerald-400" />
            Location & Availability
          </div>

          <div className="space-y-4 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            <div>
              <Label className="text-zinc-400">Location</Label>
              <Input
                value={form.location ?? ""}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. New York, NY"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <Label className="text-zinc-400">Timezone</Label>
              <Input
                value={form.timezone ?? ""}
                onChange={(e) => update("timezone", e.target.value)}
                placeholder="e.g. America/New_York"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <Label className="text-zinc-400">Languages</Label>
              <Input
                value={form.languages ?? ""}
                onChange={(e) => update("languages", e.target.value)}
                placeholder="e.g. English, Spanish"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <Label className="text-zinc-400">Response Time</Label>
              <Input
                value={form.responseTime ?? ""}
                onChange={(e) => update("responseTime", e.target.value)}
                placeholder="e.g. Usually within 2 hours"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <Label className="text-zinc-400">Website</Label>
              <Input
                value={form.website ?? ""}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://yourportfolio.com"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Globe className="h-4 w-4 text-emerald-400" />
            Social Platform
          </div>

          <div className="space-y-4 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            <div>
              <Label className="text-zinc-400">Platform</Label>
              <Select
                value={form.socialPlatform ?? "twitter"}
                onValueChange={(v) => update("socialPlatform", v)}
              >
                <SelectTrigger className="mt-1.5 border-white/10 bg-black text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-zinc-400">Social Handle</Label>
              <Input
                value={form.socialHandle ?? ""}
                onChange={(e) => update("socialHandle", e.target.value)}
                placeholder="@yourhandle"
                className="mt-1.5 border-white/10 bg-black text-white focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            Session Pricing
          </div>

          <div className="space-y-4 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            {[
              {
                key: "videoCallPrice",
                label: "15-min Video Call",
                placeholder: "150",
              },
              {
                key: "audioConsultPrice",
                label: "30-min Audio Consultation",
                placeholder: "275",
              },
              {
                key: "dmBundlePrice",
                label: "DM Bundle",
                placeholder: "45",
              },
              {
                key: "deepDivePrice",
                label: "60-min Deep Dive",
                placeholder: "500",
              },
            ].map((item) => (
              <div key={item.key}>
                <Label className="text-zinc-400">{item.label}</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    $
                  </span>
                  <Input
                    type="number"
                    value={
                      String((form as Record<string, unknown>)[item.key] ?? "")
                    }
                    onChange={(e) =>
                      update(
                        item.key,
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10),
                      )
                    }
                    placeholder={item.placeholder}
                    className="border-white/10 bg-black pl-7 text-white focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}

            <p className="text-xs text-zinc-600">
              Leave empty to disable a session type. Prices are in USD.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Tag className="h-4 w-4 text-emerald-400" />
            Account
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Email</p>
                <p className="text-xs text-zinc-500">
                  {user?.email ?? "Not set"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Firebase UID</p>
                <p className="text-xs text-zinc-500 font-mono">
                  {user?.uid ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
