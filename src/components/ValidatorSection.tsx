import React, { useState } from 'react';
import { Participant } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldCheck, CheckCircle2, XCircle, Award, Calendar, FileText, ArrowRight } from 'lucide-react';

interface ValidatorSectionProps {
  participants: Participant[];
  onViewCertificateOfStudent: (id: string) => void;
  addToast: (text: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  initialCode?: string | null;
}

export const ValidatorSection: React.FC<ValidatorSectionProps> = ({
  participants,
  onViewCertificateOfStudent,
  addToast,
  initialCode
}) => {
  const [code, setCode] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedParticipant, setMatchedParticipant] = useState<Participant | null>(null);

  // Auto-verify if initialCode is provided from scanning the QR code
  React.useEffect(() => {
    if (initialCode) {
      const query = initialCode.trim().toUpperCase();
      setCode(query);
      const matched = participants.find(
        (p) => p.certificadoEmitido && p.certificadoCodigo?.toUpperCase() === query
      );

      setMatchedParticipant(matched || null);
      setHasSearched(true);
      
      if (matched) {
        addToast('¡QR verificado! Certificado legítimo de SaludMar encontrado.', 'success');
      } else {
        addToast('No se encontró ningún certificado coincidente con este código QR', 'error');
      }
    }
  }, [initialCode, participants]);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const query = code.trim().toUpperCase();
    if (!query) {
      addToast('Ingrese un código de certificado para continuar', 'warning');
      return;
    }

    const matched = participants.find(
      (p) => p.certificadoEmitido && p.certificadoCodigo?.toUpperCase() === query
    );

    setMatchedParticipant(matched || null);
    setHasSearched(true);
    
    if (matched) {
      addToast('¡Certificado válido encontrado en los archivos de SaludMar!', 'success');
    } else {
      addToast('No se encontró ningún certificado con este código de verificación', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold text-[#082b4d] tracking-tight">
            Consultas Públicas & Validaciones
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Verifique la legitimidad de un certificado emitido por SaludMar. Ingrese el código identificador que figura al pie del diploma.
          </p>
        </div>

        <form onSubmit={handleValidate} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Ej: SM-2026-582194"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-semibold uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:normal-case placeholder:font-normal"
            />
          </div>
          <button 
            type="submit"
            className="bg-[#082b4d] hover:bg-[#0b5c8c] text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md active:scale-[0.98] whitespace-nowrap"
          >
            Validar Código
          </button>
        </form>
      </div>

      {/* SEARCH RESULT ANCHORS */}
      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {matchedParticipant ? (
              // Success Panel
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/30 shadow-lg relative overflow-hidden space-y-6">
                
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 size={30} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        Certificado Válido y Registrado
                      </h3>
                      <p className="text-emerald-700 text-xs font-semibold flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={13} />
                        <span>Firma digital autorizada por SaludMar Servicios Médicos</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 font-mono text-xs font-bold text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100">
                    {matchedParticipant.certificadoCodigo}
                  </div>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
                  <div className="space-y-1 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Titulación del Alumno
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#082b4d]">
                      {matchedParticipant.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      C.I. Nº: <strong className="text-slate-800">{matchedParticipant.cedula}</strong>
                    </p>
                  </div>

                  <div className="space-y-1 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Curso Académico Impartido
                    </span>
                    <h4 className="font-sans font-semibold text-slate-900 line-clamp-2">
                      {matchedParticipant.cursoNombre}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Modalidad: <strong className="text-slate-800">{matchedParticipant.modalidad}</strong>
                    </p>
                  </div>

                  <div className="space-y-1 p-4 bg-slate-50 rounded-xl border border-slate-100/50 md:col-span-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Fecha de Impartición
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Calendar size={14} className="text-amber-500" />
                      <span>{matchedParticipant.fecha}</span>
                    </div>
                  </div>
                </div>

                {/* Print jump action */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => onViewCertificateOfStudent(matchedParticipant.id)}
                    className="flex items-center gap-1.5 text-[#082b4d] font-bold text-xs hover:text-amber-600 transition-colors duration-200 cursor-pointer"
                  >
                    <span>Ver e imprimir la copia digital original</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            ) : (
              // Error panel
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-rose-500/30 shadow-md space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                    <XCircle size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      Código de Certificado no registrado
                    </h3>
                    <p className="text-rose-700 text-xs font-semibold">
                      Comprobación Académica Inválida
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed pt-2">
                      No encontramos ningún diploma acreditado con el identificador <strong className="text-slate-800 font-mono">"{code}"</strong>. Verifique el orden de caracteres, remplace los guiones si corresponden, u obtenga asistencia directamente con la mesa examinadora de SaludMar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lookups Quick Check Card */}
      {!hasSearched && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-150/70 space-y-4">
          <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <Award size={16} className="text-amber-500" />
            <span>Información Adicional para Verificaciones</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 leading-relaxed list-disc list-inside">
            <li>Nuestros certificados emitidos a partir del año 2026 cuentan con un patrón de verificación único compuesto por las iniciales de SaludMar (SM) seguido del año en curso, un guion, y una serie de 6 números.</li>
            <li>Si el participante completó el taller recientemente, es posible que el certificado se encuentre en fase de procesamiento o validación de pago.</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
};
