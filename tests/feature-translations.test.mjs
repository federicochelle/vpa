import assert from "node:assert/strict";
import test from "node:test";
import {
  getFeatureTranslationBackfillPlan,
  mergeFeatureTranslationBackfillTranslations,
  processFeatureTranslationBackfillRecords,
  summarizeFeatureTranslationBackfillRecords,
} from "../src/lib/translation/feature-backfill.ts";

const baseFeature = {
  id: "feature-1",
  name: "Piscina",
  nameDe: null,
  nameEn: null,
  slug: "piscina",
};

const translations = {
  de: {
    description: null,
    title: "Swimmingpool",
  },
  en: {
    description: null,
    title: "Swimming pool",
  },
};

test("detects missing feature translations", () => {
  assert.deepEqual(getFeatureTranslationBackfillPlan(baseFeature), {
    de: true,
    en: true,
  });
});

test("feature whitespace translations count as missing", () => {
  assert.deepEqual(
    getFeatureTranslationBackfillPlan({
      ...baseFeature,
      nameDe: " ",
      nameEn: "\n",
    }),
    {
      de: true,
      en: true,
    },
  );
});

test("feature merge does not overwrite existing translations", () => {
  const plan = getFeatureTranslationBackfillPlan({
    ...baseFeature,
    nameEn: "Keep this",
  });

  assert.deepEqual(mergeFeatureTranslationBackfillTranslations(plan, translations), {
    nameDe: "Swimmingpool",
  });
});

test("feature summary counts complete and incomplete records", () => {
  assert.deepEqual(
    summarizeFeatureTranslationBackfillRecords([
      baseFeature,
      {
        ...baseFeature,
        id: "feature-2",
        nameDe: "Grillbereich",
        nameEn: "Barbecue area",
      },
    ]),
    {
      complete: 1,
      incomplete: 1,
      needsDe: 1,
      needsEn: 1,
      total: 2,
    },
  );
});

test("feature backfill continues after a failed record", async () => {
  const patched = [];
  const result = await processFeatureTranslationBackfillRecords({
    onPatch: async (record, patch) => {
      patched.push({ id: record.id, patch });
    },
    records: [
      baseFeature,
      {
        ...baseFeature,
        id: "feature-2",
        name: "Parrillero",
        slug: "parrillero",
      },
    ],
    translator: async (input) => {
      if (input.title === "Piscina") {
        throw new Error("boom");
      }

      return translations;
    },
  });

  assert.equal(result.processed, 2);
  assert.equal(result.updated, 1);
  assert.equal(result.failures.length, 1);
  assert.equal(patched[0].id, "feature-2");
});
