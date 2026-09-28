import type { PublicInquiryPayload } from "@/types/inquiry";

export type InquiryAttribution = Pick<
  PublicInquiryPayload,
  "campaign" | "landingPage" | "medium" | "referrer" | "source"
>;

interface AttributionEnvironment {
  documentReferrer?: string;
  locationPathname?: string;
  locationSearch?: string;
}

interface AttributionStorage {
  getItem: (key: string) => string | null;
  removeItem?: (key: string) => void;
  setItem: (key: string, value: string) => void;
}

const ATTRIBUTION_STORAGE_KEY = "vpa:first-touch-attribution:session";

function toNullableString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function normalizeAttribution(value: unknown): InquiryAttribution {
  if (typeof value !== "object" || value === null) {
    return {
      campaign: null,
      landingPage: null,
      medium: null,
      referrer: null,
      source: null,
    };
  }

  const record = value as Record<string, unknown>;
  return {
    campaign: toNullableString(record.campaign, 120),
    landingPage: toNullableString(record.landingPage, 1000),
    medium: toNullableString(record.medium, 120),
    referrer: toNullableString(record.referrer, 1000),
    source: toNullableString(record.source, 120),
  };
}

export function createInquiryAttribution(
  environment: AttributionEnvironment,
): InquiryAttribution {
  const locationPathname = environment.locationPathname || "/";
  const locationSearch = environment.locationSearch || "";
  const searchParams = new URLSearchParams(
    locationSearch.startsWith("?") ? locationSearch.slice(1) : locationSearch,
  );

  return normalizeAttribution({
    campaign: searchParams.get("utm_campaign"),
    landingPage: `${locationPathname}${locationSearch}`,
    medium: searchParams.get("utm_medium"),
    referrer: environment.documentReferrer,
    source: searchParams.get("utm_source"),
  });
}

export function readStoredInquiryAttribution(
  storage: AttributionStorage,
): InquiryAttribution | null {
  const storedValue = storage.getItem(ATTRIBUTION_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return normalizeAttribution(JSON.parse(storedValue));
  } catch {
    return null;
  }
}

export function getFirstTouchInquiryAttribution(
  environment: AttributionEnvironment,
  storage?: AttributionStorage | null,
): InquiryAttribution {
  if (storage) {
    try {
      const storedAttribution = readStoredInquiryAttribution(storage);

      if (storedAttribution) {
        return storedAttribution;
      }
    } catch {
      // Storage can be unavailable in private modes or blocked browsers.
    }
  }

  const attribution = createInquiryAttribution(environment);

  if (storage) {
    try {
      storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // Attribution is nice to have; forms must continue working without storage.
    }
  }

  return attribution;
}

export function resetInquiryAttribution(storage: AttributionStorage) {
  try {
    storage.removeItem?.(ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Test and browser helpers should be resilient to unavailable storage.
  }
}

export function getClientInquiryAttribution(): InquiryAttribution {
  if (typeof window === "undefined") {
    return {
      campaign: null,
      landingPage: null,
      medium: null,
      referrer: null,
      source: null,
    };
  }

  let storage: Storage | null = null;

  try {
    storage = window.sessionStorage;
  } catch {
    storage = null;
  }

  return getFirstTouchInquiryAttribution(
    {
      documentReferrer: typeof document === "undefined" ? "" : document.referrer,
      locationPathname: window.location.pathname,
      locationSearch: window.location.search,
    },
    storage,
  );
}

export function initializeClientInquiryAttribution() {
  getClientInquiryAttribution();
}
