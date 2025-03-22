import React from 'react';
import { Handle, Position } from 'reactflow';

const ArrayNode = ({ data, id }) => {
  const collapsed = data.collapsed || false;
  const hasChildren = data.childrenCount && data.childrenCount > 0;
  
  return (
    <div className={`node-container ${collapsed ? 'collapsed-node' : ''}`}>
      <Handle type="target" position={Position.Left} className="handle-custom" />
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm text-yellow-400 font-medium flex items-center">
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
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <span className="text-xs text-gray-300">{collapsed ? '+' : '−'}</span>
          </button>
        )}
      </div>
      
      {/* Mostrar siempre las propiedades, independientemente del estado de colapso */}
      {collapsed && hasChildren && (
        <div className="text-xs text-gray-400 py-1 flex items-center border-t border-gray-700 mt-1">
          <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block mr-2"></span>
          <span>{data.childrenCount} elementos ocultos</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} className="handle-custom" />
    </div>
  );
};

export default ArrayNode; 