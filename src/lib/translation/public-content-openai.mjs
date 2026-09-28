import OpenAI from "openai";
import { normalizePublicContentTranslations } from "./public-content.ts";

const OPENAI_TRANSLATION_MODEL = "gpt-4.1-mini";
const OPENAI_TRANSLATION_TIMEOUT_MS = 12_000;

let cachedClient = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  cachedClient ??= new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: OPENAI_TRANSLATION_TIMEOUT_MS,
  });

  return cachedClient;
}

function logTranslationFailure(context, message, error) {
  const safeError = error instanceof Error
    ? { message: error.message, name: error.name }
    : undefined;

  console.error(`translation failed for ${context}: ${message}`, safeError);
}

export async function translatePublicContentWithOpenAI(input, { context }) {
  const client = getOpenAIClient();

  if (!client) {
    console.warn(`translation skipped: missing OPENAI_API_KEY for ${context}`);
    return null;
  }

  try {
    const completion = await client.chat.completions.create(
      {
        messages: [
          {
            content: [
              "You translate Spanish real estate public content into English and German.",
              "Rules: do not invent information, keep a professional commercial tone, preserve numbers, currencies, units, areas, proper names, addresses, neighborhoods, cities, project brands, and line breaks.",
              context === "feature"
                ? "For feature or amenity labels, return short natural real estate terms instead of literal word-by-word translations."
                : "",
              "Do not add markdown when the original has none. Return only the requested JSON fields. Translate only non-null fields; return null for null fields.",
            ].filter(Boolean).join(" "),
            role: "system",
          },
          {
            content: JSON.stringify({
              description: input.description ?? null,
              title: input.title ?? null,
            }),
            role: "user",
          },
        ],
        model: OPENAI_TRANSLATION_MODEL,
        response_format: {
          json_schema: {
            name: "public_content_translation",
            schema: {
              additionalProperties: false,
              properties: {
                de: {
                  additionalProperties: false,
                  properties: {
                    description: { type: ["string", "null"] },
                    title: { type: ["string", "null"] },
                  },
                  required: ["title", "description"],
                  type: "object",
                },
                en: {
                  additionalProperties: false,
                  properties: {
                    description: { type: ["string", "null"] },
                    title: { type: ["string", "null"] },
                  },
                  required: ["title", "description"],
                  type: "object",
                },
              },
              required: ["en", "de"],
              type: "object",
            },
            strict: true,
          },
          type: "json_schema",
        },
      },
      { timeout: OPENAI_TRANSLATION_TIMEOUT_MS },
    );
    const content = completion.choices[0]?.message.content;

    if (!content) {
      logTranslationFailure(context, "empty response");
      return null;
    }

    const parsed = normalizePublicContentTranslations(JSON.parse(content));

    if (!parsed) {
      logTranslationFailure(context, "invalid response shape");
      return null;
    }

    return parsed;
  } catch (error) {
    logTranslationFailure(context, "OpenAI request failed", error);
    return null;
  }
}
