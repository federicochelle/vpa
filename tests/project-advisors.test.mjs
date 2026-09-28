import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  canDeactivateProjectAdvisor,
  resolveProjectAdvisorFallback,
} from "../src/features/projects/project-advisors.ts";
import { buildProjectAdvisorInput } from "../src/features/projects/project-advisors.form.ts";
import {
  buildProjectAdvisorInsertPayload,
  buildProjectAdvisorUpdatePayload,
} from "../src/features/projects/project-advisor-mutation-payloads.ts";
import { buildProjectUpdatePayload } from "../src/features/projects/project-mutation-payloads.ts";

const VIRGINIA_ADVISOR = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Virginia",
  phone: "",
  whatsapp: "",
  email: null,
  photoUrl: null,
  active: true,
  isDefault: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const RAUL_ADVISOR = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Raúl",
  phone: "",
  whatsapp: "",
  email: null,
  photoUrl: null,
  active: true,
  isDefault: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const INACTIVE_ASSIGNED_ADVISOR = {
  ...RAUL_ADVISOR,
  active: false,
};

function createProjectInput(overrides = {}) {
  return {
    advisorId: VIRGINIA_ADVISOR.id,
    name: "Proyecto Test",
    slug: "proyecto-test",
    description: "Descripcion",
    videoUrl: null,
    developerName: null,
    constructionStatus: "presale",
    estimatedDeliveryDate: null,
    address: null,
    neighborhood: null,
    city: null,
    department: null,
    latitude: null,
    longitude: null,
    published: true,
    featured: false,
    isInvestmentOpportunity: true,
    ...overrides,
  };
}

function createAdvisorInput(overrides = {}) {
  return {
    name: "Nuevo Asesor",
    phone: "099 111 222",
    whatsapp: "59899111222",
    email: "asesor@example.com",
    photoUrl: "https://example.com/foto.jpg",
    active: true,
    isDefault: false,
    ...overrides,
  };
}

test("resolves a project advisor assigned to Virginia", () => {
  const advisor = resolveProjectAdvisorFallback(VIRGINIA_ADVISOR, [
    VIRGINIA_ADVISOR,
    RAUL_ADVISOR,
  ]);

  assert.equal(advisor?.name, "Virginia");
});

test("resolves a project advisor assigned to Raúl", () => {
  const advisor = resolveProjectAdvisorFallback(RAUL_ADVISOR, [
    VIRGINIA_ADVISOR,
    RAUL_ADVISOR,
  ]);

  assert.equal(advisor?.name, "Raúl");
});

test("falls back to Virginia when a project has no advisor", () => {
  const advisor = resolveProjectAdvisorFallback(null, [
    VIRGINIA_ADVISOR,
    RAUL_ADVISOR,
  ]);

  assert.equal(advisor?.name, "Virginia");
});

test("inactive assigned advisor falls back to the active default", () => {
  const advisor = resolveProjectAdvisorFallback(INACTIVE_ASSIGNED_ADVISOR, [
    VIRGINIA_ADVISOR,
    INACTIVE_ASSIGNED_ADVISOR,
  ]);

  assert.equal(advisor?.id, VIRGINIA_ADVISOR.id);
});

test("properties use the same advisor fallback logic as projects", () => {
  const propertyWithSpecificAdvisor = resolveProjectAdvisorFallback(RAUL_ADVISOR, [
    VIRGINIA_ADVISOR,
    RAUL_ADVISOR,
  ]);
  const legacyPropertyWithoutAdvisor = resolveProjectAdvisorFallback(null, [
    VIRGINIA_ADVISOR,
    RAUL_ADVISOR,
  ]);
  const propertyWithInactiveAdvisor = resolveProjectAdvisorFallback(
    INACTIVE_ASSIGNED_ADVISOR,
    [VIRGINIA_ADVISOR, INACTIVE_ASSIGNED_ADVISOR],
  );

  assert.equal(propertyWithSpecificAdvisor?.id, RAUL_ADVISOR.id);
  assert.equal(legacyPropertyWithoutAdvisor?.id, VIRGINIA_ADVISOR.id);
  assert.equal(propertyWithInactiveAdvisor?.id, VIRGINIA_ADVISOR.id);
});

test("default advisor cannot be deactivated by the simple guard", () => {
  assert.equal(canDeactivateProjectAdvisor(VIRGINIA_ADVISOR), false);
  assert.equal(canDeactivateProjectAdvisor(RAUL_ADVISOR), true);
});

test("editing a project saves advisor_id in the update payload", () => {
  const payload = buildProjectUpdatePayload(
    createProjectInput({ advisorId: VIRGINIA_ADVISOR.id }),
    { published: true, slug: "proyecto-test" },
  );

  assert.equal(payload.advisor_id, VIRGINIA_ADVISOR.id);
});

test("changing a project advisor updates advisor_id in the update payload", () => {
  const payload = buildProjectUpdatePayload(
    createProjectInput({ advisorId: RAUL_ADVISOR.id }),
    { published: true, slug: "proyecto-test" },
  );

  assert.equal(payload.advisor_id, RAUL_ADVISOR.id);
});

