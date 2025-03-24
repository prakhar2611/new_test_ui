"use client";

import { useState } from 'react';

export default function DetailsPanel({ item, onEdit, onDelete }) {
  const [isLoading, setIsLoading] = useState(false);

  // Function to run an agent
  const runAgent = async (id) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/agents/${id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: "Show me a brief overview of what you can do",
          prompt_field_values: {}
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to run agent: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Agent run response:', data);
      // Here you would handle the response data, perhaps showing it in a modal or panel
      
    } catch (error) {
      console.error('Error running agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If no item is selected, show a placeholder
  if (!item) {
    return (
      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-full overflow-y-auto p-6 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">Select an item to view its details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{item.name}</h2>
        
        {/* Properties Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Properties</h3>
          <div className="space-y-3">
            <PropertyField label="ID" value={item.id} />
            <PropertyField label="Type" value={item.type || 'Agent'} />
            <PropertyField label="Created" value={item.created || 'Just now'} />
          </div>
        </div>
        
        {/* Tools Section */}
        {item.features && item.features.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tools</h3>
            <div className="flex flex-wrap gap-2">
              {item.features.map((tool, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Configuration Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Configuration</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 space-y-3">
            <ConfigField 
              label="System Prompt" 
              type="textarea" 
              value={item.systemPrompt || item.system_prompt || ''} 
            />
            {item.additional_prompt && (
              <ConfigField 
                label="Additional Prompt" 
                type="textarea" 
                value={item.additional_prompt} 
              />
            )}
            <ConfigField 
              label="Temperature" 
              type="range" 
              value={item.temperature || 0.7} 
              min={0} 
              max={1} 
              step={0.1} 
            />
            <ConfigField 
              label="Max Tokens" 
              type="number" 
              value={item.maxTokens || 2048} 
            />
          </div>
        </div>
        
        {/* Actions Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Actions</h3>
          <div className="flex gap-2">
            <button 
              className="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
              onClick={() => runAgent(item.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </span>
              ) : 'Run'}
            </button>
            <button 
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={onEdit}
            >
              Edit
            </button>
            <button 
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-red-500 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={onDelete}
            >
              Delete
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

function ConfigField({ label, type, value, ...props }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea 
          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          value={value}
          readOnly
          {...props}
        />
      ) : type === 'range' ? (
        <div className="flex items-center gap-2">
          <input 
            type="range"
            className="w-full accent-primary"
            value={value}
            readOnly
            {...props}
          />
          <span className="text-sm">{value}</span>
        </div>
      ) : (
        <input 
          type={type}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
          value={value}
          readOnly
          {...props}
        />
      )}
    </div>
  );
} 