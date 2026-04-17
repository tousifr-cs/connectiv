import { useState, useCallback } from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  error: string | null;
  loading: boolean;
}

async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      { headers: { "User-Agent": "ProConnectiv/1.0" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const { city, town, village, state, country } = data.address ?? {};
    const locality = city || town || village;
    const parts = [locality, state, country].filter(Boolean);
    return parts.join(", ") || data.display_name || null;
  } catch {
    return null;
  }
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);

        setState({
          latitude,
          longitude,
          address,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let message = "Unable to retrieve location";
        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission denied. Enable it in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information unavailable";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out";
        }
        setState({
          latitude: null,
          longitude: null,
          address: null,
          error: message,
          loading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  return { ...state, requestLocation };
}
