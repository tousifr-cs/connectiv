import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type CallState = 'idle' | 'waiting' | 'connected';

interface UseWebRTCProps {
  roomId: string | null;
  userId: string;
  userName?: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

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
  const { toast } = useToast();

  const sendWs = useCallback((type: string, payload: Record<string, unknown>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const cleanupPeerConnection = useCallback(() => {
    if (pc.current) {
      pc.current.onicecandidate = null;
      pc.current.ontrack = null;
      pc.current.onconnectionstatechange = null;
      pc.current.close();
      pc.current = null;
    }
    setRemoteStream(null);
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
    (stream: MediaStream) => {
      cleanupPeerConnection();

      const peerConnection = new RTCPeerConnection(ICE_SERVERS);

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

    ws.current.onopen = () => {};

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

            const peerConnection = createPeerConnection(stream);
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
