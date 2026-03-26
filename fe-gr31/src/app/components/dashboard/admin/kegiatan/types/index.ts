export type TabId =
  | "bangun"
  | "beribadah"
  | "makan"
  | "belajar"
  | "bermasyarakat"
  | "olahraga"
  | "tidur";

export interface RawKegiatanRow {
  nisn?: string;
  nama?: string;
  kelas?: string;
  tanggal?: string;
  bangunPagi?: {
    jam?: string;
    membacaDanBangunTidur?: boolean;
  };
  tidur?: {
    jam?: string;
    membacaDanMasTidur?: boolean;
  };
  beribadah?: {
    berdoaUntukDiriDanOrtu?: boolean;
    sholatFajar?: boolean;
    sholatLimaWaktuBerjamaah?: boolean;
    zikirSesudahSholat?: boolean;
    sholatDhuha?: boolean;
    sholatSunahRawatib?: boolean;
    zakatInfaqSedekah?: string | number;
    subuh?: boolean;
    dzuhur?: boolean;
    ashar?: boolean;
    maghrib?: boolean;
    isya?: boolean;
  };
  makanSehat?: {
    jenisMakanan?: string;
    jenisLaukSayur?: string;
    makanSayurAtauBuah?: boolean;
    minumSuplemen?: boolean;
    deskripsi?: string;
  };
  olahraga?: {
    jenisOlahraga?: string;
    deskripsi?: string;
    waktu?: string | number;
  };
  belajar?: {
    yaAtauTidak?: boolean;
    deskripsi?: string;
  };
  bermasyarakat?: {
    deskripsi?: string;
    tempat?: string;
    waktu?: string;
    paraf?: boolean;
  };
}

export interface KegiatanApiResponse {
  data?: RawKegiatanRow[];
  total?: number;
  error?: string;
}

export interface TabItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  color: string;
}

export interface StudentBucket {
  nisn: string;
  nama: string;
  kelas: string;
}
