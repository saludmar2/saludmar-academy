import React, { useState, useEffect } from 'react';
import { Participant, Course, SignatureConfig, CertificateLayoutConfig } from './types';
import { COURSES, INITIAL_PARTICIPANTS } from './data';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useToasts, Toast } from './components/Toast';
import { HomeSection } from './components/HomeSection';
import { InscripcionSection } from './components/InscripcionSection';
import { AulaSection } from './components/AulaSection';
import { AdminSection } from './components/AdminSection';
import { CertificateTemplate } from './components/CertificateTemplate';
import { CertificateDesigner } from './components/CertificateDesigner';
import { ValidatorSection } from './components/ValidatorSection';
import { AsistenciaSelfSection } from './components/AsistenciaSelfSection';
import { SaludMarLogo } from './components/SaludMarLogo';
import { CertificateSearch } from './components/CertificateSearch';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, UserPlus, ShieldCheck, Award, 
  LayoutDashboard, Heart, GraduationCap, Printer, HelpCircle,
  Sliders, Lock, Unlock, KeyRound, LogOut
} from 'lucide-react';

const DEFAULT_SIGNATURES: SignatureConfig[] = [
  {
    id: 'firmante-1',
    nombre: 'Prof. Lic. Arnold Martínez',
    cargo: 'Facilitador del Taller',
    tipo: 'predeterminada'
  },
  {
    id: 'firmante-2',
    nombre: 'Lic. Andrea Giménez',
    cargo: 'Directora Ejecutiva',
    institucion: 'Salud-Mar',
    tipo: 'predeterminada'
  }
];

const DEFAULT_LAYOUT_CONFIG: CertificateLayoutConfig = {
  headerText: 'SALUD-MAR • REGISTRO DE ENTIDAD DE CAPACITACIÓN ACADÉMICA',
  titleText: 'Certificado',
  subtitleText: 'DE PARTICIPACIÓN',
  bodyIntroText: 'Ha participado satisfactoriamente de todos los contenidos desarrollados dentro del Curso Virtual',
  bodyLogisticsText: 'Realizado en fecha {fecha}, impartido en forma virtual por SALUD-MAR, CAPACITACIONES con una carga horaria de {carga}.',
  
  borderWidth: 14,
  outerBorderColor: '#0f172a',
  innerBorderColor: '#f59e0b',
  titleFontSize: 45,
  nameFontSize: 36,
  courseFontSize: 23,
  signatureScale: 100,
  verticalSpacing: 'normal',
  
  showLaurels: true,
  showVerificationBadge: true,
  showQrBar: true,
  showWatermark: true,
  showSignatureLine: true,
  signatureYOffset: -16,
  showDividerLine: true,
};

