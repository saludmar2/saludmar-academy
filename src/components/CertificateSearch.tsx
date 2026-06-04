import React, { useState } from 'react';
import { Participant, Course } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Award, CheckCircle2, AlertTriangle, Clock, Landmark, UserCheck, MessageSquare, ExternalLink } from 'lucide-react';

interface CertificateSearchProps {
  participants: Participant[];
  courses: Course[];
  onSelectCertificate: (id: string) => void;
  selectedCertificateId: string | null;
}

export const CertificateSearch: React.FC<CertificateSearchProps> = ({
  participants,
  courses,
  onSelectCertificate,
  selectedCertificateId,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Normalize queries to strip spaces and symbols for ID matching
  const cleanString = (str: string) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const getCleanDigits = (str: string) => {
    return str.replace(/[^\d]/g, '');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const normalizedQuery = cleanString(query);
  const digitQuery = getCleanDigits(query);

  const matchedParticipants = query.trim() === '' ? [] : participants.filter(p => {
    const nameMatch = cleanString(p.nombre).includes(normalizedQuery);
    const cedulaMatch = p.cedula.includes(query.trim()) || 
                      (digitQuery && getCleanDigits(p.cedula).includes(digitQuery));
    
    return nameMatch || cedulaMatch;
  });

  const readyCertificates = matchedParticipants.filter(p => p.certificadoEmitido);
  const pendingRegistrations = matchedParticipants.filter(p => !p.certificadoEmitido);

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

  const getWhatsAppSuppportUrl = (studentCedula: string) => {
    const origin = getAppPublicOrigin();
    const text = `Hola, no encuentro mi certificado en SaludMar con mi Cédula/Nombre.
- C.I. de consulta: ${studentCedula}
- Enlace de Administración: ${origin}/?admin_pago=${encodeURIComponent(studentCedula)}`;
    return `https://wa.me/595992441003?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 select-none no-print">
      
      {/* Banner design */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-br from-[#061b31] to-[#0d345a] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-4 -mt-4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/5 rounded-full blur-xl pointer-events-none -ml-4 -mb-4" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
            <Award className="text-amber-400 stroke-[2]" size={24} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold tracking-tight">Buscador Oficial de Certificados</h4>
            <p className="text-slate-300 text-xs mt-0.5">
              Ingrese su número de Cédula o Nombre para descargar su diploma verificado al instante.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Ingrese su número de Cédula (Ej: 4123456) o su Nombre..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim() === '') {
                setHasSearched(false);
              } else {
                setHasSearched(true);
              }
            }}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b4d] focus:border-transparent transition-all placeholder:text-slate-400 font-sans font-medium text-slate-800"
          />
        </div>
        {query.trim() !== '' && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setHasSearched(false);
            }}
            className="px-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Results Rendering Card */}
      <AnimatePresence mode="wait">
        {hasSearched ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Matching Certificates Category: READY FOR DOWNLOAD */}
            {readyCertificates.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider pl-1 select-none">
                  <CheckCircle2 className="text-emerald-500" size={14} />
                  <span>Certificados Disponibles ({readyCertificates.length})</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {readyCertificates.map((cert) => {
                    const isSelected = selectedCertificateId === cert.id;
                    return (
                      <motion.div
                        key={cert.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onSelectCertificate(cert.id)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between h-full relative overflow-hidden ${
                          isSelected
                            ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/30'
                            : 'bg-slate-50 hover:bg-slate-100/75 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute right-0 top-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2.5 py-1 rounded-bl-xl tracking-wider uppercase">
                            Visualizando
                          </div>
                        )}
                        <div className="space-y-2 pb-3">
                          <span className="text-[9px] uppercase font-bold text-amber-600 tracking-widest bg-amber-100/50 border border-amber-200/50 px-2 py-0.5 rounded-full inline-block">
                            Verificado • {cert.certificadoCodigo || 'Código Digital'}
                          </span>
                          <h5 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                            {cert.cursoNombre}
                          </h5>
                          <div className="text-xs text-slate-500">
                            <strong>Alumno:</strong> {cert.nombre}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Documento: {cert.cedula}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-xs font-bold text-[#082b4d]">
                          <span>Ver Diploma</span>
                          <span className="text-amber-500">→</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matching Certificates Category: PENDING REGISTRATIONS */}
            {pendingRegistrations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider pl-1 select-none">
                  <Clock className="text-amber-500" size={14} />
                  <span>En Proceso de Validación ({pendingRegistrations.length})</span>
                </div>

                <div className="space-y-2.5">
                  {pendingRegistrations.map((p) => {
                    const hasPaid = p.pago !== 'Pendiente';
                    const hasAttended = p.asistencia;
                    
                    return (
                      <div 
                        key={p.id}
                        className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                      >
                        <div className="space-y-1.5">
                          <h6 className="font-bold text-slate-700 text-xs sm:text-sm">
                            {p.cursoNombre}
                          </h6>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span><strong>Alumno:</strong> {p.nombre}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono">C.I.: {p.cedula}</span>
                          </div>

                          {/* Detail statuses explaining EXACTLY why it is not emitted yet */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                              hasPaid 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}>
                              {hasPaid ? '✓ Matrícula Abonada' : '✗ Matrícula Pendiente'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                              hasAttended
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                            }`}>
                              {hasAttended ? '✓ Asistencia Registrada' : '✗ Asistencia Pendiente de Acreditación'}
                            </span>
                          </div>
                        </div>

                        {/* Guidelines helper CTA to trigger help/payment flow */}
                        <div className="shrink-0 flex flex-col justify-center">
                          {!hasPaid ? (
                            <a 
                              href={`https://wa.me/595992441003?text=${encodeURIComponent(
                                `Hola, remito mi comprobante para la habilitación de mi certificado en el curso:\n- Curso: ${p.cursoNombre}\n- Alumno: ${p.nombre}\n- C.I.: ${p.cedula}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition text-[10px] uppercase justify-center cursor-pointer"
                            >
                              <span>Reportar Pago</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : !hasAttended ? (
                            <div className="text-slate-400 text-[10px] text-right">
                              Por favor marque asistencia en la sección <strong className="text-slate-600">"Aula Virtual"</strong>.
                            </div>
                          ) : (
                            <div className="text-amber-600 font-medium text-[10px] text-right flex items-center gap-1.5 justify-end">
                              <Clock size={12} />
                              <span>En espera de emisión por administración</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NO RESULTS FOUND AT ALL */}
            {readyCertificates.length === 0 && pendingRegistrations.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4 max-w-md mx-auto">
                <AlertTriangle className="mx-auto text-amber-500" size={32} />
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-800 text-sm">No encontramos registros</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    No se han encontrado preinscripciones ni certificados relacionados a la Cédula u Nombre ingresados (<strong className="font-mono">{query}</strong>) en las bases de datos de SaludMar.
                  </p>
                </div>
                <div className="pt-2">
                  <a
                    href={getWhatsAppSuppportUrl(query.trim())}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 transition text-xs cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    <span>Contactar con Soporte</span>
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* INITIAL PERSUASIVE HELP BANNER */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3.5 select-none"
          >
            <Search className="mx-auto text-slate-300" size={40} />
            <div className="space-y-1">
              <h5 className="font-bold text-slate-600 text-sm">¿Desea buscar todos sus certificados emitidos?</h5>
              <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                Complete el buscador superior con su número de Cédula de Identidad o su Nombre completo para consultar el estado de sus folios académicos y emitir sus diplomas en PDF.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
