import React from 'react';
import { COURSES } from '../data';
import { Course } from '../types';
import { motion } from 'motion/react';
import { ShieldCheck, Award, GraduationCap, Monitor, HelpCircle, Users, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface HomeSectionProps {
  onNavigate: (tab: string) => void;
  courses: Course[];
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onNavigate, courses }) => {
  return (
    <div className="space-y-12">
      {/* Hero Banner Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
      >
        <div className="lg:col-span-7 bg-[#061b31] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-850 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
          
          <div className="relative space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider border border-amber-500/20">
              <Award size={13} />
              <span>Certificaciones con Validez Digital Real</span>
            </span>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] font-sans">
              Capacitaciones profesionales con <span className="text-amber-400">certificación digital</span>
            </h1>
            
            <p className="text-[#dcecff] text-base sm:text-lg font-normal leading-relaxed max-w-xl">
              Un sistema exclusivo y centralizado de SaludMar para registrar participantes, controlar asistencia técnica y emitir folios de certificados automáticos verificables en línea.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-800 relative">
            <button 
              onClick={() => onNavigate('inscripcion')}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/15 transform active:scale-[0.98]"
            >
              <span>Inscribirme a un Curso</span>
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onNavigate('asistencia_self')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 border border-slate-750"
            >
              <span>Confirmar Presencia</span>
            </button>
            <button 
              onClick={() => onNavigate('validador')}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold px-5 py-3.5 rounded-xl transition-all duration-200 border border-white/10"
            >
              <span>Verificar Certificado</span>
            </button>
          </div>
        </div>

        {/* Info Card side panel */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-md border border-slate-100 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-[#082b4d] mb-6 flex items-center gap-2">
            <GraduationCap className="text-amber-500" size={24} />
            <span>¿Cómo funciona el Sistema?</span>
          </h2>
          
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Inscripción en línea',
                desc: 'El participante o la empresa carga los datos requeridos para el certificado.'
              },
              {
                step: '2',
                title: 'Acreditación y Asistencia',
                desc: 'SaludMar confirma el pago de matrícula y comprueba la participación o asistencia efectiva en el curso.'
              },
              {
                step: '3',
                title: 'Emisión Automática',
                desc: 'Al marcar la asistencia, el sistema genera de forma segura un código serie único verificable.'
              },
              {
                step: '4',
                title: 'Consulta Pública',
                desc: 'Cualquier entidad o empleador puede validar el código ingresando el ID en el validador oficial.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-sky-50 text-[#082b4d] font-bold flex items-center justify-center shrink-0 border border-sky-100/50 text-sm">
                  {item.step}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Course Showcase */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#082b4d] tracking-tight">
              Oferta Académica & Capacitaciones
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Seleccione cursos disponibles para empresas y profesionales sanitarios libres
            </p>
          </div>
          <div className="w-16 h-1 bg-amber-500/50 rounded-full" />
        </div>

        {courses.length === 1 && courses[0].id === 'urgencias-metabolicas' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-150 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Left side: Course info */}
            <div className="lg:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full uppercase tracking-wider select-none">
                    {courses[0].category}
                  </span>
                  <span className="text-[11px] font-extrabold px-3 py-1 bg-sky-50 text-sky-800 border border-sky-100 rounded-full uppercase tracking-wider flex items-center gap-1 select-none">
                    <Monitor size={11} />
                    <span>CURSO ONLINE</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#082b4d] tracking-tight leading-tight">
                    {courses[0].title}
                  </h3>
                  <p className="text-emerald-600 font-semibold text-sm sm:text-base italic flex items-center gap-2 font-mono select-none">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>Reconoce. Actúa. Salva vidas.</span>
                  </p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {courses[0].description}
                </p>

                {/* Topics Bulleted List */}
                <div className="space-y-3 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Temas Clave que Aprenderás:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { title: 'Hipoglucemia', desc: 'Identificación clínica de emergencia, criterios de intervención y protocolos de rescate inmediato.' },
                      { title: 'Cetoacidosis diabética', desc: 'Fisiopatología metabólica, reposición de volumen de líquidos, insulinoterapia y monitoreo de potasio.' },
                      { title: 'Estado hiperosmolar', desc: 'Criterios diagnósticos diferenciales, descompensaciones hiperglucémicas y corrección hidroelectrolítica.' }
                    ].map((tema, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-[#082b4d] font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span>{tema.title}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{tema.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[#082b4d] text-xs font-bold flex items-center gap-2 select-none">
                <span>📚 Prepárate para marcar la diferencia en cada emergencia.</span>
              </div>
            </div>

            {/* Right side: Practical Details Sidebar */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-slate-100 to-white/90 p-8 sm:p-10 border-t lg:border-t-0 lg:border-l border-slate-200/60 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-200">
                  Ficha de Coordinación y Acceso
                </h4>

                <div className="space-y-5">
                  {/* Scheduling / Date & Time */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 border border-orange-100">
                      <Clock size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha y Hora</div>
                      <div className="font-bold text-slate-800 text-sm leading-snug">SÁBADO 06 DE JULIO</div>
                      <div className="text-xs text-slate-600 font-mono">17:30 HS.</div>
                    </div>
                  </div>

                  {/* Modality / Platform */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                      <Monitor size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modalidad</div>
                      <div className="font-bold text-slate-800 text-sm">Online • Vía Zoom</div>
                      <div className="text-xs text-[#0b5c8c] font-semibold">Incluye Certificación Digital</div>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <span className="text-base font-bold font-mono">$</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inversión</div>
                      <div className="font-extrabold text-slate-800 text-lg leading-none">Gs. 40.000</div>
                      <span className="text-[10px] bg-emerald-150 text-emerald-850 font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                        Matrícula Única
                      </span>
                    </div>
                  </div>

                  {/* Inscriptions & Contacts from Flyer */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                      <Users size={18} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Informes e Inscripciones</div>
                      <div className="flex flex-col gap-0.5 font-mono text-xs text-slate-800 font-bold">
                        <span>🟢 0992 441 003</span>
                        <span>🟢 0971 191 978</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={() => onNavigate('inscripcion')}
                  className="w-full flex items-center justify-center gap-2 bg-[#082b4d] hover:bg-[#0b5c8c] text-white font-extrabold px-6 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-900/10 active:scale-[0.98] cursor-pointer"
                >
                  <GraduationCap size={18} />
                  <span>Pre-inscribirme Ahora</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          (() => {
            const upcomingCourses = courses.filter(c => c.tipoCurso === 'a_desarrollar' || !c.tipoCurso);
            const recordedCourses = courses.filter(c => c.tipoCurso === 'grabado');
            
            return (
              <div className="space-y-12">
                {/* 1. Upcoming Courses Section */}
                {upcomingCourses.length > 0 && (
                  <div className="space-y-5">
                    <h3 className="font-serif text-xl font-bold text-[#082b4d] flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                      <span>📅 Próximas Capacitaciones (En Vivo / Dictándose)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingCourses.map((course, index) => {
                        let badgeColor = 'bg-amber-50 border-amber-200 text-amber-800';
                        let Icon = Clock;
                        
                        if (course.title.includes('RCP') || course.title.includes('Urgencias')) {
                          badgeColor = 'bg-rose-50 border-rose-100 text-rose-800';
                          Icon = ShieldCheck;
                        }

                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.08 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-amber-400/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                                  {course.category}
                                </span>
                                <span className="text-slate-400 group-hover:text-amber-500 transition-colors duration-200">
                                  <Icon size={18} />
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-serif text-lg font-bold text-[#082b4d] leading-snug group-hover:text-[#0b5c8c] transition-colors duration-200">
                                  {course.title}
                                </h4>
                                <p className="text-xs font-semibold text-slate-400 font-mono">
                                  Horario: {course.duration}
                                </p>
                              </div>

                              <p className="text-slate-605 text-xs leading-relaxed line-clamp-3">
                                {course.description}
                              </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{course.modality}</span>
                              </div>
                              
                              <button 
                                onClick={() => onNavigate('inscripcion')}
                                className="flex items-center gap-1 text-[#082b4d] text-xs font-bold hover:text-amber-500 transition-colors duration-250 cursor-pointer"
                              >
                                <span>Pre-inscribirme</span>
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Recorded/Asynchronous Courses Section */}
                {recordedCourses.length > 0 && (
                  <div className="space-y-5">
                    <h3 className="font-serif text-xl font-bold text-[#082b4d] flex items-center gap-2 border-l-4 border-sky-500 pl-3">
                      <span>✨ Cursos Auto-Asistidos (Grabados / Aula Virtual Activa)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recordedCourses.map((course, index) => {
                        let badgeColor = 'bg-sky-50 border-sky-100 text-sky-800';
                        let Icon = Monitor;

                        if (course.title.includes('Muestras')) {
                          badgeColor = 'bg-purple-50 border-purple-100 text-purple-800';
                          Icon = Monitor;
                        }

                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.08 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-sky-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                                  {course.category}
                                </span>
                                <span className="text-slate-400 group-hover:text-sky-500 transition-colors duration-200">
                                  <Icon size={18} />
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-serif text-lg font-bold text-[#082b4d] leading-snug group-hover:text-[#0b5c8c] transition-colors duration-200">
                                  {course.title}
                                </h4>
                                <p className="text-xs font-semibold text-slate-405 font-mono">
                                  Acceso Asíncrono Continuo
                                </p>
                              </div>

                              <p className="text-slate-605 text-xs leading-relaxed line-clamp-3">
                                {course.description}
                              </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{course.modality}</span>
                              </div>
                              
                              <button 
                                onClick={() => onNavigate('inscripcion')}
                                className="flex items-center gap-1 text-[#082b4d] text-xs font-bold hover:text-[#0b5c8c] transition-colors duration-250 cursor-pointer"
                              >
                                <span>Habilitar Acceso</span>
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
