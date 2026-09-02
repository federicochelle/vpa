"use client";

import { useEffect, useRef, useState } from "react";

interface GoogleMapsNamespace {
  maps?: {
    Marker?: new (options: GoogleMarkerOptions) => GoogleMarker;
    importLibrary?: (libraryName: string) => Promise<unknown>;
  };
}

interface GoogleGeocoder {
  geocode: (request: {
    address: string;
    region?: string;
  }) => Promise<{
    results: Array<{
      geometry: {
        location: GoogleLatLng;
      };
    }>;
  }>;
}

interface GoogleLatLng {
  lat: () => number;
  lng: () => number;
}

interface GoogleMap {
  setCenter: (location: GoogleLatLng) => void;
  setZoom: (zoom: number) => void;
}

interface GoogleMapOptions {
  center: {
    lat: number;
    lng: number;
  };
  disableDefaultUI?: boolean;
  fullscreenControl?: boolean;
  gestureHandling?: string;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  zoomControl?: boolean;
}

interface GoogleMarkerOptions {
  map: GoogleMap;
  position: GoogleLatLng;
  title: string;
}

interface GoogleMarker {
  map?: GoogleMap | null;
}

interface PublicLocationMapProps {
  address?: string | null;
  fallbackLabel: string;
  latitude?: number | null;
  locationLabel?: string | null;
  longitude?: number | null;
  title: string;
}

let googleMapsLoader: Promise<void> | null = null;
let mapsLibrariesLoader: Promise<{
  Geocoder: new () => GoogleGeocoder;
  Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
  Marker: new (options: GoogleMarkerOptions) => GoogleMarker;
}> | null = null;

function getGoogleMapsWindow() {
  return window as Window & {
    google?: GoogleMapsNamespace;
    __googleMapsPublicInit?: () => void;
  };
}

function isGoogleMapsReady() {
  return Boolean(getGoogleMapsWindow().google?.maps?.importLibrary);
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
      'script[data-google-maps-public-loader="true"]',
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

    const googleMapsWindow = getGoogleMapsWindow();

    googleMapsWindow.__googleMapsPublicInit = () => {
      const script = document.querySelector<HTMLScriptElement>(
        'script[data-google-maps-public-loader="true"]',
      );

      if (script) {
        script.dataset.googleMapsLoaded = "true";
      }

      handleReady();
    };

    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      "&v=weekly&loading=async&callback=__googleMapsPublicInit";
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsPublicLoader = "true";
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    googleMapsLoader = null;
    throw error;
  });

  return googleMapsLoader;
}

async function loadMapsLibraries(apiKey: string) {
  await loadGoogleMapsApi(apiKey);
  const googleMapsWindow = getGoogleMapsWindow();

  if (mapsLibrariesLoader) {
    return mapsLibrariesLoader;
  }

  if (!googleMapsWindow.google?.maps?.importLibrary) {
    throw new Error("Google Maps no expuso importLibrary para cargar las librerías.");
  }

  mapsLibrariesLoader = Promise.all([
    googleMapsWindow.google.maps.importLibrary("maps"),
    googleMapsWindow.google.maps.importLibrary("geocoding"),
  ])
    .then(([mapsLibrary, geocodingLibrary]) => {
      const Map = (mapsLibrary as {
        Map?: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
      }).Map;
      const Geocoder = (geocodingLibrary as {
        Geocoder?: new () => GoogleGeocoder;
      }).Geocoder;
      const Marker = googleMapsWindow.google?.maps?.Marker;

      if (!Map || !Geocoder || !Marker) {
        throw new Error("No se pudieron cargar Map, Geocoder o Marker.");
      }

      return {
        Geocoder,
        Map,
        Marker,
      };
    })
    .catch((error) => {
      mapsLibrariesLoader = null;
      throw error;
    });

  return mapsLibrariesLoader;
}

export function PublicLocationMap({
  address,
  fallbackLabel,
  latitude,
  locationLabel,
  longitude,
  title,
}: PublicLocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const normalizedAddress = address?.trim() ?? "";
  const normalizedLocationLabel = locationLabel?.trim() ?? "";
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    if (!apiKey || (!normalizedAddress && (latitude == null || longitude == null)) || !mapRef.current) {
      return;
    }

    let isCancelled = false;

    void loadMapsLibraries(apiKey)
      .then(async ({ Geocoder, Map, Marker }) => {
        if (isCancelled || !mapRef.current) {
          return;
        }

        const map = new Map(mapRef.current, {
          center: {
            lat: latitude ?? -34.9011,
            lng: longitude ?? -56.1645,
          },
          disableDefaultUI: true,
          fullscreenControl: false,
          gestureHandling: "cooperative",
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
        });

        let markerLocation: GoogleLatLng | null = null;

        if (latitude != null && longitude != null) {
          markerLocation = {
            lat: () => latitude,
            lng: () => longitude,
          };
        } else {
          const geocoder = new Geocoder();
          const response = await geocoder.geocode({
            address: normalizedAddress,
            region: "UY",
          });
          const result = response.results[0];

          if (isCancelled || !result) {
            throw new Error("Google Maps no devolvió resultados para la dirección.");
          }

          markerLocation = result.geometry.location;
        }

        if (isCancelled || !markerLocation) {
          return;
        }

        map.setCenter(markerLocation);
        map.setZoom(15);

        if (markerRef.current) {
          markerRef.current.map = null;
        }

        markerRef.current = new Marker({
          map,
          position: markerLocation,
          title,
        });

        setHasMapError(false);
      })
      .catch((error: unknown) => {
        console.error("Google Maps JavaScript API: no se pudo renderizar el mapa público.", error);
        if (!isCancelled) {
          setHasMapError(true);
        }
      });

    return () => {
      isCancelled = true;

      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [apiKey, latitude, longitude, normalizedAddress, title]);

  const hasRenderableMap = Boolean(
    apiKey && ((latitude != null && longitude != null) || normalizedAddress),
  );

  if (!hasRenderableMap || hasMapError) {
    return (
      <div className="w-full max-w-full min-w-0">
        {normalizedLocationLabel ? (
          <p className="type-body mt-4 text-foreground">{normalizedLocationLabel}</p>
        ) : null}
        <div className="type-body-compact mt-6 flex w-full max-w-full min-w-0 min-h-60 items-center justify-center rounded-none border border-dashed border-border bg-surface-strong px-6 text-center text-muted">
          {normalizedLocationLabel || fallbackLabel}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0">
      {normalizedLocationLabel ? (
        <p className="type-body mt-4 text-foreground">{normalizedLocationLabel}</p>
      ) : null}
      <div className="mt-6 w-full max-w-full min-w-0 min-h-60 overflow-hidden rounded-none border border-dashed border-border bg-surface-strong">
        <div className="h-full min-h-60 w-full max-w-full min-w-0" ref={mapRef} />
      </div>
    </div>
  );
}
