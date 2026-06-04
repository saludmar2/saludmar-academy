import { Course, Participant } from './types';

export const COURSES: Course[] = [
  {
    id: 'urgencias-metabolicas',
    title: 'Urgencias Metabólicas',
    category: 'Emergencias Médicas',
    duration: 'Sábado 06 de Julio - 17:30 HS',
    modality: 'Virtual por Zoom',
    description: 'Actualización práctica para profesionales de la salud en el manejo oportuno de emergencias metabólicas frecuentes en urgencias. Temas clave: Hipoglucemia, Cetoacidosis diabética y Estado hiperosmolar. Costo: Gs. 40.000. Incluye certificación digital.',
    videoUrl: 'https://www.youtube.com/embed/S2O6_c36Ggo', // Educational video link for acidosis hyperosmolar medical class
    bibliography: [
      { title: 'Guía del Consenso ADA/ALAD: Cetoacidosis Diabética en Adultos', url: 'https://www.revistaalad.com/' },
      { title: 'Protocolo de Emergencia para Crisis Hiperglucémicas - OPS/OMS', url: 'https://www.paho.org/' },
      { title: 'Manual Clínico MSPyBS de Insulinas y Manejo de Hipoglucemia', url: 'https://www.mspbs.gov.py/' }
    ],
    infographics: [
      { title: 'Infografía A: El Algoritmo de Hidratación y Sodio Corregido', url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?q=80&w=800' },
      { title: 'Infografía B: Signos de Alerta del Edema Cerebral en Pediatría', url: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=800' },
      { title: 'Esquema de Infusión de Insulinas de Acción Rápida (Protocolo Bolo-Goteo)', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800' }
    ],
    examQuestions: [
      {
        id: 'q1',
        question: '¿Cuál es el criterio de laboratorio clave para catalogar como "Grave" una Cetoacidosis Diabética (CAD) en adultos según las directrices consensuadas?',
        options: [
          'A) Nivel de glucemia mayor a 500 mg/dL.',
          'B) Osmolaridad efectiva estimada mayor a 320 mOsm/kg.',
          'C) pH arterial menor a 7.00 y Bicarbonato sérico menor a 10 mEq/L.',
          'D) Elevación progresiva de la Fosfatasa Alcalina sérica.'
        ],
        correctAnswerIndex: 2
      },
      {
        id: 'q2',
        question: 'En el tratamiento prioritario de compensación hidroelectrolítica de la cetoacidosis diabética, ¿cuándo se indica la administración concomitante de potasio?',
        options: [
          'A) Si el potasio sérico inicial es menor de 3.3 mEq/L (reponer potasio y diferir el inicio de insulina).',
          'B) En todos los pacientes una vez que el pH se normalice por encima de 7.4.',
          'C) Únicamente en pacientes pediátricos asmáticos activos.',
          'D) No se debe administrar potasio por vía parenteral en ningún estadio de la rehidratación.'
        ],
        correctAnswerIndex: 0
      },
      {
        id: 'q3',
        question: '¿A qué velocidad recomendada máxima se debe descender la glucemia para prevenir el riesgo letal de Edema Cerebral en el manejo del Estado Hiperosmolar?',
        options: [
          'A) Descenso abrupto de 200 mg/dL por hora con infusión masiva.',
          'B) Un descenso controlado de entre 50 a 75 mg/dL por hora.',
          'C) Solamente se controla cada 12 horas mediante gasometría capilar.',
          'D) No existe límite de velocidad de corrección en el Estado Hiperosmolar.'
        ],
        correctAnswerIndex: 1
      }
    ]
  }
];

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p-1',
    nombre: 'Dra. Patricia Milagros Sanabria',
    cedula: '3.842.105',
    telefono: '0981 441 003',
    correo: 'patricia.sanabria@gmail.com',
    empresa: 'IPS Hospital Central',
    cargo: 'Médica Residente de Urgencias',
    cursoId: 'urgencias-metabolicas',
    cursoNombre: 'Urgencias Metabólicas',
    fecha: '2026-07-06',
    modalidad: 'Virtual por Zoom',
    pago: 'Transferencia',
    observacion: 'Matrícula confirmada por transferencia bancaria.',
    asistencia: true,
    certificadoCodigo: 'SM-2026-607001',
    certificadoEmitido: true,
    fechaEmisionCertificado: '2026-07-06',
    estado: 'Aceptado'
  },
  {
    id: 'p-2',
    nombre: 'Lic. Javier Marcelo Benítez Araujo',
    cedula: '4.195.380',
    telefono: '0971 191 978',
    correo: 'javier.benitez@outlook.com',
    empresa: 'Sanatorio Británico',
    cargo: 'Enfermero de Unidad de Cuidados Intensivos',
    cursoId: 'urgencias-metabolicas',
    cursoNombre: 'Urgencias Metabólicas',
    fecha: '2026-07-06',
    modalidad: 'Virtual por Zoom',
    pago: 'Transferencia',
    observacion: 'Pago recibido. Pendiente de conexión por Zoom para acreditación final el sábado.',
    asistencia: false,
    certificadoEmitido: false,
    estado: 'Aceptado'
  }
];
