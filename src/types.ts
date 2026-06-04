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
}

