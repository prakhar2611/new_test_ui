"use client";

import { useState } from 'react';

export default function OrchestratorPanel({ orchestrator, onEdit, onRun, onOpenChat }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [response, setResponse] = useState('');
  
  const handleRun = async () => {
    setIsLoading(true);
    setShowResponse(false);
    
    try {
      const result = await onRun();
      setResponse(result.response || 'Orchestrator ran successfully.');
      setShowResponse(true);
    } catch (error) {
      setResponse(`Error: ${error.message}`);
      setShowResponse(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!orchestrator) return null;
  
  return (
    <div className="w-1/4 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">{orchestrator.name}</h2>
        
        {/* Properties Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Properties</h3>
          <div className="space-y-3">
            <PropertyField label="ID" value={orchestrator.id} />
            <PropertyField label="Agents" value={orchestrator.agents?.length || 0} />
            <PropertyField label="Tools" value={orchestrator.tools?.length || 0} />
          </div>
        </div>
        
        {/* Description Section */}
        {orchestrator.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">{orchestrator.description}</p>
            </div>
          </div>
        )}
        
        {/* System Prompt Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">System Prompt</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
            <div className="font-fira-code font-light text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {orchestrator.system_prompt || 'No system prompt defined.'}
            </div>
          </div>
        </div>
        
        {/* Response Section */}
        {showResponse && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Response</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
              <div className="font-fira-code font-light text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {response}
              </div>
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Instructions</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
            <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>Drag agents and tools from the sidebar to the canvas</li>
              <li>Connect the components by dragging between handles</li>
              <li>Click 'Edit' to modify orchestrator properties</li>
              <li>Click 'Test in Chat' to interact with your orchestrator</li>
              <li>Or use 'Quick Run' to test with a default prompt</li>
            </ol>
          </div>
        </div>
        
        {/* Actions Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Actions</h3>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-primary text-black rounded-md text-sm hover:bg-blue-600 hover:text-white transition-colors flex-1"
                onClick={onOpenChat}
              >
                Test in Chat
              </button>
              <button 
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-1"
                onClick={onEdit}
              >
                Edit
              </button>
            </div>
            
            {/* Quick run button to show response directly in the panel */}
            <button 
              className="px-4 py-2 border border-primary text-primary bg-white dark:bg-transparent dark:text-primary dark:border-primary rounded-md text-sm hover:bg-primary/10 transition-colors"
              onClick={handleRun}
              // disabled={isLoading}
              disabled={true}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </span>
              ) : 'Quick Run'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyField({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium truncate max-w-[60%]">{value}</span>
    </div>
  );
} 