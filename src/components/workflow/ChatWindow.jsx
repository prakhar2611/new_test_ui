"use client";

import { useState, useRef, useEffect } from 'react';

export default function ChatWindow({ orchestrator, onRun, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Add a welcome message when component mounts
  useEffect(() => {
    if (orchestrator) {
      setMessages([{
        role: 'system',
        content: `Welcome to the ${orchestrator.name} orchestrator! Send a message to test it. Currently this doesn't support prompt caching.`
      }]);
      
      // Focus the input field when the component mounts
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [orchestrator]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Run the orchestrator with the user input
      const result = await onRun(orchestrator.id, input);
      
      // Add orchestrator response
      const responseMessage = { 
        role: 'assistant', 
        content: result.response || "Orchestrator ran successfully but returned no response."
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      // Add error message
      const errorMessage = { 
        role: 'system', 
        content: `Error: ${error.message || "Failed to get response from orchestrator."}` 
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  if (!orchestrator) return null;
  
  return (
    <div className="w-1/4 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center bg-primary/10">
        <div>
          <h2 className="text-lg font-semibold">Test Orchestrator</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{orchestrator.name}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400 max-w-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
              >
                <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
              </svg>
              <p>Start a conversation with the orchestrator to test its functionality.</p>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`${
              message.role === 'user' 
                ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' 
                : message.role === 'system'
                  ? 'bg-gray-50 dark:bg-gray-800'
                  : 'bg-green-50 dark:bg-green-900/20 mr-8'
            } p-3 rounded-lg`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-2">
                {message.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : message.role === 'system' ? (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {message.role === 'user' 
                    ? 'You' 
                    : message.role === 'system'
                      ? 'System'
                      : 'Orchestrator'}
                </div>
                <div className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-end">
          <div className="flex-1 relative">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:text-white resize-none"
              placeholder="Type a message..."
              rows="3"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              ref={inputRef}
            />
          </div>
          <button
            className="ml-2 px-4 py-2 bg-primary text-black rounded-md hover:bg-blue-600 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 