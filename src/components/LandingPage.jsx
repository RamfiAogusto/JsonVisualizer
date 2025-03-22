import React from 'react';

const LandingPage = ({ onStartEditing }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onStartEditing();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Barra de navegación */}
      <nav className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-blue-400">JSON Visualizador</div>
          <button 
            onClick={onStartEditing}
            onKeyDown={handleKeyDown}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
            tabIndex="0"
            aria-label="Ir al editor inmediatamente"
          >
            Ir al Editor
          </button>
        </div>
      </nav>
      
      {/* Sección Hero */}
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 pt-20 pb-40">
        <h1 className="text-5xl font-bold mb-4">Visualiza y Edita JSON con Facilidad</h1>
        <p className="text-xl text-gray-300 max-w-2xl mb-12">
          Una herramienta potente para manipular y visualizar estructuras JSON de forma interactiva.
        </p>
        <button 
          onClick={onStartEditing}
          onKeyDown={handleKeyDown}
          className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold py-3 px-8 rounded-md shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
          tabIndex="0"
          aria-label="Comenzar a usar el editor"
        >
          <span>Comenzar Ahora</span>
          <svg 
            className="w-5 h-5" 
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
        </button>
      </section>
      
      {/* Sección de características */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Características Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 rounded-lg p-6 shadow-md">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Editor Avanzado</h3>
              <p className="text-gray-300">
                Editor de código con resaltado de sintaxis, autocompletado y detección de errores en tiempo real.
              </p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6 shadow-md">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visualización de Diagramas</h3>
              <p className="text-gray-300">
                Convierte automáticamente tu JSON en diagramas interactivos para comprender mejor la estructura.
              </p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6 shadow-md">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Importación/Exportación</h3>
              <p className="text-gray-300">
                Carga y guarda fácilmente archivos JSON para trabajar con tus datos existentes.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Sección CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-8">¿Listo para empezar?</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Comienza a editar y visualizar tus datos JSON ahora mismo de forma gratuita.
        </p>
        <button 
          onClick={onStartEditing}
          onKeyDown={handleKeyDown}
          className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold py-3 px-8 rounded-md shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          tabIndex="0"
          aria-label="Ir al editor ahora"
        >
          Abrir Editor
        </button>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} JSON Visualizador. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 