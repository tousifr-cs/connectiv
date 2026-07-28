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

/** Maximum reconnection attempts before giving up. */
const MAX_RECONNECT_ATTEMPTS = 5;
/** Base delay (ms) for exponential backoff. */
const RECONNECT_BASE_DELAY = 1000;
/** Maximum delay (ms) between reconnection attempts. */
const RECONNECT_MAX_DELAY = 15000;

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
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(false);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const { toast } = useToast();

  const cleanupReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

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
    pendingIceCandidatesRef.current = [];
    setRemoteStream(null);
  }, []);

  const flushPendingIceCandidates = useCallback(async () => {
    const candidates = pendingIceCandidatesRef.current.splice(0);
    if (candidates.length === 0) return;
    for (const candidate of candidates) {
      try {
        await pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore invalid candidates after flush
      }
    }
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

  // connectWebSocket has a broad dependency list, but all deps are stable:
  // - roomId, userId, userName: controlled by the parent component
  // - sendWs, fetchRtcConfig, cleanupPeerConnection: empty-dep callbacks using refs
  // - createPeerConnection: depends on sendWs (ref-based) and roomId (stable)
  // - flushPendingIceCandidates, toast: stable references
  const connectWebSocket = useCallback(() => {
    if (!roomId || !userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    // Close any existing socket before creating a new one
    if (ws.current) {
      try { ws.current.close(); } catch { /* ignore */ }
      ws.current = null;
    }

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      reconnectAttemptRef.current = 0;
      void fetchRtcConfig();

      // If we already have a stream, rejoin the room on reconnect
      if (roomJoinedRef.current && localStreamRef.current) {
        sendWs('joinRoom', { roomId, userId, userName: userName ?? userId });
      }
    };

    socket.onmessage = async (event) => {
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
            // Flush any ICE candidates that arrived before remote description
            await flushPendingIceCandidates();
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            sendWs('answer', { roomId, sdp: answer });
            setCallState('connected');
            break;
          }

          case 'answer': {
            if (!pc.current) break;
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            // Flush any ICE candidates that arrived before remote description
            await flushPendingIceCandidates();
            break;
          }

          case 'iceCandidate': {
            if (!pc.current) break;
            if (pc.current.remoteDescription) {
              await pc.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } else {
              // Buffer candidate for when remote description is set
              pendingIceCandidatesRef.current.push(payload.candidate as RTCIceCandidateInit);
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

    socket.onerror = () => {
      // onclose will fire after this, so we handle reconnection there
    };

    socket.onclose = () => {
      // Attempt reconnection if we were in a call and the disconnect wasn't intentional
      if (shouldReconnectRef.current && roomJoinedRef.current) {
        const attempt = reconnectAttemptRef.current;
        if (attempt < MAX_RECONNECT_ATTEMPTS) {
          // Exponential backoff with jitter
          const delay = Math.min(
            RECONNECT_BASE_DELAY * Math.pow(2, attempt),
            RECONNECT_MAX_DELAY
          ) + Math.random() * 1000;

          reconnectTimerRef.current = window.setTimeout(() => {
            reconnectAttemptRef.current += 1;
            connectWebSocket();
          }, delay);
        } else {
          toast({
            title: 'Connection Failed',
            description: 'Could not reconnect to the signaling server. Please reload the page.',
            variant: 'destructive',
          });
          shouldReconnectRef.current = false;
        }
      }
    };
  }, [roomId, userId, userName, sendWs, fetchRtcConfig, createPeerConnection, flushPendingIceCandidates, cleanupPeerConnection, toast]);

  // Main WebSocket lifecycle
  useEffect(() => {
    if (!roomId || !userId) return;

    shouldReconnectRef.current = true;
    reconnectAttemptRef.current = 0;
    connectWebSocket();

    return () => {
      shouldReconnectRef.current = false;
      cleanupReconnectTimer();
      roomJoinedRef.current = false;
      relayModeRef.current = false;
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      cleanupPeerConnection();
    };
  }, [roomId, userId, connectWebSocket, cleanupReconnectTimer, cleanupPeerConnection]);

  const joinRoom = useCallback(async () => {
    let stream = localStreamRef.current;
    if (!stream) {
      stream = await startCamera();
      if (!stream) return;
    }
    roomJoinedRef.current = true;
    shouldReconnectRef.current = true;
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
    shouldReconnectRef.current = false;
    cleanupReconnectTimer();
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
  }, [cleanupPeerConnection, cleanupReconnectTimer, sendWs, roomId]);

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
