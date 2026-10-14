import React from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerModalProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ src, alt, onClose }) => {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (!src) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.6));
  };

  const imageDescription = alt || 'Attached image media preview';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-viewer-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Toolbar */}
      <div
        className="w-full max-w-4xl flex items-center justify-between py-2 px-4 text-white z-10 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="image-viewer-title" className="text-xs md:text-sm font-medium text-slate-300 truncate max-w-md">
          {imageDescription}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:outline-none"
            title="Zoom In"
            aria-label="Zoom in on image"
          >
            <ZoomIn className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:outline-none"
            title="Zoom Out"
            aria-label="Zoom out of image"
          >
            <ZoomOut className="w-5 h-5" aria-hidden="true" />
          </button>
          <a
            href={src}
            download={alt || 'keepchat-image.png'}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:outline-none"
            title="Download Image"
            aria-label="Download image file"
          >
            <Download className="w-5 h-5" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:outline-none"
            title="Close"
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6" aria-hidden="true" />
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
          alt={imageDescription}
          className="max-h-[85vh] max-w-full object-contain rounded-lg transition-transform duration-200 shadow-2xl"
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
};
