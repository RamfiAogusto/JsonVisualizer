import { useCallback } from 'react';

export default function useNodeCreation(handleNodeCollapse) {
  // Función para crear nodos a partir de datos JSON
  const createNodes = useCallback((jsonData) => {
    if (!jsonData) return { nodes: [], edges: [] };
    
    const nodes = [];
    const edges = [];
    let nodeId = 0;
    
    // Mapa para rastrear los hijos de cada nodo
    const childrenMap = {};

    // Función recursiva para procesar el JSON
    const processNode = (data, parentId = null, level = 1, keyName = '') => {
      const currentId = `node-${nodeId++}`;
      
      // Inicializar el contador de hijos para este nodo
      if (!childrenMap[currentId]) {
        childrenMap[currentId] = [];
      }
      
      if (Array.isArray(data)) {
        // Procesar array
        nodes.push({
          id: currentId,
          type: 'arrayNode',
          data: {
            label: keyName || 'Array',
            length: data.length,
            collapsed: false,
            childrenCount: 0 // Se actualizará después
          },
          position: { x: 0, y: 0 }
        });
        
        // Procesar cada elemento del array
        data.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const childId = processNode(item, currentId, level + 1, `${index}`);
            childrenMap[currentId].push(childId);
          }
        });
      } else if (typeof data === 'object' && data !== null) {
        // Extraer propiedades simples (no objetos)
        const properties = Object.entries(data)
          .filter(([_, value]) => typeof value !== 'object' || value === null)
          .map(([key, value]) => ({
            key,
            value: value === null ? 'null' : String(value)
          }));
        
        // Crear nodo para el objeto
        nodes.push({
          id: currentId,
          type: 'objectNode',
          data: {
            label: keyName || 'Object',
            properties,
            collapsed: false,
            childrenCount: 0 // Se actualizará después
          },
          position: { x: 0, y: 0 }
        });
        
        // Procesar propiedades que son objetos
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const childId = processNode(value, currentId, level + 1, key);
            childrenMap[currentId].push(childId);
          }
        });
      }
      
      // Crear conexión con el padre si existe
      if (parentId !== null) {
        edges.push({
          id: `edge-${parentId}-${currentId}`,
          source: parentId,
          target: currentId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#4299e1', strokeWidth: 2 }
        });
      }
      
      return currentId;
    };
    
    // Iniciar procesamiento desde la raíz
    processNode(jsonData);
    
    // Actualizar el recuento de hijos para cada nodo
    nodes.forEach(node => {
      if (childrenMap[node.id]) {
        node.data.childrenCount = childrenMap[node.id].length;
      }
    });
    
    // Añadir función de colapso mediante una referencia estable
    const nodesWithCollapseHandler = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleCollapse: (id) => handleNodeCollapse(id)
      }
    }));
    
    return { nodes: nodesWithCollapseHandler, edges };
  }, [handleNodeCollapse]);

  return { createNodes };
} 