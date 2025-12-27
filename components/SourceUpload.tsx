
import React, { useRef, useState } from 'react';
import { Upload, FileText, Camera, CheckCircle2, Loader2, AlertCircle, File, X, Plus } from 'lucide-react';
import { StudySource } from '../types';

interface SourceUploadProps {
  category: 'syllabus' | 'notes' | 'textbook';
  label: string;
  description: string;
  sources: StudySource[];
  onAdd: (source: StudySource) => void;
  onRemove: (id: string) => void;
}

const SourceUpload: React.FC<SourceUploadProps> = ({ category, label, description, sources, onAdd, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsScanning(true);
    setError(null);

    for (const file of files) {
      const mimeType = file.type || 'application/octet-stream';
      const isImage = mimeType.startsWith('image/');
      const isPDF = mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isText = mimeType.startsWith('text/') || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md');
      
      const isSupported = isImage || isPDF || isText;

      if (!isSupported) {
        setError(`"${file.name}" is not supported. Use PDF, Images, or Text.`);
        continue;
      }

      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          onAdd({
            id: Math.random().toString(36).substr(2, 9),
            category,
            title: label,
            type: (isImage || isPDF) ? 'file' : 'text',
            mimeType: isPDF ? 'application/pdf' : (isImage ? mimeType : 'text/plain'),
            content: content,
            fileName: file.name
          });
          resolve();
        };
        reader.onerror = () => {
          setError(`Failed to read "${file.name}".`);
          resolve();
        };
        if (isImage || isPDF) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });
    }

    // Delay scan finish for UI feeling
    setTimeout(() => {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 800);
  };

  return (
    <div className={`glass-card p-6 rounded-3xl transition-all duration-500 border-l-4 overflow-hidden relative flex flex-col h-full ${
      sources.length > 0 ? 'border-l-emerald-500/50 bg-emerald-500/5' : 
      isScanning ? 'border-l-indigo-400 bg-indigo-500/5' :
      'border-l-indigo-500/30 hover:border-l-indigo-400'
    }`}>
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="h-0.5 w-full bg-indigo-400/50 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            {sources.length > 0 ? <CheckCircle2 className="text-emerald-400 w-5 h-5" /> : null}
            {label}
          </h3>
          <p className="text-slate-400 text-xs font-medium">{description}</p>
        </div>
        <div className="bg-indigo-500/10 p-2 rounded-xl">
          {isScanning ? <Loader2 className="text-indigo-400 animate-spin w-5 h-5" /> : 
           category === 'syllabus' ? <FileText className="text-indigo-400 w-5 h-5" /> : 
           category === 'notes' ? <Camera className="text-indigo-400 w-5 h-5" /> : 
           <File className="text-indigo-400 w-5 h-5" />}
        </div>
      </div>

      <div className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
        {sources.map((src) => (
          <div key={src.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/50 border border-slate-800 group animate-in slide-in-from-left-2 duration-300">
            <div className="flex items-center gap-2 overflow-hidden">
              {src.mimeType === 'application/pdf' ? <FileText className="w-3 h-3 text-rose-400 flex-shrink-0" /> : 
               src.mimeType.startsWith('image/') ? <Camera className="w-3 h-3 text-indigo-400 flex-shrink-0" /> : 
               <File className="w-3 h-3 text-slate-400 flex-shrink-0" />}
              <span className="text-[11px] text-slate-300 font-medium truncate">{src.fileName}</span>
            </div>
            <button 
              onClick={() => onRemove(src.id)}
              className="p-1 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative group">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.txt,.md,.pdf"
          multiple
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className={`w-full py-4 px-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1
            ${sources.length > 0 
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400/80 hover:bg-emerald-500/10' 
              : isScanning
              ? 'border-indigo-500/30 text-indigo-300'
              : 'border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 text-slate-500 hover:text-slate-300'}`}
        >
          {isScanning ? (
            <span className="text-xs font-bold uppercase tracking-widest">Absorbing...</span>
          ) : (
            <>
              <Plus className="w-4 h-4 mb-1" />
              <span className="text-xs font-bold uppercase tracking-widest">Add {sources.length > 0 ? 'More' : 'Scroll'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-rose-400 text-[10px] leading-tight font-bold bg-rose-400/5 p-2 rounded-xl">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default SourceUpload;
