import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { INQUIRY_STATUS_OPTIONS, isInquiryStatus } from "../src/features/inquiries/inquiry-status.ts";

test("inquiry status values match the database contract", () => {
  assert.deepEqual(
    INQUIRY_STATUS_OPTIONS.map((option) => option.value),
    ["new", "contacted", "closed"],
  );
  assert.equal(isInquiryStatus("new"), true);
  assert.equal(isInquiryStatus("contacted"), true);
  assert.equal(isInquiryStatus("closed"), true);
  assert.equal(isInquiryStatus("confirmed"), false);
});

test("the inline selector prevents concurrent submissions and restores failures", () => {
  const source = readFileSync("src/features/inquiries/admin-inquiries-table.tsx", "utf8");
  assert.match(source, /disabled=\{isPending\}/);
  assert.match(source, /if \(isPending \|\| nextStatus === selectedStatus\)/);
  assert.match(source, /setSelectedStatus\(previousStatus\)/);
  assert.match(source, /router\.refresh\(\)/);
});

test("a missing updated row is not reported as a successful status change", () => {
  const source = readFileSync("src/features/inquiries/inquiries.data.ts", "utf8");
  assert.match(source, /if \(!data\)/);
  assert.match(source, /No se encontró la consulta o no se pudo confirmar el cambio/);
});
