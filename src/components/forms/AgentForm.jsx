"use client";

import { useState } from 'react';

export default function AgentForm({ onSubmit, onCancel, initialData = {}, availableTools = [] }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    system_prompt: initialData.system_prompt || '',
    additional_prompt: initialData.additional_prompt || '',
    selected_tools: initialData.selected_tools || [],
    handoff: initialData.handoff || false,
    prompt_fields: initialData.prompt_fields || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleToolToggle = (toolName) => {
    setFormData(prev => {
      const tools = [...prev.selected_tools];
      if (tools.includes(toolName)) {
        return { ...prev, selected_tools: tools.filter(t => t !== toolName) };
      } else {
        return { ...prev, selected_tools: [...tools, toolName] };
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSubmit(formData);
      // Success - form will be closed by the parent component
    } catch (err) {
      setError(err.message || 'Failed to save agent');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-lg max-w-2xl w-full mx-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">{initialData.id ? 'Edit Agent' : 'Create New Agent'}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          {/* System Prompt */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              System Prompt
            </label>
            <textarea
              name="system_prompt"
              value={formData.system_prompt}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          {/* Additional Prompt */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Prompt
            </label>
            <textarea
              name="additional_prompt"
              value={formData.additional_prompt}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* Tools */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tools
            </label>
            <div className="max-h-40 overflow-y-auto p-3 border border-gray-300 dark:border-gray-700 rounded-md grid grid-cols-2 gap-2">
              {availableTools.length > 0 ? (
                availableTools.map(tool => (
                  <div key={tool.name || tool} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`tool-${tool.name || tool}`}
                      checked={formData.selected_tools.includes(tool.name || tool)}
                      onChange={() => handleToolToggle(tool.name || tool)}
                      className="h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor={`tool-${tool.name || tool}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {tool.display_name || tool.name || tool}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-2">
                  No tools available
                </div>
              )}
            </div>
          </div>
          
          {/* Handoff Toggle */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="handoff"
                name="handoff"
                checked={formData.handoff}
                onChange={handleChange}
                className="h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="handoff" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Enable handoff to human
              </label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-75"
            >
              {isSubmitting ? 'Saving...' : 'Save Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 