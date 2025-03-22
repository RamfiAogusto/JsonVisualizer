import React from 'react';

const MenuTools = ({ 
  isMenuOpen, 
  toggleMenu, 
  layoutDirection, 
  setLayoutDirection, 
  collapseAllNodes, 
  expandAllNodes,
  nodeSizeMode,
  setNodeSizeMode,
  recalculateLayout
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
            <h3 className="text-sm font-semibold border-b border-gray-700 pb-1 mb-1">Dirección</h3>
            <button 
              onClick={() => setLayoutDirection('LR')}
              className={`control-button px-3 py-1 rounded text-sm ${layoutDirection === 'LR' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Horizontal
            </button>
            <button 
              onClick={() => setLayoutDirection('TB')}
              className={`control-button px-3 py-1 rounded text-sm ${layoutDirection === 'TB' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Vertical
            </button>
            
            <h3 className="text-sm font-semibold border-b border-gray-700 pb-1 mt-3 mb-1">Espaciado</h3>
            <button 
              onClick={() => setNodeSizeMode('compact')}
              className={`control-button px-3 py-1 rounded text-sm ${nodeSizeMode === 'compact' ? 'bg-blue-600' : 'bg-gray-700'}`}
              title="Espaciado mínimo entre nodos"
            >
              Compacto
            </button>
            <button 
              onClick={() => setNodeSizeMode('medium')}
              className={`control-button px-3 py-1 rounded text-sm ${nodeSizeMode === 'medium' ? 'bg-blue-600' : 'bg-gray-700'}`}
              title="Espaciado medio entre nodos"
            >
              Medio
            </button>
            <button 
              onClick={() => setNodeSizeMode('expanded')}
              className={`control-button px-3 py-1 rounded text-sm ${nodeSizeMode === 'expanded' ? 'bg-blue-600' : 'bg-gray-700'}`}
              title="Espaciado amplio entre nodos"
            >
              Expandido
            </button>
            
            <button 
              onClick={recalculateLayout}
              className="control-button px-3 py-1 rounded text-sm bg-green-600 hover:bg-green-700 mt-2"
              title="Actualizar la disposición de los nodos"
            >
              Recalcular Layout
            </button>
            
            <h3 className="text-sm font-semibold border-b border-gray-700 pb-1 mt-3 mb-1">Nodos</h3>
            <button 
              onClick={collapseAllNodes}
              className="control-button px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600"
            >
              Colapsar Todo
            </button>
            <button 
              onClick={expandAllNodes}
              className="control-button px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600"
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