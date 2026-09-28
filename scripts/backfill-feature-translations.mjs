#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import {
  getFeatureTranslationBackfillPlan,
  isFeatureTranslationBackfillPatchEmpty,
  isFeatureTranslationBackfillPlanEmpty,
  mergeFeatureTranslationBackfillTranslations,
  summarizeFeatureTranslationBackfillRecords,
} from "../src/lib/translation/feature-backfill.ts";
import {
  formatPublicContentBackfillError,
  parsePublicContentBackfillLimit,
} from "../src/lib/translation/public-content-backfill.ts";
import { translatePublicContentWithOpenAI } from "../src/lib/translation/public-content-openai.mjs";

const PAGE_SIZE = 500;
const MAX_FAILURES_TO_PRINT = 20;

const cliArgs = process.argv.slice(2);
const args = new Set(cliArgs);
const mode = args.has("--write") ? "write" : "dry";
const writeLimit = parsePublicContentBackfillLimit(cliArgs);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
  );
}

if (mode === "write" && !process.env.OPENAI_API_KEY?.trim()) {
  throw new Error("Missing OPENAI_API_KEY in environment.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function mapFeatureRow(row) {
  return {
    id: row.id,
    name: row.name,
    nameDe: row.name_de ?? null,
    nameEn: row.name_en ?? null,
    slug: row.slug ?? null,
  };
}

function patchToSupabasePayload(patch) {
  return {
    ...(Object.hasOwn(patch, "nameDe") ? { name_de: patch.nameDe } : {}),
    ...(Object.hasOwn(patch, "nameEn") ? { name_en: patch.nameEn } : {}),
  };
}

function statusLabel(needed, value) {
  if (!needed) {
    return "skip";
  }

  return value ? "ok" : "missing";
}

async function fetchFeatures() {
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("features")
      .select("id, name, name_en, name_de, slug, created_at")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    const page = data ?? [];
    rows.push(...page.map(mapFeatureRow));

    if (page.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

function printDryRunSummary(summary) {
  console.log("Features:");
  console.log(`- total: ${summary.total}`);
  console.log(`- completas: ${summary.complete}`);
  console.log(`- incompletas: ${summary.incomplete}`);
  console.log(`- necesitan EN: ${summary.needsEn}`);
  console.log(`- necesitan DE: ${summary.needsDe}`);
}

async function processFeatures(records, limit) {
  const stats = {
    failed: [],
    omitted: 0,
    processed: 0,
    updated: 0,
  };
  const incomplete = records
    .filter((record) => !isFeatureTranslationBackfillPlanEmpty(
      getFeatureTranslationBackfillPlan(record),
    ))
    .slice(0, limit ?? undefined);

  for (const [index, record] of incomplete.entries()) {
    const plan = getFeatureTranslationBackfillPlan(record);

    stats.processed += 1;
    console.log(`[Feature ${index + 1}/${incomplete.length}] ${record.slug ?? record.id}`);

    try {
      const translations = await translatePublicContentWithOpenAI(
        { description: null, title: record.name },
        { context: "feature" },
      );
      const patch = mergeFeatureTranslationBackfillTranslations(plan, translations);

      console.log(`  name: EN ${statusLabel(plan.en, patch.nameEn)} / DE ${statusLabel(plan.de, patch.nameDe)}`);

      if (isFeatureTranslationBackfillPatchEmpty(patch)) {
        stats.failed.push({
          error: "Translation returned no usable missing values.",
          id: record.id,
          slug: record.slug,
        });
        continue;
      }

      const { error } = await supabase
        .from("features")
        .update(patchToSupabasePayload(patch))
        .eq("id", record.id);

      if (error) {
        throw error;
      }

      stats.updated += 1;
    } catch (error) {
      const formattedError = formatPublicContentBackfillError(error);

      stats.failed.push({
        error: formattedError,
        id: record.id,
        slug: record.slug,
      });
      console.error(`  failed: ${formattedError}`);
    }
  }

  stats.omitted = records.length - stats.processed;
  return stats;
}

function printWriteSummary(stats) {
  console.log("Features:");
  console.log(`- procesadas: ${stats.processed}`);
  console.log(`- actualizadas: ${stats.updated}`);
  console.log(`- omitidas: ${stats.omitted}`);
  console.log(`- fallidas: ${stats.failed.length}`);

  if (stats.failed.length > 0) {
    console.log("- fallos:");
    for (const failure of stats.failed.slice(0, MAX_FAILURES_TO_PRINT)) {
      console.log(`  - ${failure.slug ?? failure.id}: ${failure.error}`);
    }
  }
}

const features = await fetchFeatures();

console.log(`Mode: ${mode === "write" ? "write" : "dry-run"}`);
if (mode === "write" && writeLimit) {
  console.log(`Limit: ${writeLimit} incomplete feature${writeLimit === 1 ? "" : "s"}`);
} else if (mode !== "write" && writeLimit) {
  console.log("Limit: ignored in dry-run summary");
}
console.log("");

printDryRunSummary(summarizeFeatureTranslationBackfillRecords(features));

if (mode !== "write") {
  console.log("");
  console.log("Dry-run only. No OpenAI calls were made and no database rows were updated.");
  process.exit(0);
}

console.log("");
console.log("Starting feature backfill. Existing non-empty translations will not be overwritten.");
console.log("");

const stats = await processFeatures(features, writeLimit);

console.log("");
console.log("Feature backfill summary");
printWriteSummary(stats);
