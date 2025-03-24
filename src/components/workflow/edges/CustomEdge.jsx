"use client";

import { useCallback } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
} from 'reactflow';

// Custom edge with label and delete button
export default function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) {
  const reactFlowInstance = useReactFlow();
  
  // Get path coordinates for the edge
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  // Handle edge removal
  const onEdgeClick = useCallback((event) => {
    event.stopPropagation();
    reactFlowInstance.deleteElements({ edges: [{ id }] });
  }, [id, reactFlowInstance]);
  
  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#6366f1', // Indigo color
        }} 
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag"
        >
          <div className="flex items-center bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700 text-xs">
            {data?.label && (
              <span className="mr-2 text-gray-700 dark:text-gray-300">{data.label}</span>
            )}
            <button
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 w-4 h-4 flex items-center justify-center"
              onClick={onEdgeClick}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-4 h-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
} 