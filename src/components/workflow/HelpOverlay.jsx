"use client";

import { useState } from 'react';

export default function HelpOverlay({ onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Workflow Builder Guide
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
          
          <div className="mb-6">
            {step === 1 && (
              <div>
                <div className="mb-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                    >
                      <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875 4.03-4.875 9-4.875 9 2.183 9 4.875Z" />
                      <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Welcome to the Workflow Builder
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The Workflow Builder allows you to create, visualize, and manage agent orchestrations. Create complex flows by connecting agents and tools in a visual canvas.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Key Features:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Create and edit orchestrators</li>
                    <li>Drag and drop agents and tools</li>
                    <li>Connect components to build workflows</li>
                    <li>Save and load workflow layouts</li>
                    <li>Run orchestrators to test workflows</li>
                  </ul>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div>
                <div className="mb-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-blue-600 dark:text-blue-400"
                    >
                      <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    The Sidebar
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The sidebar on the left contains all the components you can use to build your workflow.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Sidebar Sections:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>
                      <span className="font-medium">Orchestrators</span>: Select an existing orchestrator to edit or create a new one
                    </li>
                    <li>
                      <span className="font-medium">Agents</span>: Drag agents to the canvas to add them to your workflow
                    </li>
                    <li>
                      <span className="font-medium">Tools</span>: Drag tools to the canvas to add them to your workflow
                    </li>
                    <li>
                      <span className="font-medium">Search</span>: Filter components by name using the search box
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div>
                <div className="mb-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                    >
                      <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
                      <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Building Your Workflow
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Use the canvas to build your workflow by connecting agents and tools.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Steps to Build a Workflow:</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Select or create an orchestrator from the sidebar</li>
                    <li>Drag agents and tools from the sidebar to the canvas</li>
                    <li>Connect components by clicking and dragging from one handle to another</li>
                    <li>Arrange nodes by dragging them around the canvas</li>
                    <li>Click the "Save Layout" button to save your workflow layout</li>
                    <li>Use the controls in the bottom-left to zoom and pan the canvas</li>
                  </ol>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div>
                <div className="mb-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-purple-600 dark:text-purple-400"
                    >
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Testing and Running Orchestrators
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  After building your workflow, you can test and run it to see how it performs.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Running Your Workflow:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Click the "Run" button in the right panel to execute the orchestrator</li>
                    <li>View the output in the response section of the panel</li>
                    <li>Edit the orchestrator properties by clicking the "Edit" button</li>
                    <li>Modify the system prompt to change how the orchestrator behaves</li>
                  </ul>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded border-l-4 border-yellow-400 dark:border-yellow-600">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <strong>Tip:</strong> Make sure to save your workflow layout before running an orchestrator to ensure all connections are preserved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium focus:outline-none ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    i + 1 === step ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-primary text-black rounded-md shadow-sm text-sm font-medium hover:bg-blue-600 hover:text-white focus:outline-none"
            >
              {step === totalSteps ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 