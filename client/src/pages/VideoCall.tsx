import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Camera,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  ShieldX,
} from "lucide-react";
import { useWebRTC } from "@/hooks/use-webrtc";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import type { Booking } from "@shared/schema";

interface RoomInfo {
  booking: Booking;
  creatorName: string;
  role: "creator" | "requester";
}

export default function VideoCall() {
  const [, params] = useRoute("/video-call/:roomId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const roomId = params?.roomId ?? null;

  const userId = user?.uid ?? "anonymous";
  const userName = user?.displayName ?? user?.email ?? "User";

  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const {
    callState,
    localStream,
    remoteStream,
    isMicMuted,
    isVideoMuted,
    partnerName,
    startCamera,
    joinRoom,
    toggleMic,
    toggleVideo,
    endCall,
  } = useWebRTC({ roomId, userId, userName });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation("/auth");
      return;
    }
  }, [loading, user]);

  useEffect(() => {
    if (!roomInfo || !roomId || !user) return;
    startCamera().then(async (stream) => {
      if (stream) {
        try {
          const token = await user.getIdToken();
          joinRoom(token);
        } catch (err) {
          toast({
            title: "Authentication Error",
            description: "Failed to authenticate for the video call.",
            variant: "destructive",
          });
        }
      }
    });
  }, [roomInfo, roomId, user]);

  const copyRoomLink = () => {
    const url = `${window.location.origin}/video-call/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Share this link with the other participant.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndCall = () => {
    endCall();
    setLocation("/dashboard");
  };

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
            <Button variant="outline" className="border-zinc-700 text-zinc-300">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasCamera = !!localStream && !isVideoMuted;
  const sessionTopic = roomInfo?.booking.topic;

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <header className="h-14 shrink-0 bg-black/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <span className="font-bold text-white text-sm tracking-wide">
              ProConnectiv
            </span>
            <span className="text-white/30 text-xs ml-2">
              {sessionTopic ? `Session: ${sessionTopic}` : "Video Session"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
            <span className="truncate max-w-[140px]">
              {roomInfo
                ? `with ${roomInfo.role === "creator" ? "Requester" : roomInfo.creatorName}`
                : `Room: ${roomId}`}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyRoomLink}
            className="text-white/50 hover:text-white h-9 px-3"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="ml-1.5 hidden sm:inline text-xs">
              {copied ? "Copied" : "Share"}
            </span>
          </Button>
        </div>
      </header>

      {/* Video area */}
      <div className="flex-1 relative min-h-0">
        {/* Remote video (connected) */}
        {callState === "connected" && (
          <VideoPlayer
            stream={remoteStream}
            isMuted={isSpeakerMuted}
            className="absolute inset-0 w-full h-full object-cover"
            fallbackText="Waiting for partner's video..."
          />
        )}

        {/* Local video full (idle/waiting) */}
        {callState !== "connected" && (
          <div className="absolute inset-0">
            {localStream ? (
              <VideoPlayer
                stream={localStream}
                mirrored
                isMuted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <p className="text-white/30 text-sm">Camera off</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Waiting overlay */}
        {callState === "waiting" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 flex flex-col items-center gap-3 pointer-events-auto">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-white/80 text-sm font-medium">
                Waiting for the other participant to join...
              </p>
              <button
                onClick={copyRoomLink}
                className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                Copy invite link
              </button>
            </div>
          </div>
        )}

        {/* Partner name overlay */}
        {callState === "connected" && partnerName && (
          <div className="absolute bottom-20 left-4 z-20 animate-in slide-in-from-left-4 fade-in duration-500">
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-white text-sm font-bold tracking-wide">
                {partnerName}
              </span>
            </div>
          </div>
        )}

        {/* Speaker control */}
        {callState === "connected" && (
          <div className="absolute bottom-20 right-4 z-20">
            <button
              onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all ${
                isSpeakerMuted
                  ? "text-red-400"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {isSpeakerMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* Start cam button */}
        {!hasCamera && callState !== "idle" && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => {
                if (localStream && isVideoMuted) toggleVideo();
                else startCamera();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 hover:bg-primary text-black font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              START CAM
            </button>
          </div>
        )}

        {/* PIP local video (connected) */}
        {callState === "connected" && localStream && (
          <div className="absolute top-4 right-4 w-40 h-28 z-30 rounded-xl overflow-hidden border-2 border-white/10 shadow-xl">
            <VideoPlayer
              stream={localStream}
              mirrored
              isMuted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-16 shrink-0 bg-black/60 backdrop-blur-md border-t border-white/5 flex items-center justify-center gap-3 px-4">
        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isVideoMuted
              ? "bg-white/10 text-white/50 hover:bg-white/20"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isVideoMuted ? (
            <VideoOff className="w-5 h-5" />
          ) : (
            <VideoIcon className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isMicMuted
              ? "bg-white/10 text-white/50 hover:bg-white/20"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isMicMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
