import RecallClient from "recallrai";

const RECALL_API_KEY = process.env.RECALL_API_KEY;

let client: any = null;

function getClient(): any {
  if (!client) {
    if (!RECALL_API_KEY) {
      throw new Error("RECALL_API_KEY environment variable is not set");
    }
    client = new (RecallClient as any)({ apiKey: RECALL_API_KEY });
  }
  return client;
}

export async function createMeetingBot(meetingUrl: string, botName = "ProConnectiv Bot") {
  const recall = getClient();
  const bot = await recall.bot.createBot({
    meeting_url: meetingUrl,
    bot_name: botName,
    transcription_options: {
      provider: "default",
    },
    real_time_transcription: {
      destination_url: `${process.env.APP_URL || "http://localhost:5000"}/api/recall/webhook`,
    },
  });
  return bot;
}

export async function getBotStatus(botId: string) {
  const recall = getClient();
  return recall.bot.getBot(botId);
}

export async function getBotTranscript(botId: string) {
  const recall = getClient();
  return recall.bot.getTranscript(botId);
}

export async function removeBotFromCall(botId: string) {
  const recall = getClient();
  return recall.bot.deleteBot(botId);
}

export function isRecallConfigured(): boolean {
  return !!RECALL_API_KEY;
}
