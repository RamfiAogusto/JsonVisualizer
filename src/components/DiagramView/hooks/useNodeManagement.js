import { useCallback, useRef } from 'react';
import { applyNodeChanges } from 'reactflow';

export default function useNodeManagement(setNodes, setEdges, edgesRef, nodesDraggable) {
  const dragStartRef = useRef(false);

  // Función para manejar la selección de nodos y resaltar conexiones
  const onNodeClick = useCallback((event, node, selectedNodeId, setSelectedNodeId) => {
    if (!node || !node.id) return;
    
    const nodeId = node.id;
    
    // Actualizar el estado de selección
    setSelectedNodeId(prevSelectedNodeId => 
      prevSelectedNodeId === nodeId ? null : nodeId);
    
    // Referencia segura a las aristas actuales
    const currentEdges = edgesRef.current;
    
    // Resaltar/quitar resaltado de las aristas conectadas
    setEdges(prevEdges => {
      return prevEdges.map(edge => {
        if (!edge || !edge.id) return edge;
        
        const isConnected = edge.source === nodeId || edge.target === nodeId;
        
        // Si el nodo ya estaba seleccionado, quitamos todos los resaltados
        if (selectedNodeId === nodeId) {
          return {
            ...edge,
            className: edge.className?.replace('edge-highlight', '') || '',
            animated: false
          };
        }
        
        // Si es una conexión del nodo seleccionado, resaltarla
        if (isConnected) {
          const existingClass = edge.className || '';
          return {
            ...edge,
            className: existingClass.includes('edge-highlight') 
              ? existingClass 
              : `${existingClass} edge-highlight`,
            animated: true
          };
        }
        
        // Para las demás conexiones, quitar el resaltado
        return {
          ...edge,
          className: edge.className?.replace('edge-highlight', '') || '',
          animated: false
        };
      });
    });
    
    // También podemos resaltar nodos conectados con manejo seguro
    setNodes(prevNodes => {
      return prevNodes.map(n => {
        if (!n || !n.id) return n;
        
        const isConnectedNode = currentEdges.some(edge => 
          edge && edge.id && (
            (edge.source === nodeId && edge.target === n.id) || 
            (edge.target === nodeId && edge.source === n.id)
          )
        );
        
        // Si el nodo ya estaba seleccionado, quitamos todos los resaltados
        if (selectedNodeId === nodeId) {
          return {
            ...n,
            className: n.className?.replace('node-highlight', '') || '',
            style: {
              ...n.style,
              boxShadow: null
            }
          };
        }
        
        // Si es un nodo conectado, resaltarlo
        if (isConnectedNode || n.id === nodeId) {
          const existingClass = n.className || '';
          return {
            ...n,
            className: existingClass.includes('node-highlight') 
              ? existingClass 
              : `${existingClass} node-highlight`,
            style: {
              ...n.style,
              zIndex: 10 // Traer al frente los nodos resaltados
            }
          };
        }
        
        // Para los demás nodos, quitar el resaltado
        return {
          ...n,
          className: n.className?.replace('node-highlight', '') || '',
          style: {
            ...n.style,
            zIndex: n.style?.zIndex || 0
          }
        };
      });
    });
  }, [setEdges, setNodes, edgesRef]);

  // Función para limpiar el resaltado cuando se hace clic en el fondo
  const onPaneClick = useCallback((selectedNodeId, setSelectedNodeId) => {
    if (selectedNodeId) {
      setSelectedNodeId(null);
      
      // Quitar resaltado de todas las conexiones
      setEdges(prevEdges => {
        return prevEdges.map(edge => ({
          ...edge,
          className: edge.className?.replace('edge-highlight', '') || '',
          animated: false
        }));
      });
      
      // Quitar resaltado de todos los nodos
      setNodes(prevNodes => {
        return prevNodes.map(node => ({
          ...node,
          className: node.className?.replace('node-highlight', '') || '',
          style: {
            ...node.style,
            zIndex: node.style?.zIndex === 10 ? 0 : node.style?.zIndex
          }
        }));
      });
    }
  }, [setEdges, setNodes]);

  // Modificar la función onNodeDragStart para que sea más estricta
  const onNodeDragStart = useCallback((event, node) => {
    // Si los nodos no son arrastrables, detener COMPLETAMENTE el evento y retornar
    if (!nodesDraggable) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    if (dragStartRef.current) return;
    
    dragStartRef.current = true;
    document.body.classList.add('dragging-active');
    
    setNodes(prevNodes => {
      return prevNodes.map(n => 
        n.id === node.id ? {
          ...n,
          isDragging: true,
          style: {
            ...n.style,
            transition: 'none',
            zIndex: 1000
          }
        } : n
      );
    });
  }, [setNodes, nodesDraggable]);

  const onNodeDrag = useCallback((event, node) => {
    // Usar requestAnimationFrame de manera más eficiente
    if (!window.dragAnimationFrame) {
      window.dragAnimationFrame = requestAnimationFrame(() => {
        // Actualizar solo las aristas conectadas al nodo actual
        const connectedEdges = edgesRef.current.filter(edge => 
          edge.source === node.id || edge.target === node.id
        );
        
        if (connectedEdges.length > 0) {
          setEdges(prevEdges => 
            prevEdges.map(edge => 
              connectedEdges.some(e => e.id === edge.id) ? {
                ...edge,
                className: 'dragging-edge',
                animated: false,
                style: {
                  ...edge.style,
                  transition: 'none',
                  strokeDasharray: '5,5'
                }
              } : edge
            )
          );
        }
        
        window.dragAnimationFrame = null;
      });
    }
  }, [setEdges, edgesRef]);

  const onNodeDragStop = useCallback((event, node) => {
    dragStartRef.current = false; // Resetear la referencia
    document.body.classList.remove('dragging-active');
    
    // Restaurar estados en un solo batch
    requestAnimationFrame(() => {
      setNodes(prevNodes => 
        prevNodes.map(n => 
          n.id === node.id ? {
            ...n,
            isDragging: false,
            style: {
              ...n.style,
              transition: null,
              zIndex: 1
            }
          } : n
        )
      );
      
      setEdges(prevEdges => 
        prevEdges.map(edge => ({
          ...edge,
          className: edge.className?.replace('dragging-edge', '') || '',
          style: {
            ...edge.style,
            transition: null,
            strokeDasharray: null
          }
        }))
      );
    });
  }, [setNodes, setEdges]);

  // Optimizar el manejo de cambios en nodos
  const onNodesChange = useCallback((changes) => {
    // Filtrar cambios durante el arrastre
    const filteredChanges = document.body.classList.contains('dragging-active')
      ? changes.filter(change => change.type === 'position')
      : changes;
    
    if (filteredChanges.length === 0) return;
    
    setNodes(nodes => applyNodeChanges(filteredChanges, nodes));
  }, [setNodes]);

  return {
    onNodeClick,
    onPaneClick,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onNodesChange
  };
} 