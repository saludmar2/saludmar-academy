import React, { useState } from 'react';
import { Participant, Course, SignatureConfig, CertificateLayoutConfig } from '../types';
import { SignatureManager } from './SignatureManager';
import { CertificateDesigner } from './CertificateDesigner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Users, UserCheck, Award, Clock, 
  Trash2, Check, ExternalLink, RefreshCw, FileDown, 
  Filter, HelpCircle, CheckCircle, Smartphone, Mail, Building, PenTool, Palette, Copy, CheckSquare, Sparkles, GraduationCap, LogOut,
  BookOpen, Eye, Plus, Monitor, BookOpen as BookIcon, CheckCircle2
} from 'lucide-react';

interface AdminSectionProps {
  participants: Participant[];
  courses: Course[];
  onUpdateCourse: (course: Course) => void;
  onCreateCourse: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => Promise<boolean> | void;
  onMarkAttendance: (id: string) => void;
  onGenerateCertificate: (id: string) => void;
  onDeleteParticipant: (id: string) => void;
  onTogglePayment: (id: string) => void;
  onResetDatabase: () => void;
  addToast: (text: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onViewCertificateOfStudent: (id: string) => void;
  signatures: SignatureConfig[];
  onSaveSignatures: (newSignatures: SignatureConfig[], saveToDb?: boolean) => void;
  layoutConfig: CertificateLayoutConfig;
  courseLayoutConfigs?: Record<string, CertificateLayoutConfig>;
  onSaveLayoutConfig: (courseId: string, newLayout: CertificateLayoutConfig) => void;
  onAcceptParticipant: (id: string) => void;
  onAcceptAllPending: (courseId: string) => void;
  onUnlockAllCertificates: (courseId: string) => void;
  onLogout: () => void;
  initialSearch?: string;
  initialCourseFilter?: string;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  participants,
  courses,
  onUpdateCourse,
  onCreateCourse,
  onDeleteCourse,
  onMarkAttendance,
  onGenerateCertificate,
  onDeleteParticipant,
  onTogglePayment,
  onResetDatabase,
  addToast,
  onViewCertificateOfStudent,
  signatures,
  onSaveSignatures,
  layoutConfig,
  courseLayoutConfigs = {},
  onSaveLayoutConfig,
  onAcceptParticipant,
  onAcceptAllPending,
  onUnlockAllCertificates,
  onLogout,
  initialSearch = '',
  initialCourseFilter = 'ALL'
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState(initialCourseFilter);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [localStatusFilter, setLocalStatusFilter] = useState<'all' | 'assisted' | 'not_assisted' | 'not_paid'>('all');
  const [showSignatureManager, setShowSignatureManager] = useState(false);
  const [showLayoutConfigDesigner, setShowLayoutConfigDesigner] = useState(false);
  
  // Course/Class manager states
  const [showCourseManager, setShowCourseManager] = useState(false);
  const [courseEditorMode, setCourseEditorMode] = useState<'edit' | 'create'>('edit');
  
  // Edit course selector state
  const [editCourseId, setEditCourseId] = useState<string>(courses[0]?.id || 'urgencias-metabolicas');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Create Course states
  const [createTitle, setCreateTitle] = useState('');
  const [createCategory, setCreateCategory] = useState('Emergencias Médicas');
  const [createDuration, setCreateDuration] = useState('');
  const [createModality, setCreateModality] = useState('Virtual por Zoom');
  const [createDescription, setCreateDescription] = useState('');
  const [createTipoCurso, setCreateTipoCurso] = useState<'a_desarrollar' | 'grabado'>('a_desarrollar');

  // Shared resources states for the course being edited or created
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editHabilitada, setEditHabilitada] = useState(true);
  const [editBib, setEditBib] = useState<{title: string, url: string}[]>([]);
  const [editInfo, setEditInfo] = useState<{title: string, url: string}[]>([]);
  const [editQuestions, setEditQuestions] = useState<{id: string, question: string, options: string[], correctAnswerIndex: number}[]>([]);

  // Input states for adding dynamic elements inside editor
  const [newBibTitle, setNewBibTitle] = useState('');
  const [newBibUrl, setNewBibUrl] = useState('');
  const [newInfoTitle, setNewInfoTitle] = useState('');
  const [newInfoUrl, setNewInfoUrl] = useState('');

  // Helper helper to generate nice URL/ID slugs for added courses
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD') // remove accents
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  React.useEffect(() => {
    setShowDeleteConfirm(false);
    if (courseEditorMode !== 'edit') return;
    const c = courses.find(item => item.id === editCourseId) || courses[0];
    if (c) {
      setEditCourseId(c.id);
      setEditVideoUrl(c.videoUrl || '');
      setEditHabilitada(c.claseHabilitada !== false);
      setEditBib(c.bibliography || []);
      setEditInfo(c.infographics || []);
      setEditQuestions(c.examQuestions || [
        { id: 'q1', question: 'Pregunta 1', options: ['Opción A', 'Opción B', 'Opción C'], correctAnswerIndex: 0 },
        { id: 'q2', question: 'Pregunta 2', options: ['Opción A', 'Opción B', 'Opción C'], correctAnswerIndex: 0 },
        { id: 'q3', question: 'Pregunta 3', options: ['Opción A', 'Opción B', 'Opción C'], correctAnswerIndex: 0 }
      ]);
    }
  }, [editCourseId, courses, courses.length, courseEditorMode]);

  const handleSaveCourseSettings = () => {
    if (!editCourseId) return;
    
    // Ensure accurate questions structure with exactly 3 options each
    const formattedQuestions = editQuestions.map((q, idx) => ({
      id: q.id || `q${idx+1}`,
      question: q.question || `Pregunta ${idx+1}`,
      options: q.options && q.options.length === 3 ? q.options : ['Opción A', 'Opción B', 'Opción C'],
      correctAnswerIndex: Number(q.correctAnswerIndex ?? 0)
    }));

    const foundCourse = courses.find(c => c.id === editCourseId);
    if (!foundCourse) return;

    const updatedCourse: Course = {
      id: editCourseId,
      title: foundCourse.title || '',
      category: foundCourse.category || '',
      duration: foundCourse.duration || '',
      modality: foundCourse.modality || '',
      description: foundCourse.description || '',
      image: foundCourse.image || '',
      videoUrl: editVideoUrl.trim(),
      claseHabilitada: editHabilitada,
      bibliography: editBib,
      infographics: editInfo,
      examQuestions: formattedQuestions,
      tipoCurso: foundCourse.tipoCurso || (editVideoUrl.trim() ? 'grabado' : 'a_desarrollar')
    };
    
    onUpdateCourse(updatedCourse);
    addToast(`¡Materiales y examen de "${updatedCourse.title}" guardados con éxito!`, 'success');
    setShowCourseManager(false);
  };

