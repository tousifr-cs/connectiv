import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { ArrowLeft, Loader2, ShieldX } from "lucide-react";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import type { Booking } from "@shared/schema";

interface RoomInfo {
  booking: Booking;
  proName: string;
  role: "pro" | "requester";
}

const JAAS_APP_ID = import.meta.env.VITE_JAAS_APP_ID;
const JITSI_DOMAIN = "8x8.vc";

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      `script[src="https://${JITSI_DOMAIN}/external_api.js"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
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

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<JitsiMeetExternalAPI | null>(null);
  const [jitsiReady, setJitsiReady] = useState(false);

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

  useEffect(() => {
    if (loading) return;
    if (!user) setLocation("/auth");
  }, [loading, user, setLocation]);

  useEffect(() => {
    if (!roomInfo || !roomId || !jitsiContainerRef.current) return;

    let api: JitsiMeetExternalAPI | null = null;

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current) return;

        const sessionTopic = roomInfo.booking.topic || "ProConnectiv Session";
        const jitsiRoomName = `${JAAS_APP_ID}/ProConnectiv_${roomId}`;

        api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: jitsiRoomName,
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
  }, [roomInfo, roomId, userName, userEmail, setLocation]);

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

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
          <span className="truncate max-w-[180px]">
            {roomInfo
              ? `with ${roomInfo.role === "pro" ? "Requester" : roomInfo.proName}`
              : `Room: ${roomId}`}
          </span>
        </div>
      </header>

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
    </div>
  );
}
