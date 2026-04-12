import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { authedFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ShieldCheck,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  User,
  EyeOff,
  MessageSquare,
  Video,
  Phone,
  Clock,
  Sparkles,
  Check,
  Upload,
  X as XIcon,
  FileVideo,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Message" },
  { id: 3, label: "Preferences" },
  { id: 4, label: "Review" },
];

interface RequestForm {
  isAnonymous: boolean;
  senderName: string;
  senderProfileUrl: string;
  messageText: string;
  videoFile: File | null;
  connectionType: "video" | "voice" | "text";
  duration: 15 | 30 | 60;
  amount: string;
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3.14.69 4.22 1.78l-1.42 1.42A3.934 3.934 0 0012 7c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.73-.21-1.41-.56-2l1.45-1.45A5.96 5.96 0 0118 11c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6zm0 4a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function getPlatformInfo(url: string) {
  if (url.includes("facebook.com")) return { name: "Facebook", icon: Facebook };
  if (url.includes("instagram.com"))
    return { name: "Instagram", icon: Instagram };
  if (url.includes("linkedin.com")) return { name: "LinkedIn", icon: Linkedin };
  if (url.includes("x.com") || url.includes("twitter.com"))
    return { name: "X.com", icon: Twitter };
  if (url.includes("t.me") || url.includes("telegram"))
    return { name: "Telegram", icon: TelegramIcon };
  if (url.includes("wa.me") || url.includes("whatsapp"))
    return { name: "WhatsApp", icon: WhatsAppIcon };
  if (url.includes("signal.me") || url.includes("signal"))
    return { name: "Signal", icon: SignalIcon };
  if (url.includes("@") || url.includes("email"))
    return { name: "Email", icon: Mail };
  return { name: "Social Profile", icon: GlobeIcon };
}

export default function RequestPage() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const profileUrl = searchParams.get("url") || "";
  const platform = getPlatformInfo(profileUrl);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RequestForm>({
    isAnonymous: false,
    senderName: "",
    senderProfileUrl: "",
    messageText: "",
    videoFile: null,
    connectionType: "video",
    duration: 30,
    amount: "50",
  });

