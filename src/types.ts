export interface Participant {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  empresa: string;
  cargo: string;
  cursoId: string;
  cursoNombre: string;
  fecha: string;
  modalidad: string;
  pago: 'Pendiente' | 'Transferencia' | 'Giro' | 'Efectivo';
  observacion: string;
  asistencia: boolean;
  certificadoCodigo?: string;
  certificadoEmitido: boolean;
  fechaEmisionCertificado?: string;
  estado?: 'Pendiente' | 'Aceptado';
  examenAprobado?: boolean;
  examenNota?: string;
  fechaExamen?: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface BibliographyLink {
  title: string;
  url: string;
}

export interface InfographicLink {
  title: string;
  url: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  modality: string;
  description: string;
  image?: string;
  videoUrl?: string;
  bibliography?: BibliographyLink[];
  infographics?: InfographicLink[];
  examQuestions?: ExamQuestion[];
  claseHabilitada?: boolean;
  tipoCurso?: 'a_desarrollar' | 'grabado';
}

export interface SignatureConfig {
  id: 'firmante-1' | 'firmante-2';
  nombre: string;
  cargo: string;
  institucion?: string;
  tipo: 'predeterminada' | 'dibujada' | 'texto' | 'imagen';
  firmaBase64?: string;
  firmaTexto?: string;
  fuenteEstilo?: 'style-1' | 'style-2' | 'style-3';
}

export interface CertificateLayoutConfig {
  headerText: string;
  titleText: string;
  subtitleText: string;
  bodyIntroText: string;
  bodyLogisticsText: string; // fallback or template base
  
  // Dimensions & sizes
  borderWidth: number;          // e.g. 14px
  outerBorderColor: string;     // e.g. '#0f172a' (slate-900)
  innerBorderColor: string;     // e.g. '#f59e0b' (amber-500)
  titleFontSize: number;        // e.g. 48px
  nameFontSize: number;         // e.g. 36px
  courseFontSize: number;       // e.g. 23px
  signatureScale: number;       // e.g. 100%
  verticalSpacing: 'tight' | 'normal' | 'roomy';

  // Visibilities
  showLaurels: boolean;
  showVerificationBadge: boolean;
  showQrBar: boolean;
  showWatermark: boolean;
  showSignatureLine: boolean;
  signatureYOffset: number;
  showDividerLine: boolean;

  // Custom visual template settings (upload your own format)
  useCustomBackground?: boolean;
  backgroundImageBase64?: string;
  nameYPercent?: number;          // Position of participant name (vertical percentage 0-100)
  nameXPercent?: number;          // Position of participant name (horizontal percentage 0-100)
  cedulaYPercent?: number;        // Position of Cédula de Identidad (vertical percentage 0-100)
  cedulaXPercent?: number;        // Position of Cédula de Identidad (horizontal percentage 0-100)
  courseYPercent?: number;        // Position of course name (vertical percentage 0-100)
  courseXPercent?: number;        // Position of course name (horizontal percentage 0-100)
  dateYPercent?: number;          // Position of date (vertical percentage 0-100)
  dateXPercent?: number;          // Position of date (horizontal percentage 0-100)
  qrYPercent?: number;            // Position of QR Bar (vertical percentage 0-100)
  qrXPercent?: number;            // Position of QR Bar (horizontal percentage 0-100)
  qrScale?: number;               // Sizing scale for the QR barcode container
  showNameOverlay?: boolean;
  showCedulaOverlay?: boolean;
  showCourseOverlay?: boolean;
  showDateOverlay?: boolean;
  showQrOverlay?: boolean;
  cedulaFontSize?: number;        // Customize Cedula Font Size over Custom Background
  dateFontSize?: number;          // Customize Date Text Font Size over Custom Background
  nameWidthPercent?: number;      // Maximum container width percentage to stretch or wrap
  courseWidthPercent?: number;    // Maximum container width percentage to stretch or wrap
  dateWidthPercent?: number;      // Maximum container width percentage to stretch or wrap
  cedulaWidthPercent?: number;    // Maximum container width percentage to stretch or wrap
  nameLetterSpacing?: number;     // Extra letter spacing in pixels
  courseLetterSpacing?: number;   // Extra letter spacing in pixels
  globalTemplateMode?: 'per_course' | 'force_general' | 'force_course';
  forcedCourseId?: string;
}

