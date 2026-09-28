import assert from "node:assert/strict";
import test from "node:test";
import {
  createInquiryAttribution,
  getFirstTouchInquiryAttribution,
  resetInquiryAttribution,
} from "../src/features/inquiries/inquiry-attribution.ts";
import { validatePublicInquiryPayload } from "../src/features/inquiries/inquiries.form.ts";

const PROPERTY_ID = "11111111-1111-4111-8111-111111111111";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";

function createMemoryStorage(initialValue = null) {
  let value = initialValue;

  return {
    getItem() {
      return value;
    },
    removeItem() {
      value = null;
    },
    setItem(_key, nextValue) {
      value = nextValue;
    },
  };
}

function createThrowingStorage() {
  return {
    getItem() {
      throw new Error("storage unavailable");
    },
    setItem() {
      throw new Error("storage unavailable");
    },
  };
}

function createBasePayload(overrides = {}) {
  return {
    kind: "general",
    name: "Maria Test",
    email: "maria@example.com",
    phone: "099123456",
    message: "Quisiera recibir mas informacion sobre esta consulta.",
    relatedTitle: "Noticia de prueba",
    originPath: "/noticias/demo",
    ...overrides,
  };
}

test("captures full UTM attribution", () => {
  const attribution = createInquiryAttribution({
    documentReferrer: "https://google.com/search",
    locationPathname: "/comprar/demo",
    locationSearch: "?utm_source=google&utm_medium=cpc&utm_campaign=lanzamiento",
  });

  assert.deepEqual(attribution, {
    source: "google",
    medium: "cpc",
    campaign: "lanzamiento",
    referrer: "https://google.com/search",
    landingPage: "/comprar/demo?utm_source=google&utm_medium=cpc&utm_campaign=lanzamiento",
  });
});

test("initial UTM is persisted in session storage", () => {
  const sessionStorage = createMemoryStorage();

  const attribution = getFirstTouchInquiryAttribution(
    {
      documentReferrer: "https://instagram.com/",
      locationPathname: "/",
      locationSearch: "?utm_source=instagram&utm_medium=social&utm_campaign=prueba",
    },
    sessionStorage,
  );
  const storedAttribution = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/otra",
      locationSearch: "",
    },
    sessionStorage,
  );

  assert.equal(attribution.source, "instagram");
  assert.deepEqual(storedAttribution, attribution);
});

test("refresh keeps first-touch attribution in the same session", () => {
  const sessionStorage = createMemoryStorage();
  const firstLoad = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/",
      locationSearch: "?utm_source=instagram&utm_medium=social&utm_campaign=prueba",
    },
    sessionStorage,
  );
  const refreshedPage = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/",
      locationSearch: "",
    },
    sessionStorage,
  );

  assert.deepEqual(refreshedPage, firstLoad);
  assert.equal(refreshedPage.landingPage, "/?utm_source=instagram&utm_medium=social&utm_campaign=prueba");
});

test("keeps first-touch attribution after navigation", () => {
  const storage = createMemoryStorage();
  const firstTouch = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/comprar",
      locationSearch: "?utm_source=instagram&utm_medium=social&utm_campaign=septiembre",
    },
    storage,
  );
  const secondPage = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/inversion/proyecto",
      locationSearch: "?utm_source=google",
    },
    storage,
  );

  assert.equal(firstTouch.source, "instagram");
  assert.deepEqual(secondPage, firstTouch);
});

test("later sidebar read returns initially captured first-touch values", () => {
  const storage = createMemoryStorage();

  getFirstTouchInquiryAttribution(
    {
      documentReferrer: "https://instagram.com/",
      locationPathname: "/",
      locationSearch: "?utm_source=instagram&utm_medium=social&utm_campaign=prueba",
    },
    storage,
  );

  const sidebarRead = getFirstTouchInquiryAttribution(
    {
      documentReferrer: "",
      locationPathname: "/comprar/casa-demo",
      locationSearch: "",
    },
    storage,
  );

  assert.deepEqual(sidebarRead, {
    source: "instagram",
    medium: "social",
    campaign: "prueba",
    referrer: "https://instagram.com/",
    landingPage: "/?utm_source=instagram&utm_medium=social&utm_campaign=prueba",
  });
});

test("does not overwrite first-touch with empty later values", () => {
  const storage = createMemoryStorage();

  const initial = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/",
      locationSearch: "?utm_source=instagram&utm_medium=social&utm_campaign=prueba",
    },
    storage,
  );
  const later = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/alquileres/demo",
      locationSearch: "",
    },
    storage,
  );

  assert.deepEqual(later, initial);
  assert.equal(later.landingPage, "/?utm_source=instagram&utm_medium=social&utm_campaign=prueba");
});

