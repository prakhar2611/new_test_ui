"use client";

import { useState } from 'react';

const sidebarItems = [
  {
    category: 'Tools',
    items: [
      { id: 'web-browser', name: 'Web Browser', description: 'Enables the agent to search and retrieve information from the web.' },
      { id: 'code-interpreter', name: 'Code Interpreter', description: 'Allows the agent to write and execute code to solve problems.' },
      { id: 'image-generation', name: 'Image Generation', description: 'Generates images based on text descriptions using AI models.' },
      { id: 'file-management', name: 'File Management', description: 'Allows the agent to read, write, and manage files.' },
      { id: 'describe-table', name: 'Describe Table', description: 'Provides detailed information about database table structure.' },
      { id: 'run-query', name: 'Run Query', description: 'Executes SQL queries against the database and returns results.' },
      { id: 'show-tables', name: 'Show Tables', description: 'Lists all tables available in the current database.' },
      { id: 'show-databases', name: 'Show Databases', description: 'Lists all available databases in the system.' },
    ]
  }
];

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['Tools']); // Tools expanded by default
  const [selectedTool, setSelectedTool] = useState(null);
  
  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };
  
  const filteredItems = sidebarItems.map(category => {
    return {
      ...category,
      items: category.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
  }).filter(category => category.items.length > 0);

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
  };
  
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-full overflow-y-auto">
      {/* Search input */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tools..."
            className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:text-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-2 top-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Categories and items */}
      <div className="px-2">
        {filteredItems.map((category) => (
          <div key={category.category} className="mb-4">
            <button
              onClick={() => toggleCategory(category.category)}
              className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <span>{category.category}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${
                  expandedCategories.includes(category.category) ? 'transform rotate-0' : 'transform rotate-180'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedCategories.includes(category.category) && (
              <div className="mt-1 pl-2 space-y-1">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    className="flex items-center w-full px-2 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    onClick={() => handleToolClick(item)}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tool info modal */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTool(null)}>
          <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-lg max-w-md w-full mx-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedTool.name}</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setSelectedTool(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">{selectedTool.description}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Usage</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                <code className="text-sm font-mono">agent.use('{selectedTool.id}')</code>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                onClick={() => setSelectedTool(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 