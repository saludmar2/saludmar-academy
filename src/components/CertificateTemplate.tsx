import React, { useState, useEffect } from 'react';
import { Participant, SignatureConfig, CertificateLayoutConfig } from '../types';
import { SaludMarLogo } from './SaludMarLogo';
import { Award, ShieldCheck, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface CertificateTemplateProps {
  participant: Participant;
  signatures?: SignatureConfig[];
  layoutConfig?: CertificateLayoutConfig;
}

// Helper wrapper to render customized signatures types (handwritten text, Base64 drawn pad, or uploaded file representation)
const RenderSignature: React.FC<{ 
  config: SignatureConfig | undefined;
  defaultRenderer: React.ComponentType<{ signatureYOffset?: number }>;
  signatureYOffset?: number;
}> = ({ config, defaultRenderer: DefaultRenderer, signatureYOffset = -14 }) => {
  if (!config) return <DefaultRenderer signatureYOffset={signatureYOffset} />;

  if (config.tipo === 'predeterminada') {
    return <DefaultRenderer signatureYOffset={signatureYOffset} />;
  }

  if (config.tipo === 'texto') {
    const texto = config.firmaTexto || config.nombre.split(' ').pop() || 'Firma';
    const estiloClase = config.fuenteEstilo === 'style-2' 
      ? 'line-through decoration-slate-350 text-[#082b4d] font-serif' 
      : config.fuenteEstilo === 'style-3' 
        ? 'font-mono text-emerald-950 font-bold italic text-base' 
        : 'text-indigo-950 font-semibold italic font-serif text-lg';
    return (
      <div 
        style={{ marginBottom: `${signatureYOffset}px` }}
        className="h-[76px] flex items-center justify-center select-none overflow-hidden max-w-[180px] mx-auto"
      >
        <span className={`text-2xl tracking-widest leading-none transform -rotate-3 ${estiloClase}`}>
          {texto}
        </span>
      </div>
    );
  }

  if ((config.tipo === 'dibujada' || config.tipo === 'imagen') && config.firmaBase64) {
    return (
      <div 
        style={{ marginBottom: `${signatureYOffset}px` }}
        className="h-[76px] flex items-center justify-center select-none overflow-hidden max-w-[200px] mx-auto"
      >
        <img 
          src={config.firmaBase64} 
          alt="Firma Digital" 
          className="max-h-[72px] w-auto object-contain select-none pointer-events-none transform scale-115 mix-blend-multiply bg-transparent"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return <DefaultRenderer signatureYOffset={signatureYOffset} />;
};


// Custom hand-drawn script look for Prof. Lic. Arnold Martínez's signature
const ArnoldSignature: React.FC<{ signatureYOffset?: number }> = ({ signatureYOffset = -14 }) => (
  <svg 
    width="180" 
    height="76" 
    viewBox="0 0 140 52" 
    fill="none" 
    style={{ marginBottom: `${signatureYOffset}px` }}
    className="opacity-95 select-none transform hover:scale-105 transition-transform duration-250"
  >
    {/* Elegant handwritten ink path */}
    <path 
      d="M15,36 C28,34 40,16 48,22 C55,27 34,44 42,42 C54,39 76,12 80,16 C84,20 68,43 86,34 C98,28 112,32 124,36 M48,32 L72,27 M82,24 C85,24 95,20 102,23" 
      stroke="#1e3a8a" /* Navy academic ink */
      strokeWidth="2.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M22,34 L120,40" 
      stroke="#1e293b" 
      strokeWidth="1" 
      strokeDasharray="2 3" 
      opacity="0.2" 
    />
  </svg>
);

// Custom hand-drawn script look for Lic. Andrea Giménez's signature
const AndreaSignature: React.FC<{ signatureYOffset?: number }> = ({ signatureYOffset = -14 }) => (
  <svg 
    width="180" 
    height="76" 
    viewBox="0 0 140 52" 
    fill="none" 
    style={{ marginBottom: `${signatureYOffset}px` }}
    className="opacity-95 select-none transform hover:scale-105 transition-transform duration-250"
  >
    {/* Sleek executive signature path */}
    <path 
      d="M20,38 C32,22 55,8 48,24 C42,38 70,26 82,34 C94,42 78,14 96,16 C110,18 98,44 115,38 M115,22 C118,25 125,18 128,21" 
      stroke="#1e3a8a" /* Navy academic ink */
      strokeWidth="2.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M40,24 L110,26" 
      stroke="#1e293b" 
      strokeWidth="1" 
      strokeDasharray="2 2" 
      opacity="0.18" 
    />
  </svg>
);

// Classy Golden Laurels surrounding the brand logo for the header
const GoldenLaurels: React.FC = () => (
  <div className="flex items-center justify-center gap-2 sm:gap-4 relative my-3 select-none">
    {/* Left Laurel */}
    <svg width="45" height="65" viewBox="0 0 50 100" fill="none" className="text-amber-500/80 shrink-0">
      <path d="M 40,90 C 25,75 10,50 40,10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 33,80 C 15,75 20,65 33,70 Z" fill="currentColor" />
      <path d="M 28,68 C 10,63 15,53 28,58 Z" fill="currentColor" />
      <path d="M 26,54 C 8,49 13,39 26,44 Z" fill="currentColor" />
      <path d="M 28,40 C 10,35 15,25 28,30 Z" fill="currentColor" />
      <path d="M 32,26 C 18,20 22,12 34,18 Z" fill="currentColor" />
    </svg>
    
    {/* Center Brand Symbol */}
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-sm border border-slate-100/80">
      <SaludMarLogo symbolOnly={true} size="custom" width={48} height={48} className="w-[48px] h-[48px]" />
    </div>

    {/* Right Laurel */}
    <svg width="45" height="65" viewBox="0 0 50 100" fill="none" className="text-amber-500/80 scale-x-[-1] shrink-0">
      <path d="M 40,90 C 25,75 10,50 40,10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 33,80 C 15,75 20,65 33,70 Z" fill="currentColor" />
      <path d="M 28,68 C 10,63 15,53 28,58 Z" fill="currentColor" />
      <path d="M 26,54 C 8,49 13,39 26,44 Z" fill="currentColor" />
      <path d="M 28,40 C 10,35 15,25 28,30 Z" fill="currentColor" />
      <path d="M 32,26 C 18,20 22,12 34,18 Z" fill="currentColor" />
    </svg>
  </div>
);

// Corner guilloche wave patterns for maximum design identity
const WavyRibbonCorner: React.FC<{ position: 'top-left' | 'bottom-right' }> = ({ position }) => {
  const isTopLeft = position === 'top-left';
  return (
    <svg 
      className={`absolute ${isTopLeft ? '-top-3 -left-3' : '-bottom-3 -right-3'} w-24 h-24 sm:w-32 sm:h-32 pointer-events-none opacity-[0.22] text-rose-600/90 ${!isTopLeft && 'rotate-180'}`} 
      fill="none" 
      viewBox="0 0 100 100"
    >
      <path d="M0,0 Q30,10 60,30 T100,100" stroke="currentColor" strokeWidth="1.8" />
      <path d="M0,10 Q25,25 50,45 T90,100" stroke="currentColor" strokeWidth="1.2" />
      <path d="M0,20 Q20,40 40,60 T80,100" stroke="currentColor" strokeWidth="0.8" />
      <path d="M10,0 Q40,30 20,70 T70,100" stroke="currentColor" strokeWidth="1.4" />
      <path d="M20,0 Q50,40 30,80 T60,100" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
};

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ 
  participant, 
  signatures, 
  layoutConfig 
}) => {
  const [qrBase64, setQrBase64] = useState<string>('');

  useEffect(() => {
    if (participant.certificadoCodigo) {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://saludmar.com';
      const verifyUrl = `${currentOrigin}/?verify=${encodeURIComponent(participant.certificadoCodigo)}`;
      
      QRCode.toDataURL(verifyUrl, {
        margin: 1.5,
        width: 140,
        color: {
          dark: '#0f172a', // Deep slate for reliable scanning
          light: '#ffffff', // Stable solid white background for high-contrast scanning on paper/screen
        }
      })
      .then(url => {
        setQrBase64(url);
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [participant.certificadoCodigo]);

  const {
    headerText = 'SALUD-MAR • REGISTRO DE ENTIDAD DE CAPACITACIÓN ACADÉMICA',
    titleText = 'Certificado',
    subtitleText = 'DE PARTICIPACIÓN',
    bodyIntroText = 'Ha participado satisfactoriamente de todos los contenidos desarrollados dentro del Curso Virtual',
    bodyLogisticsText = 'Realizado en fecha {fecha}, impartido en forma virtual por SALUD-MAR, CAPACITACIONES con una carga horaria de {carga}.',
    borderWidth = 14,
    outerBorderColor = '#0f172a',
    innerBorderColor = '#f59e0b',
    titleFontSize = 45,
    nameFontSize = 36,
    courseFontSize = 23,
    signatureScale = 100,
    verticalSpacing = 'normal',
    showLaurels = true,
    showVerificationBadge = true,
    showQrBar = true,
    showWatermark = true,
    showSignatureLine = true,
    signatureYOffset = -16,
    showDividerLine = true,
  } = layoutConfig || {};

  // Extract signatures from custom configuration or fallback to defaults
  const sig1 = signatures?.find(s => s.id === 'firmante-1');
  const sig2 = signatures?.find(s => s.id === 'firmante-2');

  // Format dates in Spanish manually or via standard Intl
  const formatDateEsp = (dateStr: string) => {
    try {
      if (!dateStr) return '';
      const dateParts = dateStr.split('-');
      if (dateParts.length === 3) {
        const year = dateParts[0];
        const monthIndex = parseInt(dateParts[1], 10) - 1;
        const day = dateParts[2];
        const months = [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        return `${day} de ${months[monthIndex]} de ${year}`;
      }
      return new Date(dateStr).toLocaleDateString('es-PY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getDedicacionCatedra = (p: Participant) => {
    if (p.cursoId === 'urgencias-metabolicas') {
      return '08 horas Cátedras';
    }
    return '20 horas Cátedras';
  };

  const generateLogisticsHTML = () => {
    const formattedFecha = formatDateEsp(participant.fecha);
    const formattedCarga = getDedicacionCatedra(participant);
    return bodyLogisticsText
      .replace('{fecha}', `<strong class="text-slate-900 font-extrabold">${formattedFecha}</strong>`)
      .replace('{carga}', `<strong class="text-[#082b4d] font-black">${formattedCarga}</strong>`);
  };

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto bg-white p-3 sm:p-6 rounded-3xl border border-slate-200 shadow-xl overflow-hidden print-area"
      id="certificate-print-view"
      style={{ minHeight: '620px' }}
    >
      {/* Background Guilloche watermark */}
      <div className="absolute inset-0 certificate-pattern pointer-events-none opacity-5" />
      
      {/* Large watermark symbol centered translucently */}
      {showWatermark && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center pointer-events-none opacity-[0.035] select-none">
          <SaludMarLogo symbolOnly={true} size="custom" width={340} height={340} className="rotate-12" />
        </div>
      )}

      {/* Security guilloche wavy borders at corners */}
      <WavyRibbonCorner position="top-left" />
      <WavyRibbonCorner position="bottom-right" />

      {/* Decorative Custom Spaced Frame lines with Admin-defined thickness and slate frame */}
      <div 
        style={{ 
          borderWidth: `${borderWidth}px`, 
          borderColor: outerBorderColor,
          padding: verticalSpacing === 'tight' ? '1.25rem' : verticalSpacing === 'roomy' ? '2.5rem' : '2rem'
        }}
        className="rounded-2xl relative bg-white/95"
      >
        
        {/* Inner golden frame accent line */}
        <div 
          style={{ borderColor: innerBorderColor }}
          className="absolute inset-2.5 border pointer-events-none rounded-lg" 
        />

        {/* Certificate Header with verification status */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 mb-6 relative">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
              {headerText}
            </span>
          </div>

          {showVerificationBadge && (
            <div className="text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-700 text-xs font-semibold">
                <ShieldCheck size={13} className="text-emerald-600 animate-pulse" />
                <span>Certificación Digital Verificada</span>
              </div>
            </div>
          )}
        </div>

        {/* Crown & Brand Symbol in Laurels */}
        {showLaurels && (
          <div className="text-center">
            <GoldenLaurels />
          </div>
        )}

        {/* MAIN BODY OF THE CERTIFICATE with adjustable spacing gaps */}
        <div 
          className={`text-center relative ${
            verticalSpacing === 'tight' ? 'space-y-3.5 mt-1' : 
            verticalSpacing === 'roomy' ? 'space-y-9 mt-5' : 
            'space-y-6 mt-2'
          }`}
        >
          
          <h1 
            style={{ fontSize: `${titleFontSize}px` }}
            className="font-serif font-bold tracking-widest text-[#082b4d] uppercase font-display leading-none"
          >
            {titleText}
          </h1>
          
          <div className="text-[12px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mt-1">
            {subtitleText}
          </div>

          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-1" />

          {/* Student Name and bounding highlight lines */}
          <div className="relative py-2 max-w-xl mx-auto">
            <div className="w-full h-px bg-slate-300/80 mb-2" />
            <h2 
              style={{ fontSize: `${nameFontSize}px` }}
              className="font-serif font-extrabold text-[#082b4d] tracking-wide inline-block py-1 relative leading-snug"
            >
              {participant.nombre}
            </h2>
            <div className="w-full h-px bg-slate-300/80 mt-2" />
            
            {participant.cedula && (
              <p className="text-[11px] font-mono text-slate-500 mt-1.5 font-bold tracking-wider">
                CÉDULA DE IDENTIDAD Nº: <span className="text-slate-800">{participant.cedula}</span>
              </p>
            )}
          </div>

          {/* Main Context text matching the photo template */}
          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed font-sans">
            {bodyIntroText}
          </p>

          {/* Course Title (bold, all caps, huge serif, in double quotes with custom font) */}
          <div className="py-2.5 max-w-2xl mx-auto px-4">
            <h3 
              style={{ fontSize: `${courseFontSize}px` }}
              className="font-serif font-extrabold text-slate-900 tracking-tight leading-snug"
            >
              "{participant.cursoNombre ? participant.cursoNombre.toUpperCase() : 'URGENCIAS METABÓLICAS'}"
            </h3>
          </div>

          {/* Logistics text parsing templates */}
          <p 
            className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: generateLogisticsHTML() }}
          />
        </div>

        {/* SIGNATURES AND VALIDEZ SEAL */}
        <div 
          className={`grid grid-cols-1 sm:grid-cols-2 gap-8 items-end relative ${
            showDividerLine ? 'border-t border-slate-150/80' : ''
          } ${
            verticalSpacing === 'tight' ? 'pt-6 mt-6' : 
            verticalSpacing === 'roomy' ? 'pt-14 mt-12' : 
            'pt-10 mt-10'
          }`}
        >
          
          {/* Signature 1 (Left): Prof. Lic. Arnold Martínez */}
          <div className="text-center flex flex-col items-center justify-end">
            <div className="h-[92px] flex items-end justify-center relative select-none">
              <div 
                style={{ transform: `scale(${signatureScale / 100})` }}
                className="origin-bottom transition-transform duration-250"
              >
                <RenderSignature config={sig1} defaultRenderer={ArnoldSignature} signatureYOffset={signatureYOffset} />
              </div>
            </div>
            {showSignatureLine && <div className="w-44 h-px bg-slate-800/80 mt-1.5 mb-2 mx-auto" />}
            <div className="min-h-[54px] flex flex-col justify-start">
              <div className="text-xs font-black text-slate-900 tracking-wider">
                {sig1?.nombre || 'Prof. Lic. Arnold Martínez'}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 font-sans leading-tight">
                {sig1?.cargo || 'Facilitador del Taller'}
              </div>
              {sig1?.institucion && (
                <div className="text-[9px] text-[#082b4d] font-extrabold tracking-widest uppercase mt-0.5 leading-none">
                  {sig1.institucion}
                </div>
              )}
            </div>
          </div>

          {/* Signature 2 (Right): Lic. Andrea Giménez */}
          <div className="text-center flex flex-col items-center justify-end">
            <div className="h-[92px] flex items-end justify-center relative select-none">
              <div 
                style={{ transform: `scale(${signatureScale / 100})` }}
                className="origin-bottom transition-transform duration-250"
              >
                <RenderSignature config={sig2} defaultRenderer={AndreaSignature} signatureYOffset={signatureYOffset} />
              </div>
            </div>
            {showSignatureLine && <div className="w-44 h-px bg-slate-800/80 mt-1.5 mb-2 mx-auto" />}
            <div className="min-h-[54px] flex flex-col justify-start">
              <div className="text-xs font-black text-slate-900 tracking-wider">
                {sig2?.nombre || 'Lic. Andrea Giménez'}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 font-sans leading-tight">
                {sig2?.cargo || 'Directora Ejecutiva'}
              </div>
              {(sig2?.institucion || (!sig2 && 'Salud-Mar')) && (
                <div className="text-[9px] text-[#082b4d] font-extrabold tracking-widest uppercase mt-0.5 leading-none">
                  {sig2?.institucion || 'Salud-Mar'}
                </div>
              )}
            </div>
          </div>

          {/* Tiny centered hologram backdrop inside bottom layer for interactive styling */}
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center pointer-events-none select-none opacity-10 sm:opacity-100">
            <div className="w-14 h-14 rounded-full border border-amber-500 bg-amber-50/10 flex items-center justify-center relative shadow-inner p-1">
              <Award className="text-amber-600/70" size={24} />
              <div className="absolute inset-0 border border-amber-400 animate-[spin_60s_linear_infinite] rounded-full scale-105" />
            </div>
          </div>
        </div>

        {/* Dynamic checking registration stamp info bar (Visible on Screen AND Print) */}
        {showQrBar && (
          <div className="mt-8 pt-4 border-t border-slate-150 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/70 p-3.5 rounded-2xl select-all">
            {/* The real, generated QR Code! */}
            {qrBase64 ? (
              <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-200/80 shrink-0 flex items-center justify-center shadow-sm">
                <img 
                  src={qrBase64} 
                  alt="QR Verificación" 
                  className="w-14 h-14 object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center border border-slate-200">
                <QrCode size={20} className="text-slate-300 animate-pulse" />
              </div>
            )}

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-slate-900 text-amber-400 font-mono text-[9px] font-black px-2 py-0.5 rounded tracking-wide">
                  ID COMPROBACIÓN
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 tracking-wide">
                  {participant.certificadoCodigo || 'PROCESANDO'}
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                  <ShieldCheck size={11} className="text-emerald-600" />
                  <span>REGISTRO AUTÉNTICO</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans font-medium leading-normal">
                Verifique la legitimidad de este diploma escaneando el código QR con cualquier dispositivo móvil, o ingresando el código único directamente en el portal académico SaludMar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

