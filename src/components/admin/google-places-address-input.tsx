"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    __googleMapsInit?: () => void;
  }
}

interface GoogleMapsNamespace {
  maps?: {
    importLibrary?: (libraryName: string) => Promise<unknown>;
    places?: {
      PlaceAutocompleteElement?: GooglePlaceAutocompleteElementConstructor;
    };
  };
}

interface GooglePlaceAutocompleteElementConstructor {
  new (options?: GooglePlaceAutocompleteElementOptions): GooglePlaceAutocompleteElement;
}

interface GooglePlaceAutocompleteElementOptions {
  includedRegionCodes?: string[];
  name?: string;
  placeholder?: string;
  requestedLanguage?: string;
  requestedRegion?: string;
  value?: string;
}

interface GooglePlaceAutocompleteElement extends HTMLElement {
  disabled: boolean;
  includedRegionCodes?: string[];
  name?: string;
  noClearButton?: boolean;
  noInputIcon?: boolean;
  placeholder?: string;
  requestedLanguage?: string;
  requestedRegion?: string;
  value?: string;
}

interface GooglePlacePredictionSelectEvent extends Event {
  placePrediction?: {
    toPlace: () => GooglePlace;
  };
}

interface GooglePlace {
  addressComponents?: GoogleAddressComponent[];
  formattedAddress?: string;
  location?: GooglePlaceLocation;
  fetchFields: (payload: { fields: string[] }) => Promise<void>;
}

interface GoogleAddressComponent {
  longText?: string;
  shortText?: string;
  types: string[];
}

interface GooglePlaceLocation {
  lat: () => number;
  lng: () => number;
}

interface GooglePlacesAddressInputProps {
  id: string;
  name: string;
  defaultValue?: string | null;
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
  defaultCity?: string | null;
  defaultDepartment?: string | null;
  disabled?: boolean;
  className?: string;
}

let googleMapsLoader: Promise<void> | null = null;
let placesLibraryLoader: Promise<GooglePlaceAutocompleteElementConstructor> | null = null;

function getAddressComponentText(
  components: GoogleAddressComponent[] | undefined,
  types: string[],
) {
  for (const type of types) {
    const component = components?.find((item) => item.types.includes(type));
    const text = component?.longText?.trim() ?? component?.shortText?.trim();

    if (text) {
      return text;
    }
  }

  return null;
}

function getCityFromAddressComponents(components: GoogleAddressComponent[] | undefined) {
  // In Uruguay Google can return the city as a locality, postal town, or a lower admin area.
  return getAddressComponentText(components, [
    "locality",
    "postal_town",
    "administrative_area_level_3",
    "administrative_area_level_2",
    "sublocality_level_1",
  ]);
}

function getDepartmentFromAddressComponents(
  components: GoogleAddressComponent[] | undefined,
) {
  return getAddressComponentText(components, ["administrative_area_level_1"]);
}

function isGoogleMapsReady() {
  return Boolean(window.google?.maps?.importLibrary);
}

function loadGoogleMapsApi(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (isGoogleMapsReady()) {
    return Promise.resolve();
  }

  if (googleMapsLoader) {
    return googleMapsLoader;
  }

  googleMapsLoader = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-loader="true"]',
    );

    const handleReady = () => {
      if (isGoogleMapsReady()) {
        resolve();
        return;
      }

      reject(new Error("Google Maps cargó pero importLibrary no quedó disponible."));
    };

    const handleError = () => {
      reject(new Error("No se pudo cargar Google Maps JavaScript API."));
    };

    if (existingScript) {
      if (existingScript.dataset.googleMapsLoaded === "true") {
        handleReady();
        return;
      }

      existingScript.addEventListener("load", handleReady, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    window.__googleMapsInit = () => {
      const script = document.querySelector<HTMLScriptElement>(
        'script[data-google-maps-loader="true"]',
      );

      if (script) {
        script.dataset.googleMapsLoaded = "true";
      }

      handleReady();
    };

    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      "&v=weekly&loading=async&callback=__googleMapsInit";
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    googleMapsLoader = null;
    throw error;
  });

  return googleMapsLoader;
}

async function loadPlaceAutocompleteElement(apiKey: string) {
  await loadGoogleMapsApi(apiKey);

  if (window.google?.maps?.places?.PlaceAutocompleteElement) {
    return window.google.maps.places.PlaceAutocompleteElement;
  }

  if (placesLibraryLoader) {
    return placesLibraryLoader;
  }

  if (!window.google?.maps?.importLibrary) {
    throw new Error("Google Maps no expuso importLibrary para cargar Places API (New).");
  }

  placesLibraryLoader = window.google.maps
    .importLibrary("places")
    .then(() => {
      const constructor = window.google?.maps?.places?.PlaceAutocompleteElement;

      if (!constructor) {
        throw new Error("PlaceAutocompleteElement no quedó disponible tras importar places.");
      }

      return constructor;
    })
    .catch((error) => {
      placesLibraryLoader = null;
      throw error;
    });

  return placesLibraryLoader;
}

