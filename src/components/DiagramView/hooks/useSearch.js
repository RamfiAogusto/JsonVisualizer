import { useCallback } from 'react';
import { debounce } from 'lodash';

export default function useSearch(
  nodes, 
  reactFlowInstance, 
  setNodes, 
  setSearchTerm, 
  setSearchResults,
  setCurrentResultIndex,
  setIsSearching
) {
  // Función para enfocar un nodo específico
  const focusOnNode = useCallback((nodeId) => {
    if (!reactFlowInstance || !nodeId) return;
    
    // Encontrar el nodo por ID
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Animar el zoom al nodo
    reactFlowInstance.fitView({
      padding: 0.5,
      duration: 300,
      nodes: [node],
      maxZoom: 1.5
    });
    
    // Actualizar sólo el nodo específico con estilos especiales
    setNodes(prevNodes => {
      // Verificar si ya tiene el estilo para evitar actualizaciones innecesarias
      const nodeToUpdate = prevNodes.find(n => n.id === nodeId);
      if (nodeToUpdate?.style?.animation === 'pulse-highlight 1.5s ease-in-out') {
        return prevNodes;
      }
      
      return prevNodes.map(n => ({
        ...n,
        style: {
          ...n.style,
          // Pulso de animación para el nodo actual
          animation: n.id === nodeId ? 'pulse-highlight 1.5s ease-in-out' : n.style?.animation || 'none',
          boxShadow: n.id === nodeId 
            ? '0 0 0 3px #fb923c, 0 0 15px rgba(251, 146, 60, 0.8)' 
            : n.style?.boxShadow || 'none'
        }
      }));
    });
  }, [reactFlowInstance, nodes, setNodes]);

  // Filtrar nodos por término de búsqueda
  const filterNodesBySearchTerm = useCallback((searchText) => {
    if (!searchText || searchText.trim() === '') {
      // Resetear todos los nodos a estado normal
      setSearchResults([]);
      setCurrentResultIndex(0);
      setIsSearching(false);
      
      setNodes(prevNodes => prevNodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          opacity: 1,
          filter: 'none',
          boxShadow: 'none',
          zIndex: node.style?.zIndex || 0
        },
        highlighted: false
      })));
      
      return;
    }

    setIsSearching(true);
    const term = searchText.toLowerCase();
    const results = [];
    
    // Primero recolectar los resultados sin modificar los nodos
    const nodesToHighlight = new Set();
    
    // Buscar coincidencias
    nodes.forEach(node => {
      // Verificar coincidencias en la etiqueta del nodo
      const labelMatch = node.data.label?.toLowerCase().includes(term);
      
      // Verificar coincidencias en las propiedades
      const propMatches = node.data.properties?.filter(prop => 
        prop.key.toLowerCase().includes(term) || 
        prop.value.toLowerCase().includes(term)
      ) || [];
      
      const matches = labelMatch || propMatches.length > 0;
      
      if (matches) {
        results.push({
          id: node.id,
          labelMatch,
          propMatches: propMatches.map(p => ({key: p.key, value: p.value}))
        });
        
        nodesToHighlight.add(node.id);
      }
    });
    
    // Actualizar los resultados de búsqueda
    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
    
    // Después, aplicar los cambios visuales a los nodos en una sola actualización
    setNodes(prevNodes => prevNodes.map(node => {
      const isHighlighted = nodesToHighlight.has(node.id);
      
      return {
        ...node,
        style: {
          ...node.style,
          opacity: isHighlighted ? 1 : 0.4, // Aumentado de 0.15 a 0.4 para mejor visibilidad
          filter: isHighlighted ? 'none' : 'grayscale(0.5) blur(0.5px)', // Reducido el grayscale y blur
          boxShadow: isHighlighted 
            ? '0 0 0 2px #fbbf24, 0 0 10px rgba(251, 191, 36, 0.6)' 
            : 'none',
          zIndex: isHighlighted ? 50 : node.style?.zIndex || 0,
        },
        highlighted: isHighlighted
      };
    }));
    
    // Aplicar focus al primer resultado después de aplicar los estilos
    if (results.length > 0 && reactFlowInstance) {
      setTimeout(() => {
        focusOnNode(results[0].id);
      }, 100);
    }
  }, [nodes, reactFlowInstance, setNodes, setSearchResults, setCurrentResultIndex, setIsSearching, focusOnNode]);

  // Manejador de búsqueda con debounce
  const handleSearch = useCallback((searchText) => {
    setSearchTerm(searchText);
    
    // Usar debounce para evitar demasiadas actualizaciones
    const debouncedSearch = debounce(() => {
      filterNodesBySearchTerm(searchText);
    }, 300);
    
    debouncedSearch();
    
    return () => debouncedSearch.cancel();
  }, [filterNodesBySearchTerm, setSearchTerm]);

  // Función para ir al siguiente resultado
  const goToNextSearchResult = useCallback((searchResults, currentResultIndex) => {
    if (searchResults.length === 0) return;
    
    // Calcular el siguiente índice con rotación
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    
    // Enfocar en el nodo correspondiente después de que se actualice el estado
    setTimeout(() => {
      focusOnNode(searchResults[nextIndex]?.id);
    }, 0);
  }, [focusOnNode, setCurrentResultIndex]);

  // Función para ir al resultado anterior
  const goToPrevSearchResult = useCallback((searchResults, currentResultIndex) => {
    if (searchResults.length === 0) return;
    
    // Calcular el índice anterior con rotación
    const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentResultIndex(prevIndex);
    
    // Enfocar en el nodo correspondiente después de que se actualice el estado
    setTimeout(() => {
      focusOnNode(searchResults[prevIndex]?.id);
    }, 0);
  }, [focusOnNode, setCurrentResultIndex]);

  // Función para limpiar la búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setCurrentResultIndex(0);
    setIsSearching(false);
    
    // Restaurar todos los nodos en una única actualización
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          opacity: 1,
          filter: 'none',
          boxShadow: 'none',
          animation: 'none',
          zIndex: 0
        },
        highlighted: false
      }))
    );
  }, [setSearchTerm, setSearchResults, setCurrentResultIndex, setIsSearching, setNodes]);

  return {
    handleSearch,
    goToNextSearchResult,
    goToPrevSearchResult,
    clearSearch,
    focusOnNode
  };
} 