test("advisor form input supports create and edit values", () => {
  const formData = new FormData();
  formData.set("name", "Nuevo Asesor");
  formData.set("phone", "099 111 222");
  formData.set("whatsapp", "59899111222");
  formData.set("email", "asesor@example.com");
  formData.set("photoUrl", "https://example.com/foto.jpg");
  formData.set("active", "on");
  formData.set("isDefault", "on");

  assert.deepEqual(buildProjectAdvisorInput(formData), {
    name: "Nuevo Asesor",
    phone: "099 111 222",
    whatsapp: "59899111222",
    email: "asesor@example.com",
    photoUrl: "https://example.com/foto.jpg",
    active: true,
    isDefault: true,
  });
});

test("CRUD payloads create and edit advisors correctly", () => {
  const input = createAdvisorInput({ isDefault: true });

  assert.deepEqual(buildProjectAdvisorInsertPayload(input), {
    name: "Nuevo Asesor",
    phone: "099 111 222",
    whatsapp: "59899111222",
    email: "asesor@example.com",
    photo_url: "https://example.com/foto.jpg",
    active: true,
    is_default: false,
  });

  assert.deepEqual(buildProjectAdvisorUpdatePayload(input, { isDefault: true }), {
    name: "Nuevo Asesor",
    phone: "099 111 222",
    whatsapp: "59899111222",
    email: "asesor@example.com",
    photo_url: "https://example.com/foto.jpg",
    active: true,
    is_default: true,
  });
});

test("database migration enforces a single default advisor", () => {
  const migration = readFileSync("supabase/migrations/016_project_advisors_default.sql", "utf8");

  assert.match(migration, /add column is_default boolean not null default false/);
  assert.match(migration, /create unique index if not exists idx_project_advisors_single_default/);
  assert.match(migration, /where is_default = true/);
});

test("public inquiry sidebar does not depend on Virginia fallback assets", () => {
  const sidebar = readFileSync("src/components/inquiries/public-inquiry-sidebar.tsx", "utf8");

  assert.doesNotMatch(sidebar, /virginia\.jpeg/i);
  assert.doesNotMatch(sidebar, /name:\s*["']Virginia["']/);
});

test("project edit selector keeps default fallback explicit instead of using first advisor", () => {
  const form = readFileSync("src/features/projects/project-form.tsx", "utf8");

  assert.match(form, /<option value="">Asesor por defecto<\/option>/);
  assert.doesNotMatch(form, /advisorOptions\[0\]/);
});

test("property advisor migration reuses project_advisors table", () => {
  const migration = readFileSync("supabase/migrations/018_property_advisors.sql", "utf8");

  assert.match(migration, /alter table public\.properties/);
  assert.match(migration, /add column advisor_id uuid references public\.project_advisors \(id\) on delete set null/);
  assert.match(migration, /idx_properties_advisor_id/);
});

test("property create and edit forms expose advisor selector without first-item default", () => {
  const form = readFileSync("src/features/properties/property-form.tsx", "utf8");
  const newPage = readFileSync("src/app/admin/propiedades/nueva/page.tsx", "utf8");
  const editPage = readFileSync("src/app/admin/propiedades/[id]/editar/page.tsx", "utf8");

  assert.match(form, /name="advisorId"/);
  assert.match(form, /advisor\.isDefault/);
  assert.match(form, /<option value="">Asesor por defecto<\/option>/);
  assert.doesNotMatch(form, /advisorOptions\[0\]/);
  assert.match(newPage, /listActiveProjectAdvisors/);
  assert.match(editPage, /listActiveProjectAdvisors/);
});

test("property data persists advisor_id through create and update payloads", () => {
  const dataFile = readFileSync("src/features/properties/properties.data.ts", "utf8");
  const formFile = readFileSync("src/features/properties/properties.form.ts", "utf8");

  assert.match(formFile, /advisorId: toNullableUuid\(formData\.get\("advisorId"\), "asesor"\)/);
  assert.match(dataFile, /advisorId: string \| null/);
  assert.match(dataFile, /advisor_id: input\.advisorId/);
  assert.match(dataFile, /advisor_id: payload\.advisor_id/);
});

test("public property detail resolves advisor and passes it to inquiry sidebar", () => {
  const detail = readFileSync("src/features/properties/property-detail-shell.tsx", "utf8");

  assert.match(detail, /resolveProjectAdvisorForEntity\(property\)/);
  assert.match(detail, /advisor=\{advisor\}/);
});

test("advisor form reuses image upload helpers and cleans preview object URLs", () => {
  const form = readFileSync("src/features/projects/project-advisor-form.tsx", "utf8");

  assert.match(form, /prepareImageUploadFile/);
  assert.match(form, /IMAGE_INPUT_ACCEPT/);
  assert.match(form, /URL\.createObjectURL/);
  assert.match(form, /URL\.revokeObjectURL/);
  assert.match(form, /\/api\/admin\/project-advisors\/image\/direct-upload/);
  assert.doesNotMatch(form, /base64/i);
});

test("advisor image direct upload endpoint uses Cloudflare Images helpers", () => {
  const endpoint = readFileSync(
    "src/app/api/admin/project-advisors/image/direct-upload/route.ts",
    "utf8",
  );

  assert.match(endpoint, /createCloudflareDirectUploadUrl/);
  assert.match(endpoint, /buildCloudflareImageUrl/);
  assert.match(endpoint, /entity:\s*"project_advisor"/);
});
