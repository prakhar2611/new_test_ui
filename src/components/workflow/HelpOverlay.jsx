"use client";

import { useEffect } from 'react';

export default function HelpOverlay({ onClose }) {
  // Handle escape key to close overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Workflow Builder Tutorial</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Getting Started */}
            <section>
              <h3 className="text-xl font-semibold mb-2">Getting Started</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                The Workflow Builder lets you visually create and configure orchestrators by connecting agents and tools together.
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Select an existing orchestrator from the sidebar or create a new one</li>
                  <li>Drag agents and tools from the sidebar onto the canvas</li>
                  <li>Connect components by dragging from one handle to another</li>
                  <li>Save your layout when you're satisfied with your design</li>
                  <li>Run the orchestrator to test its functionality</li>
                </ol>
              </div>
            </section>
            
            {/* Components */}
            <section>
              <h3 className="text-xl font-semibold mb-2">Understanding Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
                    >
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                    <h4 className="text-lg font-medium">Agents</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    These are the AI agents that process information and make decisions. They can connect to tools to extend their capabilities.
                  </p>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                    >
                      <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
                      <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
                    </svg>
                    <h4 className="text-lg font-medium">Tools</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Tools provide specific functionalities to agents, such as retrieving data, performing calculations, or interacting with external systems.
                  </p>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2"
                    >
                      <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875 4.03-4.875 9-4.875 9 2.183 9 4.875Z" />
                      <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z" />
                    </svg>
                    <h4 className="text-lg font-medium">Orchestrators</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Orchestrators define how agents and tools work together. They contain the system prompt and configuration for running the workflow.
                  </p>
                </div>
              </div>
            </section>
            
            {/* Features */}
            <section>
              <h3 className="text-xl font-semibold mb-2">Key Features</h3>
              <div className="space-y-3">
                <Feature 
                  title="Drag and Drop Interface" 
                  description="Easily build workflows by dragging components onto the canvas and connecting them visually."
                />
                <Feature 
                  title="Real-time Preview" 
                  description="See your workflow connections and structure as you build them."
                />
                <Feature 
                  title="Save Layouts" 
                  description="Save your canvas layouts to revisit and modify them later."
                />
                <Feature 
                  title="Run Orchestrators" 
                  description="Test your orchestrators directly from the workflow builder interface."
                />
                <Feature 
                  title="Customizable Properties" 
                  description="Edit orchestrator properties, system prompts, and connections."
                />
              </div>
            </section>
            
            {/* Tips and Tricks */}
            <section>
              <h3 className="text-xl font-semibold mb-2">Tips & Tricks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li><span className="font-medium">Delete:</span> Remove selected node</li>
                    <li><span className="font-medium">Ctrl+Z/Cmd+Z:</span> Undo last action</li>
                    <li><span className="font-medium">Ctrl+Y/Cmd+Y:</span> Redo action</li>
                    <li><span className="font-medium">Escape:</span> Close open dialogs</li>
                  </ul>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Best Practices</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>Group related components together visually</li>
                    <li>Use descriptive names for clarity</li>
                    <li>Test incrementally as you build</li>
                    <li>Save layouts frequently to prevent loss</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-black rounded-md hover:bg-blue-600 hover:text-white transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-1">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-4 h-4 text-blue-500 dark:text-blue-400"
        >
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
} 