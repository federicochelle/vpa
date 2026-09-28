import type {
  PublicContentTranslationContext,
  PublicContentTranslations,
  PublicContentTranslator,
} from "@/lib/translation/public-content";

export type BackfillEntityType = "project" | "property";
export type BackfillField = "description" | "title";
export type BackfillLocale = "de" | "en";

export interface PublicContentBackfillRecord {
  description: string | null;
  descriptionDe: string | null;
  descriptionEn: string | null;
  id: string;
  slug: string | null;
  title: string | null;
  titleDe: string | null;
  titleEn: string | null;
}

export interface PublicContentBackfillPlan {
  description: {
    de: boolean;
    en: boolean;
  };
  title: {
    de: boolean;
    en: boolean;
  };
}

export interface PublicContentBackfillPatch {
  descriptionDe?: string | null;
  descriptionEn?: string | null;
  titleDe?: string | null;
  titleEn?: string | null;
}

export interface PublicContentBackfillFailure {
  code?: string;
  details?: string;
  error: string;
  field: BackfillField | "record";
  hint?: string;
  id: string;
  slug: string | null;
  type: BackfillEntityType;
}

export interface ProcessBackfillRecordsResult {
  failures: PublicContentBackfillFailure[];
  processed: number;
  skipped: number;
  updated: number;
}

export interface TranslationBackfillSummary {
  complete: number;
  incomplete: number;
  needsDe: number;
  needsDescription: number;
  needsEn: number;
  needsTitle: number;
  total: number;
}

export function parsePublicContentBackfillLimit(args: string[]) {
  const limitArg = args.find((arg) => arg.startsWith("--limit="));

  if (!limitArg) {
    return null;
  }

  const rawLimit = limitArg.slice("--limit=".length).trim();
  const limit = Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer.");
  }

  return limit;
}

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function getStringProperty(value: unknown, key: string) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate : null;
}

export function normalizePublicContentBackfillError(error: unknown) {
  return {
    code: getStringProperty(error, "code") ?? undefined,
    details: getStringProperty(error, "details") ?? undefined,
    hint: getStringProperty(error, "hint") ?? undefined,
    message: error instanceof Error
      ? error.message
      : getStringProperty(error, "message") ?? "Unknown backfill error.",
  };
}

export function formatPublicContentBackfillError(error: unknown) {
  const normalized = normalizePublicContentBackfillError(error);
  const parts = [normalized.message];

  if (normalized.code) {
    parts.push(`code: ${normalized.code}`);
  }

  if (normalized.details) {
    parts.push(`details: ${normalized.details}`);
  }

  if (normalized.hint) {
    parts.push(`hint: ${normalized.hint}`);
  }

  return parts.join(" | ");
}

function emptyPlan(): PublicContentBackfillPlan {
  return {
    description: {
      de: false,
      en: false,
    },
    title: {
      de: false,
      en: false,
    },
  };
}

export function getPublicContentBackfillPlan(
  record: PublicContentBackfillRecord,
): PublicContentBackfillPlan {
  const plan = emptyPlan();

  if (hasText(record.title)) {
    plan.title.en = !hasText(record.titleEn);
    plan.title.de = !hasText(record.titleDe);
  }

  if (hasText(record.description)) {
    plan.description.en = !hasText(record.descriptionEn);
    plan.description.de = !hasText(record.descriptionDe);
  }

  return plan;
}

export function isPublicContentBackfillPlanEmpty(plan: PublicContentBackfillPlan) {
  return !plan.title.en && !plan.title.de && !plan.description.en && !plan.description.de;
}

export function summarizePublicContentBackfillRecords(
  records: PublicContentBackfillRecord[],
): TranslationBackfillSummary {
  return records.reduce<TranslationBackfillSummary>(
    (summary, record) => {
      const plan = getPublicContentBackfillPlan(record);
      const needsTitle = plan.title.en || plan.title.de;
      const needsDescription = plan.description.en || plan.description.de;
      const needsEn = plan.title.en || plan.description.en;
      const needsDe = plan.title.de || plan.description.de;
      const incomplete = needsTitle || needsDescription;

      return {
        complete: summary.complete + (incomplete ? 0 : 1),
        incomplete: summary.incomplete + (incomplete ? 1 : 0),
        needsDe: summary.needsDe + (needsDe ? 1 : 0),
        needsDescription: summary.needsDescription + (needsDescription ? 1 : 0),
        needsEn: summary.needsEn + (needsEn ? 1 : 0),
        needsTitle: summary.needsTitle + (needsTitle ? 1 : 0),
        total: summary.total + 1,
      };
    },
    {
      complete: 0,
      incomplete: 0,
      needsDe: 0,
      needsDescription: 0,
      needsEn: 0,
      needsTitle: 0,
      total: 0,
    },
  );
}

export function buildPublicContentBackfillTranslationInput(
  record: PublicContentBackfillRecord,
  plan: PublicContentBackfillPlan,
) {
  return {
    description: plan.description.en || plan.description.de ? record.description : null,
    title: plan.title.en || plan.title.de ? record.title : null,
  };
}

export function mergePublicContentBackfillTranslations(
  record: PublicContentBackfillRecord,
  plan: PublicContentBackfillPlan,
  translations: PublicContentTranslations | null,
): PublicContentBackfillPatch {
  if (!translations) {
    return {};
  }

  const patch: PublicContentBackfillPatch = {};

  if (plan.title.en && hasText(translations.en.title)) {
    patch.titleEn = translations.en.title;
  }

  if (plan.title.de && hasText(translations.de.title)) {
    patch.titleDe = translations.de.title;
  }

  if (plan.description.en && hasText(translations.en.description)) {
    patch.descriptionEn = translations.en.description;
  }

  if (plan.description.de && hasText(translations.de.description)) {
    patch.descriptionDe = translations.de.description;
  }

  return patch;
}

export function isPublicContentBackfillPatchEmpty(patch: PublicContentBackfillPatch) {
  return Object.keys(patch).length === 0;
}

export async function processPublicContentBackfillRecords({
  onPatch,
  records,
  translator,
  type,
}: {
  onPatch: (record: PublicContentBackfillRecord, patch: PublicContentBackfillPatch) => Promise<void>;
  records: PublicContentBackfillRecord[];
  translator: PublicContentTranslator;
  type: BackfillEntityType;
}): Promise<ProcessBackfillRecordsResult> {
  const result: ProcessBackfillRecordsResult = {
    failures: [],
    processed: 0,
    skipped: 0,
    updated: 0,
  };

  for (const record of records) {
    const plan = getPublicContentBackfillPlan(record);

    if (isPublicContentBackfillPlanEmpty(plan)) {
      result.skipped += 1;
      continue;
    }

    result.processed += 1;

    try {
      const translations = await translator(
        buildPublicContentBackfillTranslationInput(record, plan),
        { context: type as PublicContentTranslationContext },
      );
      const patch = mergePublicContentBackfillTranslations(record, plan, translations);

      if (isPublicContentBackfillPatchEmpty(patch)) {
        result.failures.push({
          error: "Translation returned no usable missing values.",
          field: "record",
          id: record.id,
          slug: record.slug,
          type,
        });
        continue;
      }

      await onPatch(record, patch);
      result.updated += 1;
    } catch (error) {
      const normalizedError = normalizePublicContentBackfillError(error);

      result.failures.push({
        code: normalizedError.code,
        details: normalizedError.details,
        error: normalizedError.message,
        field: "record",
        hint: normalizedError.hint,
        id: record.id,
        slug: record.slug,
        type,
      });
    }
  }

  return result;
}
