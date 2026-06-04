import React, { useState } from 'react';
import { CertificateLayoutConfig } from '../types';
import { motion } from 'motion/react';
import { 
  Sliders, FileText, CheckSquare, Palette, Layout, Type, 
  RotateCcw, Sparkles
} from 'lucide-react';

interface CertificateDesignerProps {
  layoutConfig: CertificateLayoutConfig;
  onSaveLayoutConfig: (newLayout: CertificateLayoutConfig) => void;
  addToast: (text: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const PRESET_STYLES = [
  {
    name: 'Estilo Clásico Salud-Mar',
    config: {
      borderWidth: 14,
      outerBorderColor: '#0f172a', // deep navy slate
      innerBorderColor: '#f59e0b', // gold/amber
      titleFontSize: 45,
      nameFontSize: 36,
      courseFontSize: 23,
      signatureScale: 100,
      verticalSpacing: 'normal' as const,
      showLaurels: true,
      showVerificationBadge: true,
      showQrBar: true,
      showWatermark: true,
      showSignatureLine: true,
      signatureYOffset: -16,
      showDividerLine: true,
    }
  },
  {
    name: 'Estilo Minimalista Moderno',
    config: {
      borderWidth: 4,
      outerBorderColor: '#1e293b', // slate-800
      innerBorderColor: '#cbd5e1', // light slate
      titleFontSize: 40,
      nameFontSize: 32,
      courseFontSize: 20,
      signatureScale: 90,
      verticalSpacing: 'tight' as const,
      showLaurels: false,
      showVerificationBadge: true,
      showQrBar: true,
      showWatermark: false,
      showSignatureLine: false,
      signatureYOffset: -8,
      showDividerLine: false,
    }
  },
  {
    name: 'Estilo Diplomático Presidencial',
    config: {
      borderWidth: 22,
      outerBorderColor: '#0c4a6e', // rich sky/ocean
      innerBorderColor: '#d97706', // gold dark
      titleFontSize: 52,
      nameFontSize: 40,
      courseFontSize: 26,
      signatureScale: 110,
      verticalSpacing: 'roomy' as const,
      showLaurels: true,
      showVerificationBadge: true,
      showQrBar: false,
      showWatermark: true,
      showSignatureLine: true,
      signatureYOffset: -22,
      showDividerLine: true,
    }
  }
];

export const CertificateDesigner: React.FC<CertificateDesignerProps> = ({
  layoutConfig,
  onSaveLayoutConfig,
  addToast
}) => {
  const [config, setConfig] = useState<CertificateLayoutConfig>({ ...layoutConfig });

  // Sync internal state with prop changes automatically
  React.useEffect(() => {
    setConfig(layoutConfig);
  }, [layoutConfig]);

  const handleChange = (key: keyof CertificateLayoutConfig, value: any) => {
    const updated = {
      ...config,
      [key]: value
    };
    setConfig(updated);
    onSaveLayoutConfig(updated); // Instant real-time save and render feedback!
  };

  const handleApplyPreset = (preset: typeof PRESET_STYLES[0]) => {
    const updated = {
      ...config,
      ...preset.config
    };
    setConfig(updated);
    onSaveLayoutConfig(updated);
    addToast(`Diseño seteo: "${preset.name}" aplicado con éxito`, 'success');
  };

  const handleSave = () => {
    onSaveLayoutConfig(config);
    addToast('¡Diseño del certificado guardado permanentemente!', 'success');
  };

  const handleRestoreDefaults = () => {
    const defaults: CertificateLayoutConfig = {
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
    setConfig(defaults);
    onSaveLayoutConfig(defaults);
    addToast('Dimensiones y textos restaurados al valor original', 'info');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6 select-none my-4">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sliders size={12} />
            <span>Redimensionador en Tiempo Real (Autoguardado)</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Personalizar Plantilla del Certificado
          </h3>
          <p className="text-xs text-slate-500">
            Cualquier ajuste se guarda y se aplica automáticamente en el certificado. No es necesario salir de esta sección para ver el resultado.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRestoreDefaults}
            className="p-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Restaurar Original</span>
          </button>
          
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Guardado al Instante</span>
          </div>
        </div>
      </div>

      {/* INSTANT PRESETS BANNER */}
      <div className="bg-slate-55 p-3 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500 shrink-0" size={16} />
          <span className="text-xs font-bold text-slate-700">Pre-ajustes Rápidos de Diseño:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_STYLES.map((pres) => (
            <button
              key={pres.name}
              onClick={() => handleApplyPreset(pres)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
            >
              {pres.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {/* COL 1: TEXT LABELS & CORES */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
            <FileText size={16} className="text-[#082b4d]" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Edición de Textos Académicos</h4>
          </div>

          <div className="space-y-4">
            {/* Header Text */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Cabecera del Registro (Margen Superior)
              </label>
              <input
                type="text"
                value={config.headerText}
                onChange={(e) => handleChange('headerText', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-150"
              />
            </div>

            {/* Cert Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Título del Diploma
              </label>
              <input
                type="text"
                value={config.titleText}
                onChange={(e) => handleChange('titleText', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Subtítulo del Diploma
              </label>
              <input
                type="text"
                value={config.subtitleText}
                onChange={(e) => handleChange('subtitleText', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none"
              />
            </div>

            {/* Body Intro Text */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Texto de Acreditación (Introducción)
              </label>
              <textarea
                rows={2}
                value={config.bodyIntroText}
                onChange={(e) => handleChange('bodyIntroText', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Body Logistics Text */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Texto Logístico del Curso (Plantilla)
                </label>
                <span className="text-[9px] font-mono text-slate-400">Use {'{fecha}'} y {'{carga}'}</span>
              </div>
              <textarea
                rows={2}
                value={config.bodyLogisticsText}
                onChange={(e) => handleChange('bodyLogisticsText', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* COL 2: DIMENSIONS, SIZING SLIDERS & VISIBILITIES */}
        <div className="space-y-6">
          
          {/* SLIDERS & CONFIGS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <Layout size={16} className="text-[#082b4d]" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Dimensiones y Escala</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Outer Border Weight */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-10 border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>Grosor del Borde</span>
                  <span className="text-[#082b4d]">{config.borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={config.borderWidth}
                  onChange={(e) => handleChange('borderWidth', parseInt(e.target.value))}
                  className="w-full accent-[#082b4d] cursor-pointer"
                />
              </div>

              {/* Title Font Size */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>Letra de Título</span>
                  <span className="text-[#082b4d]">{config.titleFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="65"
                  value={config.titleFontSize}
                  onChange={(e) => handleChange('titleFontSize', parseInt(e.target.value))}
                  className="w-full accent-[#082b4d] cursor-pointer"
                />
              </div>

              {/* Name Font Size */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>Letra del Carpeta</span>
                  <span className="text-[#082b4d]">{config.nameFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="55"
                  value={config.nameFontSize}
                  onChange={(e) => handleChange('nameFontSize', parseInt(e.target.value))}
                  className="w-full accent-[#082b4d] cursor-pointer"
                />
              </div>

              {/* Course Font Size */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>Letra del Curso</span>
                  <span className="text-[#082b4d]">{config.courseFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="35"
                  value={config.courseFontSize}
                  onChange={(e) => handleChange('courseFontSize', parseInt(e.target.value))}
                  className="w-full accent-[#082b4d] cursor-pointer"
                />
              </div>

              {/* Signature Scale */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>Escala de Firmas</span>
                  <span className="text-[#082b4d]">{config.signatureScale}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="150"
                  value={config.signatureScale}
                  onChange={(e) => handleChange('signatureScale', parseInt(e.target.value))}
                  className="w-full accent-[#082b4d] cursor-pointer"
                />
              </div>

              {/* Signature displacement/offset slider */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>Alineación Vertical Firma</span>
                  <span className="text-[#082b4d]">{config.signatureYOffset}px</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="40"
                  value={config.signatureYOffset}
                  onChange={(e) => handleChange('signatureYOffset', parseInt(e.target.value))}
                  className="w-full accent-[#082b4d] cursor-pointer"
                />
              </div>

              {/* Vertical spacing selection */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Espaciado General
                </label>
                <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  {['tight', 'normal', 'roomy'].map((sp) => (
                    <button
                      type="button"
                      key={sp}
                      onClick={() => handleChange('verticalSpacing', sp)}
                      className={`py-1 text-[10px] font-bold rounded capitalize cursor-pointer text-center ${
                        config.verticalSpacing === sp 
                          ? 'bg-[#082b4d] text-white' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sp === 'tight' ? 'Apretado' : sp === 'normal' ? 'Normal' : 'Amplio'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Color de Borde Exterior
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.outerBorderColor}
                    onChange={(e) => handleChange('outerBorderColor', e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="font-mono text-xs font-bold text-slate-700 uppercase">{config.outerBorderColor}</span>
                </div>
              </div>

              {/* Colors Inner Accent */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Color del Filete Dorado (Interno)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.innerBorderColor}
                    onChange={(e) => handleChange('innerBorderColor', e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="font-mono text-xs font-bold text-slate-700 uppercase">{config.innerBorderColor}</span>
                </div>
              </div>

            </div>
          </div>

          {/* VISIBILITIES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <CheckSquare size={16} className="text-[#082b4d]" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Visibilidad de Elementos</h4>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {[
                { key: 'showLaurels', label: 'Escarapela o Laureles', desc: 'Símbolo dorado superior' },
                { key: 'showVerificationBadge', label: 'Sello de Verificación', desc: 'Rúbrica verde superior' },
                { key: 'showQrBar', label: 'Pie de Página QR', desc: 'Códigos para verificación en vivo' },
                { key: 'showWatermark', label: 'Marca de Agua', desc: 'Logo tenue de fondo traslúcido' },
                { key: 'showSignatureLine', label: 'Línea de Firma', desc: 'Línea recta debajo del trazo' },
                { key: 'showDividerLine', label: 'Separador de Firmas', desc: 'Línea superior que divide sección' }
              ].map((item) => {
                const isActive = (config as any)[item.key];
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleChange(item.key as any, !isActive)}
                    className={`flex items-start text-left gap-2.5 p-2 px-3 rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'border-indigo-600 bg-indigo-50/40' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      readOnly
                      className="mt-0.5 pointer-events-none accent-[#082b4d]"
                    />
                    <div>
                      <div className="text-[11.5px] font-extrabold text-slate-800 leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[9.5px] text-slate-450 mt-0.5 leading-none">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
