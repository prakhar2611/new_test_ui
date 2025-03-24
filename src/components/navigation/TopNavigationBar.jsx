"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function TopNavigationBar() {
  const [selectedItem, setSelectedItem] = useState('agents');
  
  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
      {/* Left side - Logo and title */}
      <div className="flex items-center space-x-3">
        <div className="text-primary font-bold text-xl">Quantum</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
          An interactive demo for developers to try the new agent & orchestrator developer tool.
        </div>
      </div>
      
      {/* Center - Main navigation */}
      <nav className="hidden md:flex space-x-6">
        <NavItem 
          name="Agents" 
          isSelected={selectedItem === 'agents'} 
          onClick={() => setSelectedItem('agents')} 
        />
        <NavItem 
          name="Workflows" 
          isSelected={selectedItem === 'workflows'} 
          onClick={() => setSelectedItem('workflows')} 
        />
        <NavItem 
          name="Tests" 
          isSelected={selectedItem === 'tests'} 
          onClick={() => setSelectedItem('tests')} 
        />
        <NavItem 
          name="Analytics" 
          isSelected={selectedItem === 'analytics'} 
          onClick={() => setSelectedItem('analytics')} 
        />
      </nav>
      
      {/* Right side - User settings and theme toggle */}
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}

function NavItem({ name, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm transition-colors ${
        isSelected 
          ? 'text-primary font-semibold' 
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
      }`}
    >
      {name}
    </button>
  );
} 