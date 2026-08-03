import { GOOGLE_MAPS_API_KEY } from "../constants/api.constants";

let googleMapsPromise: Promise<any> | null = null;

export const loadGoogleMapsApi = (): Promise<any> => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if ((window as any).google?.maps) {
    return Promise.resolve((window as any).google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps API key is missing."));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY,
    )}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google?.maps) {
        resolve((window as any).google);
      } else {
        reject(new Error("Google Maps API failed to load."));
      }
    };
    script.onerror = () => {
      reject(new Error("Google Maps API script failed to load."));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
