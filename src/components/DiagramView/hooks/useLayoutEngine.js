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

    // AJUSTE 1: Reducir significativamente los valores base de separación
    let baseSep = nodeSizeMode === 'compact' ? 20 : 
                 nodeSizeMode === 'expanded' ? 40 : 30;
    
    // AJUSTE 2: Reducir los factores de separación
    let nodeSepFactor = 0.8;
    let rankSepFactor = 0.8;
    
    // Para gráficos con pocos nodos, dar espacio moderado
    if (safeNodes.length < 20) {
      nodeSepFactor = 1.0;
      rankSepFactor = 1.0;
    } else if (safeNodes.length > 100) {
      // Para gráficos muy grandes, optimizar aún más el espacio
      nodeSepFactor = 0.6;
      rankSepFactor = 0.6;
    }
    
    // Aplicar factores de espaciado según dirección
    const nodesep = baseSep * (direction === 'LR' ? 1.0 : 0.8) * nodeSepFactor;
    const ranksep = baseSep * (direction === 'TB' ? 1.0 : 0.8) * rankSepFactor;
    
    // AJUSTE 3: Configuración mejorada del grafo para layout más compacto
    dagreGraph.setGraph({ 
      rankdir: direction,
      ranksep,
      nodesep,
      marginx: 20, // Reducir márgenes
      marginy: 20, // Reducir márgenes
      align: direction === 'LR' ? 'UL' : 'DL',
      ranker: 'network-simplex', // Cambiar a un algoritmo que favorece la compactación
      acyclicer: 'greedy',
      // Utilizar separación forzada pero más compacta
      edgesep: baseSep * 0.2,
      // Preferir layout más compacto
      rankSep: ranksep,
      // AJUSTE 4: Aumentar la gravedad para atraer nodos entre sí
      gravity: 0.8,
    });

    // AJUSTE 5: Reducir los márgenes de seguridad en los nodos
    safeNodes.forEach((node) => {
      try {
        // Obtener dimensiones precisas con margen adicional reducido
        const { width, height } = estimateNodeSize(node);
        // Reducir el margen de seguridad
        const safetyMargin = 5; // Reducido de 15
        
        dagreGraph.setNode(node.id, { 
          width: width + safetyMargin, 
          height: height + safetyMargin
        });
      } catch (error) {
        console.warn(`Error procesando nodo ${node.id}:`, error);
        // Usar tamaño predeterminado con margen si hay error
        dagreGraph.setNode(node.id, { width: 180, height: 50 });
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

    // Procesar los nodos con el nuevo layout y verificar superposiciones
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
        // También aquí permitimos que sea arrastrable
        return { ...node, draggable: true };
      }
    });

    return { nodes: layoutedNodes, edges: safeEdges };
  }, [nodeSizeMode, estimateNodeSize]);

  return { getLayoutedElements };
} 