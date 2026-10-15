// Wrangler types can regenerate this file after first install.
interface Env {
  AI: Ai;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_BOT_USERNAME: string;
  TELEGRAM_WEBHOOK_SECRET_TOKEN: string;
  JARVIS_OWNER_TELEGRAM_ID: string;
  JarvisAgent: DurableObjectNamespace<import("./src/index").JarvisAgent>;
}
