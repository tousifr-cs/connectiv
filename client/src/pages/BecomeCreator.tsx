import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCreatorSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Loader2,
  Camera,
  Sparkles,
  Video,
  Mic,
  Mail,
  Clock,
  X,
  Plus,
} from "lucide-react";

const CATEGORY_SUGGESTIONS = [
  "Tech",
  "Design",
  "Marketing",
  "Finance",
  "Career Coaching",
  "AI / ML",
  "Web Dev",
  "Mobile Dev",
  "Crypto",
  "Content Creation",
  "Leadership",
  "Startups",
];

export default function BecomeCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(insertCreatorSchema),
    defaultValues: {
      username: "",
      displayName: "",
      bio: "",
      socialHandle: "",
      socialPlatform: "twitter",
      price: 50,
      imageUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
      isVerified: false,
      availability: "",
      categories: "",
      videoCallPrice: null as number | null,
      audioConsultPrice: null as number | null,
      dmBundlePrice: null as number | null,
      deepDivePrice: null as number | null,
    },
  });

  const [enabledSessions, setEnabledSessions] = useState({
    videoCall: false,
    audioConsult: false,
    dmBundle: false,
    deepDive: false,
  });

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      form.setValue("imageUrl", url);
      setImagePreview(URL.createObjectURL(file));
    } catch {
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  }

  function addCategory(cat: string) {
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed) && categories.length < 6) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      form.setValue("categories", updated.join(","));
    }
    setCategoryInput("");
  }

  function removeCategory(cat: string) {
    const updated = categories.filter((c) => c !== cat);
    setCategories(updated);
    form.setValue("categories", updated.join(","));
  }

  async function onSubmit(data: any) {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in before creating a creator profile.",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }

    const payload = {
      ...data,
      videoCallPrice: enabledSessions.videoCall ? data.videoCallPrice : null,
      audioConsultPrice: enabledSessions.audioConsult ? data.audioConsultPrice : null,
      dmBundlePrice: enabledSessions.dmBundle ? data.dmBundlePrice : null,
      deepDivePrice: enabledSessions.deepDive ? data.deepDivePrice : null,
    };

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      await apiRequest("POST", "/api/creators", payload, {
        Authorization: `Bearer ${idToken}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      toast({
        title: "Profile Created!",
        description: "Your creator profile has been set up successfully.",
      });
      setLocation("/dashboard");
    } catch {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClasses = "bg-black border-white/10 text-white";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Become a Creator</h1>
          <p className="text-gray-400">
            Set up your profile and start connecting with your audience.
          </p>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Profile Details</CardTitle>
            <CardDescription>
              This information will be visible to everyone on ProConnectiv.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-colors">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Click to upload a profile photo (max 5MB)
                  </p>
                </div>

                {/* Display Name + Username */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Display Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className={inputClasses}
                            placeholder="e.g. Alex Rivera"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className={inputClasses}
                            placeholder="e.g. alex_tech"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Bio</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="w-full min-h-[100px] rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Tell us about yourself..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Platform + Social Handle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="socialPlatform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Primary Platform
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="twitter">X (Twitter)</option>
                            <option value="instagram">Instagram</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="github">GitHub</option>
                            <option value="youtube">YouTube</option>
                            <option value="tiktok">TikTok</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialHandle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Social Handle
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className={inputClasses}
                            placeholder="e.g. @alex_tech"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Expertise / Categories */}
                <div>
                  <FormLabel className="text-white mb-2 block">
                    Expertise / Categories
                  </FormLabel>
                  <p className="text-xs text-gray-500 mb-3">
                    Select up to 6 tags that describe your expertise.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {CATEGORY_SUGGESTIONS.map((cat) => {
                      const active = categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            active ? removeCategory(cat) : addCategory(cat)
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            active
                              ? "bg-primary/20 border-primary/40 text-primary"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
                          }`}
                        >
                          {active ? cat : `+ ${cat}`}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCategory(categoryInput);
                        }
                      }}
                      className={inputClasses}
                      placeholder="Add a custom tag..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addCategory(categoryInput)}
                      className="border-white/10 text-gray-400 hover:text-white shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {categories.map((cat) => (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="bg-primary/15 text-primary border-primary/30 gap-1"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => removeCategory(cat)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Availability Schedule
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          className={inputClasses}
                          placeholder="e.g. Mon-Fri, 2PM-6PM EST"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Let people know when you're available for sessions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Base Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Base Session Price (USD)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          className={inputClasses}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Default price for sessions. You can customize per type
                        below.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Session Types */}
                <div>
                  <FormLabel className="text-white mb-1 block">
                    Session Types Offered
                  </FormLabel>
                  <p className="text-xs text-gray-500 mb-4">
                    Toggle the session types you offer and set a custom price for
                    each, or leave blank to use your base price.
                  </p>
                  <div className="space-y-3">
                    <SessionTypeRow
                      icon={<Video className="w-4 h-4 text-emerald-400" />}
                      label="Video Call"
                      duration="15 min"
                      enabled={enabledSessions.videoCall}
                      onToggle={(v) =>
                        setEnabledSessions((s) => ({ ...s, videoCall: v }))
                      }
                      price={form.watch("videoCallPrice")}
                      onPriceChange={(v) => form.setValue("videoCallPrice", v)}
                      basePrice={form.watch("price")}
                    />
                    <SessionTypeRow
                      icon={<Mic className="w-4 h-4 text-purple-400" />}
                      label="Audio Consultation"
                      duration="30 min"
                      enabled={enabledSessions.audioConsult}
                      onToggle={(v) =>
                        setEnabledSessions((s) => ({ ...s, audioConsult: v }))
                      }
                      price={form.watch("audioConsultPrice")}
                      onPriceChange={(v) =>
                        form.setValue("audioConsultPrice", v)
                      }
                      basePrice={form.watch("price")}
                    />
                    <SessionTypeRow
                      icon={<Mail className="w-4 h-4 text-amber-400" />}
                      label="DM Bundle"
                      duration="Async"
                      enabled={enabledSessions.dmBundle}
                      onToggle={(v) =>
                        setEnabledSessions((s) => ({ ...s, dmBundle: v }))
                      }
                      price={form.watch("dmBundlePrice")}
                      onPriceChange={(v) => form.setValue("dmBundlePrice", v)}
                      basePrice={form.watch("price")}
                    />
                    <SessionTypeRow
                      icon={<Clock className="w-4 h-4 text-blue-400" />}
                      label="Deep Dive"
                      duration="60 min"
                      enabled={enabledSessions.deepDive}
                      onToggle={(v) =>
                        setEnabledSessions((s) => ({ ...s, deepDive: v }))
                      }
                      price={form.watch("deepDivePrice")}
                      onPriceChange={(v) => form.setValue("deepDivePrice", v)}
                      basePrice={form.watch("price")}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || uploadingImage}
                  className="w-full bg-primary text-black font-bold h-12 hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  Create My Page
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function SessionTypeRow({
  icon,
  label,
  duration,
  enabled,
  onToggle,
  price,
  onPriceChange,
  basePrice,
}: {
  icon: React.ReactNode;
  label: string;
  duration: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  price: number | null | undefined;
  onPriceChange: (v: number | null) => void;
  basePrice: number;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors ${
        enabled
          ? "border-primary/30 bg-primary/5"
          : "border-white/[0.06] bg-[#0d0d0d]"
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500">{duration}</p>
      </div>
      {enabled && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">$</span>
          <input
            type="number"
            value={price ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onPriceChange(val === "" ? null : parseInt(val) || 0);
            }}
            placeholder={String(basePrice)}
            className="w-20 h-8 rounded-md border border-white/10 bg-black px-2 text-sm text-white text-right focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}
