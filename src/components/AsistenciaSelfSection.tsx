import React, { useState, useEffect } from 'react';
import { Course, Participant } from '../types';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, UserCheck, Search, Building, Landmark, Smartphone, FileSearch, ArrowRight, CornerDownRight, ShieldCheck, ExternalLink } from 'lucide-react';

interface AsistenciaSelfSectionProps {
  courses: Course[];
  participants: Participant[];
  onConfirmAttendance: (courseId: string, cedula: string) => Promise<{ success: boolean; message: string; studentName?: string }>;
  addToast: (text: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onNavigate: (tab: string) => void;
  initialCourseId?: string | null;
}

export const AsistenciaSelfSection: React.FC<AsistenciaSelfSectionProps> = ({
  courses,
  participants,
  onConfirmAttendance,
  addToast,
  onNavigate,
  initialCourseId,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [cedula, setCedula] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    studentName?: string;
    message: string;
  } | null>(null);

  // Set the course ID automatically if provided in the URL
  useEffect(() => {
    if (initialCourseId) {
      const courseExist = courses.find(c => c.id === initialCourseId);
      if (courseExist) {
        setSelectedCourseId(initialCourseId);
        addToast(`Buscando asistencia para el curso: ${courseExist.title}`, 'info');
      }
    }
  }, [initialCourseId, courses, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentCedula = cedula.trim();

    if (!studentCedula) {
      addToast('Por favor, ingrese su número de Cédula de Identidad', 'warning');
      return;
    }

    if (!selectedCourseId) {
      addToast('Debe seleccionar un taller o curso de capacitación', 'warning');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const result = await onConfirmAttendance(selectedCourseId, studentCedula);
      setSubmissionResult(result);
      if (result.success) {
        addToast('¡Confirmación de presencia procesada exitosamente!', 'success');
      } else {
        addToast(result.message, 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error inesperado al acreditar la asistencia', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

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

  const getAsistenciaWhatsAppUrl = () => {
    const origin = getAppPublicOrigin();
    const cleanCed = cedula.trim();
    const courseTitle = currentCourse ? currentCourse.title : '';
    
    let text = `Hola, necesito asistencia con la acreditación de mi asistencia en SaludMar.
- Curso: ${courseTitle}`;
    
    if (cleanCed) {
      text += `\n- C.I.: ${cleanCed}\n\nEnlace de Administración Directa:\n${origin}/?admin_pago=${encodeURIComponent(cleanCed)}`;
    }

    return `https://wa.me/595992441003?text=${encodeURIComponent(text)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-xl mx-auto space-y-6"
    >
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-br from-[#082b4d] to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 text-center relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-4 -mt-4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/5 rounded-full blur-xl pointer-events-none -ml-4 -mb-4" />
        
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/10 mb-3.5">
          <UserCheck size={24} className="text-amber-400 stroke-[2.5]" />
        </div>
        
        <h3 className="font-serif text-xl sm:text-2xl font-extrabold tracking-tight">
          Acreditación de Presencia
        </h3>
        <p className="text-slate-300 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
          Registra tu asistencia en tiempo real durante o al finalizar el taller para habilitar la firma digital de tu certificado.
        </p>
      </div>

      {submissionResult && submissionResult.success ? (
        /* Confirmed Attendance Success State Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-lg border border-emerald-100 text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-150 shadow-inner">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black tracking-wider uppercase border border-emerald-250">
              PRESENTE CONFIRMADO
            </span>
            <h4 className="text-lg font-bold text-slate-800">
              ¡Hola, {submissionResult.studentName}!
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Tu asistencia y participación en esta jornada técnica ha sido acreditada correctamente directo en nuestra mesa examinadora.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-left space-y-2 max-w-sm mx-auto">
            <div className="text-[10px] uppercase font-bold text-slate-400">Jornada Registrada</div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm leading-tight">
              {currentCourse?.title}
            </div>
            <div className="flex gap-2 text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
              <span>{currentCourse?.category}</span>
              <span>•</span>
              <span>{currentCourse?.modality}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5 max-w-sm mx-auto">
            <button
              onClick={() => onNavigate('aula')}
              className="w-full py-2.5 bg-[#082b4d] hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Acceder al Aula Virtual / Examen</span>
              <ArrowRight size={14} className="text-amber-400" />
            </button>
            <button
              onClick={() => {
                setSubmissionResult(null);
                setCedula('');
              }}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Registrar otra cédula
            </button>
          </div>
        </motion.div>
      ) : (
        /* Standard Form Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input course picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Selecciona la Capacitación / Taller
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSubmissionResult(null);
                }}
                disabled={!!initialCourseId}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100/50 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.category})
                  </option>
                ))}
              </select>
              {initialCourseId && (
                <p className="text-[10px] font-medium text-indigo-600 block pl-1">
                  💡 Curso preseleccionado por el enlace del facilitador.
                </p>
              )}
            </div>

            {/* Document ID Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Número de Cédula de Identidad (sin puntos)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/[^0-9.-]/g, '');
                    setCedula(cleanValue);
                    setSubmissionResult(null);
                  }}
                  placeholder="Ej: 4897123"
                  className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 focus:border-[#082b4d] focus:ring-4 focus:focus:ring-[#082b4d]/10 rounded-xl text-slate-800 text-sm font-mono tracking-wider transition-all outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed pl-1">
                Ingresa la misma cédula con la que te registraste en el formulario de pre-inscripción.
              </p>
            </div>

            {submissionResult && !submissionResult.success && (
              /* Custom Error Banner explaining next steps if student isn't enrolled */
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 rounded-xl p-4 border border-amber-200/85 text-left space-y-2.5"
              >
                <h5 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <span>⚠️ Cédula no registrada aún</span>
                </h5>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  No figura un registro de inscripción con ese documento en este curso. Esto puede suceder si aún no te has inscripto antes de habilitar la asistencia.
                </p>
                <div className="pt-2 border-t border-amber-200/50 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('inscripcion');
                    }}
                    className="font-extrabold text-[11px] text-amber-950 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>👉 Haz Clic Aquí para Pre-Inscribirte Primero</span>
                  </button>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#082b4d] hover:bg-slate-900 text-white font-extrabold text-sm tracking-wide rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verificando Cédula...' : 'Acreditar Asistencia Ahora'}
            </button>
          </form>

          {/* Guidelines info */}
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] leading-relaxed text-slate-500">
            <div className="space-y-1">
              <p>
                <span className="font-bold text-slate-600">Importante:</span> La mesa académica de SaludMar autoriza la descarga de diplomas solo para alumnos con asistencia acreditada.
              </p>
              <p className="text-[10px] text-amber-600 font-medium">
                💡 Si tiene algún inconveniente, déjenos un mensaje de WhatsApp y a la brevedad será respondido.
              </p>
            </div>
            <a 
              href={getAsistenciaWhatsAppUrl()} 
              target="_blank" 
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-150 flex items-center gap-1.5 transition uppercase tracking-wider text-[10px] shrink-0 self-stretch sm:self-auto justify-center cursor-pointer"
            >
              <span>Soporte 0992441003</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </motion.div>
  );
};
