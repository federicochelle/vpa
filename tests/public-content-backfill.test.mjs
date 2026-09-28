import assert from "node:assert/strict";
import test from "node:test";
import {
  getPublicContentBackfillPlan,
  mergePublicContentBackfillTranslations,
  normalizePublicContentBackfillError,
  parsePublicContentBackfillLimit,
  processPublicContentBackfillRecords,
  summarizePublicContentBackfillRecords,
} from "../src/lib/translation/public-content-backfill.ts";

const baseRecord = {
  description: "Descripción existente",
  descriptionDe: null,
  descriptionEn: null,
  id: "property-1",
  slug: "propiedad-1",
  title: "Título existente",
  titleDe: null,
  titleEn: null,
};

const translations = {
  de: {
    description: "Bestehende Beschreibung",
    title: "Bestehender Titel",
  },
  en: {
    description: "Existing description",
    title: "Existing title",
  },
};

test("detects missing public content translations", () => {
  assert.deepEqual(getPublicContentBackfillPlan(baseRecord), {
    description: {
      de: true,
      en: true,
    },
    title: {
      de: true,
      en: true,
    },
  });
});

test("does not overwrite existing translations", () => {
  const record = {
    ...baseRecord,
    descriptionEn: "Keep this description",
    titleDe: "Diesen Titel behalten",
  };
  const plan = getPublicContentBackfillPlan(record);

  assert.deepEqual(mergePublicContentBackfillTranslations(record, plan, translations), {
    descriptionDe: "Bestehende Beschreibung",
    titleEn: "Existing title",
  });
});

test("treats whitespace translations as missing", () => {
  const plan = getPublicContentBackfillPlan({
    ...baseRecord,
    descriptionDe: "   ",
    titleEn: "\n",
  });

  assert.equal(plan.description.de, true);
  assert.equal(plan.title.en, true);
});

test("does not translate empty descriptions", () => {
  const plan = getPublicContentBackfillPlan({
    ...baseRecord,
    description: "   ",
  });

  assert.deepEqual(plan.description, {
    de: false,
    en: false,
  });
});

test("omits complete records from summary", () => {
  const completeRecord = {
    ...baseRecord,
    descriptionDe: "Beschreibung",
    descriptionEn: "Description",
    titleDe: "Titel",
    titleEn: "Title",
  };

  assert.deepEqual(summarizePublicContentBackfillRecords([baseRecord, completeRecord]), {
    complete: 1,
    incomplete: 1,
    needsDe: 1,
    needsDescription: 1,
    needsEn: 1,
    needsTitle: 1,
    total: 2,
  });
});

test("processing continues when one record fails", async () => {
  const records = [
    baseRecord,
    {
      ...baseRecord,
      id: "property-2",
      slug: "propiedad-2",
    },
  ];
  const patched = [];

  const result = await processPublicContentBackfillRecords({
    onPatch: async (record, patch) => {
      patched.push({ id: record.id, patch });
    },
    records,
    translator: async (input) => {
      if (input.title === "Título existente") {
        throw new Error("boom");
      }

      return translations;
    },
    type: "property",
  });

  assert.equal(result.processed, 2);
  assert.equal(result.updated, 0);
  assert.equal(result.failures.length, 2);
  assert.deepEqual(patched, []);
});

test("processing updates later records after a failed record", async () => {
  const records = [
    baseRecord,
    {
      ...baseRecord,
      id: "property-2",
      slug: "propiedad-2",
      title: "Otro título",
    },
  ];
  const patched = [];

  const result = await processPublicContentBackfillRecords({
    onPatch: async (record, patch) => {
      patched.push({ id: record.id, patch });
    },
    records,
    translator: async (input) => {
      if (input.title === "Título existente") {
        throw new Error("boom");
      }

      return translations;
    },
    type: "property",
  });

  assert.equal(result.processed, 2);
  assert.equal(result.updated, 1);
  assert.equal(result.failures.length, 1);
  assert.equal(patched[0].id, "property-2");
});

test("normalizes Supabase-style error objects without losing diagnostics", () => {
  assert.deepEqual(
    normalizePublicContentBackfillError({
      code: "PGRST204",
      details: "Column not found in schema cache.",
      hint: "Reload the schema cache.",
      message: "Could not find the column.",
    }),
    {
      code: "PGRST204",
      details: "Column not found in schema cache.",
      hint: "Reload the schema cache.",
      message: "Could not find the column.",
    },
  );
});

test("processing preserves Supabase-style error message, code, details and hint", async () => {
  const result = await processPublicContentBackfillRecords({
    onPatch: async () => {
      throw {
        code: "42501",
        details: "RLS policy denied update.",
        hint: "Use the service role key.",
        message: "permission denied for table properties",
      };
    },
    records: [baseRecord],
    translator: async () => translations,
    type: "property",
  });

  assert.deepEqual(result.failures[0], {
    code: "42501",
    details: "RLS policy denied update.",
    error: "permission denied for table properties",
    field: "record",
    hint: "Use the service role key.",
    id: "property-1",
    slug: "propiedad-1",
    type: "property",
  });
});

test("parses optional backfill limit", () => {
  assert.equal(parsePublicContentBackfillLimit(["--write", "--limit=1"]), 1);
  assert.equal(parsePublicContentBackfillLimit(["--write"]), null);
  assert.throws(
    () => parsePublicContentBackfillLimit(["--limit=0"]),
    /positive integer/,
  );
});
