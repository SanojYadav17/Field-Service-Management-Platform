import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, PenTool } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureBase64: string, signedByName: string) => void;
  defaultName?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signedByName, setSignedByName] = useState(defaultName);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = canvas.parentElement?.clientWidth || 450;
          canvas.height = 200;
          clearCanvas();
        }
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (isEmpty) {
      alert('Please draw your signature before saving.');
      return;
    }
    if (!signedByName.trim()) {
      alert('Please enter the name of the person signing off.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, signedByName.trim());
    onClose();
  };

  return (
    <div className="modal-overlay z-50">
      <div className="glass-card w-full max-w-lg p-6 space-y-5 border border-slate-200 shadow-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <PenTool size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Customer Digital Sign-Off</h3>
              <p className="text-xs text-slate-500">Draw signature below to acknowledge service completion</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Input Name */}
        <div>
          <label className="ks-label">Full Name of Signee *</label>
          <input
            type="text"
            placeholder="e.g. Robert Vance (Site Representative)"
            value={signedByName}
            onChange={(e) => setSignedByName(e.target.value)}
            className="ks-input-plain text-xs"
            required
          />
        </div>

        {/* Canvas Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="ks-label">Digital Signature Pad *</label>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} /> Clear Canvas
            </button>
          </div>
          <div className="w-full border-2 border-dashed border-sky-300 rounded-xl bg-slate-50 relative overflow-hidden touch-none cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[200px] block"
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-semibold text-slate-400">
                Sign here using mouse or touch screen...
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button type="button" onClick={onClose} className="ks-btn-secondary text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="ks-btn-primary text-xs w-auto px-5 flex items-center gap-1.5"
          >
            <Check size={15} /> Save Sign-Off & Complete Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
