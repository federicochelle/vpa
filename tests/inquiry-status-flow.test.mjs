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

test("deleteInquiry reports an error when no row was actually deleted", () => {
  const source = readFileSync("src/features/inquiries/inquiries.data.ts", "utf8");
  const start = source.indexOf("export async function deleteInquiry(");
  const body = source.slice(start, source.indexOf("export async function saveInquiryMeeting("));
  assert.match(body, /\.delete\(\)\s*\.eq\("id", id\)\s*\.select\("\*"\)\s*\.maybeSingle\(\)/);
  assert.match(body, /if \(!data\)[\s\S]*ok: false/);
  assert.match(body, /no se pudo confirmar la eliminación/);
});

test("deleteInquiryAction validates, blocks scheduled meetings and then deletes", () => {
  const source = readFileSync("src/features/inquiries/inquiries.actions.ts", "utf8");
  const start = source.indexOf("export async function deleteInquiryAction(");
  const body = source.slice(start, source.indexOf("export async function saveInquiryMeetingAction("));

  assert.match(body, /await requireAdminSession\(\)/);
  assert.match(body, /La consulta que intentás eliminar no existe/);
  assert.match(body, /meetingStatus === "scheduled"/);
  assert.match(
    body,
    /Esta consulta tiene una reunión agendada\. Cancelala antes de eliminar la consulta\./,
  );
  assert.ok(
    body.indexOf('meetingStatus === "scheduled"') < body.indexOf("await deleteInquiry(id)"),
    "the scheduled-meeting guard must run before the delete",
  );
  assert.match(body, /revalidatePath\("\/admin\/consultas"\)/);
  assert.match(body, /revalidatePath\("\/admin", "layout"\)/);
  assert.match(body, /if \(!result\.ok\)[\s\S]*\?error=/);
  assert.match(body, /\/admin\/consultas\?success=/);
});

test("the inquiry list shows success and error notices after a delete", () => {
  const source = readFileSync("src/app/admin/consultas/page.tsx", "utf8");
  assert.match(source, /query\.success/);
  assert.match(source, /query\.error/);
});
