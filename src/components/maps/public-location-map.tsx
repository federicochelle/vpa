"use client";

import { useEffect, useRef, useState } from "react";

interface GoogleMapsNamespace {
  maps?: {
    Marker?: new (options: GoogleMarkerOptions) => GoogleMarker;
    importLibrary?: (libraryName: string) => Promise<unknown>;
  };
}

interface GoogleLatLngLiteral {
  lat: number;
  lng: number;
}

interface GoogleMap {
  setCenter: (location: GoogleLatLngLiteral) => void;
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
  position: GoogleLatLngLiteral;
  title: string;
}

interface GoogleMarker {
  map?: GoogleMap | null;
}

interface PublicLocationMapProps {
  fallbackLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  title: string;
}

const DEFAULT_MAP_CENTER: GoogleLatLngLiteral = {
  lat: -34.9011,
  lng: -56.1645,
};
const DEFAULT_MAP_ZOOM = 11;
const LOCATION_MAP_ZOOM = 15;

let googleMapsLoader: Promise<void> | null = null;
let mapsLibrariesLoader: Promise<{
  Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
  Marker: (new (options: GoogleMarkerOptions) => GoogleMarker) | null;
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

  mapsLibrariesLoader = googleMapsWindow.google.maps
    .importLibrary("maps")
    .then((mapsLibrary) => {
      const Map = (mapsLibrary as {
        Map?: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
      }).Map;
      const Marker = googleMapsWindow.google?.maps?.Marker ?? null;

      if (!Map) {
        throw new Error("No se pudo cargar Map.");
      }

      return {
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

function normalizeCoordinate(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function PublicLocationMap({
  fallbackLabel,
  latitude,
  longitude,
  title,
}: PublicLocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const normalizedLatitude = normalizeCoordinate(latitude);
  const normalizedLongitude = normalizeCoordinate(longitude);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    if (!apiKey || !mapRef.current) {
      return;
    }

    let isCancelled = false;
    const markerLocation: GoogleLatLngLiteral | null =
      normalizedLatitude !== null && normalizedLongitude !== null
        ? {
            lat: normalizedLatitude,
            lng: normalizedLongitude,
          }
        : null;
    const mapCenter = markerLocation ?? DEFAULT_MAP_CENTER;

    void loadMapsLibraries(apiKey)
      .then(({ Map, Marker }) => {
        if (isCancelled || !mapRef.current) {
          return;
        }

        const map = new Map(mapRef.current, {
          center: mapCenter,
          disableDefaultUI: true,
          fullscreenControl: false,
          gestureHandling: "cooperative",
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
        });

        map.setCenter(mapCenter);
        map.setZoom(markerLocation ? LOCATION_MAP_ZOOM : DEFAULT_MAP_ZOOM);

        if (markerRef.current) {
          markerRef.current.map = null;
          markerRef.current = null;
        }

        if (markerLocation) {
          if (!Marker) {
            throw new Error("No se pudo cargar Marker.");
          }

          markerRef.current = new Marker({
            map,
            position: markerLocation,
            title,
          });
        }

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
  }, [apiKey, normalizedLatitude, normalizedLongitude, title]);

  const hasRenderableMap = Boolean(apiKey);

  if (!hasRenderableMap || hasMapError) {
    return (
      <div className="type-body-compact mt-6 flex w-full max-w-full min-w-0 min-h-60 items-center justify-center rounded-none border border-dashed border-border bg-surface-strong px-6 text-center text-muted">
        {fallbackLabel}
      </div>
    );
  }

  return (
    <div className="mt-6 w-full max-w-full min-w-0 min-h-60 overflow-hidden rounded-none border border-dashed border-border bg-surface-strong">
      <div className="h-full min-h-60 w-full max-w-full min-w-0" ref={mapRef} />
    </div>
  );
}