export function GooglePlacesAddressInput({
  id,
  name,
  defaultValue = "",
  defaultLatitude = null,
  defaultLongitude = null,
  defaultCity = null,
  defaultDepartment = null,
  disabled = false,
  className = "admin-input-base",
}: GooglePlacesAddressInputProps) {
  const autocompleteId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<GooglePlaceAutocompleteElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const latitudeInputRef = useRef<HTMLInputElement | null>(null);
  const longitudeInputRef = useRef<HTMLInputElement | null>(null);
  const cityInputRef = useRef<HTMLInputElement | null>(null);
  const departmentInputRef = useRef<HTMLInputElement | null>(null);
  const locationValuesRef = useRef({
    address: defaultValue ?? "",
    latitude: defaultLatitude,
    longitude: defaultLongitude,
    city: defaultCity,
    department: defaultDepartment,
  });

  function syncLocationValues({
    address,
    latitude,
    longitude,
    city,
    department,
  }: {
    address: string;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    department: string | null;
  }) {
    locationValuesRef.current = { address, latitude, longitude, city, department };

    if (addressInputRef.current) {
      addressInputRef.current.value = address;
    }

    if (latitudeInputRef.current) {
      latitudeInputRef.current.value = latitude?.toString() ?? "";
    }

    if (longitudeInputRef.current) {
      longitudeInputRef.current.value = longitude?.toString() ?? "";
    }

    if (cityInputRef.current) {
      cityInputRef.current.value = city ?? "";
    }

    if (departmentInputRef.current) {
      departmentInputRef.current.value = department ?? "";
    }
  }

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error(
        "Google Places API (New): falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, el campo Dirección queda sin autocomplete.",
      );
      return;
    }

    if (!containerRef.current) {
      return;
    }

    let isCancelled = false;
    let autocompleteElement: GooglePlaceAutocompleteElement | null = null;
    const initialValue = defaultValue ?? "";

    syncLocationValues({
      address: initialValue,
      latitude: defaultLatitude,
      longitude: defaultLongitude,
      city: defaultCity,
      department: defaultDepartment,
    });

    if (elementRef.current) {
      elementRef.current.value = initialValue;
    }

    function handleInput() {
      const nextValue = autocompleteElement?.value ?? "";

      if (nextValue === locationValuesRef.current.address) {
        return;
      }

      syncLocationValues({
        address: nextValue,
        latitude: null,
        longitude: null,
        city: null,
        department: null,
      });
    }

    async function handlePlaceSelect(event: Event) {
      const selectEvent = event as GooglePlacePredictionSelectEvent;
      const placePrediction = selectEvent.placePrediction;

      if (!placePrediction) {
        return;
      }

      try {
        const place = placePrediction.toPlace();
        await place.fetchFields({
          fields: ["formattedAddress", "location", "addressComponents"],
        });

        const nextValue = place.formattedAddress?.trim();
        const latitude = place.location?.lat();
        const longitude = place.location?.lng();

        if (!nextValue || latitude == null || longitude == null) {
          return;
        }

        if (autocompleteElement) {
          autocompleteElement.value = nextValue;
        }

        syncLocationValues({
          address: nextValue,
          latitude,
          longitude,
          city: getCityFromAddressComponents(place.addressComponents),
          department: getDepartmentFromAddressComponents(place.addressComponents),
        });
      } catch (error) {
        console.error(
          "Google Places API (New): no se pudo obtener formattedAddress desde la selección.",
          error,
        );
      }
    }

    function handleGoogleError(event: Event) {
      console.error("Google Places API (New): el widget devolvió un error.", event);
    }

    void loadPlaceAutocompleteElement(apiKey)
      .then((PlaceAutocompleteElement) => {
        if (isCancelled || !containerRef.current) {
          return;
        }

        const nextAutocompleteElement =
          elementRef.current ??
          new PlaceAutocompleteElement({
            includedRegionCodes: ["uy"],
            name: `${name}-autocomplete`,
            placeholder: "",
            requestedLanguage: "es",
            requestedRegion: "uy",
            value: defaultValue ?? "",
          });

        autocompleteElement = nextAutocompleteElement;
        elementRef.current = nextAutocompleteElement;
        nextAutocompleteElement.id = id;
        nextAutocompleteElement.className = className;
        nextAutocompleteElement.style.display = "block";
        nextAutocompleteElement.style.width = "100%";
        nextAutocompleteElement.style.colorScheme = "light";
        nextAutocompleteElement.includedRegionCodes = ["uy"];
        nextAutocompleteElement.requestedLanguage = "es";
        nextAutocompleteElement.requestedRegion = "uy";
        nextAutocompleteElement.disabled = disabled;
        nextAutocompleteElement.noClearButton = true;
        nextAutocompleteElement.noInputIcon = true;
        nextAutocompleteElement.value = initialValue;

        nextAutocompleteElement.removeEventListener("gmp-select", handlePlaceSelect);
        nextAutocompleteElement.removeEventListener("gmp-error", handleGoogleError);
        nextAutocompleteElement.removeEventListener("input", handleInput);
        nextAutocompleteElement.addEventListener("gmp-select", handlePlaceSelect);
        nextAutocompleteElement.addEventListener("gmp-error", handleGoogleError);
        nextAutocompleteElement.addEventListener("input", handleInput);

        containerRef.current.replaceChildren(nextAutocompleteElement);
      })
      .catch((error: unknown) => {
        console.error(
          "Google Places API (New): falló la carga o inicialización de PlaceAutocompleteElement.",
          error,
        );
      });

    return () => {
      isCancelled = true;

      if (autocompleteElement) {
        autocompleteElement.removeEventListener("gmp-select", handlePlaceSelect);
        autocompleteElement.removeEventListener("gmp-error", handleGoogleError);
        autocompleteElement.removeEventListener("input", handleInput);
      }
    };
  }, [
    className,
    defaultCity,
    defaultDepartment,
    defaultLatitude,
    defaultLongitude,
    defaultValue,
    disabled,
    id,
    name,
  ]);

  useEffect(() => {
    const autocompleteElement = elementRef.current;

    if (!autocompleteElement) {
      return;
    }

    autocompleteElement.disabled = disabled;
  }, [disabled]);

  return (
    <>
      <div data-google-places-address-input={autocompleteId} ref={containerRef} />
      <input
        defaultValue={defaultValue ?? ""}
        id={`${id}-hidden`}
        name={name}
        ref={addressInputRef}
        type="hidden"
      />
      <input
        defaultValue={defaultLatitude ?? ""}
        id={`${id}-latitude-hidden`}
        name="latitude"
        ref={latitudeInputRef}
        type="hidden"
      />
      <input
        defaultValue={defaultLongitude ?? ""}
        id={`${id}-longitude-hidden`}
        name="longitude"
        ref={longitudeInputRef}
        type="hidden"
      />
      <input
        defaultValue={defaultCity ?? ""}
        id={`${id}-city-hidden`}
        name="city"
        ref={cityInputRef}
        type="hidden"
      />
      <input
        defaultValue={defaultDepartment ?? ""}
        id={`${id}-department-hidden`}
        name="department"
        ref={departmentInputRef}
        type="hidden"
      />
      <style jsx global>{`
        [data-google-places-address-input="${autocompleteId}"] {
          width: 100%;
        }

        [data-google-places-address-input="${autocompleteId}"] gmp-place-autocomplete {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 1rem;
          color: var(--foreground);
          display: block;
          font-family: var(--font-sans), sans-serif;
          font-size: 0.875rem;
          line-height: 1.25rem;
          min-height: 3.125rem;
          outline: none;
          padding: 0;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease;
          width: 100%;
        }

        [data-google-places-address-input="${autocompleteId}"] gmp-place-autocomplete:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 8%, transparent);
        }

        [data-google-places-address-input="${autocompleteId}"] gmp-place-autocomplete::part(input) {
          background: transparent;
          border: 0;
          border-radius: inherit;
          box-shadow: none;
          color: inherit;
          font: inherit;
          min-height: 3.125rem;
          outline: none;
          padding: 0.75rem 1rem;
        }

        [data-google-places-address-input="${autocompleteId}"] gmp-place-autocomplete::part(prediction-list) {
          border: 1px solid var(--border);
          border-radius: 1rem;
          box-shadow: 0 14px 40px rgba(39, 39, 39, 0.08);
          font-family: var(--font-sans), sans-serif;
        }

        [data-google-places-address-input="${autocompleteId}"] gmp-place-autocomplete::part(input):focus,
        [data-google-places-address-input="${autocompleteId}"] gmp-place-autocomplete::part(input):focus-visible {
          outline: none;
        }
      `}</style>
    </>
  );
}
