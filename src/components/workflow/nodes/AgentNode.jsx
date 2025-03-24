"use client";

import { Handle, Position } from 'reactflow';

export default function AgentNode({ data }) {
  return (
    <div className="px-4 py-2 rounded-lg border-2 border-secondary bg-white dark:bg-gray-800 shadow-md min-w-[150px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-secondary border-2 border-white"
      />
      
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <div className="font-medium text-gray-700 dark:text-gray-200">{data.label}</div>
        </div>
        
        {data.tools && data.tools.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Tools: {data.tools.length}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mt-1">
          {data.tools && data.tools.slice(0, 3).map((tool, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              {tool}
            </span>
          ))}
          {data.tools && data.tools.length > 3 && (
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{data.tools.length - 3}
            </span>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-secondary border-2 border-white"
      />
    </div>
  );
} 