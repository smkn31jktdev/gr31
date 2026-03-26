import { useState, useEffect, useCallback, useRef } from "react";

const SCHOOL_COORDINATES = {
  latitude: -6.1819399,
  longitude: 106.8518572,
};
const MAX_RADIUS_METERS = 100;
const FAKE_GPS_LOCK_STORAGE_KEY = "attendance_fakegps_lock_v1";

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isClassicFakeGPS = (position: GeolocationPosition): boolean => {
  const { altitude, accuracy, heading, speed } = position.coords;
  if (accuracy < 5 && altitude === null && heading === null && speed === null) {
    return true;
  }
  return false;
};

const isTimestampSuspicious = (position: GeolocationPosition): boolean => {
  const now = Date.now();
  const posTime = position.timestamp;
  const diff = Math.abs(now - posTime);
  if (diff > 30000) {
    return true;
  }
  return false;
};

/** Layer 3: Accuracy anomaly - Fake GPS apps often report exactly round accuracy values */
const isAccuracyAnomalous = (position: GeolocationPosition): boolean => {
  const { accuracy } = position.coords;
  // Exactly 0 accuracy is impossible in real GPS
  if (accuracy === 0) return true;
  // Suspiciously exact integer accuracy consistently (real GPS fluctuates)
  if (accuracy === 1 || accuracy === 3 || accuracy === 10) return true;
  return false;
};

/** Layer 4: WebGL renderer check for emulator/desktop spoofing */
const isEmulatorDetected = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return false;
    const debugInfo = (gl as WebGLRenderingContext).getExtension(
      "WEBGL_debug_renderer_info",
    );
    if (debugInfo) {
      const renderer = (gl as WebGLRenderingContext).getParameter(
        debugInfo.UNMASKED_RENDERER_WEBGL,
      );
      const rendererLower = renderer?.toLowerCase() || "";
      // Common emulator/VM renderer strings
      if (
        rendererLower.includes("swiftshader") ||
        rendererLower.includes("llvmpipe") ||
        rendererLower.includes("virtualbox") ||
        rendererLower.includes("vmware")
      ) {
        return true;
      }
    }
  } catch {
    // Ignore errors
  }
  return false;
};

export interface FakeGPSReport {
  isFake: boolean;
  reasons: string[];
}

interface FakeGPSLockState {
  detectedAt: string;
  expiresAt: string;
  reasons: string[];
}

const getTodayLockExpiry = (): string => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
};

const getActiveFakeGPSLock = (): FakeGPSLockState | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(FAKE_GPS_LOCK_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as FakeGPSLockState;
    if (
      !parsed.expiresAt ||
      !parsed.detectedAt ||
      !Array.isArray(parsed.reasons)
    ) {
      window.sessionStorage.removeItem(FAKE_GPS_LOCK_STORAGE_KEY);
      return null;
    }

    const now = Date.now();
    const expiry = new Date(parsed.expiresAt).getTime();
    if (Number.isNaN(expiry) || expiry <= now) {
      window.sessionStorage.removeItem(FAKE_GPS_LOCK_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(FAKE_GPS_LOCK_STORAGE_KEY);
    return null;
  }
};

const saveFakeGPSLock = (reasons: string[]): FakeGPSLockState => {
  const now = new Date();
  const lock: FakeGPSLockState = {
    detectedAt: now.toISOString(),
    expiresAt: getTodayLockExpiry(),
    reasons,
  };

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(
      FAKE_GPS_LOCK_STORAGE_KEY,
      JSON.stringify(lock),
    );
  }

  return lock;
};

const buildLockedReport = (lock: FakeGPSLockState): FakeGPSReport => ({
  isFake: true,
  reasons: [
    "Perangkat sudah ditandai menggunakan Fake GPS pada sesi ini",
    ...lock.reasons,
  ],
});

const detectFakeGPS = (position: GeolocationPosition): FakeGPSReport => {
  const reasons: string[] = [];

  if (isClassicFakeGPS(position)) {
    reasons.push("Akurasi terlalu sempurna tanpa data sensor");
  }
  if (isTimestampSuspicious(position)) {
    reasons.push("Timestamp lokasi tidak sinkron");
  }
  if (isAccuracyAnomalous(position)) {
    reasons.push("Nilai akurasi GPS tidak wajar");
  }
  if (isEmulatorDetected()) {
    reasons.push("Terdeteksi penggunaan emulator");
  }

  return {
    isFake: reasons.length > 0,
    reasons,
  };
};

export interface GeolocationResult {
  isInsideSchoolBounds: boolean;
  locationMessage: string;
  isDevToolsOpen: boolean;
  isLoadingLocation: boolean;
  verifyLocation: () => void;
  distance: number | null;
  accuracy: number | null;
  fakeGPSReport: FakeGPSReport | null;
  coordinates: { latitude: number; longitude: number } | null;
}

