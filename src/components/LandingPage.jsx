import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ onStartEditing }) => {
  const [scrollY, setScrollY] = useState(0);
  
  // Efecto para detectar el scroll y actualizar la posición
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onStartEditing();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white">
      {/* Barra de navegación */}
      <nav className="border-b border-gray-800/60 backdrop-blur-md bg-gray-900/80 sticky top-0 z-10 px-4 py-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg 
              className="w-8 h-8 text-blue-500" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 5H3"></path>
              <path d="M9 9h1"></path>
              <path d="M14 9h1"></path>
              <path d="M9 13h1"></path>
              <path d="M14 13h1"></path>
              <path d="M9 17h1"></path>
              <path d="M14 17h1"></path>
              <rect x="3" y="5" width="18" height="16" rx="2"></rect>
            </svg>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">JSON Visualizador</div>
          </div>
          <button 
            onClick={onStartEditing}
            onKeyDown={handleKeyDown}
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-5 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center space-x-1 font-medium hover:shadow-lg"
            tabIndex="0"
            aria-label="Ir al editor inmediatamente"
          >
            <span>Editor</span>
            <svg 
              className="w-4 h-4 ml-1" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Sección Hero con elementos decorativos */}
      <section className="relative overflow-hidden flex-grow flex flex-col justify-center items-center text-center px-4 pt-24 pb-48">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[70%] rounded-full bg-blue-500/5 blur-3xl"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-500/5 blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEgTCAxNiAxIE0gMCA1IEwgMTYgNSBNIDAgOSBMIDE2IDkgTSAwIDEzIEwgMTYgMTMgTSAxIDAgTCAxIDE2IE0gNSAwIEwgNSAxNiBNIDkgMCBMIDkgMTYiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg2MCwgNjAsIDYwLCAwLjEpIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiPjwvcmVjdD48L3N2Zz4=')]"></div>
          
          {/* Código JSON flotante como elemento decorativo con efecto parallax */}
          <div 
            className="absolute top-1/4 left-[5%] rounded-lg bg-gray-800/50 backdrop-blur-sm p-4 shadow-xl rotate-6 transform scale-75 opacity-30 sm:opacity-40 hidden md:block transition-transform duration-300 ease-out"
            style={{ 
              transform: `rotate(6deg) translateY(${scrollY * -0.1}px) translateX(${scrollY * 0.05}px)` 
            }}
          >
            <pre className="text-left text-blue-300 text-xs">{`{
  "name": "JSON Visualizador",
  "features": ["Editor", "Diagrams"]
}`}</pre>
          </div>
          <div 
            className="absolute bottom-1/4 right-[5%] rounded-lg bg-gray-800/50 backdrop-blur-sm p-4 shadow-xl -rotate-6 transform scale-75 opacity-30 sm:opacity-40 hidden md:block transition-transform duration-300 ease-out"
            style={{ 
              transform: `rotate(-6deg) translateY(${scrollY * 0.15}px) translateX(${scrollY * -0.08}px)` 
            }}
          >
            <pre className="text-left text-blue-300 text-xs">{`{
  "tools": ["Syntax Highlighting", 
  "Interactive Diagrams"]
}`}</pre>
          </div>
          
          {/* Elementos JSON adicionales con diferentes velocidades de parallax */}
          <div 
            className="absolute top-[40%] right-[15%] rounded-lg bg-gray-800/40 backdrop-blur-sm p-3 shadow-xl rotate-12 transform scale-50 opacity-30 sm:opacity-30 hidden md:block transition-transform duration-300 ease-out"
            style={{ 
              transform: `rotate(12deg) translateY(${scrollY * 0.08}px) translateX(${scrollY * 0.04}px)` 
            }}
          >
            <pre className="text-left text-green-300 text-xs">{`{
  "type": "feature",
  "id": 123,
  "enabled": true
}`}</pre>
          </div>
          
          <div 
            className="absolute top-[65%] left-[12%] rounded-lg bg-gray-800/40 backdrop-blur-sm p-3 shadow-xl -rotate-8 transform scale-50 opacity-20 sm:opacity-25 hidden md:block transition-transform duration-300 ease-out"
            style={{ 
              transform: `rotate(-8deg) translateY(${scrollY * -0.12}px) translateX(${scrollY * -0.02}px)` 
            }}
          >
            <pre className="text-left text-purple-300 text-xs">{`{
  "config": {
    "theme": "dark",
    "layout": "auto"
  }
}`}</pre>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="relative z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent leading-tight">
            Visualiza y Edita<br />JSON con Facilidad
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Transforma estructuras JSON complejas en visualizaciones interactivas y<br className="hidden md:block" /> edita con precisión en tiempo real.
          </p>
          <button 
            onClick={onStartEditing}
            onKeyDown={handleKeyDown}
            className="relative mt-6 group bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg font-semibold py-4 px-10 rounded-full shadow-lg shadow-blue-600/30 flex items-center mx-auto overflow-hidden transition-all duration-300 hover:shadow-lg"
            tabIndex="0"
            aria-label="Comenzar a usar el editor"
          >
            <span className="relative z-10">Comenzar Ahora</span>
            <svg 
              className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          </button>
          
          {/* Indicadores de características rápidas */}
          <div className="flex flex-wrap justify-center gap-4 mt-16 text-sm">
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Editor Avanzado
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Visualización Interactiva
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Gratuito y Open Source
            </div>
          </div>
        </div>
      </section>
      
      {/* Sección de características */}
      <section className="relative py-24 bg-gray-900/80 backdrop-filter backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none"></div>
        
        {/* Elementos JSON adicionales con parallax en la sección de características */}
        <div 
          className="absolute left-[3%] top-[15%] rounded-lg bg-gray-800/30 backdrop-blur-sm p-3 shadow-xl rotate-3 transform scale-40 opacity-20 hidden md:block transition-transform duration-300 ease-out"
          style={{ 
            transform: `rotate(3deg) translateY(${(scrollY - 700) * 0.1}px) translateX(${(scrollY - 700) * 0.03}px)` 
          }}
        >
          <pre className="text-left text-cyan-300 text-xs">{`{
  "editor": {
    "fontSize": 14,
    "fontFamily": "monospace"
  }
}`}</pre>
        </div>
        
        <div 
          className="absolute right-[3%] bottom-[10%] rounded-lg bg-gray-800/30 backdrop-blur-sm p-3 shadow-xl -rotate-3 transform scale-40 opacity-20 hidden md:block transition-transform duration-300 ease-out"
          style={{ 
            transform: `rotate(-3deg) translateY(${(scrollY - 1000) * -0.08}px) translateX(${(scrollY - 1000) * -0.05}px)` 
          }}
        >
          <pre className="text-left text-yellow-300 text-xs">{`{
  "diagram": {
    "nodes": 12,
    "connections": 18
  }
}`}</pre>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="inline-block text-3xl md:text-4xl font-bold relative">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Características Principales</span>
              <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="inline-flex p-3 rounded-lg bg-blue-500/10 text-blue-400 mb-6">
                <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">Editor Avanzado</h3>
              <p className="text-gray-300 leading-relaxed">
                Editor de código con resaltado de sintaxis, autocompletado y detección de errores en tiempo real para una edición precisa.
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="inline-flex p-3 rounded-lg bg-indigo-500/10 text-indigo-400 mb-6">
                <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-indigo-400">Visualización de Diagramas</h3>
              <p className="text-gray-300 leading-relaxed">
                Convierte automáticamente tu JSON en diagramas interactivos para comprender mejor la estructura de tus datos.
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl transform transition-all duration-300 hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="inline-flex p-3 rounded-lg bg-purple-500/10 text-purple-400 mb-6">
                <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-purple-400">Importación/Exportación</h3>
              <p className="text-gray-300 leading-relaxed">
                Carga y guarda fácilmente archivos JSON para trabajar con tus datos existentes sin complicaciones.
              </p>
            </div>
          </div>
          
          {/* Vista previa */}
          <div className="mt-24 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
            <div className="pt-4 px-4 bg-gray-800/50 border-b border-gray-700/50 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-2 text-sm text-gray-400">Visualizador de JSON</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-850 to-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-950/80 rounded-lg p-4 font-mono text-sm text-blue-300">
                  <pre className="opacity-80">{`{
  "fruits": [
    {
      "name": "Apple",
      "color": "Red",
      "nutrients": {
        "calories": 52,
        "fiber": "2.4g",
        "vitaminC": "4.6mg"
      }
    },
    {
      "name": "Banana",
      "color": "Yellow"
    }
  ]
}`}</pre>
                </div>
                <div className="bg-gray-950/80 rounded-lg p-4 flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-full max-w-[220px]" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                      <rect x="100" y="10" width="100" height="40" rx="5" fill="#3b82f6" opacity="0.8" />
                      <text x="150" y="35" textAnchor="middle" fill="white" fontSize="14" fontFamily="monospace">fruits[]</text>
                      
                      <rect x="50" y="80" width="80" height="40" rx="5" fill="#8b5cf6" opacity="0.8" />
                      <text x="90" y="105" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace">Apple</text>
                      
                      <rect x="170" y="80" width="80" height="40" rx="5" fill="#8b5cf6" opacity="0.8" />
                      <text x="210" y="105" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace">Banana</text>
                      
                      <line x1="150" y1="50" x2="90" y2="80" stroke="#4c5666" strokeWidth="2" />
                      <line x1="150" y1="50" x2="210" y2="80" stroke="#4c5666" strokeWidth="2" />
                      
                      <rect x="50" y="150" width="80" height="30" rx="5" fill="#ec4899" opacity="0.8" />
                      <text x="90" y="170" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">nutrients</text>
                      
                      <line x1="90" y1="120" x2="90" y2="150" stroke="#4c5666" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Sección CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-3xl"></div>
          <div className="absolute top-[10%] right-[30%] w-[20%] h-[30%] rounded-full bg-indigo-500/5 blur-3xl"></div>
          
          {/* JSON con parallax en la sección CTA */}
          <div 
            className="absolute top-[20%] left-[20%] rounded-lg bg-gray-800/30 backdrop-blur-sm p-3 shadow-xl rotate-6 transform scale-50 opacity-20 hidden lg:block transition-transform duration-300 ease-out"
            style={{ 
              transform: `rotate(6deg) translateY(${(scrollY - 1500) * 0.12}px) translateX(${(scrollY - 1500) * 0.05}px)` 
            }}
          >
            <pre className="text-left text-pink-300 text-xs">{`{
  "export": {
    "format": "json",
    "prettify": true
  }
}`}</pre>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">¿Listo para empezar?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Comienza a editar y visualizar tus datos JSON ahora mismo de forma intuitiva y sin complicaciones.
          </p>
          <button 
            onClick={onStartEditing}
            onKeyDown={handleKeyDown}
            className="relative group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-12 rounded-full shadow-lg shadow-blue-600/30 mx-auto overflow-hidden transition-all duration-300 hover:shadow-lg"
            tabIndex="0"
            aria-label="Ir al editor ahora"
          >
            <span className="relative z-10 flex items-center justify-center">
              <span>Abrir Editor</span>
              <svg 
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800/60 py-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <svg 
                className="w-6 h-6 text-blue-500" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 5H3"></path>
                <path d="M9 9h1"></path>
                <path d="M14 9h1"></path>
                <path d="M9 13h1"></path>
                <path d="M14 13h1"></path>
                <path d="M9 17h1"></path>
                <path d="M14 17h1"></path>
                <rect x="3" y="5" width="18" height="16" rx="2"></rect>
              </svg>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">JSON Visualizador</div>
            </div>
            
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} JSON Visualizador. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 