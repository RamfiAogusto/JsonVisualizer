import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import SearchBar from './SearchBar';
import { debounce } from 'lodash';

// Primero definimos todos los componentes de nodos
const ObjectNode = ({ data, id }) => {
  const collapsed = data.collapsed || false;
  const hasChildren = data.childrenCount && data.childrenCount > 0;
  
  return (
    <div className={`node-container ${collapsed ? 'collapsed-node' : ''}`}>
      <Handle type="target" position={Position.Left} className="handle-custom" />
      <div className="flex justify-between items-center">
        {data.label && (
          <div className="text-sm text-blue-400 mb-1 font-medium flex items-center">
            {data.label}
            {hasChildren && collapsed && (
              <span className="ml-2 text-xs text-yellow-300 bg-gray-800 px-1.5 py-0.5 rounded">
                +{data.childrenCount}
              </span>
            )}
          </div>
        )}
        {hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (data.onToggleCollapse) data.onToggleCollapse(id);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <span className="text-xs text-gray-300">{collapsed ? '+' : '−'}</span>
          </button>
        )}
      </div>
      
      {/* Mostrar siempre las propiedades, independientemente del estado de colapso */}
      {data.properties && data.properties.map((prop) => (
        <div key={prop.key} className="flex justify-between text-xs py-1">
          <span className="text-blue-400">{prop.key}:</span>
          <span className="text-green-400 ml-2">{prop.value}</span>
        </div>
      ))}
      
      {collapsed && hasChildren && (
        <div className="text-xs text-gray-400 py-1 flex items-center">
          <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-2"></span>
          <span>{data.childrenCount} nodos anidados ocultos</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} className="handle-custom" />
    </div>
  );
};

const ArrayNode = ({ data, id }) => {
  const collapsed = data.collapsed || false;
  const hasChildren = data.childrenCount && data.childrenCount > 0;
  
  return (
    <div className={`node-container ${collapsed ? 'collapsed-node' : ''}`}>
      <Handle type="target" position={Position.Left} className="handle-custom" />
      <div className="flex justify-between items-center">
        <div className="text-lg text-yellow-400 font-medium flex items-center">
          {data.label} [{data.length}]
          {hasChildren && collapsed && (
            <span className="ml-2 text-xs text-yellow-300 bg-gray-800 px-1.5 py-0.5 rounded">
              +{data.childrenCount}
            </span>
          )}
        </div>
        {hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (data.onToggleCollapse) data.onToggleCollapse(id);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <span className="text-xs text-gray-300">{collapsed ? '+' : '−'}</span>
          </button>
        )}
      </div>
      
      {/* Mostrar siempre las propiedades, independientemente del estado de colapso */}
      {collapsed && hasChildren && (
        <div className="text-xs text-gray-400 py-1 flex items-center">
          <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block mr-2"></span>
          <span>{data.childrenCount} elementos ocultos</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} className="handle-custom" />
    </div>
  );
};

// Luego definimos el componente CustomEdge
const CustomEdge = ({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style = {} }) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{
        ...style,
        stroke: '#555',
        strokeWidth: 1.5,
      }} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '2px 4px',
              borderRadius: '4px',
              color: '#fff',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Definir los tipos de nodos y bordes fuera del componente, pero SIN useMemo
const NODE_TYPES = {
  objectNode: ObjectNode,
  arrayNode: ArrayNode,
};

const EDGE_TYPES = {
  customEdge: CustomEdge,
};

