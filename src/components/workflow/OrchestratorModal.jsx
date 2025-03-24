"use client";

import { useState, useEffect } from 'react';

export default function OrchestratorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  orchestrator = null,
  isCreating = false,
  agents = [],
  tools = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    agents: [],
    tools: []
  });
  
  // Initialize form with orchestrator data when editing
  useEffect(() => {
    if (orchestrator && !isCreating) {
      setFormData({
        name: orchestrator.name || '',
        description: orchestrator.description || '',
        system_prompt: orchestrator.system_prompt || '',
        agents: orchestrator.agents || [],
        tools: orchestrator.tools || []
      });
    } else {
      // Reset form for new orchestrator
      setFormData({
        name: '',
        description: '',
        system_prompt: '',
        agents: [],
        tools: []
      });
    }
  }, [orchestrator, isCreating]);
  
  // Update form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle agent selection
  const handleAgentToggle = (agentId) => {
    setFormData(prev => {
      const isSelected = prev.agents.includes(agentId);
      return {
        ...prev,
        agents: isSelected 
          ? prev.agents.filter(id => id !== agentId) 
          : [...prev.agents, agentId]
      };
    });
  };
  
  // Handle tool selection
  const handleToolToggle = (toolId) => {
    setFormData(prev => {
      const isSelected = prev.tools.includes(toolId);
      return {
        ...prev,
        tools: isSelected 
          ? prev.tools.filter(id => id !== toolId) 
          : [...prev.tools, toolId]
      };
    });
  };
  
  // Submit form data
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    
    // Create a new orchestrator or update existing
    const result = {
      ...orchestrator,
      ...formData,
      // If creating new, generate a new ID
      id: orchestrator?.id || `orch-${Date.now()}`,
    };
    
    onSave(result);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isCreating ? 'Create Orchestrator' : 'Edit Orchestrator'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Name field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter orchestrator name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              {/* Description field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter orchestrator description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* System Prompt field */}
              <div>
                <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  System Prompt
                </label>
                <textarea
                  id="system_prompt"
                  name="system_prompt"
                  value={formData.system_prompt}
                  onChange={handleChange}
                  placeholder="Enter system prompt"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white font-fira-code text-sm"
                />
              </div>
              
              {/* Agents selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Available Agents
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 max-h-48 overflow-y-auto">
                  {agents.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-2">No agents available</p>
                  ) : (
                    <ul className="space-y-1">
                      {agents.map(agent => (
                        <li key={agent.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`agent-${agent.id}`}
                            checked={formData.agents.includes(agent.id)}
                            onChange={() => handleAgentToggle(agent.id)}
                            className="h-4 w-4 rounded text-primary focus:ring-primary mr-2"
                          />
                          <label 
                            htmlFor={`agent-${agent.id}`}
                            className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer flex-grow"
                          >
                            {agent.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Selected agents: {formData.agents.length}
                </p>
              </div>
              
              {/* Tools selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Available Tools
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 max-h-48 overflow-y-auto">
                  {tools.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-2">No tools available</p>
                  ) : (
                    <ul className="space-y-1">
                      {tools.map(tool => (
                        <li key={tool.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`tool-${tool.id}`}
                            checked={formData.tools.includes(tool.id)}
                            onChange={() => handleToolToggle(tool.id)}
                            className="h-4 w-4 rounded text-primary focus:ring-primary mr-2"
                          />
                          <label 
                            htmlFor={`tool-${tool.id}`}
                            className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer flex-grow"
                          >
                            {tool.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Selected tools: {formData.tools.length}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-black rounded-md shadow-sm text-sm font-medium hover:bg-blue-600 hover:text-white focus:outline-none"
              >
                {isCreating ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 