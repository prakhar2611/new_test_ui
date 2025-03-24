"use client";

import { Handle, Position } from 'reactflow';

export default function ToolNode({ data }) {
  return (
    <div className="px-4 py-2 rounded-lg border-2 border-accent bg-white dark:bg-gray-800 shadow-md min-w-[120px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-accent border-2 border-white"
      />
      
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L15 5.414 17.586 8 14 11.586l-1.707-1.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L14 5.414z" clipRule="evenodd" />
        </svg>
        <div className="font-medium text-gray-700 dark:text-gray-200">{data.label}</div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-accent border-2 border-white"
      />
    </div>
  );
} 