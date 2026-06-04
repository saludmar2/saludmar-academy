import React, { useState, useEffect } from 'react';
import { Course, Participant } from '../types';
import { motion } from 'motion/react';
import { FileSearch, CheckCircle, RefreshCw, Send, AlertTriangle, Sparkles, Smile, Landmark, Wallet, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';

interface InscripcionSectionProps {
  courses: Course[];
  onAddParticipant: (p: Omit<Participant, 'id' | 'asistencia' | 'certificadoEmitido'>) => void;
  addToast: (text: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onNavigate: (tab: string) => void;
  urlSelectedCursoId?: string | null;
}

export const InscripcionSection: React.FC<InscripcionSectionProps> = ({ 
  courses, 
  onAddParticipant, 
  addToast,
  onNavigate,
  urlSelectedCursoId
}) => {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('');
  
  // Set default training course to the first available one
  const [selectedCursoId, setSelectedCursoId] = useState(courses[0]?.id || 'toma-de-muestras');
  
  // Default to today's date
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [modalidad, setModalidad] = useState('Virtual por Zoom');
  const [pago, setPago] = useState<Participant['pago']>('Pendiente');
  const [observacion, setObservacion] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [submittedCourseTitle, setSubmittedCourseTitle] = useState('');

  useEffect(() => {
    if (urlSelectedCursoId) {
      const courseMatch = courses.find((c) => c.id === urlSelectedCursoId);
      if (courseMatch) {
        setSelectedCursoId(urlSelectedCursoId);
        addToast(`Invitación aceptada para: ${courseMatch.title}`, 'info');
      }
    }
  }, [urlSelectedCursoId, courses]);

  const handleClear = () => {
    setNombre('');
    setCedula('');
    setTelefono('');
    setCorreo('');
    setEmpresa('');
    setCargo('');
    setObservacion('');
    setPago('Pendiente');
    setModalidad('Virtual por Zoom');
    setFecha(new Date().toISOString().split('T')[0]);
    setErrors({});
    addToast('Formulario vaciado correctamente', 'info');
  };

  const handleValidate = () => {
    const errs: { [key: string]: string } = {};
    if (!nombre.trim()) errs.nombre = 'El nombre completo es requerido';
    if (!cedula.trim()) errs.cedula = 'El número de cédula o CI es requerido';
    if (!fecha) errs.fecha = 'Debe seleccionar una fecha de inicio';
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errs.correo = 'El correo electrónico no es válido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) {
      addToast('Por favor, complete los campos marcados como obligatorios', 'error');
      return;
    }

    const courseSelected = courses.find((c) => c.id === selectedCursoId);
    const courseTitle = courseSelected ? courseSelected.title : 'Curso Personalizado';

    onAddParticipant({
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
      empresa: empresa.trim(),
      cargo: cargo.trim(),
      cursoId: selectedCursoId,
      cursoNombre: courseTitle,
      fecha,
      modalidad,
      pago,
      observacion: observacion.trim(),
    });

    setSubmittedCourseTitle(courseTitle);
    setIsSubmittedSuccessfully(true);
    addToast('¡Pre-inscripción en estado de espera guardada!', 'success');
  };

  if (isSubmittedSuccessfully) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-100 text-center space-y-8 select-none relative overflow-hidden"
      >
        {/* Confetti decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100/60 shadow-inner">
          <ShieldCheck size={40} className="stroke-[2.5]" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles size={12} />
            <span>SOLICITUD DE INSCRIPCIÓN RECIBIDA</span>
          </span>
          <h2 className="text-3xl font-extrabold text-[#082b4d] tracking-tight">
            ¡Pre-inscripción en Espera!
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Hola, <span className="font-bold text-slate-800">{nombre}</span>. Hemos registrado tus datos bajo el estado <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold font-mono text-xs">PENDIENTE DE APROBACIÓN</span> para el taller académico:
          </p>
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl font-bold text-slate-800 text-base max-w-md mx-auto shadow-sm">
            {submittedCourseTitle}
          </div>
        </div>

        {/* Next Steps / Payment Instructions */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-50/20 border border-amber-200/60 rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto">
          <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Landmark size={16} className="text-amber-600" />
            <span className="text-slate-800">Pasos Siguientes para Activación:</span>
          </h4>
          <p className="text-slate-505 text-xs leading-relaxed text-slate-600">
            Para que tu nombre figure en la <strong>lista oficial de inscriptos</strong> y puedas tener tus certificados virtuales desbloqueados al finalizar el curso, debes remitir el comprobante de pago de la matrícula:
          </p>
          <div className="space-y-1.5 pt-1 border-t border-slate-200/50">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Monto Matrícula:</span>
              <span className="font-bold text-slate-800 font-mono">Gs. 40.000 (Matrícula única)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Enviar Comprobante al:</span>
              <span className="font-bold text-[#082b4d] font-mono">0992 441 003 / 0971 191 978</span>
            </div>
          </div>
        </div>

        {/* Navigation & testing shortcuts */}
        <div className="flex flex-col gap-3 max-w-md mx-auto pt-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setIsSubmittedSuccessfully(false);
                handleClear();
              }}
              className="flex items-center justify-center gap-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className="text-slate-500" />
              <span>Inscribir Otro</span>
            </button>
            <button
              onClick={() => onNavigate('inicio')}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Smile size={14} className="text-slate-600" />
              <span>Volver al Inicio</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#082b4d] tracking-tight">
            Formulario de Inscripción de Participantes
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Complete los datos del alumno. Estos datos serán cargados directamente en los renglones oficiales de certificación.
          </p>
        </div>

        {urlSelectedCursoId && courses.some(c => c.id === urlSelectedCursoId) && (() => {
          const matchedCourse = courses.find(c => c.id === urlSelectedCursoId);
          return (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#dcecff]/40 p-5 rounded-2xl border border-sky-200 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-850 flex items-center justify-center shrink-0 border border-sky-200">
                <Sparkles size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#082b4d] text-sm leading-tight">
                  ¡Inscripción para el Taller: {matchedCourse?.title}!
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Ha accedido mediante el enlace directo. Complete los datos del participante y luego guarde la inscripción para que la administración de SaludMar realice la habilitación correspondiente.
                </p>
              </div>
            </motion.div>
          );
        })()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nombre y Apellido <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                placeholder="Ej: Sofía Benítez de Candia"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errors.nombre) setErrors({ ...errors, nombre: '' });
                }}
                className={`w-full px-4 py-3 rounded-xl border ${errors.nombre ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              <p className="text-[10px] text-amber-700 font-semibold bg-amber-50/70 border border-amber-150 p-2 rounded-lg leading-relaxed">
                💡 <strong>¿Desea incluir prefijo académico en su título?</strong> Si desea que figure su grado (Ej: <strong>TEC.</strong>, <strong>DR.</strong>, <strong>DRA.</strong>, <strong>LIC.</strong>, <strong>AUX.</strong>, <strong>MGTR.</strong>), escríbalo aquí delante de su nombre (Ej: <em>Lic. Sofía Benítez</em>).
              </p>
              {errors.nombre && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.nombre}
                </span>
              )}
            </div>

            {/* Document ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Documento de Identidad (C.I.) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                placeholder="Ej: 3.512.980 o DNI/Pasaporte"
                value={cedula}
                onChange={(e) => {
                  setCedula(e.target.value);
                  if (errors.cedula) setErrors({ ...errors, cedula: '' });
                }}
                className={`w-full px-4 py-3 rounded-xl border ${errors.cedula ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              {errors.cedula && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.cedula}
                </span>
              )}
            </div>

            {/* Telephone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Teléfono / WhatsApp
              </label>
              <input 
                type="tel"
                placeholder="Ej: 0981 123 456"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm"
              />
            </div>

            {/* Mail Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email de Contacto
              </label>
              <input 
                type="text"
                placeholder="Ej: sofia@gmail.com"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (errors.correo) setErrors({ ...errors, correo: '' });
                }}
                className={`w-full px-4 py-3 rounded-xl border ${errors.correo ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              {errors.correo && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.correo}
                </span>
              )}
            </div>

            {/* Company */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Institución / Empresa
              </label>
              <input 
                type="text"
                placeholder="Ej: Hospital de Clínicas, Empresa S.A."
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm"
              />
            </div>

            {/* Position */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cargo / Profesión
              </label>
              <input 
                type="text"
                placeholder="Ej: Lic. en Enfermería, Residente, Técnico"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm"
              />
            </div>

            {/* Training Course Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Curso Académico
              </label>
              <select 
                value={selectedCursoId}
                onChange={(e) => setSelectedCursoId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Date of Training */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fecha del Curso <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  if (errors.fecha) setErrors({ ...errors, fecha: '' });
                }}
                className={`w-full px-4 py-3 rounded-xl border ${errors.fecha ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
              />
              {errors.fecha && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.fecha}
                </span>
              )}
            </div>

            {/* Modalidad Selection */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Modalidad de Dictación
              </label>
              <select 
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm"
              >
                <option value="Virtual por Zoom">Virtual por Zoom</option>
                <option value="Presencial">Presencial (Teórico/Práctico)</option>
                <option value="Mixta">Mixta (Híbrida)</option>
              </select>
            </div>

          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 select-none">
            <button 
              type="submit"
              className="flex items-center gap-2 bg-[#082b4d] hover:bg-[#0b5c8c] text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-blue-900/10 active:scale-[0.98]"
            >
              <Send size={16} />
              <span>Registrar Inscripción</span>
            </button>
            <button 
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm px-5 py-3.5 rounded-xl transition-all duration-200 border border-slate-200/60 cursor-pointer"
            >
              <RefreshCw size={15} />
              <span>Limpiar Campos</span>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
