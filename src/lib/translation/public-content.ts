export type PublicContentTranslationContext = "feature" | "project" | "property";

export interface PublicContentTranslationInput {
  description?: string | null;
  title?: string | null;
}

export interface PublicContentTranslationValue {
  description: string | null;
  title: string | null;
}

export interface PublicContentTranslations {
  de: PublicContentTranslationValue;
  en: PublicContentTranslationValue;
}

export interface PublicContentTranslationFields {
  descriptionDe: string | null;
  descriptionEn: string | null;
  titleDe: string | null;
  titleEn: string | null;
}

export interface ExistingPublicContentTranslationFields extends PublicContentTranslationFields {
  description: string | null;
  title: string;
}

export type PublicContentTranslator = (
  input: PublicContentTranslationInput,
  options: { context: PublicContentTranslationContext },
) => Promise<PublicContentTranslations | null>;

function normalizeSourceText(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? value ?? null : null;
}

function normalizeTranslatedText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? value : null;
}

function emptyTranslations(): PublicContentTranslationFields {
  return {
    descriptionDe: null,
    descriptionEn: null,
    titleDe: null,
    titleEn: null,
  };
}

function getTranslationsForPayload(
  translated: PublicContentTranslations | null,
): PublicContentTranslationFields {
  if (!translated) {
    return emptyTranslations();
  }

  return {
    descriptionDe: translated.de.description,
    descriptionEn: translated.en.description,
    titleDe: translated.de.title,
    titleEn: translated.en.title,
  };
}

export function normalizePublicContentTranslations(
  value: unknown,
): PublicContentTranslations | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    de?: { description?: unknown; title?: unknown };
    en?: { description?: unknown; title?: unknown };
  };

  if (!candidate.en || !candidate.de) {
    return null;
  }

  if (
    !Object.hasOwn(candidate.en, "title") ||
    !Object.hasOwn(candidate.en, "description") ||
    !Object.hasOwn(candidate.de, "title") ||
    !Object.hasOwn(candidate.de, "description")
  ) {
    return null;
  }

  return {
    de: {
      description: normalizeTranslatedText(candidate.de.description),
      title: normalizeTranslatedText(candidate.de.title),
    },
    en: {
      description: normalizeTranslatedText(candidate.en.description),
      title: normalizeTranslatedText(candidate.en.title),
    },
  };
}

export async function buildCreatePublicContentTranslationFields(
  input: PublicContentTranslationInput,
  translator: PublicContentTranslator,
  context: PublicContentTranslationContext,
): Promise<PublicContentTranslationFields> {
  const title = normalizeSourceText(input.title);
  const description = normalizeSourceText(input.description);

  if (!title && !description) {
    return emptyTranslations();
  }

  const translated = await translator({ description, title }, { context });
  const fields = getTranslationsForPayload(translated);

  return {
    ...fields,
    descriptionDe: description ? fields.descriptionDe : null,
    descriptionEn: description ? fields.descriptionEn : null,
    titleDe: title ? fields.titleDe : null,
    titleEn: title ? fields.titleEn : null,
  };
}

export async function buildUpdatePublicContentTranslationFields({
  context,
  next,
  previous,
  translator,
}: {
  context: PublicContentTranslationContext;
  next: PublicContentTranslationInput;
  previous: ExistingPublicContentTranslationFields;
  translator: PublicContentTranslator;
}): Promise<PublicContentTranslationFields> {
  const nextTitle = normalizeSourceText(next.title);
  const nextDescription = normalizeSourceText(next.description);
  const previousDescription = normalizeSourceText(previous.description);
  const titleChanged = previous.title !== (next.title ?? "");
  const descriptionChanged = previousDescription !== nextDescription;

  if (!titleChanged && !descriptionChanged) {
    return {
      descriptionDe: previous.descriptionDe,
      descriptionEn: previous.descriptionEn,
      titleDe: previous.titleDe,
      titleEn: previous.titleEn,
    };
  }

  const shouldTranslateTitle = titleChanged && Boolean(nextTitle);
  const shouldTranslateDescription = descriptionChanged && Boolean(nextDescription);
  const translated = shouldTranslateTitle || shouldTranslateDescription
    ? await translator(
        {
          description: shouldTranslateDescription ? nextDescription : null,
          title: shouldTranslateTitle ? nextTitle : null,
        },
        { context },
      )
    : null;
  const fields = getTranslationsForPayload(translated);

  return {
    descriptionDe: descriptionChanged
      ? nextDescription
        ? fields.descriptionDe
        : null
      : previous.descriptionDe,
    descriptionEn: descriptionChanged
      ? nextDescription
        ? fields.descriptionEn
        : null
      : previous.descriptionEn,
    titleDe: titleChanged ? fields.titleDe : previous.titleDe,
    titleEn: titleChanged ? fields.titleEn : previous.titleEn,
  };
}