  const handleSaveCreateCourseObj = () => {
    if (!createTitle.trim()) {
      addToast('El título del curso es obligatorio.', 'error');
      return;
    }
    if (!createDuration.trim()) {
      addToast('La duración u horario del curso es obligatoria.', 'error');
      return;
    }
    
    const courseId = slugify(createTitle) || `curso-${Date.now()}`;
    if (courses.some(c => c.id === courseId)) {
      addToast('Ya existe un curso académico con ese título o ID similar.', 'error');
      return;
    }

    const formattedQuestions = editQuestions.map((q, idx) => ({
      id: q.id || `q${idx+1}`,
      question: q.question || `Pregunta ${idx+1}`,
      options: q.options && q.options.length === 3 ? q.options : ['Opción A', 'Opción B', 'Opción C'],
      correctAnswerIndex: Number(q.correctAnswerIndex ?? 0)
    }));

    const newCourse: Course = {
      id: courseId,
      title: createTitle.trim(),
      category: createCategory,
      duration: createDuration.trim(),
      modality: createModality,
      description: createDescription.trim() || 'Curso académico dictado por SaludMar.',
      image: '',
      videoUrl: editVideoUrl.trim(),
      claseHabilitada: editHabilitada,
      bibliography: editBib,
      infographics: editInfo,
      examQuestions: formattedQuestions,
      tipoCurso: createTipoCurso
    };

    onCreateCourse(newCourse);
    
    // Clear and redirect
    setEditCourseId(courseId);
    setCourseEditorMode('edit');
    setShowCourseManager(false);
    
    // Clear create state inputs
    setCreateTitle('');
    setCreateDuration('');
    setCreateDescription('');
  };
  
  // New workflow variables
  const [adminListTab, setAdminListTab] = useState<'oficiales' | 'pendientes' | 'estadisticas'>('oficiales');
  const [selectedStatsCourseId, setSelectedStatsCourseId] = useState<string>('all');
  const [copiedCourseId, setCopiedCourseId] = useState<string | null>(null);
  const [copiedAttendanceCourseId, setCopiedAttendanceCourseId] = useState<string | null>(null);

  // Active registration link helper
  const activeLinkCourseId = selectedCourseFilter === 'ALL' ? courses[0]?.id : selectedCourseFilter;
  const activeLinkCourseObj = courses.find(c => c.id === activeLinkCourseId) || courses[0];

  // Compute stats for Official/Accepted Participants
  const officialParticipants = participants.filter(p => p.estado === 'Aceptado' || !p.estado);
  const pendingApprovals = participants.filter(p => p.estado === 'Pendiente');
  const pendingApprovalsCount = pendingApprovals.length;

  const totalRegistered = officialParticipants.length;
  const totalAttended = officialParticipants.filter((p) => p.asistencia).length;
  const totalCertificates = officialParticipants.filter((p) => p.certificadoEmitido).length;
  const totalPending = officialParticipants.filter((p) => !p.asistencia).length;

