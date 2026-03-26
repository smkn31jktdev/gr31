// Generic report
export { downloadPdfReport } from "./generic";

// Specific reports
export { downloadBangunTidurStyledPdf } from "./bangun";
export { downloadMakanSehatStyledPdf } from "./makan";
export { downloadOlahragaStyledPdf } from "./olahraga";
export { downloadBelajarStyledPdf } from "./belajar";
export { downloadIbadahStyledPdf } from "./beribadah";
export { downloadBermasyarakatStyledPdf } from "./bermasyarakat";

// Helpers
export { createPdfFilename } from "./helpers";

// Types
export type {
  MakanSehatPdfRow,
  OlahragaPdfRow,
  BelajarPdfRow,
  IbadahPdfRow,
  BermasyarakatPdfRow,
  PdfParams,
} from "./types";
