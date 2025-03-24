"use client";

import { useState } from 'react';

export default function WorkflowSidebar({ 
  agents, 
  tools, 
  orchestrators, 
  selectedOrchestratorId,
  onOrchestratorSelect,
  onCreateOrchestrator,
  onDragStart,
  isLoading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['Orchestrators', 'Agents', 'Tools']);
  
  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };
  
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredTools = tools.filter(tool => {
    // Handle different possible data structures for tools
    if (typeof tool === 'string') {
      return tool.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Check if tool is an object with a name property
    if (tool && typeof tool === 'object') {
      const name = tool.name || tool.display_name || tool.id || '';
      return typeof name === 'string' && name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return false; // Filter out any tools that don't match the above criteria
  });
  
  const filteredOrchestrators = orchestrators.filter(orch => 
    orch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDragStart = (event, item, type) => {
    // Call the parent's onDragStart handler if provided
    if (onDragStart) {
      onDragStart();
    }
    
    // Set the drag data
    event.dataTransfer.setData('application/reactflow/type', type);
    event.dataTransfer.setData('application/reactflow/item', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-full overflow-y-auto">
      {/* Search input */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:text-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute right-2 top-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading components...</p>
        </div>
      ) : (
        <>
          {/* Orchestrators Category */}
          <div className="px-2 mb-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => toggleCategory('Orchestrators')}
                className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <span>Orchestrators</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${
                    expandedCategories.includes('Orchestrators') ? 'transform rotate-0' : 'transform rotate-180'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-primary"
                onClick={onCreateOrchestrator}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            {expandedCategories.includes('Orchestrators') && (
              <div className="mt-1 pl-2 space-y-1">
                {filteredOrchestrators.length > 0 ? (
                  filteredOrchestrators.map(orchestrator => (
                    <button
                      key={orchestrator.id}
                      className={`flex items-center w-full px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${
                        selectedOrchestratorId === orchestrator.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-primary' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                      onClick={() => onOrchestratorSelect(orchestrator.id)}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      {orchestrator.name}
                    </button>
                  ))
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm px-2 py-2">
                    No orchestrators found
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Agents Category */}
          <div className="px-2 mb-4">
            <button
              onClick={() => toggleCategory('Agents')}
              className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <span>Agents</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${
                  expandedCategories.includes('Agents') ? 'transform rotate-0' : 'transform rotate-180'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedCategories.includes('Agents') && (
              <div className="mt-1 pl-2 space-y-1">
                {filteredAgents.length > 0 ? (
                  filteredAgents.map(agent => (
                    <div
                      key={agent.id}
                      className="flex items-center w-full px-2 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-grab"
                      draggable
                      onDragStart={(e) => handleDragStart(e, agent, 'agent')}
                    >
                      <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                      {agent.name}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm px-2 py-2">
                    No agents found
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Tools Category */}
          <div className="px-2 mb-4">
            <button
              onClick={() => toggleCategory('Tools')}
              className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <span>Tools</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${
                  expandedCategories.includes('Tools') ? 'transform rotate-0' : 'transform rotate-180'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedCategories.includes('Tools') && (
              <div className="mt-1 pl-2 space-y-1">
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool, index) => {
                    // Get tool name, id and description from different possible formats
                    const toolName = typeof tool === 'string' 
                      ? tool 
                      : tool.name || tool.display_name || `Tool ${index + 1}`;
                    
                    const toolId = typeof tool === 'string' 
                      ? tool 
                      : tool.id || tool.name || `tool-${index}`;
                    
                    const toolDescription = typeof tool === 'string'
                      ? `Tool: ${tool}`
                      : tool.description || `Tool: ${toolName}`;
                    
                    return (
                      <div
                        key={`tool-${index}-${toolId}`}
                        className="flex items-center w-full px-2 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-grab"
                        draggable
                        onDragStart={(e) => handleDragStart(e, { 
                          id: toolId, 
                          name: toolName, 
                          description: toolDescription 
                        }, 'tool')}
                      >
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                        {toolName}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm px-2 py-2">
                    No tools found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="px-4 py-3 mt-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Drag agents and tools to the canvas to build your workflow. Connect nodes by dragging from the output handle to the input handle.
            </p>
          </div>
        </>
      )}
    </div>
  );
} 