  const update = (patch: Partial<RequestForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const canProceed = () => {
    if (step === 1) return form.isAnonymous || form.senderName.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return true;
    return Number(form.amount) > 0;
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authedFetch("/api/connection-requests", {
        method: "POST",
        body: JSON.stringify({
          profileUrl,
          platform: platform.name,
          isAnonymous: form.isAnonymous,
          senderName: form.isAnonymous ? null : form.senderName || null,
          senderProfileUrl: form.isAnonymous
            ? null
            : form.senderProfileUrl || null,
          messageText: form.messageText || null,
          videoFileName: form.videoFile?.name ?? null,
          connectionType: form.connectionType,
          duration: form.duration,
          amount: Number(form.amount) || 0,
        }),
      });
      if (res.ok) {
        setLocation("/inbox");
      }
    } catch {
      // handled silently
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-8 pb-16 max-w-2xl flex flex-col justify-center">
        {/* Profile chip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 mb-8 p-3 rounded-xl w-fit transition-all ${
            platform.name !== "Social Profile"
              ? "bg-primary/5 border border-primary/30 shadow-[0_0_12px_rgba(34,211,238,0.08)]"
              : "bg-white/5 border border-white/10"
          }`}
        >
          <div className={`p-2 rounded-lg ${
            platform.name !== "Social Profile"
              ? "bg-primary/10 border border-primary/20"
              : "bg-black border border-white/10"
          }`}>
            <platform.icon className={`w-5 h-5 ${
              platform.name !== "Social Profile" ? "text-primary" : "text-gray-500"
            }`} />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium ${
              platform.name !== "Social Profile" ? "text-primary" : "text-white"
            }`}>{platform.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[260px]">
              {profileUrl}
            </p>
          </div>
          {platform.name !== "Social Profile" && (
            <div className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
              Detected
            </div>
          )}
        </motion.div>

        {/* Progress stepper */}
        <div className="flex items-center gap-1 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step > s.id
                      ? "bg-primary text-black"
                      : step === s.id
                        ? "bg-primary/20 text-primary border border-primary"
                        : "bg-white/5 text-gray-600 border border-white/10"
                  }`}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block transition-colors ${
                    step >= s.id ? "text-white" : "text-gray-600"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 transition-colors duration-300 ${
                    step > s.id ? "bg-primary" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <StepIdentity form={form} update={update} />}
            {step === 2 && <StepMessage form={form} update={update} />}
            {step === 3 && <StepPreferences form={form} update={update} />}
            {step === 4 && (
              <StepReview
                form={form}
                update={update}
                platform={platform}
                profileUrl={profileUrl}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-10">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={prev}
              className="h-12 px-6 border-white/10 bg-transparent text-white hover:bg-white/5 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step === 2 && !form.messageText.trim() && !form.videoFile && (
            <Button
              variant="ghost"
              onClick={next}
              className="h-12 px-6 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              Skip
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={next}
              disabled={!canProceed()}
              className="h-12 px-8 bg-primary text-black font-bold hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.15)] disabled:opacity-40 disabled:shadow-none"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Number(form.amount) <= 0 || submitting}
              className="h-14 px-10 bg-primary text-black font-bold text-lg hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-40 disabled:shadow-none"
            >
              <Wallet className="w-5 h-5 mr-2" />
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Step 1: Identity ─── */

function StepIdentity({
  form,
  update,
}: {
  form: RequestForm;
  update: (p: Partial<RequestForm>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          How do you want to appear?
        </h2>
        <p className="text-gray-400">
          Choose whether to reveal your identity or stay anonymous.
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <IdentityOption
            selected={!form.isAnonymous}
            onClick={() => update({ isAnonymous: false })}
            icon={<User className="w-5 h-5" />}
            title="Named"
            description="Share your name and optionally a profile link. Builds trust and increases response rates."
            badge="3x more responses"
          />
          <AnimatePresence>
            {!form.isAnonymous && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 mt-4 ml-4 pl-4 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Your name</Label>
                    <Input
                      id="senderName"
                      placeholder="John Doe"
                      value={form.senderName}
                      onChange={(e) => update({ senderName: e.target.value })}
                      className="h-12 bg-black border-white/10 text-white focus:border-primary rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderUrl">
                      Your profile link{" "}
                      <span className="text-gray-600">(optional)</span>
                    </Label>
                    <Input
                      id="senderUrl"
                      placeholder="linkedin.com/in/johndoe"
                      value={form.senderProfileUrl}
                      onChange={(e) => update({ senderProfileUrl: e.target.value })}
                      className="h-12 bg-black border-white/10 text-white focus:border-primary rounded-xl"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <IdentityOption
          selected={form.isAnonymous}
          onClick={() => update({ isAnonymous: true })}
          icon={<EyeOff className="w-5 h-5" />}
          title="Anonymous"
          description='Your identity stays hidden. They only see "Someone wants to connect" and your message.'
        />
      </div>
    </div>
  );
}

function IdentityOption({
  selected,
  onClick,
  icon,
  title,
  description,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/5"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-2.5 rounded-xl transition-colors ${
            selected ? "bg-primary/20 text-primary" : "bg-white/5 text-gray-500"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white">{title}</span>
            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
            selected ? "border-primary" : "border-white/20"
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
      </div>
    </button>
  );
}

/* ─── Step 2: Message ─── */

const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25 MB

function StepMessage({
  form,
  update,
}: {
  form: RequestForm;
  update: (p: Partial<RequestForm>) => void;
}) {
  const charCount = form.messageText.length;
  const maxChars = 500;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) return;
      if (file.size > MAX_VIDEO_SIZE) return;
      update({ videoFile: file });
    },
    [update],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight mb-2">
          What would you like to say?
        </h2>
        <p className="text-gray-400">
          Write a short message or drop a video clip. You can also skip this
          step.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your message</Label>
        <Textarea
          id="message"
          placeholder="Hi! I'd love to connect with you about..."
          value={form.messageText}
          onChange={(e) =>
            update({ messageText: e.target.value.slice(0, maxChars) })
          }
          rows={4}
          className="bg-black border-white/10 text-white focus:border-primary rounded-xl resize-none text-base"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            {charCount}/{maxChars} characters
          </p>
          {charCount === 0 && (
            <p className="text-xs text-amber-500/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              A personal message gets 3x more responses
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">
            or attach a video
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <AnimatePresence mode="wait">
          {form.videoFile ? (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20"
            >
              <div className="p-3 rounded-xl bg-primary/10">
                <FileVideo className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {form.videoFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(form.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => update({ videoFile: null })}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="drop-zone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <Upload
                className={`w-7 h-7 mx-auto mb-2 transition-colors ${
                  dragOver ? "text-primary" : "text-gray-600"
                }`}
              />
              <p className="text-sm text-gray-400 mb-1">
                Drag & drop a video file or{" "}
                <span className="text-primary font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-600">
                MP4 or WebM &middot; Max 25 MB &middot; Up to 60 seconds
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

/* ─── Step 3: Preferences ─── */

function StepPreferences({
  form,
  update,
}: {
  form: RequestForm;
  update: (p: Partial<RequestForm>) => void;
}) {
  const connectionTypes = [
    {
      id: "video" as const,
      icon: Video,
      label: "Video Call",
      desc: "Face-to-face encrypted session",
    },
    {
      id: "voice" as const,
      icon: Phone,
      label: "Voice Call",
      desc: "Audio-only conversation",
    },
    {
      id: "text" as const,
      icon: MessageSquare,
      label: "Text Chat",
      desc: "Real-time messaging session",
    },
  ];

  const durations = [
    { value: 15 as const, label: "15 min", desc: "Quick chat" },
    { value: 30 as const, label: "30 min", desc: "Standard" },
    { value: 60 as const, label: "60 min", desc: "Deep dive" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          How would you like to connect?
        </h2>
        <p className="text-gray-400">
          Choose your preferred connection type and session length.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Connection type</Label>
        <div className="grid grid-cols-3 gap-3">
          {connectionTypes.map((ct) => (
            <button
              key={ct.id}
              type="button"
              onClick={() => update({ connectionType: ct.id })}
              className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                form.connectionType === ct.id
                  ? "border-primary bg-primary/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <ct.icon
                className={`w-6 h-6 mx-auto mb-2 ${
                  form.connectionType === ct.id
                    ? "text-primary"
                    : "text-gray-500"
                }`}
              />
              <p className="font-bold text-sm text-white">{ct.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{ct.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Session duration</Label>
        <div className="grid grid-cols-3 gap-3">
          {durations.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => update({ duration: d.value })}
              className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                form.duration === d.value
                  ? "border-primary bg-primary/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <Clock
                className={`w-5 h-5 mx-auto mb-2 ${
                  form.duration === d.value ? "text-primary" : "text-gray-500"
                }`}
              />
              <p className="font-bold text-white">{d.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400">
          We'll personally reach out to the profile owner, verify their identity,
          and arrange the session based on both of your preferences.
        </p>
      </div>
    </div>
  );
}

/* ─── Step 4: Review & Payment ─── */

function StepReview({
  form,
  update,
  platform,
  profileUrl,
}: {
  form: RequestForm;
  update: (p: Partial<RequestForm>) => void;
  platform: { name: string; icon: React.ComponentType<{ className?: string }> };
  profileUrl: string;
}) {
  const amount = Number(form.amount) || 0;

  const connectionLabel =
    form.connectionType === "video"
      ? "Video Call"
      : form.connectionType === "voice"
        ? "Voice Call"
        : "Text Chat";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Review your request
        </h2>
        <p className="text-gray-400">
          Make sure everything looks good before submitting.
        </p>
      </div>

      <Card className="bg-white/[0.03] border-white/10 text-white overflow-hidden">
        <CardContent className="p-0 divide-y divide-white/5">
          <ReviewRow label="Platform" value={platform.name} />
          <ReviewRow
            label="Profile"
            value={profileUrl}
            truncate
          />
          <ReviewRow
            label="Identity"
            value={form.isAnonymous ? "Anonymous" : form.senderName}
          />
          <ReviewRow label="Connection" value={connectionLabel} />
          <ReviewRow label="Duration" value={`${form.duration} minutes`} />
          <ReviewRow
            label="Video message"
            value={form.videoFile ? form.videoFile.name : "None"}
          />
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1.5">Your message</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {form.messageText || (
                <span className="text-gray-600 italic">No message</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Payment</CardTitle>
          <CardDescription className="text-gray-500">
            Attach cryptocurrency to your request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label className="text-center block">Offer Amount (USD)</Label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(0, (Number(form.amount) || 0) - 5);
                  update({ amount: String(val) });
                }}
                className="w-12 h-12 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all shrink-0"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="relative w-32">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-lg">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => update({ amount: e.target.value })}
                  className="h-14 pl-9 bg-black border-white/10 focus:border-primary rounded-xl text-2xl font-bold text-center"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const val = (Number(form.amount) || 0) + 5;
                  update({ amount: String(val) });
                }}
                className="w-12 h-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] transition-all shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 text-center">
              Higher offers get faster responses.
            </p>
          </div>

          <p className="text-center text-xs text-gray-500 pt-2">
            Secure escrow payment. Refunded if not accepted within 7 days.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm font-medium text-white ${truncate ? "truncate max-w-[200px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