test("reset helper clears persisted attribution for tests", () => {
  const storage = createMemoryStorage();

  getFirstTouchInquiryAttribution(
    {
      locationPathname: "/",
      locationSearch: "?utm_source=instagram",
    },
    storage,
  );
  resetInquiryAttribution(storage);
  const nextTouch = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/comprar",
      locationSearch: "?utm_source=google",
    },
    storage,
  );

  assert.equal(nextTouch.source, "google");
  assert.equal(nextTouch.landingPage, "/comprar?utm_source=google");
});

test("clean session allows new attribution", () => {
  const firstSessionStorage = createMemoryStorage();
  const secondSessionStorage = createMemoryStorage();

  const firstSession = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/",
      locationSearch: "?utm_source=instagram",
    },
    firstSessionStorage,
  );
  const secondSession = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/",
      locationSearch: "?utm_source=google",
    },
    secondSessionStorage,
  );

  assert.equal(firstSession.source, "instagram");
  assert.equal(secondSession.source, "google");
});

test("blocked storage does not break attribution capture", () => {
  const attribution = getFirstTouchInquiryAttribution(
    {
      locationPathname: "/alquileres/demo",
      locationSearch: "?utm_source=newsletter",
    },
    createThrowingStorage(),
  );

  assert.equal(attribution.source, "newsletter");
  assert.equal(attribution.landingPage, "/alquileres/demo?utm_source=newsletter");
});

test("old payload without tracking remains valid", () => {
  const validation = validatePublicInquiryPayload(createBasePayload());

  assert.equal(validation.ok, true);
  assert.equal(validation.data?.source, null);
  assert.equal(validation.data?.intent, null);
});

test("advisory general payload is valid without entity or news related title", () => {
  const validation = validatePublicInquiryPayload({
    kind: "general",
    intent: "advisory",
    name: "Maria Test",
    email: "maria@example.com",
    phone: "099123456",
    message: "Quisiera coordinar una reunión de asesoramiento.",
    originPath: "/asesoramiento",
  });

  assert.equal(validation.ok, true);
  assert.equal(validation.data?.kind, "general");
  assert.equal(validation.data?.intent, "advisory");
  assert.equal(validation.data?.propertyId, null);
  assert.equal(validation.data?.projectId, null);
  assert.equal(validation.data?.relatedTitle, null);
});

test("direct general intents are valid without entity or news related title", () => {
  const intents = [
    ["advisory", "Quisiera coordinar una reunión de asesoramiento."],
    ["contact", "Quisiera enviar una consulta desde contacto."],
    ["sell", "Quisiera vender una propiedad y recibir asesoramiento."],
    ["valuation", "Quisiera solicitar una tasación profesional."],
    ["investment", "Quisiera evaluar una oportunidad de inversión inmobiliaria."],
    ["professional_report", "Quisiera solicitar un informe profesional inmobiliario."],
  ];

  for (const [intent, message] of intents) {
    const validation = validatePublicInquiryPayload({
      kind: "general",
      intent,
      name: "Maria Test",
      email: "maria@example.com",
      phone: "099123456",
      message,
      originPath: "/asesoramiento",
    });

    assert.equal(validation.ok, true, `${intent} should be valid`);
    assert.equal(validation.data?.kind, "general");
    assert.equal(validation.data?.intent, intent);
    assert.equal(validation.data?.propertyId, null);
    assert.equal(validation.data?.projectId, null);
    assert.equal(validation.data?.relatedTitle, null);
  }
});

test("advisory payload keeps tracking metadata", () => {
  const attribution = {
    source: "instagram",
    medium: "social",
    campaign: "asesoramiento",
    referrer: "https://instagram.com/",
    landingPage: "/?utm_source=instagram&utm_medium=social&utm_campaign=asesoramiento",
  };
  const validation = validatePublicInquiryPayload({
    kind: "general",
    intent: "advisory",
    name: "Maria Test",
    email: "maria@example.com",
    phone: "",
    message: "Quisiera coordinar una reunión de asesoramiento.",
    originPath: "/asesoramiento",
    ...attribution,
  });

  assert.equal(validation.ok, true);
  assert.equal(validation.data?.source, attribution.source);
  assert.equal(validation.data?.medium, attribution.medium);
  assert.equal(validation.data?.campaign, attribution.campaign);
  assert.equal(validation.data?.referrer, attribution.referrer);
  assert.equal(validation.data?.landingPage, attribution.landingPage);
});

