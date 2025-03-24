"use client";

import { useCallback } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  useStore 
} from 'reactflow';

// Custom edge with label and delete button
export default function CustomEdge({
  id,
  source,
  target,
  markerEnd,
  style = {},
  data,
  selected,
}) {
  // Get the edge path
  const sourceNode = useStore(useCallback(store => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback(store => store.nodeInternals.get(target), [target]));
  
  if (!sourceNode || !targetNode) {
    return null;
  }
  
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
  
  // Calculate the bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
  });

  const edgeStyles = {
    ...style,
    strokeWidth: selected ? 3 : 2,
    stroke: selected ? '#3b82f6' : style.stroke || '#6366f1',
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={edgeStyles} />
      
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs shadow-md nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// Helper function to calculate the edge parameters
function getEdgeParams(sourceNode, targetNode) {
  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);
  
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  
  // Determine the source and target positions based on the relative
  // positions of the nodes
  const sourcePos = Math.abs(dx) > Math.abs(dy)
    ? dx > 0 ? 'right' : 'left'
    : dy > 0 ? 'bottom' : 'top';
    
  const targetPos = Math.abs(dx) > Math.abs(dy)
    ? dx > 0 ? 'left' : 'right'
    : dy > 0 ? 'top' : 'bottom';
  
  // Calculate source and target coordinates based on the node positions
  const sourceIntersection = getNodeIntersection(
    sourceCenter,
    targetCenter,
    sourceNode,
    sourcePos
  );
  
  const targetIntersection = getNodeIntersection(
    targetCenter,
    sourceCenter,
    targetNode,
    targetPos
  );
  
  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos,
    targetPos,
  };
}

// Helper function to calculate node center
function getNodeCenter(node) {
  return {
    x: node.positionAbsolute.x + node.width / 2,
    y: node.positionAbsolute.y + node.height / 2,
  };
}

// Helper function to calculate the intersection point of an edge with a node
function getNodeIntersection(nodeCenter, otherNodeCenter, node, pos) {
  // Calculate direction vector
  const dx = otherNodeCenter.x - nodeCenter.x;
  const dy = otherNodeCenter.y - nodeCenter.y;
  
  // Default values (using the position handles if specified)
  const defaultX = nodeCenter.x;
  const defaultY = nodeCenter.y;
  
  // Adjust for different positions
  let offsetX = 0;
  let offsetY = 0;
  
  switch (pos) {
    case 'top':
      offsetY = -node.height / 2;
      break;
    case 'right':
      offsetX = node.width / 2;
      break;
    case 'bottom':
      offsetY = node.height / 2;
      break;
    case 'left':
      offsetX = -node.width / 2;
      break;
    default:
      break;
  }
  
  return {
    x: defaultX + offsetX,
    y: defaultY + offsetY,
  };
} 