  // Filter participants based on active list tab, search criteria, and filter selectors
  const filteredParticipants = participants.filter((p) => {
    // Tab Segmenting
    const isPending = p.estado === 'Pendiente';
    if (adminListTab === 'oficiales' && isPending) return false;
    if (adminListTab === 'pendientes' && !isPending) return false;

    const matchesSearch = 
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.cedula.toLowerCase().includes(search.toLowerCase()) ||
      (p.correo && p.correo.toLowerCase().includes(search.toLowerCase())) ||
      (p.empresa && p.empresa.toLowerCase().includes(search.toLowerCase()));

    const matchesCourse = selectedCourseFilter === 'ALL' || p.cursoId === selectedCourseFilter;
    
    let matchesStatus = true;
    if (selectedStatusFilter === 'ATTENDED') matchesStatus = p.asistencia;
    if (selectedStatusFilter === 'PENDING_ATTENDANCE') matchesStatus = !p.asistencia;
    if (selectedStatusFilter === 'CERTIFICATE_ISSUED') matchesStatus = p.certificadoEmitido;
    if (selectedStatusFilter === 'PENDING_PAYMENT') matchesStatus = p.pago === 'Pendiente';

    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Helper to resolve the correct frontend URL domain when run inside an iframe or Google container
  const getAppPublicOrigin = () => {
    const origin = window.location.origin;
    if (
      !origin || 
      origin === 'null' || 
      origin.includes('google.com') || 
      origin.includes('googleusercontent.com') || 
      origin.includes('-dev-') || 
      origin.includes('localhost')
    ) {
      return 'https://ais-pre-cz2wbsqcmrr34jtsojsttn-303791901062.us-east5.run.app';
    }
    return origin;
  };

  const handleCopyLink = (courseId: string) => {
    const origin = getAppPublicOrigin();
    // Generate the student self-registration link
    const path = `${origin}/?curso=${courseId}`;
    navigator.clipboard.writeText(path)
      .then(() => {
        setCopiedCourseId(courseId);
        addToast('¡Enlace de inscripción copiado al portapapeles!', 'success');
        setTimeout(() => setCopiedCourseId(null), 2200);
      })
      .catch(() => {
        addToast('No se pudo copiar el enlace', 'error');
      });
  };

  const handleCopyAttendanceLink = (courseId: string) => {
    const origin = getAppPublicOrigin();
    // Generate the student self-attendance confirmation link
    const path = `${origin}/?asistencia=${courseId}`;
    navigator.clipboard.writeText(path)
      .then(() => {
        setCopiedAttendanceCourseId(courseId);
        addToast('¡Enlace de auto-asistencia copiado al portapapeles!', 'success');
        setTimeout(() => setCopiedAttendanceCourseId(null), 2200);
      })
      .catch(() => {
        addToast('No se pudo copiar el enlace', 'error');
      });
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(participants, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `comprobante_participantes_saludmar_${new Date().getFullYear()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Registros exportados en formato JSON correctamente', 'success');
    } catch (e) {
      addToast('No se pudo exportar la base de datos', 'error');
    }
  };



  return (
    <div className="space-y-8 select-none">
      
      {/* SECTION HEADER AND QUICK CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#082b4d] tracking-tight">
            Panel de Acreditación Académica
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Asigne estatus de asistencia, autorice folios de certificación digital y audite los depósitos de matrícula.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              setShowCourseManager(!showCourseManager);
              setShowSignatureManager(false);
              setShowLayoutConfigDesigner(false);
            }}
            className={`flex items-center gap-1.5 font-extrabold text-xs px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
              showCourseManager 
                ? 'bg-[#082b4d] text-white border-[#082b4d] shadow-md ring-2 ring-blue-100' 
                : 'bg-white hover:bg-slate-50 text-[#082b4d] border-slate-200'
            }`}
          >
            <BookIcon size={14} className={showCourseManager ? 'text-amber-400' : 'text-[#082b4d]'} />
            <span>📚 Gestionar Clases y Exámenes</span>
          </button>

          <button
            onClick={() => {
              setShowSignatureManager(!showSignatureManager);
              setShowLayoutConfigDesigner(false);
              setShowCourseManager(false);
            }}
            className={`flex items-center gap-1.5 font-extrabold text-xs px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
              showSignatureManager 
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-amber-400 shadow-md ring-2 ring-amber-200' 
                : 'bg-white hover:bg-slate-50 text-[#082b4d] border-slate-200'
            }`}
          >
            <PenTool size={14} />
            <span>✍️ Cargar Firmas Digitales</span>
          </button>

          <button
            onClick={() => {
              setShowLayoutConfigDesigner(!showLayoutConfigDesigner);
              setShowSignatureManager(false);
              setShowCourseManager(false);
            }}
            className={`flex items-center gap-1.5 font-extrabold text-xs px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
              showLayoutConfigDesigner 
                ? 'bg-indigo-650 hover:bg-indigo-700 text-[#082b4d] border-indigo-200 bg-indigo-50 shadow-md ring-2 ring-indigo-200/50' 
                : 'bg-white hover:bg-slate-50 text-[#082b4d] border-slate-200'
            }`}
          >
            <Palette size={14} className="text-indigo-600" />
            <span>🎨 Personalizar Plantilla</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-colors duration-250 cursor-pointer"
          >
            <FileDown size={14} />
            <span>Exportar JSON</span>
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que desea restablecer los alumnos por defecto? Esto eliminará registros manuales recientes.')) {
                onResetDatabase();
                addToast('Base de datos restablecida con los datos de demostración', 'info');
              }
            }}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-rose-200/50 transition-colors duration-250 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Limpiar / Reiniciar DB</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Desea cerrar la sesión de administrador de forma segura?')) {
                onLogout();
              }
            }}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-605 transition-colors duration-250 cursor-pointer"
            title="Cerrar sesión de administrador"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* SIGNATURE CONFIGURATION MANAGER COLLAPSED */}
      <AnimatePresence>
        {showSignatureManager && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <SignatureManager
              signatures={signatures}
              onSaveSignatures={onSaveSignatures}
              addToast={addToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CERTIFICATE DESIGN CUSTOMIZER COLLAPSED */}
      <AnimatePresence>
        {showLayoutConfigDesigner && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CertificateDesigner
              layoutConfig={layoutConfig}
              courseLayoutConfigs={courseLayoutConfigs}
              courses={courses}
              signatures={signatures}
              onSaveLayoutConfig={onSaveLayoutConfig}
              addToast={addToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* COURSE & MATERIALS MANAGER PANEL */}
      <AnimatePresence>
        {showCourseManager && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#082b4d] flex items-center gap-2">
                  <Monitor size={20} className="text-[#082b4d]" />
                  <span>{courseEditorMode === 'create' ? 'Cargar Nueva Capacitación / Curso' : 'Configuración de Contenidos y Aula Virtual'}</span>
                </h3>
                <p className="text-slate-500 text-xs">
                  {courseEditorMode === 'create' 
                    ? 'Complete la ficha técnica del curso académico y configure su examen y bibliografía correspondiente.' 
                    : 'Edite los enlaces de video, los materiales bibliográficos, las infografías y configure el examen correspondiente a cada capacitación.'}
                </p>
              </div>

              {/* Modo de Edición Sub-tabs */}
              <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCourseEditorMode('edit')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    courseEditorMode === 'edit'
                      ? 'bg-[#082b4d] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  📝 Editar Curso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourseEditorMode('create');
                    setCreateTitle('');
                    setCreateDuration('');
                    setCreateDescription('');
                    setEditVideoUrl('');
                    setEditHabilitada(true);
                    setEditBib([]);
                    setEditInfo([]);
                    setEditQuestions([
                      { id: 'q1', question: '¿Cuál es la primera acción frente a un paro cardiorrespiratorio precoz?', options: ['Llamar al sistema de emergencias y pedir DEA', 'Iniciar compresiones torácicas inmediatamente', 'Buscar un desfibrilador externo automático'], correctAnswerIndex: 0 },
                      { id: 'q2', question: '¿Qué relación de compresiones y ventilaciones se aplica en adultos?', options: ['15 compresiones y 2 ventilaciones', '30 compresiones y 2 ventilaciones', '30 compresiones y 5 ventilaciones'], correctAnswerIndex: 1 },
                      { id: 'q3', question: '¿Cuál es el ritmo de compresiones recomendado por minuto para RCP?', options: ['Al menos 60 a 80 por minuto', 'Entre 100 y 120 por minuto', 'Más de 140 por minuto'], correctAnswerIndex: 1 }
                    ]);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    courseEditorMode === 'create'
                      ? 'bg-[#082b4d] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  ✨ Agregar Curso
                </button>
              </div>

              {/* Selector de Capacitación a editar */}
              {courseEditorMode === 'edit' && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-600">Módulo:</span>
                    <select
                      value={editCourseId}
                      onChange={(e) => setEditCourseId(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#082b4d]"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {onDeleteCourse && (
                    <div className="flex items-center gap-1.5">
                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Trash2 size={13} />
                          <span>Eliminar Curso</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl text-xs">
                          <span className="font-bold text-rose-800">¿Confirmar eliminación absoluta del curso?</span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                const courseToDelete = courses.find(c => c.id === editCourseId);
                                if (!courseToDelete) return;
                                
                                await onDeleteCourse(editCourseId);
                                const remaining = courses.filter(c => c.id !== editCourseId);
                                if (remaining.length > 0) {
                                  setEditCourseId(remaining[0].id);
                                }
                                setShowDeleteConfirm(false);
                              }}
                              className="bg-rose-700 hover:bg-rose-800 text-white font-extrabold px-2 py-0.5 rounded-lg text-[10px] cursor-pointer"
                            >
                              Sí, borrar
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(false)}
                              className="bg-slate-250 hover:bg-slate-300 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[10px] cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Video URL & Habilitar Aula & Bibliografia */}
              <div className="space-y-6">
                
                {/* General Settings for New Course when in creation mode */}
                {courseEditorMode === 'create' && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-extrabold text-[#082b4d] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                       <Plus size={14} className="text-[#082b4d]" />
                       <span>Ficha Técnica de la Nueva Capacitación</span>
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título de la Capacitación</label>
                        <input
                          type="text"
                          value={createTitle}
                          onChange={(e) => setCreateTitle(e.target.value)}
                          placeholder="Ej: Análisis del Ritmo Cardíaco en Emergencias"
                          className="px-3 py-2 bg-slate-50 focus:bg-white border border-slate-250 rounded-xl text-xs w-full font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría Académica</label>
                          <select
                            value={createCategory}
                            onChange={(e) => setCreateCategory(e.target.value)}
                            className="px-3 py-2 bg-slate-50 focus:bg-white border border-slate-250 rounded-xl text-xs w-full font-semibold focus:outline-none"
                          >
                            <option value="Emergencias Médicas">Emergencias Médicas</option>
                            <option value="Enfermería Aplicada">Enfermería Aplicada</option>
                            <option value="Medicina Crítica">Medicina Crítica</option>
                            <option value="Cardiología">Cardiología</option>
                            <option value="Ginecología y Obstetricia">Ginecología y Obstetricia</option>
                            <option value="Soporte Vital y Trauma">Soporte Vital y Trauma</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Modalidad Académica</label>
                          <select
                            value={createModality}
                            onChange={(e) => setCreateModality(e.target.value)}
                            className="px-3 py-2 bg-slate-50 focus:bg-white border border-slate-250 rounded-xl text-xs w-full font-semibold focus:outline-none"
                          >
                            <option value="Virtual por Zoom">Virtual por Zoom (Sincrónico)</option>
                            <option value="Virtual por Grabación (Asíncrono)">Virtual por Grabación (Asíncrono)</option>
                            <option value="Presencial (Práctico/Teórico)">Presencial en Sede</option>
                            <option value="Mixta Híbrida">Modalidad Mixta (Híbrida)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Horario / Duración o Fecha del Evento</label>
                        <input
                          type="text"
                          value={createDuration}
                          onChange={(e) => setCreateDuration(e.target.value)}
                          placeholder="Ej: Sábado 18 de Julio - 14:00 HS"
                          className="px-3 py-2 bg-slate-50 focus:bg-white border border-slate-250 rounded-xl text-xs w-full font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 mt-1">
                        <label className="text-[10px] font-black text-[#082b4d] uppercase tracking-wider block">Tipo de Capacitación</label>
                        <div className="flex flex-col sm:flex-row gap-3 pt-1.5 border-t border-slate-200/50">
                          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700 select-none">
                            <input
                              type="radio"
                              name="tipoCurso"
                              checked={createTipoCurso === 'a_desarrollar'}
                              onChange={() => setCreateTipoCurso('a_desarrollar')}
                              className="h-4 w-4 text-[#082b4d] border-slate-300 focus:ring-[#082b4d]"
                            />
                            <span>A desarrollarse (En vivo / Próximamente)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700 select-none">
                            <input
                              type="radio"
                              name="tipoCurso"
                              checked={createTipoCurso === 'grabado'}
                              onChange={() => setCreateTipoCurso('grabado')}
                              className="h-4 w-4 text-[#082b4d] border-slate-300 focus:ring-[#082b4d]"
                            />
                            <span>Ya grabado (Acceso Directo Aula)</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Breve Descripción e Inversión (Gs.)</label>
                        <textarea
                          value={createDescription}
                          onChange={(e) => setCreateDescription(e.target.value)}
                          placeholder="Ej: Taller certificado de alta especificidad. Inversión: Gs. 50.000. Una vez aprobado el examen, el certificado digital se emite en el acto de forma permanente."
                          rows={3}
                          className="px-3 py-2 bg-slate-50 focus:bg-white border border-slate-250 rounded-xl text-xs w-full font-semibold focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Video & Aula switch card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Monitor size={14} className="text-slate-500" />
                    <span>Videoclase & Acceso Virtual</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Enlace del Video Completo (Link de YouTube o Vimeo)</label>
                      <input
                        type="text"
                        value={editVideoUrl}
                        onChange={(e) => setEditVideoUrl(e.target.value)}
                        placeholder="Ej: https://www.youtube.com/embed/dQw4w9WgXcQ"
                        className="px-3 py-2 border border-slate-200 rounded-xl text-xs w-full bg-slate-50 focus:bg-white"
                      />
                      <p className="text-[9.5px] text-slate-400">
                        Preferentemente use enlaces en formato de inserción de video (ej. /embed/).
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-150 mt-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">Habilitación del Aula Virtual</span>
                        <span className="text-[10px] text-slate-500 block">Si la desactivas, los alumnos de este curso no verán el reproductor de video ni el examen.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditHabilitada(!editHabilitada)}
                        className={`font-mono text-xs px-3 py-1.5 rounded-lg font-bold border transition-all ${
                          editHabilitada 
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                            : 'bg-rose-100 border-rose-300 text-rose-800'
                        }`}
                      >
                        {editHabilitada ? '🟢 HABILITADA' : '🔴 PAUSADA'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bibliografía card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <BookOpen size={14} className="text-slate-500" />
                    <span>Bibliografía de Apoyo</span>
                  </h4>
                  
                  {/* Dynamic list rendering */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {editBib.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-2">No hay recursos bibliográficos agregados.</p>
                    ) : (
                      editBib.map((bib, index) => (
                        <div key={index} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl border border-slate-150">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-800 block truncate">{bib.title}</span>
                            <span className="font-mono text-[9px] text-slate-400 block truncate">{bib.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditBib(editBib.filter((_, i) => i !== index))}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Eliminar recurso"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add form row */}
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150 space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Agregar Nuevo Material Bibliográfico</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Título del Artículo"
                        value={newBibTitle}
                        onChange={(e) => setNewBibTitle(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Enlace o PDF (https://...)"
                        value={newBibUrl}
                        onChange={(e) => setNewBibUrl(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBibTitle || !newBibUrl) {
                          addToast('Ingrese el título y el enlace enlace del material', 'warning');
                          return;
                        }
                        setEditBib([...editBib, { title: newBibTitle, url: newBibUrl }]);
                        setNewBibTitle('');
                        setNewBibUrl('');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#082b4d] hover:bg-indigo-950 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Insertar Fila Bibliográfica</span>
                    </button>
                  </div>
                </div>

                {/* Infographics card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Eye size={14} className="text-slate-500" />
                    <span>Infografías & Material de Mesa</span>
                  </h4>
                  
                  {/* Dynamic list rendering */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {editInfo.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-2">No hay infografías clínicas cargadas.</p>
                    ) : (
                      editInfo.map((inf, index) => (
                        <div key={index} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl border border-slate-150">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-800 block truncate">{inf.title}</span>
                            <span className="font-mono text-[9px] text-slate-400 block truncate">{inf.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditInfo(editInfo.filter((_, i) => i !== index))}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Eliminar Infografía"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add form row */}
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150 space-y-2">
                    <span className="text-[9px] font-bold text-slate-505 uppercase tracking-widest block">Agregar Nueva Infografía</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Título o Epígrafe Clínico"
                        value={newInfoTitle}
                        onChange={(e) => setNewInfoTitle(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="URL de la imagen (https://...)"
                        value={newInfoUrl}
                        onChange={(e) => setNewInfoUrl(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newInfoTitle || !newInfoUrl) {
                          addToast('Debe escribir el título y una URL de imagen válida', 'warning');
                          return;
                        }
                        setEditInfo([...editInfo, { title: newInfoTitle, url: newInfoUrl }]);
                        setNewInfoTitle('');
                        setNewInfoUrl('');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#082b4d] hover:bg-indigo-950 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Cargar Fila de Infografía</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: EXAM QUESTIONS */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Award size={14} className="text-slate-505" />
                    <span>Banco de Reactivos del Examen Técnico (3 Preguntas)</span>
                  </h4>

                  <div className="space-y-5">
                    {editQuestions.map((q, qIdx) => (
                      <div key={q.id || `q-${qIdx}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                        <div className="flex justify-between items-center bg-slate-200/50 -m-4 mb-1 p-2.5 px-4 rounded-t-xl border-b border-slate-200">
                          <span className="font-bold text-slate-700 font-sans text-[11px] uppercase">Pregunta #{qIdx + 1}</span>
                          <span className="font-mono text-[9px] text-[#082b4d] bg-white border border-slate-200 px-1.5 py-0.5 rounded">Acreditación Obligatoria</span>
                        </div>

                        {/* Question Input */}
                        <div className="flex flex-col gap-1 pt-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">Enunciado de la Pregunta</label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => {
                              const updated = [...editQuestions];
                              updated[qIdx].question = e.target.value;
                              setEditQuestions(updated);
                            }}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                          />
                        </div>

