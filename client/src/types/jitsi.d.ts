interface JitsiMeetExternalAPIOptions {
  roomName: string;
  parentNode?: HTMLElement;
  width?: string | number;
  height?: string | number;
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: {
    displayName?: string;
    email?: string;
  };
  jwt?: string;
  devices?: Record<string, string>;
  lang?: string;
}

declare class JitsiMeetExternalAPI {
  constructor(domain: string, options: JitsiMeetExternalAPIOptions);
  dispose(): void;
  addEventListener(
    event: string,
    listener: (data?: Record<string, unknown>) => void,
  ): void;
  removeEventListener(
    event: string,
    listener: (data?: Record<string, unknown>) => void,
  ): void;
  executeCommand(command: string, ...args: unknown[]): void;
  getNumberOfParticipants(): number;
  isAudioMuted(): Promise<boolean>;
  isVideoMuted(): Promise<boolean>;
}

interface Window {
  JitsiMeetExternalAPI: typeof JitsiMeetExternalAPI;
}
