import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { ArrowLeft, Download, Loader2, ShieldCheck, ShieldX, Clock } from "lucide-react";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@shared/schema";

interface RoomInfo {
  booking: Booking;
  creatorName: string;
  role: "creator" | "requester" | "admin";
}

interface JitsiTokenResponse {
  token: string;
  domain: string;
  roomName: string;
}

interface RoomRecording {
  id: string;
  status: "requested" | "recording" | "processing" | "ready" | "failed";
  storageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  endedAt: string | null;
  failureReason: string | null;
}

const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || "8x8.vc";

function loadJitsiScript(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      `script[src="https://${domain}/external_api.js"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Jitsi Meet API"));
    document.head.appendChild(script);
  });
}

export default function VideoCall() {
  const [, params] = useRoute("/video-call/:roomId");
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const roomId = params?.roomId ?? null;
  const { toast } = useToast();

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<JitsiMeetExternalAPI | null>(null);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);

  const userName = user?.displayName ?? user?.email ?? "User";
  const userEmail = user?.email ?? "";

  const {
    data: roomInfo,
    isLoading: roomLoading,
    error: roomError,
  } = useQuery<RoomInfo>({
    queryKey: ["/api/rooms", roomId],
    queryFn: async () => {
      const res = await authedFetch(`/api/rooms/${roomId}`);
      if (res.status === 403) throw new Error("unauthorized");
      if (res.status === 404) throw new Error("not_found");
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    enabled: !!user && !!roomId,
    retry: false,
  });

  const { data: jitsiToken } = useQuery<JitsiTokenResponse>({
    queryKey: ["/api/rooms", roomId, "jitsi-token"],
    queryFn: async () => {
      const res = await authedFetch(`/api/rooms/${roomId}/jitsi-token`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("jitsi_token_failed");
      return res.json();
    },
    enabled: !!user && !!roomId,
    retry: false,
  });

  const {
    data: recordings,
    refetch: refetchRecordings,
    isFetching: recordingsLoading,
  } = useQuery<RoomRecording[]>({
    queryKey: ["/api/rooms", roomId, "recordings"],
    queryFn: async () => {
      const res = await authedFetch(`/api/rooms/${roomId}/recordings`);
      if (!res.ok) throw new Error("recordings_failed");
      return res.json();
    },
    enabled: !!user && !!roomId,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) setLocation("/auth");
  }, [loading, user, setLocation]);

  useEffect(() => {
    if (!jitsiReady) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          jitsiApiRef.current?.executeCommand("hangup");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [jitsiReady]);

  useEffect(() => {
    if (!roomInfo || !roomId || !jitsiContainerRef.current || !jitsiToken) return;

    let api: JitsiMeetExternalAPI | null = null;

    const initJitsi = async () => {
      try {
        await loadJitsiScript(jitsiToken.domain || JITSI_DOMAIN);

        if (!jitsiContainerRef.current) return;

        const sessionTopic = roomInfo.booking.topic || "ProConnectiv Session";

        api = new window.JitsiMeetExternalAPI(jitsiToken.domain || JITSI_DOMAIN, {
          roomName: jitsiToken.roomName,
          parentNode: jitsiContainerRef.current,
          width: "100%",
          height: "100%",
          configOverwrite: {
            subject: sessionTopic,
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            enableNoisyMicDetection: true,
            p2p: { enabled: true },
            toolbarButtons: [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "raisehand",
              "tileview",
              "hangup",
              "fullscreen",
              "settings",
              "toggle-camera",
              "select-background",
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: "",
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: "#111111",
            TOOLBAR_ALWAYS_VISIBLE: false,
            FILM_STRIP_MAX_HEIGHT: 120,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            APP_NAME: "ProConnectiv",
            NATIVE_APP_NAME: "ProConnectiv",
            PROVIDER_NAME: "ProConnectiv",
          },
          userInfo: {
            displayName: userName,
            email: userEmail,
          },
          jwt: jitsiToken.token,
        });

        jitsiApiRef.current = api;

        api.addEventListener("videoConferenceJoined", () => {
          setJitsiReady(true);
        });

        api.addEventListener("readyToClose", () => {
          setLocation("/dashboard");
        });
      } catch (err) {
        console.error("Failed to initialize Jitsi:", err);
      }
    };

    initJitsi();

    return () => {
      if (api) api.dispose();
      jitsiApiRef.current = null;
      setJitsiReady(false);
    };
  }, [roomInfo, roomId, userName, userEmail, setLocation, jitsiToken]);

  const hasActiveRecording = (recordings ?? []).some(
    (recording) =>
      recording.status === "recording" || recording.status === "requested",
  );

  async function handleRecording(action: "start" | "stop") {
    if (!roomId || !jitsiApiRef.current) return;
    setRecordingBusy(true);
    try {
      const res = await authedFetch(`/api/rooms/${roomId}/recordings`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("recording_action_failed");

      if (action === "start") {
        jitsiApiRef.current.executeCommand("startRecording", {
          mode: "file",
        });
      } else {
        jitsiApiRef.current.executeCommand("stopRecording", "file");
      }
      await refetchRecordings();
    } catch {
      toast({
        title: "Recording update failed",
        description: "Could not update recording state. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRecordingBusy(false);
    }
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">
          Invalid room. Please go back and start a session.
        </p>
      </div>
    );
  }

  if (loading || roomLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (roomError) {
    const msg =
      roomError.message === "unauthorized"
        ? "You are not a participant in this session."
        : roomError.message === "not_found"
          ? "This session room does not exist."
          : "Unable to load session.";
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldX className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white/60">{msg}</p>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <header className="h-12 shrink-0 bg-black/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <ProConnectivLogo size="sm" />
            <span className="text-white/30 text-xs hidden sm:inline">
              {roomInfo?.booking.topic
                ? `Session: ${roomInfo.booking.topic}`
                : "Video Session"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {jitsiReady && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <Clock className="h-3.5 w-3.5" />
              {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")} left
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
            <span className="truncate max-w-[180px]">
              {roomInfo
                ? `with ${roomInfo.role === "creator" ? "Requester" : roomInfo.creatorName}`
                : `Room: ${roomId}`}
            </span>
          </div>
        </div>
      </header>

      <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-xs text-emerald-300">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        Escrow active — payment is held until this session is marked complete.
      </div>

      <div className="shrink-0 border-b border-white/5 px-4 py-2 bg-black/70 flex items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          {hasActiveRecording ? "Recording in progress" : "Recording is off"}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveRecording ? (
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 text-zinc-200"
              onClick={() => handleRecording("stop")}
              disabled={recordingBusy}
            >
              {recordingBusy ? "Stopping..." : "Stop recording"}
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => handleRecording("start")}
              disabled={recordingBusy}
            >
              {recordingBusy ? "Starting..." : "Start recording"}
            </Button>
          )}
        </div>
      </div>

      {/* Jitsi Meeting Container */}
      <div className="flex-1 relative min-h-0">
        {!jitsiReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-white/60 text-sm">
                Loading meeting room...
              </p>
            </div>
          </div>
        )}
        <div
          ref={jitsiContainerRef}
          className="w-full h-full"
          style={{ minHeight: 0 }}
        />
      </div>

      <div className="shrink-0 border-t border-white/5 px-4 py-3 bg-black/80">
        <p className="text-xs text-white/40 mb-2">Session recordings</p>
        <div className="space-y-2 max-h-32 overflow-auto">
          {recordingsLoading && (
            <p className="text-xs text-white/50">Loading recordings...</p>
          )}
          {!recordingsLoading && (recordings ?? []).length === 0 && (
            <p className="text-xs text-white/50">No recordings yet.</p>
          )}
          {(recordings ?? []).map((recording) => (
            <div
              key={recording.id}
              className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-xs text-white/70"
            >
              <span className="capitalize">{recording.status}</span>
              {recording.storageUrl ? (
                <a
                  href={recording.storageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              ) : (
                <span className="text-white/40">
                  {recording.status === "failed"
                    ? recording.failureReason || "Failed"
                    : "Not ready"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
