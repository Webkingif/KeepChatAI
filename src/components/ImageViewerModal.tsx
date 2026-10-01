import React from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerModalProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ src, alt, onClose }) => {
  const [scale, setScale] = React.useState(1);

  if (!src) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.6));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Toolbar */}
      <div
        className="w-full max-w-4xl flex items-center justify-between py-2 px-4 text-white z-10 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs md:text-sm font-medium text-slate-300 truncate max-w-md">
          {alt || 'Image Preview'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <a
            href={src}
            download={alt || 'keepchat-image.png'}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="flex-1 flex items-center justify-center w-full max-w-5xl overflow-hidden p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || 'Image'}
          className="max-h-[85vh] max-w-full object-contain rounded-lg transition-transform duration-200 shadow-2xl"
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
};