                        {/* Options Inputs */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block pl-0.5">Opciones de Respuesta</span>
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-2 items-center">
                              <span className="font-mono font-bold text-slate-400 text-xs w-4">
                                {oIdx === 0 ? 'A)' : oIdx === 1 ? 'B)' : 'C)'}
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...editQuestions];
                                  updated[qIdx].options[oIdx] = e.target.value;
                                  setEditQuestions(updated);
                                }}
                                className="px-2 ml-1 p-1.5 bg-white border border-slate-350 rounded-md text-xs w-full"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Correct Option Dropdown */}
                        <div className="flex flex-col gap-1 pt-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">Opción Correcta</label>
                          <select
                            value={q.correctAnswerIndex}
                            onChange={(e) => {
                              const updated = [...editQuestions];
                              updated[qIdx].correctAnswerIndex = Number(e.target.value);
                              setEditQuestions(updated);
                            }}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-bold"
                          >
                            <option value={0}>Opción A) es la correcta</option>
                            <option value={1}>Opción B) es la correcta</option>
                            <option value={2}>Opción C) es la correcta</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions Row */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 text-sm font-sans">
              <button
                type="button"
                onClick={() => {
                  setShowCourseManager(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-705 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={courseEditorMode === 'create' ? handleSaveCreateCourseObj : handleSaveCourseSettings}
                className="px-6 py-2 bg-[#082b4d] hover:bg-indigo-950 text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={15} className="text-amber-400" />
                <span>{courseEditorMode === 'create' ? 'Publicar Nueva Capacitación' : 'Guardar Materiales y Examen'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECCIÓN ESPECIAL: ENLACES DE INSCRIPCIÓN Y ACCIONES POR CURSO */}
      <div className="bg-[#031525] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        {/* Subtle background overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="flex flex-col lg:flex-row items-stretch gap-8 relative">
          
          {/* Left panel: Enlace de inscripción */}
          <div className="flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 uppercase tracking-widest">
                <Sparkles size={11} />
                <span>RECEPCIÓN DIGITAL AUTOMÁTICA & ASISTENCIA</span>
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-extrabold tracking-tight">
                Enlaces para Estudiantes
              </h3>
              <p className="text-slate-350 text-xs max-w-lg leading-relaxed text-slate-300">
                Comparte estos enlaces interactivos con los alumnos según la etapa de la capacitación para automatizar el ingreso de datos y acreditar la presencialidad.
              </p>
            </div>

            {/* Course active indicator */}
            <div className="space-y-4 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Curso Activo seleccionado:</span>
                <span className="font-semibold text-amber-300 font-mono">
                  {activeLinkCourseObj?.title || 'Todos'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Link de Inscripción */}
                <div className="bg-[#051c30]/50 border border-slate-800 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Enlace de Inscripción
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold uppercase">
                      Al Inicio
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Para que los estudiantes completen sus datos de registro oficial antes de comenzar la jornada.
                  </p>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      readOnly
                      value={`${getAppPublicOrigin()}/?curso=${activeLinkCourseObj?.id}`}
                      className="w-full bg-[#051c30] border border-slate-700/80 rounded-xl px-2.5 py-2 text-[11px] text-slate-300 font-mono focus:outline-none"
                    />
                    
                    <button
                      onClick={() => handleCopyLink(activeLinkCourseObj?.id)}
                      className={`flex items-center gap-1 font-bold text-[10px] px-3 py-2 rounded-xl transition-all shadow-sm ${
                        copiedCourseId === activeLinkCourseObj?.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      } shrink-0 cursor-pointer`}
                    >
                      {copiedCourseId === activeLinkCourseObj?.id ? (
                        <>
                          <CheckCircle size={12} />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Link de Auto-Asistencia */}
                <div className="bg-[#051c30]/50 border border-slate-800 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Enlace Asistencia Mágica
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-bold uppercase">
                      Mitad o Fin
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Comparte este enlace a mitad o fin de clase. El alumno registrado carga su Cédula e ingresa al instante como **Presente**.
                  </p>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      readOnly
                      value={`${getAppPublicOrigin()}/?asistencia=${activeLinkCourseObj?.id}`}
                      className="w-full bg-[#051c30] border border-slate-700/80 rounded-xl px-2.5 py-2 text-[11px] text-slate-300 font-mono focus:outline-none"
                    />
                    
                    <button
                      onClick={() => handleCopyAttendanceLink(activeLinkCourseObj?.id)}
                      className={`flex items-center gap-1 font-bold text-[10px] px-3 py-2 rounded-xl transition-all shadow-sm ${
                        copiedAttendanceCourseId === activeLinkCourseObj?.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-white'
                      } shrink-0 cursor-pointer`}
                    >
                      {copiedAttendanceCourseId === activeLinkCourseObj?.id ? (
                        <>
                          <CheckCircle size={12} />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: bulk action (desbloqueo de certificados) */}
          <div className="w-full lg:w-[350px] bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <GraduationCap className="text-amber-400" size={16} />
                <span>Finalización & Cierre del Curso</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Al concluir el taller presencial o vía Zoom, haz clic en el siguiente botón para <strong>marcar asistencia</strong> y <strong>desbloquear masivamente los certificados</strong> para todos los alumnos inscriptos y previamente aceptados en la lista oficial de este curso.
              </p>
            </div>

            <button
              onClick={() => {
                const confirmed = window.confirm(
                  `¿Confirmas la culminación del taller "${activeLinkCourseObj?.title}"? Esto acreditará la asistencia y habilitará para descarga segura los certificados de TODOS los alumnos aprobados en este curso.`
                );
                if (confirmed) {
                  onUnlockAllCertificates(activeLinkCourseObj?.id);
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#082b4d] hover:bg-[#0b5c8c] text-white font-extrabold text-xs py-3 rounded-xl shadow-md border border-sky-850 hover:border-sky-500 transition-all cursor-pointer"
            >
              <Award size={15} className="text-amber-400" />
              <span>Finalizar Taller e Iniciar Emisión Masiva</span>
            </button>
          </div>

        </div>
      </div>

      {/* STATS PANELS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            title: 'Inscritos Registrados',
            value: totalRegistered,
            icon: Users,
            color: 'from-blue-500/10 to-indigo-500/5 text-[#082b4d] border-blue-100/50'
          },
          {
            title: 'Asistieron Confirmados',
            value: totalAttended,
            icon: UserCheck,
            color: 'from-sky-500/10 to-cyan-500/5 text-sky-800 border-sky-100/50'
          },
          {
            title: 'Certificados Emitidos',
            value: totalCertificates,
            icon: Award,
            color: 'from-emerald-500/10 to-teal-500/5 text-emerald-800 border-emerald-100/50'
          },
          {
            title: 'Faltan de Acreditación',
            value: totalPending,
            icon: Clock,
            color: 'from-amber-500/10 to-yellow-500/5 text-amber-800 border-amber-100/50'
          }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border shadow-xs flex flex-col justify-between h-28 relative overflow-hidden`}
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {stat.title}
              </span>
              <stat.icon size={18} className="opacity-80" />
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold tracking-tight font-sans">
                {stat.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SECCIÓN DE TABS: OFICIALES VS SOLICITUDES PENDIENTES */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setAdminListTab('oficiales')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all duration-200 cursor-pointer ${
              adminListTab === 'oficiales'
                ? 'bg-[#082b4d] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
            }`}
          >
            <Users size={16} />
            <span>Lista Oficial de Inscriptos ({totalRegistered})</span>
          </button>

          <button
            onClick={() => setAdminListTab('pendientes')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all duration-200 relative cursor-pointer ${
              adminListTab === 'pendientes'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
            }`}
          >
            <Clock size={16} />
            <span>Solicitudes Pendientes ({pendingApprovalsCount})</span>
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white font-bold items-center justify-center">
                  {pendingApprovalsCount}
                </span>
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminListTab('estadisticas')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all duration-200 cursor-pointer ${
              adminListTab === 'estadisticas'
                ? 'bg-indigo-650 text-white shadow-md font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
            }`}
          >
            <span>📊 Estadísticas por Taller</span>
          </button>
        </div>

        {/* Bulk approval button inside the sub-tab */}
        {adminListTab === 'pendientes' && pendingApprovalsCount > 0 && (
          <button
            onClick={() => {
              const activeCourseTitle = selectedCourseFilter === 'ALL' ? 'todos los talleres' : courses.find(c => c.id === selectedCourseFilter)?.title;
              const confirmed = window.confirm(
                `¿Seguro que desea aprobar de forma masiva todas las solicitudes pendientes para "${activeCourseTitle}"?`
              );
              if (confirmed) {
                onAcceptAllPending(selectedCourseFilter);
              }
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <CheckSquare size={14} />
            <span>Aprobar Todos de este Curso</span>
          </button>
        )}
      </div>

      {adminListTab === 'estadisticas' ? (
        <div className="space-y-6">
          {/* STATS INTERACTIVE HEADER */}
          <div className="bg-gradient-to-br from-[#082b4d] to-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-sm border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>📊 Monitoreo Estadístico & Auditoría por Taller</span>
                </h3>
                <p className="text-slate-300 text-xs mt-1">
                  Seleccione un taller específico para evaluar métricas, auditar la lista de personas que asistieron, descargar reportes y excluir alumnos si es pertinente.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
                <span className="text-xs text-amber-300 font-bold">Taller:</span>
                <select
                  value={selectedStatsCourseId}
                  onChange={(e) => {
                    setSelectedStatsCourseId(e.target.value);
                    setLocalStatusFilter('all');
                  }}
                  className="bg-transparent text-white rounded-md text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-white">[Todos los Talleres]</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* General metrics aggregation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-white/10">
              {(() => {
                const targetCourses = selectedStatsCourseId === 'all' 
                  ? courses 
                  : courses.filter(c => c.id === selectedStatsCourseId);
                
                const targetCourseIds = targetCourses.map(c => c.id);
                const blockParticipants = participants.filter(p => targetCourseIds.includes(p.cursoId) && p.estado !== 'Pendiente');
                
                const totalIn = blockParticipants.length;
                const totalAsis = blockParticipants.filter(p => p.asistencia).length;
                const totalPag = blockParticipants.filter(p => p.pago === 'Confirmado').length;
                const totalCert = blockParticipants.filter(p => p.certificadoEmitido).length;
                const promExamen = blockParticipants.filter(p => p.examenAprobado).length;

                const passRate = totalIn > 0 ? Math.round((promExamen / totalIn) * 100) : 0;
                const asisRate = totalIn > 0 ? Math.round((totalAsis / totalIn) * 100) : 0;
                const pagRate = totalIn > 0 ? Math.round((totalPag / totalIn) * 100) : 0;

                return (
                  <>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Inscriptos</span>
                      <span className="text-2xl font-black text-white">{totalIn}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Cupo oficial activo</span>
                    </div>
                    
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Asistencia Real</span>
                      <span className="text-2xl font-black text-white">{totalAsis} <span className="text-xs font-bold text-emerald-400">({asisRate}%)</span></span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Alumnos presentes</span>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Matrículas Pagas</span>
                      <span className="text-2xl font-black text-white">{totalPag} <span className="text-xs font-bold text-sky-400">({pagRate}%)</span></span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Arancel validado</span>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Examen Aprobado</span>
                      <span className="text-2xl font-black text-white">{promExamen} <span className="text-xs font-bold text-amber-400">({passRate}%)</span></span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Pasaron la evaluación</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* GRID OF INDIVIDUAL WORKSHOP CARDS (IF "ALL" CHOSEN) */}
          {selectedStatsCourseId === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map(course => {
                const cParticipants = participants.filter(p => p.cursoId === course.id && p.estado !== 'Pendiente');
                const cEnrolled = cParticipants.length;
                const cAttended = cParticipants.filter(p => p.asistencia).length;
                const cPaid = cParticipants.filter(p => p.pago === 'Confirmado').length;
                const cCerted = cParticipants.filter(p => p.certificadoEmitido).length;
                const cAsisPercent = cEnrolled > 0 ? Math.round((cAttended / cEnrolled) * 100) : 0;
                
                return (
                  <div key={course.id} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs space-y-4 hover:border-indigo-400/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {course.category}
                      </span>
                      <h4 className="font-serif font-bold text-slate-850 text-sm mt-1 leading-snug line-clamp-2 min-h-10">
                        {course.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Modalidad: {course.modality}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Attendance progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>Índice de Asistencia</span>
                          <span className="font-mono text-slate-800">{cAsisPercent}% ({cAttended}/{cEnrolled})</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${cAsisPercent}%` }} 
                          />
                        </div>
                      </div>

                      {/* Summary chips */}
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Acreditado</span>
                          <span className="text-xs font-black text-emerald-700">{cPaid}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Aprobó</span>
                          <span className="text-xs font-black text-amber-700">
                            {cParticipants.filter(p => p.examenAprobado).length}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Foliados</span>
                          <span className="text-xs font-black text-indigo-700">{cCerted}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedStatsCourseId(course.id)}
                        className="w-full py-2 bg-slate-50 hover:bg-[#082b4d] hover:text-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>🔍 Auditar Alumnos ({cEnrolled})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ATTENDEE AUDITING LIST & DELETION FOR SELECTED WORKSHOP */}
          {(() => {
            const isAll = selectedStatsCourseId === 'all';
            const inspectCourseIds = isAll ? courses.map(c => c.id) : [selectedStatsCourseId];
            
            let statsParticipants = participants.filter(p => inspectCourseIds.includes(p.cursoId) && p.estado !== 'Pendiente');
            
            if (localStatusFilter === 'assisted') {
              statsParticipants = statsParticipants.filter(p => p.asistencia);
            } else if (localStatusFilter === 'not_assisted') {
              statsParticipants = statsParticipants.filter(p => !p.asistencia);
            } else if (localStatusFilter === 'not_paid') {
              statsParticipants = statsParticipants.filter(p => p.pago === 'Pendiente');
            }

            return (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-serif font-black text-slate-800 text-sm flex items-center gap-2">
                      <Users size={16} className="text-[#082b4d]" />
                      <span>
                        {isAll 
                          ? 'Lista Consolidada de Participantes (Todos los Talleres)' 
                          : `Alumnos Registrados en: ${courses.find(c => c.id === selectedStatsCourseId)?.title}`}
                      </span>
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Visualice alumnos, confirme asistencia, revise aranceles y remueva matrículas si hace falta.
                    </p>
                  </div>

                  {/* Filter tabs inside */}
                  <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'assisted', label: '✅ Asistieron' },
                      { id: 'not_assisted', label: '❌ Inasistentes' },
                      { id: 'not_paid', label: '💸 Pago Pendiente' }
                    ].map(subf => (
                      <button
                        key={subf.id}
                        type="button"
                        onClick={() => setLocalStatusFilter(subf.id as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          localStatusFilter === subf.id
                            ? 'bg-[#082b4d] text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {subf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main mini-table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#082b4d] text-white text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-4 rounded-l-xl">Participante</th>
                        <th className="p-4">Cédula CI</th>
                        <th className="p-4">Asistencia</th>
                        <th className="p-4">Arancel Pago</th>
                        <th className="p-4">Calificación Examen</th>
                        <th className="p-4 text-center">Código Folio</th>
                        <th className="p-4 text-right rounded-r-xl">Excluir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-xs">
                      {statsParticipants.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                            Ningún participante oficial coincide con el sub-filtro seleccionado.
                          </td>
                        </tr>
                      ) : (
                        statsParticipants.map(sp => (
                          <tr key={sp.id} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className="font-bold text-slate-850 block">{sp.nombre}</span>
                                <div className="flex flex-col gap-1">
                                  {sp.empresa && (
                                    <span className="text-[10px] text-slate-400 block">
                                      🏢 {sp.empresa} {sp.cargo && `(${sp.cargo})`}
                                    </span>
                                  )}
                                  {isAll && (
                                    <span className="inline-block text-[9px] text-indigo-700 font-extrabold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded truncate max-w-xs w-fit">
                                      {sp.cursoNombre}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-semibold text-slate-600">{sp.cedula}</td>
                            <td className="p-4">
                              {sp.asistencia ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-805 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                  <CheckSquare size={10} className="text-emerald-600" />
                                  <span>Asistió</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                  <Clock size={10} className="text-rose-600" />
                                  <span>Ausencia</span>
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => onTogglePayment(sp.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors cursor-pointer ${
                                  sp.pago === 'Confirmado' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                                    : 'bg-rose-50 text-rose-805 border-rose-200 hover:bg-rose-100'
                                }`}
                              >
                                {sp.pago}
                              </button>
                            </td>
                            <td className="p-4">
                              {sp.examenAprobado ? (
                                <span className="font-mono text-[10px] bg-sky-50 text-indigo-850 border border-sky-200 px-2 py-1 rounded font-bold">
                                  APROBADO ({sp.examenNota || '80%'})
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium italic">No rindió o reprobó</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {sp.certificadoEmitido ? (
                                <span className="font-mono text-[10px] bg-yellow-50 text-amber-950 border border-yellow-250 px-2 py-0.5 rounded font-black">
                                  {sp.certificadoCodigo}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic font-medium">No foliado</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    `¿Está absolutamente seguro de que desea ELIMINAR / EXCLUIR a "${sp.nombre}" de la base de datos?\n\nEsta acción removerá sus comprobantes, notas de examen y certificados de forma irrevocable.`
                                  );
                                  if (confirmed) {
                                    onDeleteParticipant(sp.id);
                                    addToast(`El alumno ${sp.nombre} ha sido excluido de forma absoluta.`, 'warning');
                                  }
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-605 hover:text-white text-rose-700 border border-rose-200 rounded-xl transition-all inline-flex items-center gap-1 font-bold cursor-pointer shadow-2xs"
                              >
                                <Trash2 size={12} />
                                <span>Excluir</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!isAll && (
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">
                      Auditoría interna SaludMar. Registros mostrados: <strong>{statsParticipants.length}</strong> alumnos.
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedStatsCourseId('all')}
                      className="px-3 py-1.5 text-xs text-indigo-700 font-bold border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                    >
                      ← Volver a Vista de Todos los Talleres
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        <>
          {/* SEARCH AND FILTERS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar participante por nombre, cédula (CI), organización..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100/80 transition-all duration-255"
                />
              </div>

              {/* Course filter select */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <Filter size={15} className="text-slate-400" />
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
                >
                  <option value="ALL">Todos los Cursos</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Status filter select */}
              <div className="flex items-center gap-2 min-w-[170px]">
                <Filter size={15} className="text-slate-400" />
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
                >
                  <option value="ALL">Cualquier Estatus</option>
                  <option value="ATTENDED">Asistió</option>
                  <option value="PENDING_ATTENDANCE">Pendiente Asistencia</option>
                  <option value="CERTIFICATE_ISSUED">Certificado Emitido</option>
                  <option value="PENDING_PAYMENT">Pago Pendiente</option>
                </select>
              </div>
            </div>
          </div>

          {/* DATA GRID TABLE */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#082b4d] text-white">
                    <th className="p-4 pl-6 text-xs font-bold uppercase tracking-wider">Ficha Participante</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider">C.I. / Documento</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider">Curso de Instrucción</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider">Acreditación Pago</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider">Confirmar Asistencia</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Folio Digital emitido</th>
                    <th className="p-4 pr-6 text-xs font-bold uppercase tracking-wider text-right">Controles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-sm italic">
                        Ningún participante coincide con los criterios de búsqueda especificados.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p) => {
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/55 transition-colors duration-200 font-semibold text-xs text-slate-700">
                          {/* Name Card and info */}
                          <td className="p-4 pl-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-850 leading-tight text-sm">
                                  {p.nombre}
                                </span>
                                {p.examenAprobado && (
                                  <span className="inline-flex items-center gap-0.5 bg-emerald-100/90 text-emerald-850 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono shrink-0">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    <span>🎓 EXAMEN: {p.examenNota || 'APROBADO'}</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-400">
                                {p.empresa && (
                                  <span className="flex items-center gap-0.5">
                                    <Building size={11} />
                                    {p.empresa} {p.cargo && `(${p.cargo})`}
                                  </span>
                                )}
                                {p.telefono && (
                                  <span className="flex items-center gap-0.5">
                                    <Smartphone size={11} />
                                    {p.telefono}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Legal CI Document */}
                          <td className="p-4">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                              {p.cedula}
                            </span>
                          </td>

                          {/* Course item */}
                          <td className="p-4">
                            <div className="space-y-0.5 max-w-[200px]">
                              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                                {p.cursoNombre}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {p.modalidad} · {p.fecha}
                              </span>
                            </div>
                          </td>

                          {/* Payment state button cycling */}
                          <td className="p-4">
                            <button
                              onClick={() => onTogglePayment(p.id)}
                              className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-colors duration-200 cursor-pointer ${
                                p.pago === 'Pendiente'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100'
                              }`}
                            >
                              {p.pago}
                            </button>
                          </td>

                          {/* Attendance checkbox action */}
                          <td className="p-4">
                            {adminListTab === 'pendientes' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-805 border border-amber-200/60 font-semibold text-[11px]">
                                <Clock size={11} className="text-amber-600" />
                                <span>Pre-inscrito</span>
                              </span>
                            ) : p.asistencia ? (
                              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 py-1 bg-emerald-50 rounded-full border border-emerald-100/50 px-2.5">
                                <CheckCircle size={12} />
                                <span>Confirmada</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => onMarkAttendance(p.id)}
                                className="flex items-center gap-1 text-[11.5px] font-bold text-slate-600 hover:text-[#082b4d] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-350 bg-white transition-all cursor-pointer"
                              >
                                <UserCheck size={12} />
                                <span>Acreditar</span>
                              </button>
                            )}
                          </td>

                          {/* Generated Code serial */}
                          <td className="p-4 text-center">
                            {adminListTab === 'pendientes' ? (
                              <span className="text-[11px] text-slate-400 font-medium italic">
                                Por admitir
                              </span>
                            ) : p.certificadoEmitido ? (
                              <span className="font-mono text-xs font-extrabold text-[#082b4d] bg-yellow-50 px-2.5 py-1 rounded font-semibold border border-yellow-200/50">
                                {p.certificadoCodigo}
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-400 italic">
                                No emitido
                              </span>
                            )}
                          </td>

                          {/* Options and Actions */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              {adminListTab === 'pendientes' ? (
                                <button
                                  onClick={() => {
                                    onAcceptParticipant(p.id);
                                    addToast(`¡Inscripción de ${p.nombre} aprobada de forma exitosa!`, 'success');
                                  }}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                                  title="Aceptar Alumno"
                                >
                                  <Check size={12} />
                                  <span>✓ Aceptar</span>
                                </button>
                              ) : (
                                p.asistencia && (
                                  <button
                                    onClick={() => {
                                      if (!p.certificadoEmitido) {
                                        onGenerateCertificate(p.id);
                                      } else {
                                        onViewCertificateOfStudent(p.id);
                                      }
                                    }}
                                    className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-600 hover:to-amber-700 font-bold text-[11px] px-2.5 py-1.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                                    title={p.certificadoEmitido ? 'Ver e Imprimir Certificado de Alumno' : 'Autorizar Código Certificado'}
                                  >
                                    <Award size={12} />
                                    <span>{p.certificadoEmitido ? 'Ver Cert' : 'Emitir'}</span>
                                  </button>
                                )
                              )}

                              <button
                                onClick={() => {
                                  const listMsg = adminListTab === 'pendientes'
                                    ? `¿Desea denegar y eliminar la solicitud de pre-inscripción de "${p.nombre}"?`
                                    : `¿Desea eliminar de forma permanente a "${p.nombre}" de la lista oficial de ${p.cursoNombre}?`;
                                  if (window.confirm(listMsg)) {
                                    onDeleteParticipant(p.id);
                                    addToast('Participante removido con éxito', 'warning');
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors duration-200 border border-transparent hover:border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                                title="Eliminar inscripción"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Dynamic total count label */}
            <div className="p-4 pl-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <div>
                Mostrando <strong>{filteredParticipants.length}</strong> {adminListTab === 'pendientes' ? 'solicitudes' : 'alumnos oficiales'} de un total de <strong>{participants.length}</strong> registros.
              </div>
              <div className="flex gap-2 text-slate-400">
                <span>Oficiales: {totalRegistered}</span>
                <span>•</span>
                <span>Pendientes: {pendingApprovalsCount}</span>
                <span>•</span>
                <span>Con Certificado: {totalCertificates}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
