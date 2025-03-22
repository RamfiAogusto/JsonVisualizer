import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

// Importar componentes modularizados
import NODE_TYPES from './nodes';
import EDGE_TYPES from './edges';
import LockButton from './components/LockButton';
import SearchControls from './components/SearchControls';
import MenuTools from './components/MenuTools';
import { TruncatedText } from './components';

// Importar hooks personalizados
import useNodeManagement from './hooks/useNodeManagement';
import useSearch from './hooks/useSearch';
import useLayoutEngine from './hooks/useLayoutEngine';
import useCollapsible from './hooks/useCollapsible';
import useNodeCreation from './hooks/useNodeCreation';

// Importar estilos
import './styles';

const DiagramView = ({ jsonData, darkMode = true }) => {
  // Estados básicos del diagrama
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [layoutDirection, setLayoutDirection] = useState('LR');
  const [levelThreshold, setLevelThreshold] = useState(999);
  const [nodeSizeMode, setNodeSizeMode] = useState('medium');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [nodesDraggable, setNodesDraggable] = useState(true);
  
  // Estados para búsqueda y selección
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  // Referencias para el diagrama
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const autoLayoutRef = useRef(null);
  
  // Actualizar referencias cuando cambien los nodos o aristas
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);
  
  // Función para estimar tamaño de nodos
  const estimateNodeSize = useCallback((node) => {
    // Tamaño fijo para todos los nodos
    return { width: 180, height: 100 };
  }, []);

  // Inicializar hooks personalizados
  const { getLayoutedElements } = useLayoutEngine(estimateNodeSize, nodeSizeMode);
  
  const { handleNodeCollapse, collapseAllNodes, expandAllNodes } = useCollapsible(
    setNodes, 
    setEdges, 
    edgesRef
  );
  
  const { createNodes } = useNodeCreation(handleNodeCollapse);
  
  const { 
    onNodeClick: baseOnNodeClick,
    onPaneClick: baseOnPaneClick,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onNodesChange
  } = useNodeManagement(setNodes, setEdges, edgesRef, nodesDraggable);
  
  const {
    handleSearch,
    goToNextSearchResult,
    goToPrevSearchResult,
    clearSearch,
    focusOnNode
  } = useSearch(
    nodes,
    reactFlowInstance,
    setNodes,
    setSearchTerm,
    setSearchResults,
    setCurrentResultIndex,
    setIsSearching
  );
  
  // Función optimizada para controlar el fitView directamente
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      document.body.classList.add('viewport-transforming');
      
      // Simplificar la representación visual durante la transformación
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          style: {
            ...node.style,
            transition: 'none',
          }
        }))
      );
      
      // Usar requestAnimationFrame para sincronizar con el ciclo de renderizado del navegador
      requestAnimationFrame(() => {
        try {
          reactFlowInstance.fitView({
            padding: 0.05, // Reducido para un zoom más cercano
            includeHiddenNodes: false,
            duration: 150,
            maxZoom: 1.8 // Aumentado para permitir más zoom
          });
          
          // Restaurar después de que termine la transformación
          setTimeout(() => {
            document.body.classList.remove('viewport-transforming');
            setNodes(prevNodes => 
              prevNodes.map(node => ({
                ...node,
                style: {
                  ...node.style,
                  transition: null
                }
              }))
            );
          }, 250);
        } catch (error) {
          console.warn("Error en fitView:", error);
          document.body.classList.remove('viewport-transforming');
        }
      });
    }
  }, [reactFlowInstance, setNodes]);
  
  // Adaptadores para funciones que requieren parámetros adicionales
  const onNodeClick = useCallback((event, node) => {
    baseOnNodeClick(event, node, selectedNodeId, setSelectedNodeId);
  }, [baseOnNodeClick, selectedNodeId]);
  
  const onPaneClick = useCallback(() => {
    baseOnPaneClick(selectedNodeId, setSelectedNodeId);
  }, [baseOnPaneClick, selectedNodeId]);
  
  const handleGoToNextResult = useCallback(() => {
    goToNextSearchResult(searchResults, currentResultIndex);
  }, [goToNextSearchResult, searchResults, currentResultIndex]);
  
  const handleGoToPrevResult = useCallback(() => {
    goToPrevSearchResult(searchResults, currentResultIndex);
  }, [goToPrevSearchResult, searchResults, currentResultIndex]);
  
  // Definir recalculateLayout
  const recalculateLayout = useCallback(() => {
    if (!reactFlowInstance) return;
    
    try {
      document.body.classList.add('viewport-transforming');
      
      const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
        nodesRef.current,
        edgesRef.current,
        layoutDirection
      );
      
      // Asegurar que los nodos mantienen su estado visible/colapsado
      const updatedNodes = newNodes.map(newNode => {
        const existingNode = nodesRef.current.find(n => n.id === newNode.id);
        if (!existingNode) return newNode;
        
        return {
          ...newNode,
          data: {
            ...newNode.data,
            collapsed: existingNode.data?.collapsed || false,
            manuallyToggled: existingNode.data?.manuallyToggled || false
          },
          hidden: existingNode.hidden || false,
          style: {
            ...newNode.style,
            opacity: existingNode.hidden ? 0 : 1,
            visibility: existingNode.hidden ? 'hidden' : 'visible'
          }
        };
      });
      
      setNodes(updatedNodes);
      setEdges(newEdges);
      
      // FitView mejorado
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({
            padding: 0.05,
            includeHiddenNodes: false,
            duration: 200,
            maxZoom: 1.5
          });
          
          setTimeout(() => {
            document.body.classList.remove('viewport-transforming');
          }, 100);
        }
      }, 10);
      
    } catch (error) {
      console.warn("Error en el recálculo del layout:", error);
      document.body.classList.remove('viewport-transforming');
    }
  }, [getLayoutedElements, reactFlowInstance, layoutDirection, setNodes, setEdges]);
  
  // Asegurar que autoLayoutRef se actualiza
  useEffect(() => {
    autoLayoutRef.current = recalculateLayout;
  }, [recalculateLayout]);
  
  // Procesar datos JSON iniciales
  useEffect(() => {
    if (!jsonData) return;
    
    const { nodes: initialNodes, edges: initialEdges } = createNodes(jsonData);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      layoutDirection
    );
    
    // Inicializar con todos los nodos expandidos al cargar
    const expandedNodes = layoutedNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        collapsed: false
      },
      hidden: false,
      style: {
        ...node.style,
        opacity: 1,
        visibility: 'visible',
        zIndex: 0
      }
    }));
    
    setLevelThreshold(999);
    setNodes(expandedNodes);
    setEdges(layoutedEdges);
    
    // Recalcular layout después de la carga inicial
    setTimeout(() => {
      if (autoLayoutRef.current) {
        autoLayoutRef.current();
      }
    }, 300);
  }, [jsonData, setNodes, setEdges, createNodes, getLayoutedElements, layoutDirection]);
  
  // Función para alternar el menú
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);
  
  // Función para alternar la capacidad de arrastrar nodos
  const toggleNodesDraggable = useCallback(() => {
    setNodesDraggable(prevState => !prevState);
  }, []);
  
  // Efecto para actualizar el estado draggable de los nodos
  useEffect(() => {
    // Cuando el estado de draggable cambia, forzar la actualización en todos los nodos
    setNodes(prevNodes => prevNodes.map(node => ({
      ...node,
      draggable: nodesDraggable, // Asegurar que cada nodo individual tenga el atributo draggable actualizado
      style: {
        ...node.style,
        cursor: nodesDraggable ? 'grab' : 'default',
      }
    })));
  }, [nodesDraggable, setNodes]);

  // Memoizar los tipos de nodos y bordes
  const memoizedNodeTypes = useMemo(() => NODE_TYPES, []);
  const memoizedEdgeTypes = useMemo(() => EDGE_TYPES, []);

  return (
    <div 
      className={`h-full w-full ${darkMode ? 'bg-black' : 'bg-gray-100'} relative`} 
      ref={reactFlowWrapper}
    >
      {/* Menú de herramientas */}
      <MenuTools 
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        layoutDirection={layoutDirection}
        setLayoutDirection={setLayoutDirection}
        collapseAllNodes={collapseAllNodes}
        expandAllNodes={expandAllNodes}
      />
      
      {/* Controles de búsqueda */}
      <SearchControls 
        handleSearch={handleSearch}
        isSearching={isSearching}
        searchResults={searchResults}
        currentResultIndex={currentResultIndex}
        goToPrevSearchResult={handleGoToPrevResult}
        goToNextSearchResult={handleGoToNextResult}
        clearSearch={clearSearch}
      />
      
      {/* ReactFlow con configuración optimizada */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={memoizedNodeTypes}
        edgeTypes={memoizedEdgeTypes}
        onNodesChange={nodesDraggable ? onNodesChange : null}
        onEdgesChange={null}
        onInit={setReactFlowInstance}
        fitView
        fitViewOptions={{ 
          padding: 0.05, 
          includeHiddenNodes: true,
          duration: 300,
          maxZoom: 1.8
        }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ 
          hideAttribution: true
        }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 1.5 },
          animated: false
        }}
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        preventScrolling={true}
        selectionOnDrag={false}
        className="animate-layout-transition"
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onError={(error) => console.warn("ReactFlow error:", error)}
        nodesDraggable={nodesDraggable}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={nodesDraggable ? onNodeDrag : null}
        onNodeDragStop={nodesDraggable ? onNodeDragStop : null}
        draggable={true}
        zoomOnDoubleClick={false}
        translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
      >
        <Background 
          color={darkMode ? "#333" : "#e5e7eb"} 
          gap={16} 
          size={1}
        />
        
        {/* Controles con el botón de bloqueo integrado */}
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          fitViewOptions={{ 
            padding: 0.1, 
            duration: 150
          }}
          onFitView={handleFitView}
          position="bottom-left"
        >
          <LockButton 
            locked={!nodesDraggable} 
            onClick={toggleNodesDraggable} 
          />
        </Controls>
        
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'arrayNode': return darkMode ? '#ecc94b' : '#d97706';
              default: return darkMode ? '#4299e1' : '#2563eb';
            }
          }}
          maskColor={darkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)"}
          style={{ 
            background: darkMode ? '#1a202c' : '#f3f4f6',
            height: 80,
            width: 120
          }}
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
};

export default DiagramView; 