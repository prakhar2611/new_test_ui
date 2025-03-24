"use client";

import { useState } from 'react';

const sidebarItems = [
  {
    category: 'Agents',
    items: [
      { id: 'alloy', name: 'Alloy' },
      { id: 'ash', name: 'Ash' },
      { id: 'ballad', name: 'Ballad' },
      { id: 'coral', name: 'Coral' },
      { id: 'echo', name: 'Echo' },
    ]
  },
  {
    category: 'Tools',
    items: [
      { id: 'web-browser', name: 'Web Browser' },
      { id: 'code-interpreter', name: 'Code Interpreter' },
      { id: 'image-generation', name: 'Image Generation' },
      { id: 'file-management', name: 'File Management' },
    ]
  },
  {
    category: 'Flow Control',
    items: [
      { id: 'condition', name: 'Condition' },
      { id: 'loop', name: 'Loop' },
      { id: 'parallel', name: 'Parallel' },
    ]
  }
];

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    sidebarItems.map(category => category.category)
  );
  
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
    </div>
  );
} 