import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCreatePublicContentTranslationFields,
  buildUpdatePublicContentTranslationFields,
  normalizePublicContentTranslations,
} from "../src/lib/translation/public-content.ts";

function createTranslator(result, calls = []) {
  return async (input, options) => {
    calls.push({ input, options });
    return result;
  };
}

const TRANSLATION = {
  de: {
    description: "Beschreibung DE",
    title: "Titel DE",
  },
  en: {
    description: "Description EN",
    title: "Title EN",
  },
};

const PREVIOUS = {
  description: "Descripcion ES",
  descriptionDe: "Descripcion anterior DE",
  descriptionEn: "Previous description EN",
  title: "Titulo ES",
  titleDe: "Titulo anterior DE",
  titleEn: "Previous title EN",
};

test("create property translation fields enter the insert payload shape", async () => {
  const calls = [];
  const fields = await buildCreatePublicContentTranslationFields(
    { description: "Descripcion ES", title: "Titulo ES" },
    createTranslator(TRANSLATION, calls),
    "property",
  );

  assert.deepEqual(fields, {
    descriptionDe: "Beschreibung DE",
    descriptionEn: "Description EN",
    titleDe: "Titel DE",
    titleEn: "Title EN",
  });
  assert.deepEqual(calls, [
    {
      input: { description: "Descripcion ES", title: "Titulo ES" },
      options: { context: "property" },
    },
  ]);
});

test("create property translation failure does not block payload creation", async () => {
  const fields = await buildCreatePublicContentTranslationFields(
    { description: "Descripcion ES", title: "Titulo ES" },
    createTranslator(null),
    "property",
  );

  assert.deepEqual(fields, {
    descriptionDe: null,
    descriptionEn: null,
    titleDe: null,
    titleEn: null,
  });
});

test("update property without title or description changes does not translate", async () => {
  const calls = [];
  const fields = await buildUpdatePublicContentTranslationFields({
    context: "property",
    next: { description: "Descripcion ES", title: "Titulo ES" },
    previous: PREVIOUS,
    translator: createTranslator(TRANSLATION, calls),
  });

  assert.equal(calls.length, 0);
  assert.deepEqual(fields, {
    descriptionDe: "Descripcion anterior DE",
    descriptionEn: "Previous description EN",
    titleDe: "Titulo anterior DE",
    titleEn: "Previous title EN",
  });
});

test("update property title change regenerates title translations only", async () => {
  const calls = [];
  const fields = await buildUpdatePublicContentTranslationFields({
    context: "property",
    next: { description: "Descripcion ES", title: "Titulo nuevo ES" },
    previous: PREVIOUS,
    translator: createTranslator(TRANSLATION, calls),
  });

  assert.deepEqual(calls[0].input, {
    description: null,
    title: "Titulo nuevo ES",
  });
  assert.deepEqual(fields, {
    descriptionDe: "Descripcion anterior DE",
    descriptionEn: "Previous description EN",
    titleDe: "Titel DE",
    titleEn: "Title EN",
  });
});

test("update property description change regenerates description translations only", async () => {
  const calls = [];
  const fields = await buildUpdatePublicContentTranslationFields({
    context: "property",
    next: { description: "Descripcion nueva ES", title: "Titulo ES" },
    previous: PREVIOUS,
    translator: createTranslator(TRANSLATION, calls),
  });

  assert.deepEqual(calls[0].input, {
    description: "Descripcion nueva ES",
    title: null,
  });
  assert.deepEqual(fields, {
    descriptionDe: "Beschreibung DE",
    descriptionEn: "Description EN",
    titleDe: "Titulo anterior DE",
    titleEn: "Previous title EN",
  });
});

test("update property cleared description nulls description translations", async () => {
  const calls = [];
  const fields = await buildUpdatePublicContentTranslationFields({
    context: "property",
    next: { description: null, title: "Titulo ES" },
    previous: PREVIOUS,
    translator: createTranslator(TRANSLATION, calls),
  });

  assert.equal(calls.length, 0);
  assert.deepEqual(fields, {
    descriptionDe: null,
    descriptionEn: null,
    titleDe: "Titulo anterior DE",
    titleEn: "Previous title EN",
  });
});

test("update property changed Spanish content with translation failure nulls changed translations", async () => {
  const fields = await buildUpdatePublicContentTranslationFields({
    context: "property",
    next: { description: "Descripcion nueva ES", title: "Titulo nuevo ES" },
    previous: PREVIOUS,
    translator: createTranslator(null),
  });

  assert.deepEqual(fields, {
    descriptionDe: null,
    descriptionEn: null,
    titleDe: null,
    titleEn: null,
  });
});

test("create project translation fields use the same mocked service", async () => {
  const calls = [];
  const fields = await buildCreatePublicContentTranslationFields(
    { description: "Descripcion proyecto ES", title: "Proyecto ES" },
    createTranslator(TRANSLATION, calls),
    "project",
  );

  assert.equal(calls[0].options.context, "project");
  assert.deepEqual(fields, {
    descriptionDe: "Beschreibung DE",
    descriptionEn: "Description EN",
    titleDe: "Titel DE",
    titleEn: "Title EN",
  });
});

test("create feature translation fields use feature context and do not block on failure", async () => {
  const calls = [];
  const fields = await buildCreatePublicContentTranslationFields(
    { description: null, title: "Piscina" },
    createTranslator(TRANSLATION, calls),
    "feature",
  );

  assert.deepEqual(calls, [
    {
      input: { description: null, title: "Piscina" },
      options: { context: "feature" },
    },
  ]);
  assert.deepEqual(fields, {
    descriptionDe: null,
    descriptionEn: null,
    titleDe: "Titel DE",
    titleEn: "Title EN",
  });

  assert.deepEqual(
    await buildCreatePublicContentTranslationFields(
      { description: null, title: "Piscina" },
      createTranslator(null),
      "feature",
    ),
    {
      descriptionDe: null,
      descriptionEn: null,
      titleDe: null,
      titleEn: null,
    },
  );
});

test("update project preserves unchanged fields and nulls failed changed description", async () => {
  const fields = await buildUpdatePublicContentTranslationFields({
    context: "project",
    next: { description: "Descripcion proyecto nueva ES", title: "Titulo ES" },
    previous: PREVIOUS,
    translator: createTranslator(null),
  });

  assert.deepEqual(fields, {
    descriptionDe: null,
    descriptionEn: null,
    titleDe: "Titulo anterior DE",
    titleEn: "Previous title EN",
  });
});

test("translation response normalization rejects invalid shapes and empty strings", () => {
  assert.equal(normalizePublicContentTranslations({ en: {}, de: {} }), null);
  assert.deepEqual(
    normalizePublicContentTranslations({
      de: { description: "   ", title: "Titel DE" },
      en: { description: "Description EN", title: "" },
    }),
    {
      de: { description: null, title: "Titel DE" },
      en: { description: "Description EN", title: null },
    },
  );
});
