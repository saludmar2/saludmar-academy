import React, { useState, useEffect } from 'react';
import { Course, Participant } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, BookOpen, FileText, Award, CheckCircle2, 
  HelpCircle, AlertCircle, RefreshCw, Send, CheckCircle, 
  ChevronRight, Compass, LogIn, ExternalLink, Eye, Info,
  Lock, Unlock, Clock, Sparkles, LogOut, Check
} from 'lucide-react';

interface AulaSectionProps {
  courses: Course[];
  participants: Participant[];
  onAddParticipant: (p: Omit<Participant, 'id' | 'asistencia' | 'certificadoEmitido'>) => void;
  onUpdateParticipantWithExam: (cedula: string, nota: string, aprobado: boolean) => Promise<boolean>;
  addToast: (text: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AulaSection: React.FC<AulaSectionProps> = ({
  courses,
  participants,
  onAddParticipant,
  onUpdateParticipantWithExam,
  addToast
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'urgencias-metabolicas');
  const [studentCedula, setStudentCedula] = useState<string>('');
  const [identifiedStudent, setIdentifiedStudent] = useState<Participant | null>(null);
  const [accessError, setAccessError] = useState<'not_found' | 'pending_payment' | null>(null);
  const [matchedPendingStudent, setMatchedPendingStudent] = useState<Participant | null>(null);
  
  // Video tracking progress (0 - 100)
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isPlayingSimulated, setIsPlayingSimulated] = useState<boolean>(false);

  // Exam-specific states
  const [examState, setExamState] = useState<'idle' | 'taking' | 'submitted'>('idle');
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [scorePercent, setScorePercent] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // Modal state for infographics
  const [activeInfographic, setActiveInfographic] = useState<{ title: string; url: string } | null>(null);

  // Registration for non-enrolled students who passed
  const [showDirectEnrollForm, setShowDirectEnrollForm] = useState<boolean>(false);
  const [enrollNombre, setEnrollNombre] = useState<string>('');
  const [enrollTelefono, setEnrollTelefono] = useState<string>('');
  const [enrollCorreo, setEnrollCorreo] = useState<string>('');
  const [enrollEmpresa, setEnrollEmpresa] = useState<string>('');
  const [enrollCargo, setEnrollCargo] = useState<string>('');

  const course = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Active status of course unlock based on identified student state
  const isUnlocked = identifiedStudent !== null && identifiedStudent.pago !== 'Pendiente';

  // Tick up progress if simulated player is on
  useEffect(() => {
    let interval: any;
    if (isPlayingSimulated && videoProgress < 100) {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          const next = prev + 4;
          if (next >= 100) {
            clearInterval(interval);
            setIsPlayingSimulated(false);
            addToast('🎉 ¡Visualización completada al 100%! Examen plenamente desbloqueado.', 'success');
            return 100;
          }
          if (prev < 50 && next >= 50) {
            addToast('🔓 ¡Examen Teórico habilitado! Ha completado el 50% de la visualización necesaria.', 'success');
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingSimulated, videoProgress]);

  const handleIdentifyStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCedula = studentCedula.trim().replace(/\./g, '');
    if (!cleanCedula) {
      addToast('Por favor, ingrese su número de Cédula.', 'warning');
      setAccessError(null);
      setMatchedPendingStudent(null);
      return;
    }
    
    // Find among existing participants
    const match = participants.find(p => p.cedula.replace(/\./g, '') === cleanCedula && p.cursoId === selectedCourseId);
    
    if (match) {
      if (match.pago === 'Pendiente') {
        setAccessError('pending_payment');
        setMatchedPendingStudent(match);
        setIdentifiedStudent(null);
        addToast('Acceso diferido: Matrícula pendiente de pago.', 'warning');
      } else {
        setIdentifiedStudent(match);
        setMatchedPendingStudent(null);
        setAccessError(null);
        setVideoProgress(0); // Reset progress on new login
        setIsPlayingSimulated(false);
        addToast(`¡Bienvenido/a al Aula Virtual, ${match.nombre}! Tu matrícula se encuentra activa y validada.`, 'success');
      }
    } else {
      setIdentifiedStudent(null);
      setMatchedPendingStudent(null);
      setAccessError('not_found');
      addToast('Cédula no encontrada en los registros para esta capacitación.', 'error');
    }
  };

  const handleLogoutStudent = () => {
    setIdentifiedStudent(null);
    setStudentCedula('');
    setMatchedPendingStudent(null);
    setAccessError(null);
    setExamState('idle');
    setVideoProgress(0);
    setIsPlayingSimulated(false);
    addToast('Sesión de alumno cerrada correctamente.', 'info');
  };

  const handleStartExam = () => {
    if (videoProgress < 50) {
      addToast('El examen está bloqueado hasta que vea por lo menos la mitad del video.', 'error');
      return;
    }
    if (!course.examQuestions || course.examQuestions.length === 0) {
      addToast('Este curso no tiene un examen configurado actualmente.', 'info');
      return;
    }
    setAnswers({});
    setActiveQuestionIdx(0);
    setExamState('taking');
    addToast('Examen iniciado. Responda con atención todas las preguntas académicas.', 'info');
  };

  const handleSelectOption = (qId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitExam = async () => {
    if (!course.examQuestions) return;
    
    const unselected = course.examQuestions.some(q => answers[q.id] === undefined);
    if (unselected) {
      addToast('Por favor, responda todas las preguntas del examen antes de enviar.', 'warning');
      return;
    }

    // Calculate score
    let correctCount = 0;
    course.examQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const total = course.examQuestions.length;
    const score = Math.round((correctCount / total) * 100);
    const passedExam = score >= 60; // 60% passing mark

    setScorePercent(score);
    setPassed(passedExam);
    setExamState('submitted');

    if (passedExam) {
      addToast(`¡Felicitaciones! Has aprobado el examen con ${score}%.`, 'success');
      // If student is already identified, sync instantly to Firestore database
      if (identifiedStudent || studentCedula) {
        const targetCed = identifiedStudent ? identifiedStudent.cedula : studentCedula;
        const success = await onUpdateParticipantWithExam(targetCed, `${score}%`, true);
        if (success) {
          addToast('Nota de examen y asistencia sincronizada correctamente en Firebase.', 'success');
          // Re-identify to pull fresh DB data
          const updatedMatch = participants.find(p => p.cedula.replace(/\./g, '') === targetCed.replace(/\./g, '') && p.cursoId === selectedCourseId);
          if (updatedMatch) {
            setIdentifiedStudent(updatedMatch);
          }
        }
      }
    } else {
      addToast(`Calificación obtenida: ${score}%. Debe alcanzar al menos un 60% para aprobar. Intente de nuevo.`, 'error');
    }
  };

  const handleDirectEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollNombre.trim()) {
      addToast('Nombre completo es requerido', 'error');
      return;
    }
    const targetCed = studentCedula || enrollNombre; // fallback if no CED
    onAddParticipant({
      nombre: enrollNombre.trim(),
      cedula: targetCed.trim(),
      telefono: enrollTelefono.trim(),
      correo: enrollCorreo.trim(),
      empresa: enrollEmpresa.trim(),
      cargo: enrollCargo.trim(),
      cursoId: selectedCourseId,
      cursoNombre: course.title,
      fecha: new Date().toISOString().split('T')[0],
      modalidad: 'Virtual por Grabación',
      pago: 'Pendiente',
      observacion: `Examen Aprobado Autónomamente con Nota: ${scorePercent}%`
    });

    addToast('Inscripción enviada con estatus de examen aprobado.', 'success');
    setShowDirectEnrollForm(false);
    // Reset exam states
    setExamState('idle');
  };

  const getAppPublicOrigin = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
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

  const getPendingPaymentWhatsAppUrl = () => {
    const origin = getAppPublicOrigin();
    const studentName = matchedPendingStudent ? matchedPendingStudent.nombre : 'Estudiante';
    const cleanCed = studentCedula.trim() || (matchedPendingStudent ? matchedPendingStudent.cedula : '');
    const courseTitle = course ? course.title : '';
    
    const text = `Hola, remito mi comprobante para la habilitación de mi aula virtual en SaludMar.
- Alumno: ${studentName}
- C.I.: ${cleanCed}
- Curso: ${courseTitle}

Enlace de Aprobación Directa para el Administrador:
${origin}/?admin_pago=${encodeURIComponent(cleanCed)}`;

    return `https://wa.me/595992441003?text=${encodeURIComponent(text)}`;
  };

  const getGeneralDoubtsWhatsAppUrl = () => {
    const origin = getAppPublicOrigin();
    const cleanCed = studentCedula.trim();
    const courseTitle = course ? course.title : '';
    
    let text = `Hola, tengo dudas con la habilitación de mi pago en SaludMar.
- Curso: ${courseTitle}`;
    
    if (cleanCed) {
      text += `\n- C.I.: ${cleanCed}\n\nEnlace de Administración:\n${origin}/?admin_pago=${encodeURIComponent(cleanCed)}`;
    }

    return `https://wa.me/595992441003?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-10">
      
      {/* Intro Header Card with Selection */}
      <div className="bg-[#082b4d] text-white rounded-3xl p-6 sm:p-10 border border-slate-750 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider border border-amber-500/20">
            <Compass size={13} className="animate-spin-slow" />
            <span>Aula de Auto-Capacitación Asincrónica</span>
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Aula Virtual & Exámenes</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Soporte de clases pregrabadas, bibliografía médica y material de infografía. Rinde tu examen autogestionado para certificar tus conocimientos acreditados.
          </p>
        </div>
        
        {/* Course Select */}
        <div className="w-full md:w-auto shrink-0 space-y-1">
          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">Seleccionar Capacitación</label>
          <select 
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setIdentifiedStudent(null);
              setMatchedPendingStudent(null);
              setAccessError(null);
              setExamState('idle');
              setShowDirectEnrollForm(false);
              setVideoProgress(0);
              setIsPlayingSimulated(false);
            }}
            className="w-full md:w-72 px-4 py-3 bg-[#061b31] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-xs font-semibold cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDER LOCK SCREEN OR CLASSROOM CONTENT */}
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          /* ================= LOCK SCREEN (SHOWN BY DEFAULT OR IF PENDING PAGO) ================= */
          <motion.div
            key="lock-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-150 shadow-lg overflow-hidden"
          >
            {/* Top warning ribbon */}
            <div className="bg-amber-500 text-slate-950 px-6 py-2.5 text-center text-[11px] font-bold tracking-wide uppercase flex items-center justify-center gap-2">
              <Lock size={12} />
              <span>Contenido Premium Restringido - Requiere Aprobación Administrativa</span>
            </div>

            <div className="p-6 sm:p-10 space-y-8">
              {/* Layout Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Left Side: Locked icon and course details (7 cols) */}
                <div className="md:col-span-7 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-[#082b4d] text-[10px] font-bold uppercase border border-slate-200">
                      {course.category}
                    </span>
                    <span className="text-[#082b4d] text-xs font-bold font-mono">
                      ⏱️ {course.duration || 'Virtual por Grabación'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
                    {course.title}
                  </h3>

                  <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">
                    {course.description || 'Actualización práctica para profesionales de la salud. Incluye clase grabada, guías de consenso, infografías clínicas y examen con folio privado.'}
                  </p>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3">
                    <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-xs">Arancel Único del Curso: Gs. 40.000</h4>
                      <p className="text-slate-550 text-[11px] leading-relaxed">
                        Una vez realizado el abono, recibido y aprobado por administración, el sistema se desbloqueará de forma automática habilitando la video clase, todas las fuentes bibliográficas de apoyo, las infografías de alta definición, y el examen teórico para emisión del diploma.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: LogIn and Search Box (5 cols) */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-150 p-6 rounded-3xl space-y-5">
                  <div className="text-center space-y-1.5 pb-2 border-b border-slate-200">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Lock size={20} className="stroke-[2.5]" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Habilitar Mi Acceso</h4>
                    <p className="text-slate-500 text-[10px]">Verifica tus credenciales en el sistema</p>
                  </div>

                  <form onSubmit={handleIdentifyStudent} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">Cédula de Identidad (C.I.)</label>
                      <input
                        type="text"
                        placeholder="Ej: 3.842.105"
                        value={studentCedula}
                        onChange={(e) => setStudentCedula(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-250 bg-white rounded-xl text-slate-900 text-xs font-mono focus:ring-4 focus:ring-slate-100 focus:outline-none transition-all shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#082b4d] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-all duration-150 cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      <LogIn size={14} />
                      <span>Validar Matrícula</span>
                    </button>
                  </form>

                  {/* Contextual Access Messages */}
                  <AnimatePresence mode="wait">
                    {accessError === 'pending_payment' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-yellow-50 border border-yellow-200 p-3.5 rounded-xl space-y-2 text-[11px]"
                      >
                        <p className="font-bold text-yellow-900 flex items-center gap-1">
                          <AlertCircle size={13} className="text-yellow-600" />
                          <span>¡Matrícula Pendiente de Pago!</span>
                        </p>
                        <p className="text-slate-600 leading-normal">
                          Hemos guardado su preinscripción con éxito para la C.I. ingresada, pero el estado del abono de <strong>Gs. 40.000</strong> se encuentra en estado <strong>Pendiente de Aprobación</strong>.
                        </p>
                        <p className="text-[10px] text-slate-700 pt-1.5 border-t border-yellow-150 leading-relaxed font-sans font-semibold">
                          📲 Remita su comprobante de pago al soporte administrativo WhatsApp de SaludMar para desbloquear de inmediato. Envíe un mensaje al <a href={getPendingPaymentWhatsAppUrl()} target="_blank" rel="noreferrer" className="text-[#082b4d] underline hover:text-black font-black">0992441003</a> y a la brevedad será respondido.
                        </p>
                      </motion.div>
                    )}

                    {accessError === 'not_found' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-rose-50 border border-rose-150 p-3.5 rounded-xl space-y-2 text-[11px]"
                      >
                        <p className="font-bold text-rose-900 flex items-center gap-1">
                          <AlertCircle size={13} className="text-rose-500" />
                          <span>Cédula No Encontrada</span>
                        </p>
                        <p className="text-slate-600 leading-normal">
                          No se encontró ninguna pre-inscripción registrada con la Cédula <strong>{studentCedula}</strong> para este curso.
                        </p>
                        <div className="pt-1 text-[10px] space-y-1 text-slate-650">
                          <div>• Asegúrese de haber completado la solicitud de preinscripción.</div>
                          <div>• O diríjase a la pestaña <span className="font-bold text-[#082b4d]">Inscripción</span> arriba para asentar su participación ahora.</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Payment Instructions / Help */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 select-none">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    <Info size={14} className="text-slate-400" />
                    <span>¿Dudas con la habilitación de tu pago? Escríbenos al WhatsApp.</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-medium pl-5">💡 Déjenos un mensaje y a la brevedad será respondido.</span>
                </div>
                <a 
                  href={getGeneralDoubtsWhatsAppUrl()} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-150 flex items-center gap-1.5 transition uppercase tracking-wider text-[10px]"
                >
                  <span>Soporte 0992441003</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================= UNLOCKED CLASSROOM (SHOWN ONCE STUDENT IS ACTIVE & PAID) ================= */
          <motion.div
            key="unlocked-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            
            {/* Student Session Alert Banner */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-5 py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 select-none shadow-sm">
              <div className="flex items-center gap-3 text-center sm:text-left flex-col sm:flex-row">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
                  <Unlock size={18} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
                    Aula Virtual Desbloqueada • Bienvenido/a, {identifiedStudent?.nombre}
                  </h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Cédula: <strong className="font-mono text-slate-900">{identifiedStudent?.cedula}</strong> | Matrícula activa autorizada para <strong className="text-slate-900">{course.title}</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogoutStudent}
                className="px-3.5 py-1.5 text-[11px] font-bold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-350 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
              >
                <LogOut size={12} />
                <span>Cerrar Sesión Alumno</span>
              </button>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Video and Dynamic Study Tracker (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Embedded Video Card */}
                <div className="bg-white rounded-3xl border border-slate-150 p-4 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="text-[#082b4d]" size={20} />
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">Módulo Grabado: Clase Interactiva</h3>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                      {course.category}
                    </span>
                  </div>

                  {course.videoUrl ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-inner border border-slate-200">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={course.videoUrl + "?enablejsapi=1"}
                        title="Clase SaludMar"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-center items-center rounded-2xl p-6 text-center text-slate-400 space-y-3 animate-pulse">
                      <Monitor size={48} className="text-slate-600" />
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-white">Video Clase Pendiente de Carga</p>
                        <p className="text-xs text-slate-550 max-w-xs leading-relaxed">
                          Un facilitador cargará el material grabado de esta clase en las próximas horas.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Active study tracking widget & progress slider bar */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-[#082b4d] tracking-wider flex items-center gap-1.5">
                          <Clock size={12} className="animate-pulse text-amber-500" />
                          <span>Control de Aprendizaje Activo</span>
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs">Progreso Actual de Visualización</h4>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPlayingSimulated(!isPlayingSimulated);
                            addToast(isPlayingSimulated ? 'Reproducción pausada' : 'Reproducción en marcha. El temporizador registrará su tiempo de estudio.', 'info');
                          }}
                          className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                            isPlayingSimulated 
                              ? 'bg-[#082b4d] text-white' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isPlayingSimulated ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <span>Pausar</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                              <span>Reproducir Clase</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoProgress(100);
                            setIsPlayingSimulated(false);
                            addToast('🔓 ¡Visualización de video completada! Examen plenamente desbloqueado.', 'success');
                          }}
                          className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-indigo-50 hover:bg-[#082b4d] text-indigo-700 hover:text-white hover:border-[#082b4d] font-bold text-xs border border-indigo-200/55 transition cursor-pointer"
                        >
                          Completar Video
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-700">
                        <span className="flex items-center gap-1">
                          <strong className="text-[#082b4d] text-sm">{videoProgress}%</strong> reproducido
                        </span>
                        <span className="text-[10px] text-slate-505 font-bold flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded text-amber-950">
                          Requisitos para Examen: Mínimo 50%
                        </span>
                      </div>

                      <div className="relative pt-1.5">
                        {/* Custom interactive range slider */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={videoProgress}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setVideoProgress(val);
                            if (val >= 50 && videoProgress < 50) {
                              addToast('🔓 ¡Examen Teórico habilitado! Has completado el requisito de visualización.', 'success');
                            }
                          }}
                          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#082b4d] focus:outline-none focus:ring-2 focus:ring-[#082b4d]/20 transition-all duration-100"
                          style={{
                            background: `linear-gradient(to right, #082b4d 0%, #082b4d ${videoProgress}%, #e2e8f0 ${videoProgress}%, #e2e8f0 100%)`
                          }}
                        />
                        {/* Visual 50% target bar */}
                        <div 
                          className="absolute top-0 w-1 h-5 bg-amber-500 rounded pointer-events-none" 
                          style={{ left: '50%' }}
                          title="Límite del 50%"
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Punto de Inicio</span>
                        <span className="text-amber-600 font-bold">Límite para Habilitar Examen (50%)</span>
                        <span>Fin de Clase</span>
                      </div>
                    </div>

                    {/* Completion statuses feedback message */}
                    <AnimatePresence mode="wait">
                      {videoProgress >= 50 ? (
                        <motion.div 
                          key="unlocked"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs leading-relaxed"
                        >
                          <CheckCircle className="text-emerald-500 shrink-0 stroke-[2.5]" size={16} />
                          <div>
                            <strong>¡Requisito superado!</strong> Has visualizado el <strong>{videoProgress}%</strong>. El examen académico ya está desbloqueado a la derecha. Consigue un 60%+ en la evaluación para imprimir tu certificado.
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="locked"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs leading-relaxed"
                        >
                          <Lock className="text-amber-500 shrink-0" size={16} />
                          <div>
                            <strong>Evaluación Bloqueada:</strong> Falta visualizar un <strong>{50 - videoProgress}%</strong> de esta clase interactiva para habilitar el examen electrónico correspondiente.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Course visual labels */}
                  <div className="p-1 px-2 space-y-2">
                    <h4 className="font-serif text-lg font-bold text-[#082b4d]">{course.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{course.description}</p>
                  </div>
                </div>

              </div>

              {/* Right Column: References, Infographics, Exam Modules (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Virtual Resources & Bibliography Card */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <BookOpen size={16} className="text-amber-500" />
                    <span>Bibliografía Académica</span>
                  </h4>

                  {course.bibliography && course.bibliography.length > 0 ? (
                    <div className="space-y-2.5">
                      {course.bibliography.map((lib, idx) => (
                        <a
                          key={idx}
                          href={lib.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-205 rounded-xl transition text-xs group"
                        >
                          <div className="flex items-center gap-2 overflow-hidden shrink-1">
                            <FileText size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                            <span className="font-semibold text-slate-700 truncate">{lib.title}</span>
                          </div>
                          <ExternalLink size={12} className="text-slate-400 shrink-0 ml-1.5" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] text-center py-2">No hay bibliografía de lectura para este tema.</p>
                  )}
                </div>

                {/* Infographics and Visual Aids Card */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Eye size={16} className="text-indigo-500" />
                    <span>Infografías & Guías Visuales</span>
                  </h4>

                  {course.infographics && course.infographics.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {course.infographics.map((info, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveInfographic(info)}
                          className="flex flex-col text-left border border-slate-100 hover:border-indigo-200/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-slate-50 cursor-pointer"
                        >
                          <div className="aspect-[4/3] bg-slate-200 overflow-hidden relative">
                            <img 
                              src={info.url} 
                              alt={info.title} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-slate-900/10 hover:bg-transparent transition-colors duration-250" />
                          </div>
                          <div className="p-2">
                            <p className="text-[10px] font-bold text-slate-700 line-clamp-2 leading-snug">{info.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] text-center py-2">No hay infografías cargadas.</p>
                  )}
                </div>

                {/* Exam Area Module */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-5 relative overflow-hidden">
                  
                  {/* Top borders decoration */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#082b4d] via-amber-400 to-indigo-500" />

                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={16} className="text-amber-500" />
                      <span>Examen Teórico Digital</span>
                    </h4>
                    {examState === 'taking' && (
                      <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-amber-100 text-amber-800 rounded-full font-mono animate-pulse">
                        CURSANDO
                      </span>
                    )}
                  </div>

                  {/* DOUBLE CHECK VIDEO ACCESS LOCK TRIGGER FOR EXAM CONTAINER */}
                  {videoProgress < 50 ? (
                    /* EXAM IS LOCKED */
                    <div className="space-y-4 py-8 text-center flex flex-col items-center">
                      <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center border border-slate-200 shadow-inner relative">
                        <Lock size={22} className="stroke-[2.5]" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                      </div>
                      
                      <div className="space-y-1.5 max-w-xs">
                        <h5 className="font-bold text-slate-800 text-xs sm:text-xs">Módulo Evaluativo Bloqueado</h5>
                        <p className="text-slate-550 text-[11px] leading-relaxed">
                          La Mesa Examinadora requiere haber visualizado al menos el <strong>50% del video instructivo</strong> de la capacitación para habilitar este examen del folio.
                        </p>
                      </div>

                      <div className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left space-y-1 text-[10px] text-slate-550">
                        <div className="font-bold text-slate-700 flex items-center gap-1">
                          <Clock size={12} />
                          <span>Instrucción Administrativa:</span>
                        </div>
                        <div>• Active "Reproducir Clase" en el reproductor de la izquierda.</div>
                        <div>• Del mismo modo, puede deslizar el progreso libremente para evaluaciones rápidas.</div>
                      </div>
                    </div>
                  ) : (
                    /* EXAM IS ACTIVE AND DESBLOQUEADO */
                    <AnimatePresence mode="wait">
                      
                      {examState === 'idle' && (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            Evaluación de contenidos para aprobar e imprimir tu certificado oficial con folio privado. Se requiere un porcentaje superior al <strong>60% de aciertos</strong>.
                          </p>
                          
                          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[10px] text-slate-650">
                            <div className="flex items-center gap-1.5 font-bold text-[#082b4d]">
                              <HelpCircle size={12} />
                              <span>Detalles del Intento:</span>
                            </div>
                            <div>• <strong>3 Preguntas</strong> de opción múltiple de alta precisión clínica.</div>
                            <div>• <strong>Intentos ilimitados</strong> para reforzar conocimientos.</div>
                            <div>• <strong>Acreditación instantánea</strong> vinculada a tu número de cédula.</div>
                          </div>

                          <button
                            onClick={handleStartExam}
                            className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                          >
                            <span>Iniciar Examen Virtual</span>
                            <ChevronRight size={14} />
                          </button>
                        </motion.div>
                      )}

                      {examState === 'taking' && course.examQuestions && (
                        <motion.div
                          key="taking"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-5"
                        >
                          {/* Progress indicator */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>Pregunta {activeQuestionIdx + 1} de {course.examQuestions.length}</span>
                            <span>{Math.round(((activeQuestionIdx + 1) / course.examQuestions.length) * 100)}% Completado</span>
                          </div>

                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#082b4d] transition-all duration-300"
                              style={{ width: `${((activeQuestionIdx + 1) / course.examQuestions.length) * 100}%` }}
                            />
                          </div>

                          {/* Active Question Title */}
                          <div className="space-y-3">
                            <h5 className="font-bold text-slate-800 text-xs sm:text-xs tracking-tight select-none">
                              {course.examQuestions[activeQuestionIdx].question}
                            </h5>
                            
                            {/* Active Question Options */}
                            <div className="space-y-2">
                              {course.examQuestions[activeQuestionIdx].options.map((opt, oIdx) => {
                                const qId = course.examQuestions![activeQuestionIdx].id;
                                const isSelected = answers[qId] === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleSelectOption(qId, oIdx)}
                                    className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition flex items-start gap-2.5 cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#082b4d]/5 border-[#082b4d] text-[#082b4d] font-bold'
                                        : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    <span className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center font-mono font-bold text-[9px] mt-0.5 ${
                                      isSelected 
                                        ? 'bg-[#082b4d] text-white border-[#082b4d]' 
                                        : 'bg-white text-slate-400 border-slate-200'
                                    }`}>
                                      {oIdx + 1}
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-slate-100 gap-2">
                            <button
                              type="button"
                              disabled={activeQuestionIdx === 0}
                              onClick={() => setActiveQuestionIdx(prev => prev - 1)}
                              className="px-3 py-2 border border-slate-205 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-50 disabled:opacity-40 select-none cursor-pointer"
                            >
                              Anterior
                            </button>

                            {activeQuestionIdx < course.examQuestions.length - 1 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const qId = course.examQuestions![activeQuestionIdx].id;
                                  if (answers[qId] === undefined) {
                                    addToast('Por favor, responda esta pregunta primero.', 'warning');
                                    return;
                                  }
                                  setActiveQuestionIdx(prev => prev + 1);
                                }}
                                className="flex items-center gap-1 px-4 py-2 bg-[#082b4d] hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                              >
                                <span>Siguiente</span>
                                <ChevronRight size={14} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSubmitExam}
                                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                              >
                                <Send size={12} />
                                <span>Finalizar Examen</span>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {examState === 'submitted' && (
                        <motion.div
                          key="submitted"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4 text-center"
                        >
                          {passed ? (
                            <div className="space-y-3 py-2">
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-150 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <CheckCircle2 size={24} className="stroke-[2.5]" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-extrabold text-slate-900 text-sm">¡Aprobación Confirmada!</h5>
                                <p className="text-[11px] text-slate-500">
                                  Lograste responder correctamente y aprobar con una puntuación de:
                                </p>
                                <div className="text-3xl font-black text-emerald-600 font-mono py-1">{scorePercent}%</div>
                              </div>

                              {identifiedStudent ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-805 text-left space-y-1">
                                  <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                                    <CheckCircle size={12} /> Examen Registrado Exitosamente
                                  </p>
                                  <p className="text-slate-600 leading-relaxed">
                                    Los datos de aprobación para {identifiedStudent.nombre} han sido vinculados de forma segura a su registro académico. La mesa examinadora de SaludMar actualizará la expedición de su certificado.
                                  </p>
                                </div>
                              ) : (
                                <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-[10px] text-slate-650 text-left space-y-3">
                                  <p className="font-bold text-[#082b4d] flex items-center gap-1">
                                    <Info size={12} /> Examen Aprobado pero Sin Matrícula
                                  </p>
                                  <p className="text-slate-600 leading-relaxed text-[10px]">
                                    Tu examen ha sido guardado administrativamente en la memoria. Si no estabas en la lista oficial, te sugerimos completar tu registro ahora bajo este estatus de mérito académico aprobado:
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEnrollNombre('');
                                      setShowDirectEnrollForm(true);
                                    }}
                                    className="w-full py-2 bg-[#082b4d] hover:bg-slate-950 text-white font-bold text-[10px] rounded-lg transition"
                                  >
                                    Registrar Mi Certificado de Aprobación
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setExamState('idle');
                                  setShowDirectEnrollForm(false);
                                }}
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                              >
                                Cerrar Módulo
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4 py-2">
                              <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-150 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <AlertCircle size={24} className="stroke-[2.5]" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-bold text-slate-800 text-xs">Examen No Superado</h5>
                                <p className="text-[11px] text-slate-500">
                                  Tu calificación es inferior al 60% requerido para certificar el taller:
                                </p>
                                <div className="text-3xl font-black text-rose-600 font-mono py-1">{scorePercent}%</div>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                No te preocupes; puedes repasar los materiales, releer la bibliografía compartida y volver a rendir cuando te sientas preparado.
                              </p>
                              
                              <button
                                type="button"
                                onClick={handleStartExam}
                                className="w-full flex items-center justify-center gap-1 py-3 bg-[#082b4d] hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
                              >
                                <RefreshCw size={12} />
                                <span>Volver a Intentar</span>
                              </button>
                            </div>
                          )}

                        </motion.div>
                      )}

                    </AnimatePresence>
                  )}

                </div>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER NEW STUDENT DIRECT ENROLLMENT FORM MODAL INLINE */}
      {showDirectEnrollForm && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-md max-w-2xl mx-auto space-y-6"
        >
          <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-900 text-sm">Registrar Mérito de Examen Aprobado</h4>
              <p className="text-slate-500 text-[11px]">
                Complete los datos para generar el folio de participación pendiente de verificación de matrícula.
              </p>
            </div>
          </div>

          <form onSubmit={handleDirectEnroll} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Dra. María Auxiliadora Silva"
                value={enrollNombre}
                onChange={(e) => setEnrollNombre(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase">Cédula de Identidad (C.I.) *</label>
              <input
                type="text"
                required
                disabled={!!studentCedula}
                placeholder="Ej. 4.390.100"
                value={studentCedula || enrollNombre}
                onChange={(e) => setStudentCedula(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono disabled:bg-slate-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase">Teléfono de contacto</label>
              <input
                type="tel"
                placeholder="Ej. 0981 223 900"
                value={enrollTelefono}
                onChange={(e) => setEnrollTelefono(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase">Correo Electrónico</label>
              <input
                type="email"
                placeholder="Ej. m.silva@gmail.com"
                value={enrollCorreo}
                onChange={(e) => setEnrollCorreo(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase">Institución / Empresa</label>
              <input
                type="text"
                placeholder="Ej. IPS Hospital Central"
                value={enrollEmpresa}
                onChange={(e) => setEnrollEmpresa(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase">Cargo o Profesión</label>
              <input
                type="text"
                placeholder="Ej. Enfermera de Cuidados Críticos"
                value={enrollCargo}
                onChange={(e) => setEnrollCargo(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2 pt-3 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowDirectEnrollForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold font-sans text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#082b4d] hover:bg-indigo-950 text-white font-bold rounded-xl pointer-events-auto"
              >
                Inscribir y Enviar con Examen Aprobado
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* FULL VIEW INFOGRAPHIC DECORATIVE LIGHTBOX MODAL */}
      {activeInfographic && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
          onClick={() => setActiveInfographic(null)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h4 className="font-bold text-xs sm:text-sm tracking-tight">{activeInfographic.title}</h4>
              <button 
                onClick={() => setActiveInfographic(null)}
                className="text-slate-400 hover:text-white font-black text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded transition cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="flex-grow aspect-video sm:aspect-[16/10] bg-slate-100 overflow-y-auto">
              <img 
                src={activeInfographic.url} 
                alt={activeInfographic.title} 
                className="w-full h-auto object-contain mx-auto" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 text-[11px] text-slate-500 bg-slate-50 border-t border-slate-100 leading-relaxed italic">
              📌 Nota: Esta es una infografía de SaludMar Academy orientada a la capacitación clínica continua. Prohibida su duplicación externa sin previo consentimiento del facilitador.
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
