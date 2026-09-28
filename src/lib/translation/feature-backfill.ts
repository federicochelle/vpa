import type {
  PublicContentTranslations,
  PublicContentTranslator,
} from "@/lib/translation/public-content";

export interface FeatureTranslationBackfillRecord {
  id: string;
  name: string;
  nameDe: string | null;
  nameEn: string | null;
  slug: string | null;
}

export interface FeatureTranslationBackfillPlan {
  de: boolean;
  en: boolean;
}

export interface FeatureTranslationBackfillPatch {
  nameDe?: string | null;
  nameEn?: string | null;
}

export interface FeatureTranslationBackfillSummary {
  complete: number;
  incomplete: number;
  needsDe: number;
  needsEn: number;
  total: number;
}

export interface FeatureTranslationBackfillFailure {
  error: string;
  id: string;
  slug: string | null;
}

export interface ProcessFeatureTranslationBackfillResult {
  failures: FeatureTranslationBackfillFailure[];
  processed: number;
  skipped: number;
  updated: number;
}

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getFeatureTranslationBackfillPlan(
  record: FeatureTranslationBackfillRecord,
): FeatureTranslationBackfillPlan {
  if (!hasText(record.name)) {
    return { de: false, en: false };
  }

  return {
    de: !hasText(record.nameDe),
    en: !hasText(record.nameEn),
  };
}

export function isFeatureTranslationBackfillPlanEmpty(
  plan: FeatureTranslationBackfillPlan,
) {
  return !plan.de && !plan.en;
}

export function summarizeFeatureTranslationBackfillRecords(
  records: FeatureTranslationBackfillRecord[],
): FeatureTranslationBackfillSummary {
  return records.reduce<FeatureTranslationBackfillSummary>(
    (summary, record) => {
      const plan = getFeatureTranslationBackfillPlan(record);
      const incomplete = plan.de || plan.en;

      return {
        complete: summary.complete + (incomplete ? 0 : 1),
        incomplete: summary.incomplete + (incomplete ? 1 : 0),
        needsDe: summary.needsDe + (plan.de ? 1 : 0),
        needsEn: summary.needsEn + (plan.en ? 1 : 0),
        total: summary.total + 1,
      };
    },
    {
      complete: 0,
      incomplete: 0,
      needsDe: 0,
      needsEn: 0,
      total: 0,
    },
  );
}

export function mergeFeatureTranslationBackfillTranslations(
  plan: FeatureTranslationBackfillPlan,
  translations: PublicContentTranslations | null,
): FeatureTranslationBackfillPatch {
  if (!translations) {
    return {};
  }

  const patch: FeatureTranslationBackfillPatch = {};

  if (plan.en && hasText(translations.en.title)) {
    patch.nameEn = translations.en.title;
  }

  if (plan.de && hasText(translations.de.title)) {
    patch.nameDe = translations.de.title;
  }

  return patch;
}

export function isFeatureTranslationBackfillPatchEmpty(
  patch: FeatureTranslationBackfillPatch,
) {
  return Object.keys(patch).length === 0;
}

export async function processFeatureTranslationBackfillRecords({
  onPatch,
  records,
  translator,
}: {
  onPatch: (record: FeatureTranslationBackfillRecord, patch: FeatureTranslationBackfillPatch) => Promise<void>;
  records: FeatureTranslationBackfillRecord[];
  translator: PublicContentTranslator;
}): Promise<ProcessFeatureTranslationBackfillResult> {
  const result: ProcessFeatureTranslationBackfillResult = {
    failures: [],
    processed: 0,
    skipped: 0,
    updated: 0,
  };

  for (const record of records) {
    const plan = getFeatureTranslationBackfillPlan(record);

    if (isFeatureTranslationBackfillPlanEmpty(plan)) {
      result.skipped += 1;
      continue;
    }

    result.processed += 1;

    try {
      const translations = await translator(
        { description: null, title: record.name },
        { context: "feature" },
      );
      const patch = mergeFeatureTranslationBackfillTranslations(plan, translations);

      if (isFeatureTranslationBackfillPatchEmpty(patch)) {
        result.failures.push({
          error: "Translation returned no usable missing values.",
          id: record.id,
          slug: record.slug,
        });
        continue;
      }

      await onPatch(record, patch);
      result.updated += 1;
    } catch (error) {
      result.failures.push({
        error: error instanceof Error ? error.message : "Unknown feature backfill error.",
        id: record.id,
        slug: record.slug,
      });
    }
  }

  return result;
}
