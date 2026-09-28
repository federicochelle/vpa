import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPublicCommonExpenses,
  formatPublicDate,
  formatPublicNumber,
  formatPublicPropertyMoney,
  getConstructionStatusLabel,
  getOperationBadgeLabel,
  getPropertyTypeLabel,
} from "../src/i18n/public/formatters.ts";
import { getPublicMessage, publicMessages } from "../src/i18n/public/messages.ts";

test("German public messages are present for primary navigation and inquiry UI", () => {
  assert.equal(getPublicMessage("de", "nav.rent"), "MIETEN");
  assert.equal(getPublicMessage("de", "nav.buy"), "KAUFEN");
  assert.equal(getPublicMessage("de", "nav.advisory"), "BERATUNG");
  assert.equal(getPublicMessage("de", "inquiry.submit"), "Nachricht senden");
  assert.equal(getPublicMessage("de", "news.readMore"), "Mehr lesen");
});

test("German messages do not fall back to English for key public UI labels", () => {
  assert.notEqual(publicMessages.de["common.viewMore"], publicMessages.en["common.viewMore"]);
  assert.notEqual(publicMessages.de["property.pendingPrice"], publicMessages.en["property.pendingPrice"]);
  assert.notEqual(publicMessages.de["project.featured"], publicMessages.en["project.featured"]);
  assert.notEqual(publicMessages.de["advisory.schedule"], publicMessages.en["advisory.schedule"]);
});

test("German public enum formatters use German labels", () => {
  assert.equal(getOperationBadgeLabel("rent", "de"), "MIETE");
  assert.equal(getOperationBadgeLabel("sale", "de"), "KAUF");
  assert.equal(getPropertyTypeLabel("apartment", "de"), "Wohnung");
  assert.equal(getConstructionStatusLabel("construction", "de"), "Im Bau");
});

test("German public number, money, expenses and date formatters use de-DE", () => {
  assert.equal(formatPublicNumber(1234567, "de"), "1.234.567");
  assert.equal(formatPublicPropertyMoney(1234567, "USD", "de"), "USD 1.234.567");
  assert.equal(formatPublicCommonExpenses(1234567, "de"), "$ 1.234.567");
  assert.equal(formatPublicDate("2026-09-28T12:00:00.000Z", "de"), "28. September 2026");
});