export function useGeolocation(): GeolocationResult {
  const [isInsideSchoolBounds, setIsInsideSchoolBounds] =
    useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string>(
    "Sedang memverifikasi lokasi Anda...",
  );
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [fakeGPSReport, setFakeGPSReport] = useState<FakeGPSReport | null>(
    null,
  );
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const prevPositionRef = useRef<{
    lat: number;
    lon: number;
    time: number;
  } | null>(null);

  const applyFakeGPSLock = useCallback((lock: FakeGPSLockState) => {
    const report = buildLockedReport(lock);
    setFakeGPSReport(report);
    setIsInsideSchoolBounds(false);
    setCoordinates(null);
    setDistance(null);
    setAccuracy(null);
    setLocationMessage(
      " Akses absensi dikunci: Fake GPS sudah terdeteksi sebelumnya. Tutup aplikasi Fake GPS dan coba lagi besok.",
    );
    setIsLoadingLocation(false);
  }, []);

  useEffect(() => {
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    window.addEventListener("resize", detectDevTools);
    detectDevTools();

    return () => window.removeEventListener("resize", detectDevTools);
  }, []);

  const verifyLocation = useCallback(() => {
    const lock = getActiveFakeGPSLock();
    if (lock) {
      applyFakeGPSLock(lock);
      return;
    }

    if (!navigator.geolocation) {
      setLocationMessage("Browser Anda tidak mendukung deteksi lokasi.");
      setIsLoadingLocation(false);
      return;
    }

    if (isDevToolsOpen) {
      setLocationMessage(
        "Tolong tutup Developer Tools Anda untuk melanjutkan absen.",
      );
      setIsInsideSchoolBounds(false);
      setIsLoadingLocation(false);
      return;
    }

    setIsLoadingLocation(true);
    setLocationMessage("Mencari titik koordinat Anda...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const report = detectFakeGPS(position);

        if (prevPositionRef.current) {
          const timeDiff =
            (position.timestamp - prevPositionRef.current.time) / 1000;
          if (timeDiff > 0) {
            const dist = calculateDistance(
              prevPositionRef.current.lat,
              prevPositionRef.current.lon,
              position.coords.latitude,
              position.coords.longitude,
            );
            const speedKmH = (dist / 1000 / timeDiff) * 3600;
            if (speedKmH > 1000) {
              report.isFake = true;
              report.reasons.push(
                "Perpindahan lokasi terlalu cepat (teleportasi terdeteksi)",
              );
            }
          }
        }

        prevPositionRef.current = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          time: position.timestamp,
        };

        if (report.isFake) {
          const lockState = saveFakeGPSLock(report.reasons);
          const lockedReport = buildLockedReport(lockState);
          setLocationMessage(
            `Terdeteksi Lokasi Palsu: ${lockedReport.reasons[1] || lockedReport.reasons[0]}. Akses absensi dikunci sampai besok.`,
          );
          setIsInsideSchoolBounds(false);
          setIsLoadingLocation(false);
          setCoordinates(null);
          setDistance(null);
          setAccuracy(null);
          setFakeGPSReport(lockedReport);
          return;
        }

        setFakeGPSReport(null);
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setAccuracy(position.coords.accuracy);

        const dist = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          SCHOOL_COORDINATES.latitude,
          SCHOOL_COORDINATES.longitude,
        );
        setDistance(dist);

        if (dist <= MAX_RADIUS_METERS) {
          setIsInsideSchoolBounds(true);
          setLocationMessage(
            `Lokasi Valid! Jarak: ${Math.round(dist)}m dari sekolah. (Akurasi: ±${Math.round(position.coords.accuracy)}m)`,
          );
        } else {
          setIsInsideSchoolBounds(false);
          setLocationMessage(
            `Anda di luar area sekolah. Jarak: ${Math.round(dist)}m (Akurasi: ±${Math.round(position.coords.accuracy)}m)`,
          );
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Izin akses lokasi ditolak. Aktifkan GPS dan beri izin browser.",
          );
        } else {
          setLocationMessage(
            "Gagal mendapatkan lokasi Anda. Pastikan sinyal GPS optimal.",
          );
        }
        setIsInsideSchoolBounds(false);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [applyFakeGPSLock, isDevToolsOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      verifyLocation();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [verifyLocation]);

  return {
    isInsideSchoolBounds,
    locationMessage,
    isDevToolsOpen,
    isLoadingLocation,
    verifyLocation,
    distance,
    accuracy,
    fakeGPSReport,
    coordinates,
  };
}
