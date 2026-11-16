// ai/config.js — everything you switch lives here (or in env). Nothing else imports a vendor SDK.
const env = process.env;

const EMBED_DEFAULT_MODEL = {
  voyage: "voyage-3.5-lite",
  openai: "text-embedding-3-small",
  google: "gemini-embedding-001",
};
const embedProvider = env.EMBED_PROVIDER || "voyage";

export const aiConfig = {
  // Chat/agent provider: anthropic | openai | google | compat (any OpenAI-compatible endpoint)
  provider: env.AI_PROVIDER || "anthropic",

  // "fast" = employee chat, "smart" = admin agent. Set the env vars for whichever provider you use.
  models: {
    anthropic: {
      fast: env.ANTHROPIC_FAST_MODEL || "claude-haiku-5-5",
      smart: env.ANTHROPIC_SMART_MODEL || "claude-sonnet-5-5",
    },
    openai: { fast: env.OPENAI_FAST_MODEL, smart: env.OPENAI_SMART_MODEL },
    google: { fast: env.GOOGLE_FAST_MODEL, smart: env.GOOGLE_SMART_MODEL },
    compat: { fast: env.COMPAT_FAST_MODEL, smart: env.COMPAT_SMART_MODEL },
  },

  // Embeddings are a separate choice. Changing them means re-embedding (see scripts/reembed.js).
  // Keep dims the same across providers (1024) so the Atlas vector index never has to change.
  embeddings: {
    provider: embedProvider,
    model: env.EMBED_MODEL || EMBED_DEFAULT_MODEL[embedProvider],
    dims: Number(env.EMBED_DIMS || 1024),
  },

  // Used to turn "this month" into real dates. Minutes ahead of UTC (e.g. UTC+5 → 300).
  utcOffsetMinutes: Number(env.AI_UTC_OFFSET_MINUTES || 0),

  // Roles that get the admin profile (strong model, all tools, CRM data).
  adminRoles: (env.AI_ADMIN_ROLES || "admin").split(",").map((s) => s.trim()),
};