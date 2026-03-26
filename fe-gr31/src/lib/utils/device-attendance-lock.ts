export type DeviceAttendanceRecord = {
  tanggal: string;
  ownerNisn: string;
  ownerName: string;
  status: "hadir" | "tidak_hadir";
  verifiedAt: string;
};

export type DeviceAttendanceLockStatus = {
  isLocked: boolean;
  record: DeviceAttendanceRecord | null;
};

const STORAGE_PREFIX = "gr31:device-attendance-lock:v1";

function getStorageKey(tanggal: string): string {
  return `${STORAGE_PREFIX}:${tanggal}`;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getDeviceAttendanceRecord(
  tanggal: string,
): DeviceAttendanceRecord | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = localStorage.getItem(getStorageKey(tanggal));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DeviceAttendanceRecord>;

    if (
      parsed.tanggal !== tanggal ||
      !parsed.ownerNisn ||
      !parsed.ownerName ||
      (parsed.status !== "hadir" && parsed.status !== "tidak_hadir") ||
      !parsed.verifiedAt
    ) {
      localStorage.removeItem(getStorageKey(tanggal));
      return null;
    }

    return {
      tanggal,
      ownerNisn: parsed.ownerNisn,
      ownerName: parsed.ownerName,
      status: parsed.status,
      verifiedAt: parsed.verifiedAt,
    };
  } catch {
    localStorage.removeItem(getStorageKey(tanggal));
    return null;
  }
}

export function setDeviceAttendanceRecord(
  record: DeviceAttendanceRecord,
): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(getStorageKey(record.tanggal), JSON.stringify(record));
}

export function getDeviceAttendanceLockStatus(
  tanggal: string,
  currentNisn: string,
): DeviceAttendanceLockStatus {
  const record = getDeviceAttendanceRecord(tanggal);

  if (!record) {
    return {
      isLocked: false,
      record: null,
    };
  }

  if (!currentNisn || record.ownerNisn === currentNisn) {
    return {
      isLocked: false,
      record,
    };
  }

  return {
    isLocked: true,
    record,
  };
}

export function buildDeviceLockMessage(record: DeviceAttendanceRecord): string {
  const time = new Date(record.verifiedAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const statusLabel = record.status === "hadir" ? "Hadir" : "Tidak Hadir";

  return `Perangkat ini sudah dipakai absen oleh ${record.ownerName} (${record.ownerNisn}) pukul ${time} WIB dengan status ${statusLabel}. Silakan gunakan perangkat masing-masing.`;
}
