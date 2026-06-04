import React, { useState, useRef, useEffect } from 'react';
import { SignatureConfig } from '../types';
import { motion } from 'motion/react';
import { 
  FileText, ShieldCheck, Edit, Keyboard, FileUp, 
  Trash2, Undo, CheckCircle2, Award, User, RefreshCw
} from 'lucide-react';

interface SignatureManagerProps {
  signatures: SignatureConfig[];
  onSaveSignatures: (newSignatures: SignatureConfig[]) => void;
  addToast: (text: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SignatureManager: React.FC<SignatureManagerProps> = ({
  signatures,
  onSaveSignatures,
  addToast
}) => {
  const [configs, setConfigs] = useState<SignatureConfig[]>(signatures);
  const [activeSignee, setActiveSignee] = useState<'firmante-1' | 'firmante-2'>('firmante-1');
  
  // HTML5 Drawing Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setConfigs(signatures);
  }, [signatures]);

  const currentConfig = configs.find(c => c.id === activeSignee) || configs[0];

  // Canvas drawing functions
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling when drawing on touch screens
    if (e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Drawing settings for smooth ink look
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep charcoal/navy ink

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Convert Drawn canvas to PNG Base64 and assign to active config
  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      addToast('Primero dibuje su firma sobre el lienzo', 'warning');
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      updateCurrentConfig({
        tipo: 'dibujada',
        firmaBase64: dataUrl
      });
      addToast(`Firma dibujada guardada para ${currentConfig.nombre}`, 'success');
    } catch (err) {
      addToast('Error al procesar el trazo del lienzo', 'error');
    }
  };

  // Handle uploading PNG image signature
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('El archivo seleccionado debe ser una imagen válida (PNG, JPG, SVG)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateCurrentConfig({
          tipo: 'imagen',
          firmaBase64: event.target.result as string
        });
        addToast(`Imagen de firma cargada para ${currentConfig.nombre}`, 'success');
      }
    };
    reader.onerror = () => {
      addToast('Error al leer el archivo de firma', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Helper code to update fields of currentConfig
  const updateCurrentConfig = (updates: Partial<SignatureConfig>) => {
    const nextConfigs = configs.map(c => {
      if (c.id === currentConfig.id) {
        return {
          ...c,
          ...updates
        };
      }
      return c;
    });
    setConfigs(nextConfigs);
    // Instant background auto-save to Parent & Firestore on any change
    onSaveSignatures(nextConfigs);
  };

  // Save changes back to App system level
  const handleSaveChanges = () => {
    onSaveSignatures(configs);
    addToast('¡Configuraciones y firmas digitales guardadas correctamente!', 'success');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-8">
      {/* HEADER SECTION IN PLATFORM STYLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-[11px] font-bold uppercase tracking-wider select-none animate-pulse">
            <ShieldCheck size={12} />
            <span>Módulo de Firmas Certificadas</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#082b4d] tracking-tight">
            Gestión de Secretarios y Firmas Académicas
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure quiénes firman los documentos, personalice nombres, cargos y cargue las rúbricas que saldrán en la impresión.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-[11px] sm:text-xs font-black tracking-wide select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Guardado al Instante</span>
          </div>

          <button
            onClick={handleSaveChanges}
            className="bg-[#082b4d] hover:bg-[#0b5c8c] text-white font-extrabold text-[11px] sm:text-xs px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-200 shadow-md transform hover:scale-[1.01] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            Guardar Firmas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Select Signee and Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Seleccionar Firmante a configurar
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'firmante-1', name: configs[0].nombre, desc: configs[0].cargo },
                { id: 'firmante-2', name: configs[1].nombre, desc: configs[1].cargo }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSignee(item.id as any);
                    clearCanvas();
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all duration-250 cursor-pointer ${
                    activeSignee === item.id
                      ? 'border-[#082b4d] bg-sky-50/40 ring-4 ring-sky-100/50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-650 font-bold text-xs select-none">
                    {item.id === 'firmante-1' ? '✍️' : '🖋️'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-850 text-[12.5px] truncate leading-none">
                      {item.name}
                    </div>
                    <div className="text-[10.5px] text-slate-500 truncate font-semibold uppercase tracking-wider leading-none">
                      {item.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Signee Details Inputs */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-4">
            <h4 className="text-xs font-bold text-slate-750 uppercase tracking-widest pb-2 border-b border-slate-200 flex items-center gap-1.5 select-none">
              <User size={14} className="text-[#082b4d]" />
              <span>Datos del Firmante del Folio</span>
            </h4>

            {/* Name input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nombre Completo y Prefijo Académico
              </label>
              <input
                type="text"
                placeholder="Ej: Prof. Lic. Arnold Martínez"
                value={currentConfig.nombre}
                onChange={(e) => updateCurrentConfig({ nombre: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100/80 transition-all"
              />
            </div>

            {/* Cargo input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Cargo / Rol de Representación
              </label>
              <input
                type="text"
                placeholder="Ej: Facilitador del Taller"
                value={currentConfig.cargo}
                onChange={(e) => updateCurrentConfig({ cargo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100/80 transition-all"
              />
            </div>

            {/* Institution / Subtitle input (optional) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Organización / Subtítulo Institucional (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Salud-Mar"
                value={currentConfig.institucion || ''}
                onChange={(e) => updateCurrentConfig({ institucion: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100/80 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Signature Method Picker and Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Método de carga para {currentConfig.nombre}
            </h4>

            {/* Tab selection for signature type */}
            <div className="grid grid-cols-4 gap-1 sm:gap-2 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'predeterminada', label: 'Elegante', icon: Award },
                { id: 'texto', label: 'Teclado', icon: Keyboard },
                { id: 'dibujada', label: 'Dibujar', icon: Edit },
                { id: 'imagen', label: 'Subir PNG', icon: FileUp }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSel = currentConfig.tipo === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      updateCurrentConfig({ tipo: tab.id as any });
                      if (tab.id === 'dibujada') {
                        setTimeout(clearCanvas, 50); // Ensure clear canvas draws nicely
                      }
                    }}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-1.5 sm:px-3.5 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#082b4d] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* METHOD RENDER CONFIG CONTENT PANEL */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50 min-h-[190px] flex flex-col justify-between">
            
            {/* 1. DEFAULT VECTOR DECORATIVE */}
            {currentConfig.tipo === 'predeterminada' && (
              <div className="space-y-3 py-2 text-center my-auto">
                <div className="flex justify-center text-slate-400">
                  <Award size={36} className="text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-800">Rúbrica vectorizada institucional</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Se utilizará el trazo oficial simulado de alta definición diseñado en el certificado original para {currentConfig.nombre}.
                  </p>
                </div>
              </div>
            )}

            {/* 2. HANDWRITTEN TEXT ENTRY */}
            {currentConfig.tipo === 'texto' && (
              <div className="space-y-4 my-auto">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Escriba su firma para convertirla a cursiva caligráfica
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Arnold Martínez"
                    value={currentConfig.firmaTexto || ''}
                    onChange={(e) => updateCurrentConfig({ firmaTexto: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-850 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Seleccione Estilo Caligráfico
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'style-1', label: 'Elegante', style: "font-serif italic font-medium tracking-wide text-indigo-900" },
                      { id: 'style-2', label: 'Artístico', style: "font-serif font-light text-slate-900 line-through decoration-double decoration-slate-400" },
                      { id: 'style-3', label: 'Clásico', style: "font-mono italic tracking-tight text-emerald-950" }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => updateCurrentConfig({ fuenteEstilo: st.id as any })}
                        className={`p-2.5 rounded-xl border text-[11px] font-extrabold text-center transition-all cursor-pointer ${
                          currentConfig.fuenteEstilo === st.id || (!currentConfig.fuenteEstilo && st.id === 'style-1')
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. DYNAMIC INTERACTIVE DRAWING CANVAS */}
            {currentConfig.tipo === 'dibujada' && (
              <div className="space-y-3 text-center my-auto">
                <div className="relative mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner max-w-sm">
                  <div className="absolute top-1.5 left-2 bg-[#082b4d] text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest pointer-events-none uppercase">
                    Lienzo de dibujo táctil
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full block bg-slate-50/50 cursor-crosshair pb-3 pt-4"
                    title="Dibuje su rúbrica aquí con mouse o pantalla táctil"
                  />
                  <div className="absolute bottom-1 right-2 pointer-events-none text-[8.5px] font-bold text-slate-450 italic">
                    Usa tu dedo, mouse o lápiz
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={clearCanvas}
                    className="p-2 px-3.5 bg-slate-200 hover:bg-slate-250 text-slate-700 rounded-lg text-xs font-bold leading-normal flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Borrar</span>
                  </button>
                  <button
                    onClick={saveCanvasSignature}
                    className="p-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black leading-normal flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 size={12} />
                    <span>Confirmar Trazo</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. PNG IMAGE UPLOAD */}
            {currentConfig.tipo === 'imagen' && (
              <div className="space-y-4 text-center my-auto">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-white/70 hover:bg-slate-50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <FileUp size={28} className="text-[#082b4d] group-hover:scale-105 transition-transform" />
                  <div className="mt-2 text-xs font-black text-slate-800">Haga clic o arrastre su firma</div>
                  <div className="text-[10px] text-slate-500 mt-1 max-w-xs">
                    Preferiblemente PNG con fondo transparente o fondo blanco recortado para mejor nitidez en el folio.
                  </div>
                </div>
              </div>
            )}

            {/* CURRENT ACTIVE PREVIEW */}
            <div className="border-t border-slate-200/80 pt-4 mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Vista previa firma actual
              </span>
              <div className="h-10 text-center flex items-center justify-center bg-white px-5 rounded-lg border border-slate-100/90 shadow-2xs">
                {currentConfig.tipo === 'predeterminada' && (
                  <span className="text-[11px] font-extrabold text-indigo-900 italic font-serif">
                    Vector Predeterminado Oficial
                  </span>
                )}
                
                {currentConfig.tipo === 'texto' && (
                  <span className={`text-base font-serif italic font-bold tracking-widest ${
                    currentConfig.fuenteEstilo === 'style-2' ? 'line-through decoration-slate-300 text-slate-800' :
                    currentConfig.fuenteEstilo === 'style-3' ? 'font-mono text-emerald-900 font-bold' :
                    'text-indigo-950 font-medium'
                  }`}>
                    {currentConfig.firmaTexto || currentConfig.nombre.split(' ').pop() || 'Firma'}
                  </span>
                )}

                {(currentConfig.tipo === 'dibujada' || currentConfig.tipo === 'imagen') && currentConfig.firmaBase64 && (
                  <img 
                    src={currentConfig.firmaBase64} 
                    alt="Firma" 
                    className="max-h-8 object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}

                {(currentConfig.tipo === 'dibujada' || currentConfig.tipo === 'imagen') && !currentConfig.firmaBase64 && (
                  <span className="text-[10px] text-slate-405 italic">Falta cargar firma</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
