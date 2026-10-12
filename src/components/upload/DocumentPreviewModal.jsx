export default function DocumentPreviewModal({ isOpen, onClose, document }) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fbfbfb]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              <img src={document.thumb} alt={document.name} className="size-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-[#111] text-[18px]">{document.name}</h3>
              <p className="text-xs text-[#505050]">{document.pages?.length || document.pageCount || 1} page(s) attached • Ready for CPA Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close document viewer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content / Document Preview Canvas */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-[#f5f5f5] gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-md w-full flex flex-col items-center">
            <img 
              src={document.pages?.[0]?.preview || "/figma/upload/doc-page-thumb.png"} 
              alt="Document preview" 
              className="max-h-[55vh] object-contain rounded-lg border border-gray-100"
            />
            <div className="mt-3 flex items-center justify-between w-full text-xs text-[#505050] px-2">
              <span className="font-medium text-[#111]">Verified TaxMax Secure Scan</span>
              <span className="bg-[#0094c5]/10 text-[#0094c5] font-semibold px-2 py-0.5 rounded-full">Encrypted 256-bit</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#0094c5] text-white font-bold text-sm hover:bg-[#0082ad] transition-colors cursor-pointer"
          >
            Done Viewing
          </button>
        </div>
      </div>
    </div>
  );
}
