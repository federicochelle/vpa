import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

const projectRoot = process.cwd();

// Loads the real route handler with its external dependencies swapped for stubs,
// so the tests exercise the actual ordering of the BotID check, honeypot and save.
async function loadRoute() {
  const dir = mkdtempSync(path.join(tmpdir(), "inquiries-route-"));
  const state = { botError: null, botVerdict: { isBot: false }, botChecks: 0, created: [] };
  globalThis.__inquiryRouteTestState = state;

  writeFileSync(
    path.join(dir, "botid-server.ts"),
    `export async function checkBotId() {
  const state = globalThis.__inquiryRouteTestState;
  state.botChecks += 1;
  if (state.botError) {
    throw state.botError;
  }
  return state.botVerdict;
}\n`,
  );
  writeFileSync(
    path.join(dir, "next-server.ts"),
    `export const NextResponse = {
  json: (body: unknown, init?: ResponseInit) => Response.json(body, init),
};\n`,
  );
  writeFileSync(
    path.join(dir, "inquiries-data.ts"),
    `export async function createPublicInquiry(input: unknown) {
  globalThis.__inquiryRouteTestState.created.push(input);
  return { ok: true, error: null, message: "ok" };
}\n`,
  );
  writeFileSync(
    path.join(dir, "honeypot.ts"),
    `export const INQUIRY_HONEYPOT_FIELD_NAME = "website";\n`,
  );

  const formPath = path.join(projectRoot, "src/features/inquiries/inquiries.form.ts");
  const source = readFileSync(path.join(projectRoot, "src/app/api/inquiries/route.ts"), "utf8")
    .replace('"botid/server"', '"./botid-server.ts"')
    .replace('"next/server"', '"./next-server.ts"')
    .replace('"@/features/inquiries/inquiries.data"', '"./inquiries-data.ts"')
    .replace('"@/features/inquiries/inquiries.form"', JSON.stringify(pathToFileURL(formPath).href))
    .replace('"@/features/inquiries/inquiry-honeypot-field"', '"./honeypot.ts"');
  writeFileSync(path.join(dir, "route.ts"), source);

  const route = await import(pathToFileURL(path.join(dir, "route.ts")).href);
  return { POST: route.POST, state };
}

function buildRequest(overrides = {}) {
  return new Request("http://localhost/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "general",
      intent: "contact",
      name: "Ana Pérez",
      email: "ana@example.com",
      phone: "099123456",
      message: "Quisiera más información sobre una propiedad.",
      originPath: "/contacto",
      ...overrides,
    }),
  });
}

test("a request classified as a bot gets 403 and nothing is saved", async () => {
  const { POST, state } = await loadRoute();
  state.botVerdict = { isBot: true };

  const response = await POST(buildRequest());
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.message, "No pudimos procesar tu consulta. Intentá de nuevo.");
  assert.equal(state.created.length, 0);
});

test("the bot check runs before the payload is validated", async () => {
  const { POST, state } = await loadRoute();
  state.botVerdict = { isBot: true };

  const response = await POST(buildRequest({ email: "no-es-un-email", name: "" }));

  assert.equal(response.status, 403);
  assert.equal(state.botChecks, 1);
});

test("a filled honeypot is indistinguishable from a real success and saves nothing", async () => {
  const { POST, state } = await loadRoute();

  const realResponse = await POST(buildRequest());
  const realBody = await realResponse.json();
  assert.equal(state.created.length, 1);

  const trapResponse = await POST(buildRequest({ website: "http://spam.example" }));
  const trapBody = await trapResponse.json();

  assert.equal(trapResponse.status, 201);
  assert.equal(trapResponse.status, realResponse.status);
  assert.deepEqual(trapBody, realBody);
  assert.equal(state.created.length, 1);
});

test("a BotID error does not block the inquiry, which is still saved", async () => {
  const { POST, state } = await loadRoute();
  state.botError = new Error("The 'x-vercel-oidc-token' header is missing");
  const logged = [];
  const originalError = console.error;
  console.error = (...args) => logged.push(args);

  try {
    const response = await POST(buildRequest());

    assert.equal(response.status, 201);
    assert.equal(state.created.length, 1);
    assert.ok(
      logged.some(([message]) => String(message).includes("BotID check failed, allowing request")),
    );
  } finally {
    console.error = originalError;
  }
});

test("a BotID error still runs the honeypot and validation", async () => {
  const { POST, state } = await loadRoute();
  state.botError = new Error("missing OIDC");
  const originalError = console.error;
  console.error = () => {};

  try {
    const trap = await POST(buildRequest({ website: "http://spam.example" }));
    assert.equal(trap.status, 201);
    assert.equal(state.created.length, 0);

    const invalid = await POST(buildRequest({ email: "no-es-un-email" }));
    assert.equal(invalid.status, 400);
    assert.equal(state.created.length, 0);
  } finally {
    console.error = originalError;
  }
});

test("an empty honeypot and a human verdict save the inquiry", async () => {
  const { POST, state } = await loadRoute();

  const response = await POST(buildRequest({ website: "" }));

  assert.equal(response.status, 201);
  assert.equal(state.created.length, 1);
});

test("every public form renders the honeypot and sends it with the payload", () => {
  const forms = [
    "src/features/inquiries/contact-form-shell.tsx",
    "src/features/inquiries/advisory-contact-form.tsx",
    "src/components/inquiries/public-inquiry-sidebar.tsx",
    "src/features/inquiries/owner-lead-modal.tsx",
  ];

  for (const file of forms) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /<InquiryHoneypotField \/>/, `${file} renders the honeypot`);
    assert.match(source, /website: String\(/, `${file} sends the honeypot value`);
  }
});

test("BotID is wired for POST /api/inquiries only", () => {
  const client = readFileSync("instrumentation-client.ts", "utf8");
  assert.match(client, /path: "\/api\/inquiries"/);
  assert.match(client, /method: "POST"/);
  assert.equal((client.match(/path:/g) ?? []).length, 1);

  const config = readFileSync("next.config.ts", "utf8");
  assert.match(config, /export default withBotId\(nextConfig\)/);
});
