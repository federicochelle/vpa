import "server-only";

import {
  type PublicContentTranslationContext,
  type PublicContentTranslationInput,
  type PublicContentTranslations,
} from "@/lib/translation/public-content";
import { translatePublicContentWithOpenAI } from "@/lib/translation/public-content-openai.mjs";

export async function translatePublicContent(
  input: PublicContentTranslationInput,
  { context }: { context: PublicContentTranslationContext },
): Promise<PublicContentTranslations | null> {
  return translatePublicContentWithOpenAI(input, { context });
}
