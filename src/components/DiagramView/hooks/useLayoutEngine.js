import { useCallback } from 'react';
import dagre from 'dagre';

// Hook para gestionar el layout de los nodos
export default function useLayoutEngine(estimateNodeSize, nodeSizeMode) {
  // Función de layout mejorada con espaciado más compacto
  const getLayoutedElements = useCallback((nodes, edges, direction = 'LR') => {
    if (!nodes || !nodes.length) return { nodes: [], edges: [] };
    
    // Crear una copia segura de los nodos y aristas
    const safeNodes = [...nodes].filter(node => node && node.id);
    const safeEdges = [...edges].filter(edge => 
      edge && edge.id && edge.source && edge.target &&
      safeNodes.some(node => node.id === edge.source) &&
      safeNodes.some(node => node.id === edge.target)
    );
    
    if (!safeNodes.length) return { nodes: safeNodes, edges: safeEdges };
    
    // Crear un nuevo grafo para el layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // MODIFICADO: Valores de separación según el modo seleccionado
    let baseSep;
    switch (nodeSizeMode) {
      case 'compact':
        baseSep = 30; // Compacto pero con espacio suficiente
        break;
      case 'expanded':
        baseSep = 80; // Amplio espaciado
        break;
      case 'medium':
      default:
        baseSep = 50; // Valor medio
        break;
    }
    
    // Factores de separación ajustados
    let nodeSepFactor = 1.2; // Mayor separación horizontal
    let rankSepFactor = 1.3; // Mayor separación vertical
    
    // Ajuste dinámico según cantidad de nodos
    if (safeNodes.length < 20) {
      // Más espacio para pocos nodos
      nodeSepFactor = 1.5;
      rankSepFactor = 1.6;
    } else if (safeNodes.length > 100) {
      // Menos espacio (pero suficiente) para muchos nodos
      nodeSepFactor = 0.9;
      rankSepFactor = 1.0;
    }
    
    // Calculamos separaciones finales
    const nodesep = baseSep * (direction === 'LR' ? 1.0 : 0.9) * nodeSepFactor;
    const ranksep = baseSep * (direction === 'TB' ? 1.0 : 0.9) * rankSepFactor;
    
    // Configuración mejorada para mejor espaciado
    dagreGraph.setGraph({ 
      rankdir: direction,
      ranksep,
      nodesep,
      marginx: 40, // Margen horizontal
      marginy: 40, // Margen vertical
      align: 'UL', // Alineación más natural
      ranker: 'tight-tree', // Mejor algoritmo para jerarquías
      acyclicer: 'greedy',
      edgesep: baseSep * 0.4, // Mayor separación entre aristas
      rankSep: ranksep,
      gravity: 0.6, // Atracción moderada
    });

    // Configurar nodos con mayor margen
    safeNodes.forEach((node) => {
      try {
        const { width, height } = estimateNodeSize(node);
        // MODIFICADO: Aumentar margen de seguridad
        const safetyMargin = 15; // Margen moderado
        
        dagreGraph.setNode(node.id, { 
          width: width + safetyMargin, 
          height: height + safetyMargin
        });
      } catch (error) {
        console.warn(`Error procesando nodo ${node.id}:`, error);
        dagreGraph.setNode(node.id, { width: 180, height: 120 });
      }
    });

    // Añadir aristas al grafo
    safeEdges.forEach((edge) => {
      try {
        dagreGraph.setEdge(edge.source, edge.target);
      } catch (error) {
        console.warn(`Error procesando arista ${edge.id}:`, error);
      }
    });

    // Calcular el layout con manejo de errores
    try {
      dagre.layout(dagreGraph);
    } catch (error) {
      console.error("Error en el cálculo del layout:", error);
      return { nodes: safeNodes, edges: safeEdges };
    }

    // Procesar los nodos con el nuevo layout
    const layoutedNodes = safeNodes.map((node) => {
      try {
        const nodeWithPosition = dagreGraph.node(node.id);
        
        // Verificar si dagre devolvió posición para este nodo
        if (!nodeWithPosition || typeof nodeWithPosition.x !== 'number' || typeof nodeWithPosition.y !== 'number') {
          return node;
        }
        
        const { width, height } = estimateNodeSize(node);
        
        return {
          ...node,
          // Importante: permitir que el nodo sea arrastrable
          draggable: true,
          position: {
            x: nodeWithPosition.x - width / 2,
            y: nodeWithPosition.y - height / 2,
          },
          dimensions: { width, height }
        };
      } catch (error) {
        console.warn(`Error posicionando nodo ${node.id}:`, error);
        return { ...node, draggable: true };
      }
    });

    return { nodes: layoutedNodes, edges: safeEdges };
  }, [nodeSizeMode, estimateNodeSize]);

  return { getLayoutedElements };
} 