const DiagramView = ({ jsonData, darkMode = true }) => {
  // Usar useMemo DENTRO del componente para memorizar los tipos
  const nodeTypes = useMemo(() => NODE_TYPES, []);
  const edgeTypes = useMemo(() => EDGE_TYPES, []);
  
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [layoutDirection, setLayoutDirection] = useState('LR');
  const [levelThreshold, setLevelThreshold] = useState(999);
  const [nodeSizeMode, setNodeSizeMode] = useState('medium');
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Estado para almacenar el nodo seleccionado
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  // Nuevos estados para la funcionalidad de búsqueda
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  
  // Referencias estables para evitar problemas de dependencias circulares
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú hamburguesa
  
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);
  
  // Función auxiliar para estimar el tamaño de un nodo basado en su contenido
  const estimateNodeSize = useCallback((node) => {
    let width = 220; // Ancho base
    let height = 60; // Altura base
    
    // Ajuste según el modo de tamaño seleccionado
    const sizeMultiplier = nodeSizeMode === 'compact' ? 0.8 : 
                          nodeSizeMode === 'expanded' ? 1.2 : 1;
    
    width *= sizeMultiplier;
    height *= sizeMultiplier;
    
    // Calcular tamaño basado en el contenido
    if (node.data) {
      // Si es un nodo de objeto y tiene propiedades, ajustar altura
      if (node.type === 'objectNode' && node.data.properties) {
        const visibleProps = node.data.collapsed ? 0 : node.data.properties.length;
        // Altura base + altura por cada propiedad visible
        height += visibleProps * 22 * sizeMultiplier;
        
        // Calcular ancho basado en las propiedades más largas
        if (node.data.properties && node.data.properties.length > 0) {
          const longestProp = node.data.properties.reduce((max, prop) => {
            const length = (prop.key.length + String(prop.value).length);
            return length > max ? length : max;
          }, 0);
          
          // Ajustar ancho si hay propiedades muy largas
          if (longestProp > 25) {
            width += Math.min((longestProp - 25) * 4, 100) * sizeMultiplier;
          }
        }
      }
      
      // Si es un nodo de array, ajustar según si está colapsado
      if (node.type === 'arrayNode') {
        if (!node.data.collapsed && node.data.length > 0) {
          // Si está expandido, dar más espacio
          height += 20 * sizeMultiplier;
        }
        
        // Si el array tiene un nombre largo
        if (node.data.label && node.data.label.length > 10) {
          width += Math.min((node.data.label.length - 10) * 8, 80) * sizeMultiplier;
        }
      }
    }
    
    // Asegurar mínimos razonables
    width = Math.max(width, 180 * sizeMultiplier);
    height = Math.max(height, 40 * sizeMultiplier);
    
    return { width, height };
  }, [nodeSizeMode]);
  
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

  // Función para manejar la selección de nodos y resaltar conexiones
  const onNodeClick = useCallback((event, node) => {
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
  }, [setEdges, setNodes, selectedNodeId]);

  // Función para limpiar el resaltado cuando se hace clic en el fondo
  const onPaneClick = useCallback(() => {
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
  }, [selectedNodeId, setEdges, setNodes]);

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

  // En la sección de referencias del componente (cerca de la línea 50)
  const dragStartRef = useRef(false);

  // Modificar la función onNodeDragStart (línea 1157)
  const onNodeDragStart = useCallback((event, node) => {
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
  }, [setNodes]);

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
  }, [setEdges]);

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

  // Reemplazar la función de filtrado y los efectos relacionados con la búsqueda
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
  }, [nodes, reactFlowInstance]);

  // Reemplazar el useEffect de búsqueda con un handler para SearchBar
  const handleSearch = useCallback((searchText) => {
    setSearchTerm(searchText);
    
    // Usar debounce para evitar demasiadas actualizaciones
    const debouncedSearch = debounce(() => {
      filterNodesBySearchTerm(searchText);
    }, 300);
    
    debouncedSearch();
    
    return () => debouncedSearch.cancel();
  }, [filterNodesBySearchTerm]);

  // Actualizar la función focusOnNode para evitar más bucles
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

  // Actualizar la función goToNextSearchResult para evitar actualizaciones repetidas
  const goToNextSearchResult = useCallback(() => {
    if (searchResults.length === 0) return;
    
    // Calcular el siguiente índice con rotación
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    
    // Enfocar en el nodo correspondiente después de que se actualice el estado
    setTimeout(() => {
      focusOnNode(searchResults[nextIndex]?.id);
    }, 0);
  }, [searchResults, currentResultIndex, focusOnNode]);

  // Actualizar la función goToPrevSearchResult
  const goToPrevSearchResult = useCallback(() => {
    if (searchResults.length === 0) return;
    
    // Calcular el índice anterior con rotación
    const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentResultIndex(prevIndex);
    
    // Enfocar en el nodo correspondiente después de que se actualice el estado
    setTimeout(() => {
      focusOnNode(searchResults[prevIndex]?.id);
    }, 0);
  }, [searchResults, currentResultIndex, focusOnNode]);

  // Actualizar clearSearch para asegurar que no cause bucles
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
  }, [setNodes]);

  // Añadir la función createNodes que falta
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
  }, []); // Dependencia vacía ya que handleNodeCollapse no está definido aún

  // Mejorar la función handleNodeCollapse para gestionar mejor las aristas
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
    
    // Opcional: Después de un tiempo, recalcular el layout para arreglar posibles problemas visuales
    // setTimeout(() => {
    //   if (autoLayoutRef.current) {
    //     autoLayoutRef.current();
    //   }
    // }, 50);
  }, [setNodes, setEdges]);

  // Crear referencia para autoLayout
  const autoLayoutRef = useRef(null);

  // Definir recalculateLayout antes de usarlo en otros lugares
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
            collapsed: existingNode.data?.collapsed || false
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
      
      // Usar un fitView más rápido
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

  // Ahora puedes usar recalculateLayout en el useEffect que carga los datos iniciales
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

  // 4. Implementar funciones mejoradas para colapsar/expandir todos los nodos
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
    
    // Recalcular layout después de colapsar
    setTimeout(() => {
      if (autoLayoutRef.current) {
        autoLayoutRef.current();
      }
    }, 100);
  }, [setNodes, setEdges]);

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
    
    // Recalcular layout después de expandir
    setTimeout(() => {
      if (autoLayoutRef.current) {
        autoLayoutRef.current();
      }
    }, 100);
  }, [setNodes, setEdges]);

  // Opcional: Si quieres crear una versión mejorada, hazlo después de la definición original
  const enhancedRecalculateLayout = useCallback(() => {
    if (!reactFlowInstance) return;
    
    try {
      document.body.classList.add('viewport-transforming');
      
      const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
        nodesRef.current,
        edgesRef.current,
        layoutDirection
      );
      
      // Preservar estados de colapso y visibilidad
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

  // Si decides usar el enhancedRecalculateLayout, actualiza también la referencia
  useEffect(() => {
    autoLayoutRef.current = enhancedRecalculateLayout;
  }, [enhancedRecalculateLayout]);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <div className={`h-full w-full ${darkMode ? 'bg-black' : 'bg-gray-100'} relative`} ref={reactFlowWrapper}>
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

      {/* Barra de búsqueda mejorada con controles de navegación */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <SearchBar onSearch={handleSearch} />
          
          {/* Controles de navegación de resultados */}
          {isSearching && (
            <div className="flex items-center bg-gray-800 rounded-md px-2 py-1 text-white">
              <span className="text-xs mr-2">
                {searchResults.length > 0 
                  ? `${currentResultIndex + 1}/${searchResults.length}` 
                  : '0 resultados'}
              </span>
              
              <button 
                onClick={goToPrevSearchResult}
                disabled={searchResults.length === 0}
                className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-1"
                aria-label="Resultado anterior"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && goToPrevSearchResult()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              
              <button 
                onClick={goToNextSearchResult}
                disabled={searchResults.length === 0}
                className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-1"
                aria-label="Siguiente resultado"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && goToNextSearchResult()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
      </div>
      
        {/* Indicador de resultados y botón de limpiar */}
        {searchResults.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-800 bg-opacity-70 rounded-md px-2 py-1 text-xs text-gray-300">
            <div>
              <span className="font-medium text-yellow-300">{searchResults.length}</span> 
              {` coincidencia${searchResults.length !== 1 ? 's' : ''} encontrada${searchResults.length !== 1 ? 's' : ''}`}
            </div>
            <button 
              onClick={clearSearch}
              className="text-gray-400 hover:text-white ml-auto"
              aria-label="Limpiar búsqueda"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && clearSearch()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* ReactFlow con configuración optimizada */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
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
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        draggable={true}
        zoomOnDoubleClick={false}
        translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
      >
        <Background 
          color={darkMode ? "#333" : "#e5e7eb"} 
          gap={16} 
          size={1}
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          fitViewOptions={{ 
            padding: 0.1, 
            duration: 150
          }}
          onFitView={handleFitView}
          position="bottom-right"
        />
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
        
        {/* Panel oculto para auto-layout */}
        <Panel position="bottom-center" className="bg-transparent">
          <button
            className="hidden"
            onClick={() => autoLayoutRef.current()}
            id="auto-layout-btn"
          />
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default DiagramView;