test("contact general payload is valid without entity or news related title", () => {
  const validation = validatePublicInquiryPayload({
    kind: "general",
    intent: "contact",
    name: "Maria Test",
    email: "maria@example.com",
    phone: "099123456",
    message: "Quisiera enviar una consulta desde contacto.",
    originPath: "/contacto",
  });

  assert.equal(validation.ok, true);
  assert.equal(validation.data?.kind, "general");
  assert.equal(validation.data?.intent, "contact");
  assert.equal(validation.data?.propertyId, null);
  assert.equal(validation.data?.projectId, null);
  assert.equal(validation.data?.relatedTitle, null);
});

test("contact payload keeps tracking metadata", () => {
  const attribution = {
    source: "google",
    medium: "organic",
    campaign: "marca",
    referrer: "https://google.com/",
    landingPage: "/?utm_source=google&utm_medium=organic&utm_campaign=marca",
  };
  const validation = validatePublicInquiryPayload({
    kind: "general",
    intent: "contact",
    name: "Maria Test",
    email: "maria@example.com",
    phone: "",
    message: "Quisiera enviar una consulta desde contacto.",
    originPath: "/contacto",
    ...attribution,
  });

  assert.equal(validation.ok, true);
  assert.equal(validation.data?.source, attribution.source);
  assert.equal(validation.data?.medium, attribution.medium);
  assert.equal(validation.data?.campaign, attribution.campaign);
  assert.equal(validation.data?.referrer, attribution.referrer);
  assert.equal(validation.data?.landingPage, attribution.landingPage);
});

test("metadata reaches backend validation and empty strings become null", () => {
  const validation = validatePublicInquiryPayload(createBasePayload({
    intent: "investment",
    source: " google ",
    medium: "",
    campaign: " lanzamiento ",
    referrer: "   ",
    landingPage: "/comprar?utm_source=google",
  }));

  assert.equal(validation.ok, true);
  assert.equal(validation.data?.intent, "investment");
  assert.equal(validation.data?.source, "google");
  assert.equal(validation.data?.medium, null);
  assert.equal(validation.data?.campaign, "lanzamiento");
  assert.equal(validation.data?.referrer, null);
  assert.equal(validation.data?.landingPage, "/comprar?utm_source=google");
});

test("professional report payload keeps tracking metadata", () => {
  const attribution = {
    source: "linkedin",
    medium: "social",
    campaign: "informes",
    referrer: "https://linkedin.com/",
    landingPage: "/asesoramiento?utm_source=linkedin&utm_medium=social&utm_campaign=informes",
  };
  const validation = validatePublicInquiryPayload({
    kind: "general",
    intent: "professional_report",
    name: "Maria Test",
    email: "maria@example.com",
    phone: "099123456",
    message: "Quisiera solicitar un informe profesional inmobiliario.",
    originPath: "/asesoramiento",
    ...attribution,
  });

  assert.equal(validation.ok, true);
  assert.equal(validation.data?.intent, "professional_report");
  assert.equal(validation.data?.source, attribution.source);
  assert.equal(validation.data?.medium, attribution.medium);
  assert.equal(validation.data?.campaign, attribution.campaign);
  assert.equal(validation.data?.referrer, attribution.referrer);
  assert.equal(validation.data?.landingPage, attribution.landingPage);
});

test("current property, project, and general inquiry payloads stay valid", () => {
  const propertyValidation = validatePublicInquiryPayload(createBasePayload({
    kind: "property",
    propertyId: PROPERTY_ID,
    projectId: "",
    relatedTitle: "Casa demo",
    originPath: "/comprar/casa-demo",
  }));
  const projectValidation = validatePublicInquiryPayload(createBasePayload({
    kind: "project",
    projectId: PROJECT_ID,
    propertyId: "",
    relatedTitle: "Proyecto demo",
    originPath: "/inversion/proyecto-demo",
  }));
  const generalValidation = validatePublicInquiryPayload(createBasePayload());
  const legacyNewsValidation = validatePublicInquiryPayload(createBasePayload({
    kind: "general",
    intent: "",
    relatedTitle: "Noticia legacy",
    originPath: "/noticias/noticia-legacy",
  }));

  assert.equal(propertyValidation.ok, true);
  assert.equal(projectValidation.ok, true);
  assert.equal(generalValidation.ok, true);
  assert.equal(legacyNewsValidation.ok, true);
});

test("legacy general news payload still requires related title", () => {
  const validation = validatePublicInquiryPayload({
    kind: "general",
    name: "Maria Test",
    email: "maria@example.com",
    phone: "099123456",
    message: "Quisiera recibir mas informacion sobre esta noticia.",
    originPath: "/noticias/demo",
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.error, "El origen de la consulta no es válido.");
});
