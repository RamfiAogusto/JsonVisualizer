import React from 'react';

const MenuTools = ({ 
  isMenuOpen, 
  toggleMenu, 
  layoutDirection, 
  setLayoutDirection, 
  collapseAllNodes, 
  expandAllNodes 
}) => {
  return (
    <>
      {/* Botón de menú hamburguesa */}
      <button 
        onClick={toggleMenu}
        className="absolute top-2 right-2 z-20 bg-gray-800 text-white p-2 rounded"
        aria-label="Toggle Menu"
      >
        {isMenuOpen ? '✖' : '☰'} {/* Icono de menú hamburguesa */}
      </button>

      {/* Menú de herramientas */}
      {isMenuOpen && (
        <div className="absolute top-16 right-2 z-20 bg-gray-800 text-white p-4 rounded shadow-lg">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setLayoutDirection('LR')}
              className={`control-button ${layoutDirection === 'LR' ? 'active' : ''}`}
            >
              Horizontal
            </button>
            <button 
              onClick={() => setLayoutDirection('TB')}
              className={`control-button ${layoutDirection === 'TB' ? 'active' : ''}`}
            >
              Vertical
            </button>
            <button 
              onClick={collapseAllNodes}
              className="control-button"
            >
              Colapsar Todo
            </button>
            <button 
              onClick={expandAllNodes}
              className="control-button"
            >
              Expandir Todo
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuTools; 