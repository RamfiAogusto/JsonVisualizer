import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const TruncatedText = ({ text, maxLength = 15 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const textRef = useRef(null);
  const popupRef = useRef(null);

  // Actualizar posición cuando se muestra el popup
  useEffect(() => {
    if (isExpanded && textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      
      // Calcular una posición que evite que se salga de la pantalla
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Posición inicial cerca del texto pero fuera del nodo
      let x = rect.left;
      let y = rect.bottom + 10;
      
      // Ajustar para que el popup no se salga de la pantalla
      if (popupRef.current) {
        const popupWidth = popupRef.current.offsetWidth;
        const popupHeight = popupRef.current.offsetHeight;
        
        // Ajustar horizontalmente si es necesario
        if (x + popupWidth > viewportWidth - 20) {
          x = Math.max(20, viewportWidth - popupWidth - 20);
        }
        
        // Ajustar verticalmente si es necesario
        if (y + popupHeight > viewportHeight - 20) {
          y = Math.max(20, rect.top - popupHeight - 10);
        }
      }
      
      setCoords({ x, y });
    }
  }, [isExpanded]);

  // Manejador para cerrar el popup al hacer clic fuera
  useEffect(() => {
    if (isExpanded) {
      const handleClickOutside = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target) && 
            textRef.current && !textRef.current.contains(e.target)) {
          setIsExpanded(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isExpanded]);

  // Si el texto es corto, mostrarlo directamente
  if (text.length <= maxLength) {
    return <span className="text-green-400">{text}</span>;
  }

  return (
    <>
      <div className="flex overflow-visible" ref={textRef}>
        <span className="text-green-400 truncate max-w-[80%]">{text.substring(0, maxLength)}…</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="ml-1 text-xs text-gray-400 hover:text-white flex-shrink-0 z-10 flex items-center justify-center w-5 h-5 !p-0"
          title="Ver texto completo"
          tabIndex={0}
          aria-label="Toggle text expansion"
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 12h12"></path>
            </svg>
          )}
        </button>
      </div>

      {isExpanded && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div 
          ref={popupRef}
          className="fixed bg-gray-900 border border-gray-700 p-3 rounded shadow-lg max-w-[350px] z-[99999] text-popup"
          style={{ 
            left: `${coords.x}px`, 
            top: `${coords.y}px`,
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-400 font-medium text-xs">Texto completo:</span>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="text-green-400 text-xs whitespace-pre-wrap">
            {text}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TruncatedText; 