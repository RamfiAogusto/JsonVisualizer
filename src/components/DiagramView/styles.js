// Archivo de estilos para ser importado desde el componente principal

// Estilos adicionales para nodos
const nodeStyles = `
  .node-container {
    padding: 8px;
    background-color: #1e1e1e;
    border: 1px solid #333;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    font-size: 12px;
    width: 180px; // Ancho fijo
    height: 100px; // Altura fija
    overflow: visible !important;
  }
  
  .handle-custom {
    width: 6px;
    height: 6px;
    background-color: #555;
    border: 1px solid #888;
  }
  
  .node-highlight {
    box-shadow: 0 0 0 2px #4299e1, 0 0 8px rgba(66, 153, 225, 0.6);
  }
  
  .edge-highlight {
    stroke: #4299e1 !important;
    stroke-width: 2px !important;
  }
  
  /* Estilos para popup de texto */
  .text-popup {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
    z-index: 99999 !important; /* Aumentado para estar sobre todo */
  }
  
  /* Asegurar que los nodos y sus contenedores no ocultan contenido emergente */
  .react-flow__node {
    overflow: visible !important;
  }
  
  .react-flow__node .react-flow__handle {
    z-index: 1;
  }
  
  /* Todo dentro del nodo debe ser visible */
  .node-container > * {
    overflow: visible !important;
  }
  
  /* Solo el contenido interno del texto debe ser truncado */
  .node-container .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Estilos para la parte interna del nodo */
  .node-content {
    overflow: hidden;
  }
`;

// Inyectar estilos una sola vez
if (typeof document !== 'undefined') {
  const styleId = 'diagram-node-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = nodeStyles;
    document.head.appendChild(styleEl);
  }
}

export default nodeStyles; 