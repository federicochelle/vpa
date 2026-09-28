import assert from "node:assert/strict";
import test from "node:test";
import {
  getLocalizedProjectDescription,
  getLocalizedProjectName,
  getLocalizedPropertyDescription,
  getLocalizedPropertyTitle,
  getLocalizedFeatureName,
} from "../src/i18n/public/content.ts";

const PROPERTY = {
  title: "Titulo ES",
  titleEn: "Title EN",
  titleDe: "Titel DE",
  description: "Descripcion ES",
  descriptionEn: "Description EN",
  descriptionDe: "Beschreibung DE",
};

const PROJECT = {
  name: "Proyecto ES",
  nameEn: "Project EN",
  nameDe: "Projekt DE",
  description: "Descripcion proyecto ES",
  descriptionEn: "Project description EN",
  descriptionDe: "Projektbeschreibung DE",
};

const FEATURE = {
  name: "Piscina",
  nameEn: "Swimming pool",
  nameDe: "Swimmingpool",
};

test("property localization uses Spanish originals for es", () => {
  assert.equal(getLocalizedPropertyTitle(PROPERTY, "es"), "Titulo ES");
  assert.equal(getLocalizedPropertyDescription(PROPERTY, "es"), "Descripcion ES");
});

test("property localization uses English fields for en", () => {
  assert.equal(getLocalizedPropertyTitle(PROPERTY, "en"), "Title EN");
  assert.equal(getLocalizedPropertyDescription(PROPERTY, "en"), "Description EN");
});

test("property localization uses German fields for de", () => {
  assert.equal(getLocalizedPropertyTitle(PROPERTY, "de"), "Titel DE");
  assert.equal(getLocalizedPropertyDescription(PROPERTY, "de"), "Beschreibung DE");
});

test("property localization falls back to Spanish for empty, null, and whitespace translations", () => {
  assert.equal(
    getLocalizedPropertyTitle({ ...PROPERTY, titleEn: "" }, "en"),
    "Titulo ES",
  );
  assert.equal(
    getLocalizedPropertyDescription({ ...PROPERTY, descriptionDe: null }, "de"),
    "Descripcion ES",
  );
  assert.equal(
    getLocalizedPropertyDescription({ ...PROPERTY, descriptionEn: "   " }, "en"),
    "Descripcion ES",
  );
});

test("project localization uses Spanish originals for es", () => {
  assert.equal(getLocalizedProjectName(PROJECT, "es"), "Proyecto ES");
  assert.equal(getLocalizedProjectDescription(PROJECT, "es"), "Descripcion proyecto ES");
});

test("project localization uses English fields for en", () => {
  assert.equal(getLocalizedProjectName(PROJECT, "en"), "Project EN");
  assert.equal(getLocalizedProjectDescription(PROJECT, "en"), "Project description EN");
});

test("project localization uses German fields for de", () => {
  assert.equal(getLocalizedProjectName(PROJECT, "de"), "Projekt DE");
  assert.equal(getLocalizedProjectDescription(PROJECT, "de"), "Projektbeschreibung DE");
});

test("project localization falls back to Spanish for empty, null, and whitespace translations", () => {
  assert.equal(
    getLocalizedProjectName({ ...PROJECT, nameEn: "" }, "en"),
    "Proyecto ES",
  );
  assert.equal(
    getLocalizedProjectDescription({ ...PROJECT, descriptionDe: null }, "de"),
    "Descripcion proyecto ES",
  );
  assert.equal(
    getLocalizedProjectDescription({ ...PROJECT, descriptionEn: "   " }, "en"),
    "Descripcion proyecto ES",
  );
});

test("feature localization uses translated names by locale", () => {
  assert.equal(getLocalizedFeatureName(FEATURE, "es"), "Piscina");
  assert.equal(getLocalizedFeatureName(FEATURE, "en"), "Swimming pool");
  assert.equal(getLocalizedFeatureName(FEATURE, "de"), "Swimmingpool");
});

test("feature localization falls back to Spanish for empty translations", () => {
  assert.equal(getLocalizedFeatureName({ ...FEATURE, nameEn: "   " }, "en"), "Piscina");
  assert.equal(getLocalizedFeatureName({ ...FEATURE, nameDe: null }, "de"), "Piscina");
});
