#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import {
  buildPublicContentBackfillTranslationInput,
  formatPublicContentBackfillError,
  getPublicContentBackfillPlan,
  isPublicContentBackfillPatchEmpty,
  isPublicContentBackfillPlanEmpty,
  mergePublicContentBackfillTranslations,
  parsePublicContentBackfillLimit,
  summarizePublicContentBackfillRecords,
} from "../src/lib/translation/public-content-backfill.ts";
import { translatePublicContentWithOpenAI } from "../src/lib/translation/public-content-openai.mjs";

const PAGE_SIZE = 500;
const MAX_FAILURES_TO_PRINT = 20;

const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "dry";
const writeLimit = parsePublicContentBackfillLimit(process.argv.slice(2));

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

function mapPropertyRow(row) {
  return {
    description: row.description ?? null,
    descriptionDe: row.description_de ?? null,
    descriptionEn: row.description_en ?? null,
    id: row.id,
    slug: row.slug ?? null,
    title: row.title ?? null,
    titleDe: row.title_de ?? null,
    titleEn: row.title_en ?? null,
  };
}

function mapProjectRow(row) {
  return {
    description: row.description ?? null,
    descriptionDe: row.description_de ?? null,
    descriptionEn: row.description_en ?? null,
    id: row.id,
    slug: row.slug ?? null,
    title: row.name ?? null,
    titleDe: row.name_de ?? null,
    titleEn: row.name_en ?? null,
  };
}

function patchToSupabasePayload(type, patch) {
  if (type === "property") {
    return {
      ...(Object.hasOwn(patch, "descriptionDe") ? { description_de: patch.descriptionDe } : {}),
      ...(Object.hasOwn(patch, "descriptionEn") ? { description_en: patch.descriptionEn } : {}),
      ...(Object.hasOwn(patch, "titleDe") ? { title_de: patch.titleDe } : {}),
      ...(Object.hasOwn(patch, "titleEn") ? { title_en: patch.titleEn } : {}),
    };
  }

  return {
    ...(Object.hasOwn(patch, "descriptionDe") ? { description_de: patch.descriptionDe } : {}),
    ...(Object.hasOwn(patch, "descriptionEn") ? { description_en: patch.descriptionEn } : {}),
    ...(Object.hasOwn(patch, "titleDe") ? { name_de: patch.titleDe } : {}),
    ...(Object.hasOwn(patch, "titleEn") ? { name_en: patch.titleEn } : {}),
  };
}

function statusLabel(needed, value) {
  if (!needed) {
    return "skip";
  }

  return value ? "ok" : "missing";
}

function printDryRunSummary(label, summary) {
  console.log(`${label}:`);
  console.log(`- total: ${summary.total}`);
  console.log(`- completas: ${summary.complete}`);
  console.log(`- incompletas: ${summary.incomplete}`);
  console.log(`- necesitan title/name: ${summary.needsTitle}`);
  console.log(`- necesitan description: ${summary.needsDescription}`);
  console.log(`- necesitan EN: ${summary.needsEn}`);
  console.log(`- necesitan DE: ${summary.needsDe}`);
}

async function fetchAll({ mapRow, select, table }) {
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    const page = data ?? [];
    rows.push(...page.map(mapRow));

    if (page.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

async function fetchEntities() {
  const [properties, projects] = await Promise.all([
    fetchAll({
      mapRow: mapPropertyRow,
      select: "id, slug, title, description, title_en, description_en, title_de, description_de, created_at",
      table: "properties",
    }),
    fetchAll({
      mapRow: mapProjectRow,
      select: "id, slug, name, description, name_en, description_en, name_de, description_de, created_at",
      table: "projects",
    }),
  ]);

  return { projects, properties };
}

async function processRecords(type, records, limit) {
  const table = type === "property" ? "properties" : "projects";
  const stats = {
    failed: [],
    omitted: 0,
    processed: 0,
    updated: 0,
  };
  const incomplete = records
    .filter((record) => !isPublicContentBackfillPlanEmpty(
      getPublicContentBackfillPlan(record),
    ))
    .slice(0, limit ?? undefined);

  for (const [index, record] of incomplete.entries()) {
    const plan = getPublicContentBackfillPlan(record);

    stats.processed += 1;
    console.log(`[${type === "property" ? "Property" : "Project"} ${index + 1}/${incomplete.length}] ${record.slug ?? record.id}`);

    try {
      const translations = await translatePublicContentWithOpenAI(
        buildPublicContentBackfillTranslationInput(record, plan),
        { context: type },
      );
      const patch = mergePublicContentBackfillTranslations(record, plan, translations);

      console.log(`  title/name: EN ${statusLabel(plan.title.en, patch.titleEn)} / DE ${statusLabel(plan.title.de, patch.titleDe)}`);
      console.log(`  description: EN ${statusLabel(plan.description.en, patch.descriptionEn)} / DE ${statusLabel(plan.description.de, patch.descriptionDe)}`);

      if (isPublicContentBackfillPatchEmpty(patch)) {
        stats.failed.push({
          field: "record",
          id: record.id,
          slug: record.slug,
          type,
        });
        continue;
      }

      const { error } = await supabase
        .from(table)
        .update(patchToSupabasePayload(type, patch))
        .eq("id", record.id);

      if (error) {
        throw error;
      }

      stats.updated += 1;
    } catch (error) {
      const formattedError = formatPublicContentBackfillError(error);

      stats.failed.push({
        error: formattedError,
        field: "record",
        id: record.id,
        slug: record.slug,
        type,
      });
      console.error(`  failed: ${formattedError}`);
    }
  }

  stats.omitted = records.length - stats.processed;
  return stats;
}

function printWriteSummary(label, stats) {
  console.log(`${label}:`);
  console.log(`- procesadas: ${stats.processed}`);
  console.log(`- actualizadas: ${stats.updated}`);
  console.log(`- omitidas: ${stats.omitted}`);
  console.log(`- fallidas: ${stats.failed.length}`);

  if (stats.failed.length > 0) {
    console.log("- fallos:");
    for (const failure of stats.failed.slice(0, MAX_FAILURES_TO_PRINT)) {
      console.log(`  - ${failure.type} ${failure.slug ?? failure.id} (${failure.field}): ${failure.error ?? "Unknown backfill error."}`);
    }
  }
}

const { projects, properties } = await fetchEntities();

console.log(`Mode: ${mode === "write" ? "write" : "dry-run"}`);
if (mode === "write" && writeLimit) {
  console.log(`Limit: ${writeLimit} incomplete record${writeLimit === 1 ? "" : "s"} total`);
} else if (mode !== "write" && writeLimit) {
  console.log("Limit: ignored in dry-run summary");
}
console.log("");

printDryRunSummary("Properties", summarizePublicContentBackfillRecords(properties));
console.log("");
printDryRunSummary("Projects", summarizePublicContentBackfillRecords(projects));

if (mode !== "write") {
  console.log("");
  console.log("Dry-run only. No OpenAI calls were made and no database rows were updated.");
  process.exit(0);
}

console.log("");
console.log("Starting backfill. Existing non-empty translations will not be overwritten.");
console.log("");

let remainingLimit = writeLimit;
const propertyStats = await processRecords("property", properties, remainingLimit);
if (remainingLimit !== null) {
  remainingLimit = Math.max(remainingLimit - propertyStats.processed, 0);
}
console.log("");
const projectStats = await processRecords("project", projects, remainingLimit);

console.log("");
console.log("Backfill summary");
printWriteSummary("Properties", propertyStats);
console.log("");
printWriteSummary("Projects", projectStats);
