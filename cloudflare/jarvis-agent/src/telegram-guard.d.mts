export interface TelegramActor { userId: string; chatId: string; updateId: string }
export function secretMatches(given: string | null, expected: string | undefined): boolean;
export function verifiedTelegramActor(update: unknown): TelegramActor | null;
export function telegramIngressGate(request: Request, env: {
  TELEGRAM_WEBHOOK_SECRET_TOKEN?: string;
  JARVIS_OWNER_TELEGRAM_ID?: string;
}): Promise<{ accepted: false; response: Response } | { accepted: true; actor: TelegramActor }>;