export default function App() {
  const { toasts, addToast, removeToast } = useToasts();
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [courses, setCourses] = useState<Course[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<SignatureConfig[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<CertificateLayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  const [courseLayoutConfigs, setCourseLayoutConfigs] = useState<Record<string, CertificateLayoutConfig>>({});
  const [isAdminDesignMode, setIsAdminDesignMode] = useState<boolean>(false);
  const [urlVerifyCode, setUrlVerifyCode] = useState<string | null>(null);
  const [urlSelectedCursoId, setUrlSelectedCursoId] = useState<string | null>(null);
  const [urlSelectedAsistenciaCursoId, setUrlSelectedAsistenciaCursoId] = useState<string | null>(null);
  const [adminSearchParam, setAdminSearchParam] = useState<string>('');
  const [adminCourseParam, setAdminCourseParam] = useState<string>('ALL');

  // Secure admin lock states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('saludmar_admin_authenticated') === 'true';
  });
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const handleAdminLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = adminPinInput.trim().toLowerCase();
    if (cleanInput === 'jaiaanalia') {
      setPinError(false);
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('saludmar_admin_authenticated', 'true');
      addToast('¡Acceso concedido! Bienvenido al panel de acreditación académica.', 'success');
      setAdminPinInput('');
    } else {
      setPinError(true);
      addToast('Código de acceso incorrecto. Intente de nuevo.', 'error');
    }
  };

  // Scan URL query parameter for automatic verification or custom course enrollment links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyCode = params.get('verify') || params.get('code');
    const cursoCode = params.get('curso') || params.get('course');
    const asistenciaCode = params.get('asistencia') || params.get('presente');
    const adminPagoCode = params.get('admin_pago');
    const adminCursoId = params.get('admin_curso');

    if (adminPagoCode) {
      setAdminSearchParam(adminPagoCode);
      if (adminCursoId) {
        setAdminCourseParam(adminCursoId);
      } else {
        setAdminCourseParam('ALL');
      }
      setActiveTab('admin');
      
      // Clear URL query parameters so page refresh doesn't trigger it again
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (verifyCode) {
      setUrlVerifyCode(verifyCode);
      setActiveTab('validador');
      // Clear URL query parameters so page refresh doesn't trigger it again
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (cursoCode) {
      setUrlSelectedCursoId(cursoCode);
      setActiveTab('inscripcion');
      // Clear URL query parameters so page refresh doesn't trigger it again
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (asistenciaCode) {
      setUrlSelectedAsistenciaCursoId(asistenciaCode);
      setActiveTab('asistencia_self');
      // Clear URL query parameters so page refresh doesn't trigger it again
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Load initial settings and synchronize collections on boot with Firebase Firestore
  useEffect(() => {
    async function loadFirebaseData() {
      try {
        // 0. Check if DB has been initialized
        const systemStatusRef = doc(db, 'system', 'status');
        const systemStatusSnap = await getDoc(systemStatusRef);
        const alreadyInitialized = systemStatusSnap.exists() && systemStatusSnap.data()?.initialized === true;

        // 1. Load Layout Config and Course-Specific Layout Overrides from "layout" collection
        const layoutsCollectionRef = collection(db, 'layout');
        const layoutsSnap = await getDocs(layoutsCollectionRef);
        const fetchedCourseLayouts: Record<string, CertificateLayoutConfig> = {};
        let generalConfigDoc: CertificateLayoutConfig | null = null;

        layoutsSnap.forEach((doc) => {
          if (doc.id === 'config') {
            generalConfigDoc = doc.data() as CertificateLayoutConfig;
          } else if (doc.id.startsWith('course_')) {
            const courseId = doc.id.replace('course_', '');
            fetchedCourseLayouts[courseId] = doc.data() as CertificateLayoutConfig;
          }
        });

        if (generalConfigDoc) {
          setLayoutConfig(generalConfigDoc);
        } else {
          // Initialize in firestore
          const layoutRef = doc(db, 'layout', 'config');
          await setDoc(layoutRef, DEFAULT_LAYOUT_CONFIG);
          setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
        }
        setCourseLayoutConfigs(fetchedCourseLayouts);

        // 2. Load Signatures
        const sigsCollectionRef = collection(db, 'signatures');
        const sigsSnap = await getDocs(sigsCollectionRef);
        if (!sigsSnap.empty) {
          const loadedSigs: SignatureConfig[] = [];
          sigsSnap.forEach((doc) => {
            const data = doc.data() as SignatureConfig;
            loadedSigs.push({
              ...data,
              id: (data.id || doc.id) as 'firmante-1' | 'firmante-2'
            });
          });
          
          // Double guarantee that both firmante-1 and firmante-2 are populated by merging loaded fields with defaults
          const completeSigs = DEFAULT_SIGNATURES.map((defSig) => {
            const loaded = loadedSigs.find(s => s.id === defSig.id);
            return loaded ? { ...defSig, ...loaded } : defSig;
          });
          
          setSignatures(completeSigs);
        } else {
          // Initialize in firestore via Batch to prevent empty states
          const batch = writeBatch(db);
          for (const sig of DEFAULT_SIGNATURES) {
            const sigRef = doc(db, 'signatures', sig.id);
            batch.set(sigRef, sig);
          }
          await batch.commit();
          setSignatures(DEFAULT_SIGNATURES);
        }

        // Load Courses
        const coursesCollRef = collection(db, 'courses');
        const coursesSnap = await getDocs(coursesCollRef);
        if (!coursesSnap.empty) {
          const loadedCourses: Course[] = [];
          coursesSnap.forEach((doc) => {
            loadedCourses.push(doc.data() as Course);
          });
          setCourses(loadedCourses);
        } else if (!alreadyInitialized) {
          // Bootstrap courses in Firestore
          const batch = writeBatch(db);
          for (const course of COURSES) {
            const courseRef = doc(db, 'courses', course.id);
            batch.set(courseRef, course);
          }
          await batch.commit();
          setCourses(COURSES);
        } else {
          setCourses([]);
        }

        // 3. Load Participants
        const partRef = collection(db, 'participants');
        const partSnap = await getDocs(partRef);
        if (!partSnap.empty) {
          const loadedPart: Participant[] = [];
          partSnap.forEach((doc) => {
            loadedPart.push(doc.data() as Participant);
          });
          setParticipants(loadedPart);
        } else if (!alreadyInitialized) {
          // Initialize in firestore
          const batch = writeBatch(db);
          for (const part of INITIAL_PARTICIPANTS) {
            const docRef = doc(db, 'participants', part.id);
            batch.set(docRef, part);
          }
          batch.set(systemStatusRef, { initialized: true });
          await batch.commit();
          setParticipants(INITIAL_PARTICIPANTS);
        } else {
          setParticipants([]);
        }

        // If not initialized, mark as initialized now so future delete all actions work properly
        if (!alreadyInitialized) {
          await setDoc(systemStatusRef, { initialized: true });
        }

        addToast('Datos sincronizados permanentemente con Firebase Cloud.', 'success');
      } catch (error) {
        console.error('Error loading initial Firestore data:', error);
        addToast('Error al conectar con la base de datos de Firebase.', 'error');
      }
    }

    loadFirebaseData();
  }, []);

  const handleSaveSignatures = async (newSignatures: SignatureConfig[], saveToDb: boolean = true) => {
    setSignatures(newSignatures);
    if (!saveToDb) return;
    try {
      const batch = writeBatch(db);
      for (const sig of newSignatures) {
        const sigRef = doc(db, 'signatures', sig.id);
        batch.set(sigRef, sig);
      }
      await batch.commit();
      addToast('Firmas actualizadas en Firebase.', 'success');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'signatures');
    }
  };

  const handleSaveLayoutConfig = async (
    courseIdOrLayout: string | CertificateLayoutConfig,
    optionalLayout?: CertificateLayoutConfig,
    quiet = false
  ) => {
    let courseId = 'default';
    let newLayout: CertificateLayoutConfig;

    if (typeof courseIdOrLayout === 'string') {
      courseId = courseIdOrLayout;
      newLayout = optionalLayout!;
    } else {
      newLayout = courseIdOrLayout;
    }

    try {
      if (courseId === 'default' || !courseId) {
        setLayoutConfig(newLayout);
        const layoutRef = doc(db, 'layout', 'config');
        await setDoc(layoutRef, newLayout);
        if (!quiet) {
          addToast('Diseño de plantilla general guardado en Firebase.', 'success');
        }
      } else {
        setCourseLayoutConfigs(prev => ({
          ...prev,
          [courseId]: newLayout
        }));
        const layoutRef = doc(db, 'layout', 'course_' + courseId);
        await setDoc(layoutRef, newLayout);
        if (!quiet) {
          const courseObj = courses.find(c => c.id === courseId);
          addToast(`Diseño para "${courseObj?.title || courseId}" guardado en Firebase.`, 'success');
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `layout/${courseId === 'default' ? 'config' : 'course_' + courseId}`);
    }
  };

  const handleAddParticipant = async (fields: Omit<Participant, 'id' | 'asistencia' | 'certificadoEmitido'>) => {
    const id = 'p-' + Date.now().toString(36);
    const newParticipant: Participant = {
      ...fields,
      id,
      asistencia: false,
      certificadoEmitido: false,
      estado: 'Pendiente', // Enter as 'Pendiente' of admin approval
    };
    
    // Update local state first for immediate UI responsiveness
    setParticipants(prev => [...prev, newParticipant]);
    
    try {
      const docRef = doc(db, 'participants', id);
      await setDoc(docRef, newParticipant);
      addToast('Inscripción enviada y resguardada en la base de datos.', 'success');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `participants/${id}`);
    }
  };

  const handleUpdateParticipantWithExam = async (cedula: string, nota: string, aprobado: boolean) => {
    const cleanCedula = cedula.trim().replace(/\./g, '');
    const match = participants.find(p => p.cedula.replace(/\./g, '') === cleanCedula && p.cursoId === 'urgencias-metabolicas');
    
    if (match) {
      const payload = {
        examenAprobado: aprobado,
        examenNota: nota,
        fechaExamen: new Date().toISOString().split('T')[0]
      };
      
      const updated = participants.map(p => {
        if (p.id === match.id) {
          return { ...p, ...payload };
        }
        return p;
      });
      setParticipants(updated);
      
      try {
        const docRef = doc(db, 'participants', match.id);
        await updateDoc(docRef, payload);
        return true;
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `participants/${match.id}`);
        return false;
      }
    }
    return false;
  };

  const handleUpdateCourse = async (courseId: string, updatedFields: Partial<Course>) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    setCourses(updated);
    
    try {
      const docRef = doc(db, 'courses', courseId);
      await updateDoc(docRef, updatedFields);
      addToast('Módulo académico persistido en Firebase correctamente.', 'success');
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `courses/${courseId}`);
      return false;
    }
  };

  const handleCreateCourse = async (newCourse: Course) => {
    if (courses.some(c => c.id === newCourse.id)) {
      addToast('Un curso con un identificador similar ya existe en la base de datos.', 'error');
      return false;
    }
    const updated = [...courses, newCourse];
    setCourses(updated);
    
    try {
      const docRef = doc(db, 'courses', newCourse.id);
      await setDoc(docRef, newCourse);
      addToast(`Capacitación "${newCourse.title}" cargada y persistida de forma segura.`, 'success');
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `courses/${newCourse.id}`);
      return false;
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (courses.length <= 1) {
      addToast('No es posible eliminar todas las capacitaciones. Debe quedar al menos una activa en el sistema.', 'error');
      return false;
    }
    const updated = courses.filter(c => c.id !== courseId);
    setCourses(updated);
    
    try {
      const docRef = doc(db, 'courses', courseId);
      await deleteDoc(docRef);
      addToast('Capacitación eliminada permanentemente del sistema de datos.', 'success');
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `courses/${courseId}`);
      return false;
    }
  };

  const handleAcceptParticipant = async (id: string) => {
    const updated = participants.map((p) => {
      if (p.id === id) {
        return { ...p, estado: 'Aceptado' as const };
      }
      return p;
    });
    setParticipants(updated);
    
    try {
      const docRef = doc(db, 'participants', id);
      await updateDoc(docRef, { estado: 'Aceptado' });
      addToast('Inscripción aceptada. El alumno ha ingresado a la lista oficial.', 'success');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `participants/${id}`);
    }
  };

  const handleAcceptAllPending = async (courseId: string) => {
    let count = 0;
    const acceptIds: string[] = [];
    const updated = participants.map((p) => {
      if (p.cursoId === courseId && p.estado === 'Pendiente') {
        count++;
        acceptIds.push(p.id);
        return { ...p, estado: 'Aceptado' as const };
      }
      return p;
    });
    
    if (count === 0) {
      addToast('No hay alumnos pendientes para este curso académico.', 'info');
      return;
    }
    
    setParticipants(updated);
    
    try {
      const batch = writeBatch(db);
      for (const id of acceptIds) {
        const docRef = doc(db, 'participants', id);
        batch.update(docRef, { estado: 'Aceptado' });
      }
      await batch.commit();
      addToast(`¡Éxito! Se han aprobado ${count} inscripciones pendientes de forma masiva.`, 'success');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'participants');
    }
  };

  const handleUnlockAllCertificates = async (courseId: string) => {
    let count = 0;
    const elementsToUpdate: {id: string, update: Partial<Participant>}[] = [];
    const updated = participants.map((p) => {
      if (p.cursoId === courseId && p.estado === 'Aceptado') {
        if (!p.certificadoEmitido) {
          count++;
          const code = p.certificadoCodigo || `SM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
          const payload = {
            asistencia: true,
            certificadoEmitido: true,
            certificadoCodigo: code,
            fechaEmisionCertificado: new Date().toISOString().split('T')[0]
          };
          elementsToUpdate.push({id: p.id, update: payload});
          return {
            ...p,
            ...payload
          };
        }
      }
      return p;
    });
    
    if (count === 0) {
      addToast('No hay certificados por emitir para este curso.', 'info');
      return;
    }
    
    setParticipants(updated);
    
    try {
      const batch = writeBatch(db);
      for (const item of elementsToUpdate) {
        const docRef = doc(db, 'participants', item.id);
        batch.update(docRef, item.update);
      }
      await batch.commit();
      addToast(`¡Taller finalizado con éxito! Se han liberado ${count} certificados con validez digital.`, 'success');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'participants');
    }
  };

  const handleMarkAttendance = async (id: string) => {
    const updated = participants.map((p) => {
      if (p.id === id) {
        return { ...p, asistencia: true };
      }
      return p;
    });
    setParticipants(updated);
    
    try {
      const docRef = doc(db, 'participants', id);
      await updateDoc(docRef, { asistencia: true });
      addToast('Asistencia acreditada con éxito', 'success');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `participants/${id}`);
    }
  };

  const handleSelfMarkAttendance = async (courseId: string, cedula: string): Promise<{ success: boolean; message: string; studentName?: string }> => {
    const cleanCedula = cedula.trim().replace(/\./g, '');
    const match = participants.find(p => 
      p.cursoId === courseId && 
      p.cedula.trim().replace(/\./g, '') === cleanCedula
    );

    if (!match) {
      return {
        success: false,
        message: 'No se encontró ningún participante pre-inscripto con esta Cédula de Identidad para este curso.'
      };
    }

    const payload = {
      asistencia: true,
      estado: match.estado === 'Pendiente' ? 'Aceptado' as const : match.estado
    };

    const updated = participants.map((p) => {
      if (p.id === match.id) {
        return { 
          ...p, 
          ...payload
        };
      }
      return p;
    });
    setParticipants(updated);

    try {
      const docRef = doc(db, 'participants', match.id);
      await updateDoc(docRef, payload);
      return {
        success: true,
        studentName: match.nombre,
        message: '¡Asistencia acreditada con éxito!'
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `participants/${match.id}`);
      return {
        success: false,
        message: 'Error de servidor al guardar la asistencia.'
      };
    }
  };

  const handleGenerateCertificate = async (id: string) => {
    let payload: Partial<Participant> = {};
    const updated = participants.map((p) => {
      if (p.id === id) {
        const hasCode = p.certificadoCodigo;
        const code = hasCode || `SM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        payload = {
          asistencia: true,
          certificadoEmitido: true,
          certificadoCodigo: code,
          fechaEmisionCertificado: new Date().toISOString().split('T')[0]
        };
        return {
          ...p,
          ...payload
        };
      }
      return p;
    });
    setParticipants(updated);
    setSelectedCertificateId(id);
    setActiveTab('certificados');
    
    try {
      const docRef = doc(db, 'participants', id);
      await updateDoc(docRef, payload);
      addToast('¡Certificado virtual emitido y habilitado para descarga!', 'success');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `participants/${id}`);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    const updated = participants.filter((p) => p.id !== id);
    setParticipants(updated);
    if (selectedCertificateId === id) {
      setSelectedCertificateId(null);
    }
    
    try {
      const docRef = doc(db, 'participants', id);
      await deleteDoc(docRef);
      addToast('Alumno eliminado de la base de datos.', 'info');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `participants/${id}`);
    }
  };

  const handleTogglePayment = async (id: string) => {
    const paymentSequence: Participant['pago'][] = ['Pendiente', 'Transferencia', 'Giro', 'Efectivo'];
    let nextStatus: Participant['pago'] = 'Pendiente';
    const updated = participants.map((p) => {
      if (p.id === id) {
        const nextIndex = (paymentSequence.indexOf(p.pago) + 1) % paymentSequence.length;
        nextStatus = paymentSequence[nextIndex];
        return { ...p, pago: nextStatus };
      }
      return p;
    });
    setParticipants(updated);
    addToast(`Pago actualizado: ${nextStatus}`, 'info');
    
    try {
      const docRef = doc(db, 'participants', id);
      await updateDoc(docRef, { pago: nextStatus });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `participants/${id}`);
    }
  };

  const handleResetDatabase = async () => {
    setParticipants(INITIAL_PARTICIPANTS);
    setSelectedCertificateId(null);
    
    try {
      const partRef = collection(db, 'participants');
      const partSnap = await getDocs(partRef);
      const batch = writeBatch(db);
      partSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });
      for (const part of INITIAL_PARTICIPANTS) {
        const docRef = doc(db, 'participants', part.id);
        batch.set(docRef, part);
      }
      await batch.commit();
      addToast('La base de datos de Firebase ha sido restablecida.', 'success');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'participants');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('saludmar_admin_authenticated');
    addToast('Sesión de administrador finalizada de forma segura.', 'info');
  };

  const handleViewCertificateOfStudent = (id: string) => {
    setSelectedCertificateId(id);
    setActiveTab('certificados');
  };

  // Find the selected participant or use the first participant with an active certificate to showcase
  const getCertificateTarget = (): Participant | null => {
    if (selectedCertificateId) {
      const found = participants.find((p) => p.id === selectedCertificateId);
      if (found) return found;
    }
    // Fallback: find the first sibling with an already active certificate so the view isn't blank
    const fallback = participants.find((p) => p.certificadoEmitido);
    return fallback || null;
  };

  const targetCertificateParticipant = getCertificateTarget();

  const getResolvedLayoutConfig = (participant: Participant): CertificateLayoutConfig => {
    const mode = layoutConfig.globalTemplateMode || 'per_course';
    if (mode === 'force_general') {
      return layoutConfig;
    }
    if (mode === 'force_course' && layoutConfig.forcedCourseId) {
      const targetId = layoutConfig.forcedCourseId;
      if (targetId === 'default') return layoutConfig;
      return courseLayoutConfigs[targetId] || layoutConfig;
    }
    return courseLayoutConfigs[participant.cursoId] || layoutConfig;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* HEADER SECTION (HIDDEN ON PRINT) */}
      <header className="bg-gradient-to-br from-[#061b31] via-[#082b4d] to-[#041324] text-white py-10 px-4 sm:px-8 border-b border-slate-900 shadow-md no-print relative overflow-hidden select-none">
        {/* Decorative organic shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Discrete Admin Link/Button in the top right corner */}
        <div className="absolute top-3 right-4 sm:right-6 z-10 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer border ${
              activeTab === 'admin'
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 hover:border-white/25 text-slate-300 hover:text-white border-white/10'
            }`}
          >
            {isAdminAuthenticated ? (
              <>
                <Unlock size={11} className="text-emerald-400" />
                <span>Panel Admin</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </>
            ) : (
              <>
                <Lock size={11} className="text-amber-400" />
                <span>Admin</span>
              </>
            )}
          </button>
          
          {isAdminAuthenticated && (
            <button
              onClick={handleLogout}
              title="Cerrar Sesión Admin"
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600/80 text-rose-300 hover:text-white border border-rose-500/25 transition-all duration-200 cursor-pointer text-xs flex items-center justify-center"
            >
              <LogOut size={11} />
            </button>
          )}
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between relative">
          
          {/* Logo Brand area */}
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 group relative overflow-hidden p-1.5">
              <SaludMarLogo size="custom" width={72} height={72} className="w-[72px] h-[72px] transform group-hover:scale-105 transition-transform duration-350" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans leading-none flex items-center justify-center md:justify-start gap-2">
                SALUD<span className="text-amber-400">MAR</span> ACADEMY
              </h1>
              <p className="text-slate-300 text-sm font-medium tracking-wide">
                Formación Continua para Profesionales que Salvan Vidas
              </p>
            </div>
          </div>

          {/* Mini Contact/Badge indicator */}
          <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <GraduationCap className="text-amber-400" size={24} />
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-white uppercase tracking-wider">Mesa Examinadora</div>
              <div className="text-slate-300 font-mono">soporte@saludmar.com</div>
            </div>
          </div>
        </div>
      </header>

      {/* NAVBAR NAVIGATION TABS (HIDDEN ON PRINT) */}
      <nav className="bg-white border-b border-slate-250/60 sticky top-0 z-40 shadow-sm no-print select-none">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1.5 overflow-x-auto py-3 justify-start sm:justify-center scrollbar-none">
            {[
              { id: 'inicio', label: 'Inicio', icon: Home },
              { id: 'inscripcion', label: 'Inscripción', icon: UserPlus },
              { id: 'aula', label: 'Aula Virtual', icon: GraduationCap },
              { id: 'certificados', label: 'Certificados', icon: Award },
              { id: 'validador', label: 'Validar Diploma', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-[#082b4d] text-white shadow-md' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:py-10 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <HomeSection 
              key="inicio" 
              onNavigate={(tab) => setActiveTab(tab)} 
              courses={courses} 
            />
          )}

          {activeTab === 'inscripcion' && (
            <InscripcionSection
              key="inscripcion"
              courses={courses}
              onAddParticipant={handleAddParticipant}
              addToast={addToast}
              onNavigate={(tab) => setActiveTab(tab)}
              urlSelectedCursoId={urlSelectedCursoId}
            />
          )}

          {activeTab === 'aula' && (
            <AulaSection
              key="aula"
              courses={courses}
              participants={participants}
              onAddParticipant={handleAddParticipant}
              onUpdateParticipantWithExam={handleUpdateParticipantWithExam}
              addToast={addToast}
            />
          )}

          {activeTab === 'admin' && !isAdminAuthenticated && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-150 text-center space-y-6 select-none relative overflow-hidden animate-fade-in"
            >
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#082b4d]/5 rounded-full blur-2xl pointer-events-none -ml-8 -mb-8" />

              <div className="w-16 h-16 bg-[#082b4d]/10 text-[#082b4d] rounded-2xl flex items-center justify-center mx-auto border border-[#082b4d]/20 relative">
                {pinError ? (
                  <motion.div
                    animate={{ x: [-6, 6, -6, 6, 0] }}
                    transition={{ duration: 0.4 }}
                    className="text-rose-600"
                  >
                    <Lock size={32} className="stroke-[2.5]" />
                  </motion.div>
                ) : (
                  <KeyRound size={32} className="stroke-[2.5]" />
                )}
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  ÁREA RESTRINGIDA
                </span>
                <h3 className="text-2xl font-black text-[#082b4d] tracking-tight">
                  Acceso de Administrador
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
                  Ingrese el código de seguridad de la Mesa Examinadora de SaludMar para autorizar firmas y emitir diplomas.
                </p>
              </div>

              {/* Login form styled nicely */}
              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 max-w-xs mx-auto select-text">
                <div className="relative">
                  <input
                    type="password"
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="Código de acceso..."
                    className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#082b4d] focus:ring-2 focus:ring-[#082b4d]/20 rounded-2xl text-slate-800 text-base font-mono tracking-wider transition-all outline-none"
                    autoFocus
                  />
                </div>

                {pinError && (
                  <p className="text-rose-600 text-xs font-bold font-mono">
                    ⚠️ Código incorrecto. Intente de nuevo.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#082b4d] hover:bg-slate-900 text-white font-bold text-sm tracking-wide rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock size={16} />
                  <span>Iniciar Sesión</span>
                </button>
              </form>


            </motion.div>
          )}

          {activeTab === 'admin' && isAdminAuthenticated && (
            <AdminSection
              key="admin"
              participants={participants}
              courses={courses}
              onUpdateCourse={(course) => handleUpdateCourse(course.id, course)}
              onCreateCourse={handleCreateCourse}
              onDeleteCourse={handleDeleteCourse}
              onMarkAttendance={handleMarkAttendance}
              onGenerateCertificate={handleGenerateCertificate}
              onDeleteParticipant={handleDeleteParticipant}
              onTogglePayment={handleTogglePayment}
              onResetDatabase={handleResetDatabase}
              addToast={addToast}
              onViewCertificateOfStudent={handleViewCertificateOfStudent}
              signatures={signatures}
              onSaveSignatures={handleSaveSignatures}
              layoutConfig={layoutConfig}
              courseLayoutConfigs={courseLayoutConfigs}
              onSaveLayoutConfig={handleSaveLayoutConfig}
              onAcceptParticipant={handleAcceptParticipant}
              onAcceptAllPending={handleAcceptAllPending}
              onUnlockAllCertificates={handleUnlockAllCertificates}
              onLogout={handleLogout}
              initialSearch={adminSearchParam}
              initialCourseFilter={adminCourseParam}
            />
          )}

          {activeTab === 'certificados' && (
            <motion.div
              key="certificados"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <CertificateSearch
                participants={participants}
                courses={courses}
                onSelectCertificate={(id) => setSelectedCertificateId(id)}
                selectedCertificateId={selectedCertificateId}
              />

              {/* Header inside Certificate frame showcasing download info */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print select-none">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Award className="text-amber-500" size={20} />
                    <span>Visualizador de Certificado Académico</span>
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-md">
                    {targetCertificateParticipant 
                      ? `Mostrando el diploma emitido de "${targetCertificateParticipant.nombre}".` 
                      : 'No hay certificados emitidos actualmente en los registros.'}
                  </p>
                </div>

                {targetCertificateParticipant && (
                  <div className="flex flex-wrap gap-2.5">
                    {isAdminAuthenticated && (
                      <button
                        onClick={() => setIsAdminDesignMode(!isAdminDesignMode)}
                        className={`flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isAdminDesignMode 
                            ? 'bg-[#082b4d] text-white border-[#082b4d] shadow-inner' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Sliders size={15} />
                        <span>{isAdminDesignMode ? 'Cerrar Ajustes' : 'Ajustar Firma / Márgenes'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <Printer size={15} />
                      <span>Imprimir / Descargar PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Render either valid Certificate template with optional side-by-side designer or alert notice */}
              {targetCertificateParticipant ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {isAdminAuthenticated && isAdminDesignMode && (
                    <div className="lg:col-span-5 no-print">
                      <CertificateDesigner 
                        layoutConfig={layoutConfig}
                        courseLayoutConfigs={courseLayoutConfigs}
                        courses={courses}
                        signatures={signatures}
                        initialSelectedCourseId={targetCertificateParticipant.cursoId}
                        onSaveLayoutConfig={handleSaveLayoutConfig}
                        addToast={addToast}
                      />
                    </div>
                  )}
                  
                  <div className={isAdminAuthenticated && isAdminDesignMode ? "lg:col-span-7" : "lg:col-span-12"}>
                    <CertificateTemplate 
                      participant={targetCertificateParticipant} 
                      signatures={signatures} 
                      layoutConfig={getResolvedLayoutConfig(targetCertificateParticipant)}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-4 no-print select-none">
                  <Award className="mx-auto text-slate-300" size={60} />
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">Ningún alumno seleccionado</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Debe dirigirse al "Panel Admin", acreditar la asistencia del participante que completó el curso y seleccionar la opción "Emitir" o "Ver Cert" para visualizar su diploma en este módulo.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="bg-[#082b4d] hover:bg-[#0b5c8c] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Ir al Panel Admin
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'validador' && (
            <ValidatorSection
              key="validador"
              participants={participants}
              onViewCertificateOfStudent={handleViewCertificateOfStudent}
              addToast={addToast}
              initialCode={urlVerifyCode}
            />
          )}

          {activeTab === 'asistencia_self' && (
            <AsistenciaSelfSection
              key="asistencia_self"
              courses={courses}
              participants={participants}
              onConfirmAttendance={handleSelfMarkAttendance}
              addToast={addToast}
              onNavigate={(tab) => setActiveTab(tab)}
              initialCourseId={urlSelectedAsistenciaCursoId}
            />
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER BRANDS CONTAINER (HIDDEN ON PRINT) */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-center text-xs space-y-2.5 no-print select-none">
        <div className="flex justify-center items-center gap-1 font-bold text-slate-300 uppercase tracking-widest text-[10px]">
          <span>SaludMar</span>
          <span className="text-amber-500">•</span>
          <span>Capacitaciones Médicas</span>
        </div>
        <p className="max-w-md mx-auto text-slate-500">
          Este sistema privado de folios digitales y acreditación es propiedad exclusiva de SaludMar. Registros y firmas resguardados bajo normas internas vigentes.
        </p>
        <p className="text-slate-600 font-mono text-[9px] mt-4">
          © {new Date().getFullYear()} SaludMar Academy • Todos los derechos reservados
        </p>
      </footer>

      {/* TOAST SYSTEM CONTAINER */}
      <Toast toasts={toasts} onRemove={removeToast} />
      
    </div>
  );
}
