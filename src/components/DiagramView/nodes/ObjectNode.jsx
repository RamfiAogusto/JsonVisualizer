import React from 'react';
import { Handle, Position } from 'reactflow';
import TruncatedText from '../components/TruncatedText';

const ObjectNode = ({ data, id }) => {
  const collapsed = data.collapsed || false;
  const hasChildren = data.childrenCount && data.childrenCount > 0;
  
  return (
    <div className={`node-container ${collapsed ? 'collapsed-node' : ''}`}>
      <Handle type="target" position={Position.Left} className="handle-custom" />
      <div className="flex justify-between items-center mb-2">
        {data.label && (
          <div className="text-sm text-blue-400 font-medium flex items-center">
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
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 flex-shrink-0"
          >
            <span className="text-xs text-gray-300">{collapsed ? '+' : '−'}</span>
          </button>
        )}
      </div>
      
      {/* Mostrar siempre las propiedades, independientemente del estado de colapso */}
      {data.properties && data.properties.length > 0 && (
        <div className="border-t border-gray-700 pt-1 node-content">
          {data.properties.map((prop) => (
            <div key={prop.key} className="flex text-xs py-1 border-b border-gray-700 last:border-b-0 overflow-visible">
              <span className="text-blue-400 min-w-[40%] pr-2 flex-shrink-0 truncate">{prop.key}:</span>
              <div className="flex-grow min-w-0 overflow-visible">
                <TruncatedText text={prop.value} maxLength={12} />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {collapsed && hasChildren && (
        <div className="text-xs text-gray-400 py-1 flex items-center mt-1">
          <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-2"></span>
          <span>{data.childrenCount} nodos anidados ocultos</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} className="handle-custom" />
    </div>
  );
};

export default ObjectNode; 