import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authedFetch } from '@/lib/api';

export type CallState = 'idle' | 'waiting' | 'connected';

interface UseWebRTCProps {
  roomId: string | null;
  userId: string;
  userName?: string;
}

interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

interface RtcConfigResponse {
  iceServers: IceServerConfig[];
  forceRelayAfterMs: number;
  hasTurn: boolean;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC({ roomId, userId, userName }: UseWebRTCProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);

  const pc = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const relayFallbackTimerRef = useRef<number | null>(null);
  const rtcConfigRef = useRef<RtcConfigResponse>({
    iceServers: DEFAULT_ICE_SERVERS,
    forceRelayAfterMs: 8000,
    hasTurn: false,
  });
  const roomJoinedRef = useRef(false);
  const relayModeRef = useRef(false);
  const { toast } = useToast();

  const sendWs = useCallback((type: string, payload: Record<string, unknown>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const cleanupPeerConnection = useCallback(() => {
    if (relayFallbackTimerRef.current) {
      window.clearTimeout(relayFallbackTimerRef.current);
      relayFallbackTimerRef.current = null;
    }
    if (pc.current) {
      pc.current.onicecandidate = null;
      pc.current.ontrack = null;
      pc.current.onconnectionstatechange = null;
      pc.current.close();
      pc.current = null;
    }
    setRemoteStream(null);
  }, []);

  const fetchRtcConfig = useCallback(async () => {
    try {
      const res = await authedFetch('/api/rtc-config');
      if (!res.ok) return;
      const data = (await res.json()) as RtcConfigResponse;
      if (!Array.isArray(data.iceServers) || data.iceServers.length === 0) return;
      rtcConfigRef.current = data;
    } catch {
      // silently keep defaults when endpoint/config is unavailable
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('Camera access denied:', err);
      toast({
        title: 'Camera Required',
        description: 'Please allow camera and microphone access for video calls.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const createPeerConnection = useCallback(
    (stream: MediaStream, options?: { forceRelay?: boolean }) => {
      cleanupPeerConnection();
      const forceRelay = options?.forceRelay === true;
      relayModeRef.current = forceRelay;
      const rtcConfig = rtcConfigRef.current;
      const peerConnection = new RTCPeerConnection({
        iceServers: rtcConfig.iceServers.length > 0 ? rtcConfig.iceServers : DEFAULT_ICE_SERVERS,
        iceTransportPolicy: forceRelay ? 'relay' : 'all',
      });

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (e) => {
        if (e.streams?.[0]) {
          setRemoteStream(e.streams[0]);
        }
      };

      peerConnection.onicecandidate = (e) => {
        if (e.candidate) {
          sendWs('iceCandidate', { roomId, candidate: e.candidate });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          if (relayFallbackTimerRef.current) {
            window.clearTimeout(relayFallbackTimerRef.current);
            relayFallbackTimerRef.current = null;
          }
        }
        if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
          toast({ title: 'Connection lost', description: 'The video connection was interrupted.' });
          setCallState('waiting');
          setRemoteStream(null);
        }
      };

      pc.current = peerConnection;
      return peerConnection;
    },
    [cleanupPeerConnection, sendWs, roomId, toast]
  );

  useEffect(() => {
    if (!roomId || !userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      void fetchRtcConfig();
    };

    ws.current.onmessage = async (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);

        switch (type) {
          case 'roomJoined': {
            setCallState('waiting');
            if (payload.partnerName) {
              setPartnerName(payload.partnerName);
            }
            break;
          }

          case 'peerJoined': {
            setPartnerName(payload.partnerName || 'Partner');
            const stream = localStreamRef.current;
            if (!stream) break;

            if (relayFallbackTimerRef.current) {
              window.clearTimeout(relayFallbackTimerRef.current);
              relayFallbackTimerRef.current = null;
            }
            const peerConnection = createPeerConnection(stream, { forceRelay: false });

            const rtcConfig = rtcConfigRef.current;
            if (rtcConfig.hasTurn && rtcConfig.forceRelayAfterMs > 0) {
              relayFallbackTimerRef.current = window.setTimeout(async () => {
                if (!roomJoinedRef.current) return;
                if (relayModeRef.current) return;
                if (!pc.current) return;
                const state = pc.current.connectionState;
                if (state === 'connected') return;
                const local = localStreamRef.current;
                if (!local) return;

                const relayPc = createPeerConnection(local, { forceRelay: true });
                try {
                  const relayOffer = await relayPc.createOffer();
                  await relayPc.setLocalDescription(relayOffer);
                  sendWs('offer', { roomId, sdp: relayOffer });
                } catch {
                  // keep existing attempt if relay renegotiation fails
                }
              }, rtcConfig.forceRelayAfterMs);
            }

            if (payload.initiator) {
              const offer = await peerConnection.createOffer();
              await peerConnection.setLocalDescription(offer);
              sendWs('offer', { roomId, sdp: offer });
            }
            setCallState('connected');
            break;
          }

          case 'offer': {
            const stream = localStreamRef.current;
            if (!stream) break;

            const peerConnection = pc.current || createPeerConnection(stream);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            sendWs('answer', { roomId, sdp: answer });
            setCallState('connected');
            break;
          }

          case 'answer': {
            if (!pc.current) break;
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            break;
          }

          case 'iceCandidate': {
            if (!pc.current) break;
            if (pc.current.remoteDescription) {
              await pc.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
            }
            break;
          }

          case 'peerLeft': {
            toast({ title: 'Partner disconnected', description: 'The other participant left the call.' });
            cleanupPeerConnection();
            setCallState('waiting');
            setPartnerName(null);
            break;
          }

          case 'error': {
            toast({ title: 'Error', description: payload.message, variant: 'destructive' });
            break;
          }
        }
      } catch {
        // malformed signaling messages are silently dropped
      }
    };

    ws.current.onerror = () => {
      toast({
        title: 'Connection Lost',
        description: 'Lost connection to the signaling server.',
        variant: 'destructive',
      });
    };

    ws.current.onclose = () => {};

    return () => {
      roomJoinedRef.current = false;
      relayModeRef.current = false;
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      cleanupPeerConnection();
    };
  }, [roomId, userId, createPeerConnection, cleanupPeerConnection, sendWs, toast]);

  const joinRoom = useCallback(async () => {
    let stream = localStreamRef.current;
    if (!stream) {
      stream = await startCamera();
      if (!stream) return;
    }
    roomJoinedRef.current = true;
    sendWs('joinRoom', { roomId, userId, userName: userName ?? userId });
    setCallState('waiting');
  }, [roomId, userId, userName, sendWs, startCamera]);

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setIsMicMuted((m) => !m);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setIsVideoMuted((m) => !m);
    }
  }, []);

  const endCall = useCallback(() => {
    roomJoinedRef.current = false;
    relayModeRef.current = false;
    cleanupPeerConnection();
    sendWs('leaveRoom', { roomId });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setCallState('idle');
    setPartnerName(null);
  }, [cleanupPeerConnection, sendWs, roomId]);

  return {
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
  };
}
