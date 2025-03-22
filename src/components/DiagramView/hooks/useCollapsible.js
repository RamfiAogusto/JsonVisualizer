import { useCallback } from 'react';

export default function useCollapsible(setNodes, setEdges, edgesRef) {
  // Función para colapsar/expandir un nodo específico
  const handleNodeCollapse = useCallback((nodeId) => {
    setNodes(prevNodes => {
      // Obtener el estado de colapso actual del nodo
      const currentNode = prevNodes.find(node => node.id === nodeId);
      if (!currentNode) return prevNodes;
      
      const newCollapsedState = !currentNode.data.collapsed;
      
      // Funciones para el manejo de jerarquía
      const findAllDescendants = (rootId) => {
        const descendants = new Set();
        const currentEdges = edgesRef.current;
        
        // Función recursiva para explorar el árbol
        const explore = (nodeId) => {
          // Encontrar hijos directos
          const childrenIds = currentEdges
            .filter(edge => edge.source === nodeId)
            .map(edge => edge.target);
          
          // Agregar hijos y seguir explorando
          childrenIds.forEach(childId => {
            if (!descendants.has(childId)) {
              descendants.add(childId);
              explore(childId);
            }
          });
        };
        
        explore(rootId);
        return Array.from(descendants);
      };
      
      // Encontrar descendientes
      const allDescendants = findAllDescendants(nodeId);
      
      // Actualizar los nodos
      const updatedNodes = prevNodes.map(node => {
        // El nodo que estamos colapsando/expandiendo
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              collapsed: newCollapsedState,
              manuallyToggled: true
            }
          };
        }
        
        // Nodos descendientes
        if (allDescendants.includes(node.id)) {
          if (newCollapsedState) {
            return {
              ...node,
              hidden: true,
              style: {
                ...node.style,
                opacity: 0,
                visibility: 'hidden',
                zIndex: -999
              }
            };
          } else {
            return {
              ...node,
              hidden: false,
              style: {
                ...node.style,
                opacity: 1,
                visibility: 'visible',
                zIndex: 0
              }
            };
          }
        }
        
        return node;
      });
      
      // También necesitamos actualizar aristas (mejorado)
      const currentEdges = edgesRef.current;
      
      // Crear un registro de todas las aristas que se deben mostrar/ocultar
      const edgeVisibilityMap = {};
      
      // Primero, registrar todas las aristas que involucran a los descendientes
      currentEdges.forEach(edge => {
        const sourceIsDescendant = allDescendants.includes(edge.source);
        const targetIsDescendant = allDescendants.includes(edge.target);
        const sourceIsCollapsedNode = edge.source === nodeId;
        
        // Si la arista conecta el nodo colapsado con un descendiente directo,
        // o conecta dos descendientes, debe ocultarse cuando se colapsa
        if ((sourceIsCollapsedNode && targetIsDescendant) || 
            (sourceIsDescendant && targetIsDescendant)) {
          edgeVisibilityMap[edge.id] = newCollapsedState ? 'hide' : 'show';
        }
        
        // Si la arista tiene origen o destino en un descendiente pero el otro extremo
        // no es el nodo colapsado ni otro descendiente, también debe ocultarse
        if ((sourceIsDescendant && !targetIsDescendant && !edge.target === nodeId) ||
            (targetIsDescendant && !sourceIsDescendant && !edge.source === nodeId)) {
          edgeVisibilityMap[edge.id] = newCollapsedState ? 'hide' : 'show';
        }
      });
      
      // Aplicar cambios a las aristas
      setEdges(prevEdges => 
        prevEdges.map(edge => {
          const action = edgeVisibilityMap[edge.id];
          
          if (action === 'hide') {
            return {
              ...edge,
              hidden: true,
              style: {
                ...edge.style,
                opacity: 0,
                visibility: 'hidden',
                strokeWidth: 0
              }
            };
          } else if (action === 'show') {
            // Asegurar que las aristas que deben mostrarse tengan las propiedades correctas
            return {
              ...edge,
              hidden: false,
              style: {
                ...edge.style,
                opacity: 1,
                visibility: 'visible',
                strokeWidth: edge.type === 'smoothstep' ? 1.5 : 2,
                stroke: edge.style?.stroke || '#4299e1'
              }
            };
          }
          
          // Si esta arista no está en el mapa de visibilidad, mantener su estado actual
          return edge;
        })
      );
      
      return updatedNodes;
    });
  }, [setNodes, setEdges, edgesRef]);

  // Función para colapsar todos los nodos
  const collapseAllNodes = useCallback(() => {
    setNodes(prevNodes => {
      // Primero identificar todos los nodos que tienen hijos
      const nodesWithChildren = prevNodes.filter(node => 
        node.data && node.data.childrenCount > 0
      );
      
      // Colapsar esos nodos
      const updatedNodes = prevNodes.map(node => {
        if (node.data && node.data.childrenCount > 0) {
          return {
            ...node,
            data: {
              ...node.data,
              collapsed: true,
              manuallyToggled: true
            }
          };
        }
        return node;
      });
      
      // Ahora necesitamos ocultar los descendientes de los nodos colapsados
      // Referencia segura a las aristas actuales
      const currentEdges = edgesRef.current;
      
      // Encuentra todos los descendientes de nodos colapsados
      const findDescendants = (nodeId, descendants = new Set()) => {
        const childEdges = currentEdges.filter(edge => edge.source === nodeId);
        
        childEdges.forEach(edge => {
          const childId = edge.target;
          if (!descendants.has(childId)) {
            descendants.add(childId);
            findDescendants(childId, descendants);
          }
        });
        
        return descendants;
      };
      
      // Coleccionar todos los descendientes
      const nodesToHide = new Set();
      nodesWithChildren.forEach(node => {
        const descendants = findDescendants(node.id);
        descendants.forEach(id => nodesToHide.add(id));
      });
      
      // Ocultar los descendientes
      const finalNodes = updatedNodes.map(node => {
        if (nodesToHide.has(node.id)) {
          return {
            ...node,
            hidden: true,
            style: {
              ...node.style,
              opacity: 0,
              visibility: 'hidden',
              zIndex: -999
            }
          };
        }
        return node;
      });
      
      // Actualizar también las aristas relacionadas
      const edgesToHide = new Set();
      currentEdges.forEach(edge => {
        if (nodesToHide.has(edge.source) || nodesToHide.has(edge.target)) {
          edgesToHide.add(edge.id);
        }
      });
      
      setEdges(prevEdges => 
        prevEdges.map(edge => {
          if (edgesToHide.has(edge.id)) {
            return {
              ...edge,
              hidden: true,
              style: {
                ...edge.style,
                opacity: 0,
                visibility: 'hidden',
                strokeWidth: 0
              }
            };
          }
          return edge;
        })
      );
      
      return finalNodes;
    });
  }, [setNodes, setEdges, edgesRef]);

  // Función para expandir todos los nodos
  const expandAllNodes = useCallback(() => {
    // Expandir todos los nodos y hacerlos visibles
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          collapsed: false,
          manuallyToggled: true
        },
        hidden: false,
        style: {
          ...node.style,
          opacity: 1,
          visibility: 'visible',
          zIndex: node.style?.zIndex || 0
        }
      }))
    );
    
    // Mostrar todas las aristas
    setEdges(prevEdges => 
      prevEdges.map(edge => ({
        ...edge,
        hidden: false,
        style: {
          ...edge.style,
          opacity: 1,
          visibility: 'visible',
          strokeWidth: edge.style?.strokeWidth || 1.5
        }
      }))
    );
  }, [setNodes, setEdges]);

  return {
    handleNodeCollapse,
    collapseAllNodes,
    expandAllNodes
  };
} 