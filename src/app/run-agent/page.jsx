"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNavigationBar from '@/components/navigation/TopNavigationBar';
import ReactMarkdown from 'react-markdown';
import { orchestratorApi } from '@/services/api';

export default function RunAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orchestratorId = searchParams.get('id');
  
  const [orchestrators, setOrchestrators] = useState([]);
  const [selectedOrchestrator, setSelectedOrchestrator] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isReceivingStream, setIsReceivingStream] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] = useState('');
  const [showExecutionFlow, setShowExecutionFlow] = useState(false);
  
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Custom styles for markdown content
  const markdownStyles = {
    prose: {
      maxWidth: '100% !important',
      overflowWrap: 'break-word',
      wordBreak: 'break-word'
    },
    pre: {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowX: 'auto',
      maxWidth: '100%'
    },
    code: {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }
  };

  // Fetch orchestrators on page load
  useEffect(() => {
    const fetchOrchestrators = async () => {
      try {
        setIsLoading(true);
        const data = await orchestratorApi.getAll();
        setOrchestrators(data);
        
        // If an ID is provided in the URL, select that orchestrator
        if (orchestratorId) {
          const orch = data.find(o => o.id === orchestratorId);
          if (orch) {
            setSelectedOrchestrator(orch);
            fetchOrchestratorDetails(orchestratorId);
          }
        }
      } catch (err) {
        console.error('Error fetching orchestrators:', err);
        setError('Failed to load orchestrators. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrchestrators();
    
    // Cleanup event source on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [orchestratorId]);
  
  // Fetch orchestrator details
  const fetchOrchestratorDetails = async (id) => {
    try {
      const details = await orchestratorApi.getById(id);
      setSelectedOrchestrator(details);
    } catch (err) {
      console.error(`Error fetching orchestrator details for ${id}:`, err);
      setError('Failed to load orchestrator details.');
    }
  };
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamMessage]);
  
  // Handle orchestrator selection
  const handleOrchestratorChange = (e) => {
    const id = e.target.value;
    if (id) {
      const orch = orchestrators.find(o => o.id === id);
      setSelectedOrchestrator(orch);
      fetchOrchestratorDetails(id);
      // Update URL without causing a page reload
      router.push(`/run-agent?id=${id}`, { scroll: false });
    } else {
      setSelectedOrchestrator(null);
      router.push('/run-agent', { scroll: false });
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !selectedOrchestrator) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: inputValue,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input field
    setInputValue('');
    
    try {
      // Start streaming
      startStreaming(userMessage.content);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Error: Failed to communicate with the orchestrator.',
          error: true,
        },
      ]);
    }
  };
  
  // Start SSE streaming
  const startStreaming = async (userInput) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Reset stream state
    setIsReceivingStream(true);
    setShowExecutionFlow(true);
    setCurrentStreamMessage('');
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const streamUrl = `${API_BASE_URL}/orchestrators/${selectedOrchestrator.id}/stream-sse`;
    
    // Create a custom fetch-based SSE implementation
    const fetchEventSource = async () => {
      try {
        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            user_input: userInput,
            save_history: true
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Get the response as a readable stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        // Track the current message being built up
        let currentMessage = '';
        let messageLog = '';
        
        // Function to process SSE chunks
        const processChunk = async () => {
          const { value, done } = await reader.read();
          
          if (done) {
            // Stream is complete
            console.log('Stream reader reached done state');
            setIsReceivingStream(false);
            
            // Add the complete message to the chat if it wasn't already added by a 'complete' event
            if (currentStreamMessage) {
              console.log('Adding accumulated message from done state:', currentStreamMessage);
              setMessages(prevMessages => [
                ...prevMessages,
                {
                  role: 'assistant',
                  content: currentStreamMessage,
                },
              ]);
              setCurrentStreamMessage('');
            }
            return;
          }
          
          // Decode the chunk and add it to our buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process any complete events in the buffer
          while (buffer.includes('\n\n')) {
            const eventEnd = buffer.indexOf('\n\n');
            const eventData = buffer.substring(0, eventEnd);
            buffer = buffer.substring(eventEnd + 2);
            
            // Process the event data
            if (eventData.startsWith('data: ')) {
              try {
                const jsonStr = eventData.substring(6); // Remove 'data: ' prefix
                const data = JSON.parse(jsonStr);
                
                // Debug the incoming data structure
                console.log('SSE event received:', data);
                
                // Handle different event types based on the streamingData.txt format
                if (data.type === 'start') {
                  // Stream started
                  console.log('Stream started');
                  messageLog += "▶️ Starting orchestrator\n\n";
                  setCurrentStreamMessage(messageLog);
                } 
                else if (data.type === 'agent_updated_stream_event') {
                  // Agent info events - persist this in the log
                  console.log('Agent updated:', data.new_agent);
                  messageLog += `👤 Agent updated: ${data.new_agent}\n\n`;
                  setCurrentStreamMessage(messageLog);
                } 
                else if (data.type === 'raw_response_event') {
                  // Raw response events with delta content
                  if (data.data && data.data.delta) {
                    // Accumulate message content from deltas
                    currentMessage += data.data.delta;
                    // For deltas, we don't add to the log - will be added as complete message at the end
                  } 
                  else if (data.data && data.data.item && data.data.item.type === "function_call") {
                    // Tool call being prepared
                    const toolCall = data.data.item;
                    messageLog += `🔧 Tool call: ${toolCall.name}\n`;
                    
                    try {
                      // Parse and pretty-print the arguments JSON if possible
                      const argsObj = JSON.parse(toolCall.arguments);
                      messageLog += "```\n" + JSON.stringify(argsObj, null, 2) + "\n```\n\n";
                    } catch (e) {
                      // If parsing fails, just show the raw arguments
                      messageLog += "```\n" + toolCall.arguments + "\n```\n\n";
                    }
                    
                    setCurrentStreamMessage(messageLog);
                  }
                  // Other raw_response_event types don't need specific handling for sequential output
                } 
                else if (data.type === 'run_item_stream_event') {
                  // Handle run item stream events, persisting their output
                  if (data.item && data.item.type === "tool_call_item") {
                    messageLog += `🛠️ Tool was called\n\n`;
                    setCurrentStreamMessage(messageLog);
                  } 
                  else if (data.item && data.item.type === "tool_call_output_item") {
                    const output = data.item.output || "No output";
                    messageLog += `📄 Tool output:\n`;
                    messageLog += "```\n" + output + "\n```\n\n";
                    setCurrentStreamMessage(messageLog);
                  } 
                  else if (data.item && data.item.type === "message_output_item") {
                    // For message outputs, we persist them directly
                    messageLog += `💬 Message output:\n`;
                    if (data.item.text) {
                      messageLog += data.item.text + "\n\n";
                    } else {
                      messageLog += "(Empty message)\n\n";
                    }
                    setCurrentStreamMessage(messageLog);
                  }
                  else if (data.name === "message_output_created" || 
                           data.name === "tool_called" || 
                           data.name === "tool_output") {
                    // Handle the event name format
                    if (data.name === "message_output_created") {
                      messageLog += `📝 Message created\n\n`;
                    } else if (data.name === "tool_called") {
                      messageLog += `🔨 Tool called\n\n`;
                    } else if (data.name === "tool_output") {
                      messageLog += `📊 Tool output received:\n`;
                      if (data.item && data.item.output) {
                        messageLog += "```\n" + data.item.output + "\n```\n\n";
                      } else {
                        messageLog += "(No output)\n\n";
                      }
                    }
                    setCurrentStreamMessage(messageLog);
                  }
                } 
                else if (data.type === 'complete') {
                  messageLog = handleCompletionEvent(data, messageLog);
                } else if (data.type === 'end') {
                  // Stream ended without final output
                  console.log('Stream ended');
                  
                  // Add end marker
                  messageLog += `\n⏹️ Stream ended\n\n`;
                  setCurrentStreamMessage(messageLog);
                  
                  // Finalize the accumulated message in the chat without clearing the flow
                  if (currentMessage) {
                    setTimeout(() => {
                      setMessages(prevMessages => [
                        ...prevMessages,
                        {
                          role: 'assistant',
                          content: currentMessage,
                        },
                      ]);
                      // Keep the execution flow visible
                      setIsReceivingStream(false);
                    }, 1500);
                  }
                }
              } catch (error) {
                console.error('Error parsing SSE data:', error, eventData);
              }
            }
          }
          
          // Continue reading
          processChunk();
        };
        
        // Start processing the stream
        processChunk();
        
        // Store a way to abort the fetch
        const controller = new AbortController();
        eventSourceRef.current = {
          close: () => controller.abort()
        };
        
      } catch (error) {
        console.error('SSE error:', error);
        setIsReceivingStream(false);
        
        // If we have a partial message, add it to the messages
        if (currentStreamMessage) {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              role: 'assistant',
              content: currentStreamMessage,
            },
          ]);
          setCurrentStreamMessage('');
        } else {
          // Add an error message if we have no content at all
          setMessages(prevMessages => [
            ...prevMessages,
            {
              role: 'assistant',
              content: 'Error: The connection was lost. Please try again.',
              error: true,
            },
          ]);
        }
      }
    };
    
    // Start the streaming
    fetchEventSource();
  };
  
  const handleCompletionEvent = (data, messageLog) => {
    console.log('Stream complete event received:', data);
    
    // For the final message, add a completion marker
    messageLog += `\n✅ Complete\n\n`;
    
    // Add the message log to the streaming view - keep it visible
    setCurrentStreamMessage(messageLog);
    
    // Keep the message log visible but don't display as "typing"
    setIsReceivingStream(false);
    
    // Extract the final content if needed
    let finalContent = '';
    if (currentMessage) {
      finalContent = currentMessage;
    }
    
    // Add the final answer to the chat after a small delay
    if (finalContent) {
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant',
            content: finalContent,
          },
        ]);
      }, 500);
    } else {
      console.warn('No final content available in complete event');
    }
    
    return messageLog;
  };

  return (
    <div className="flex flex-col h-screen">
      <TopNavigationBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Run Agent</h2>
            
            <div className="mb-6">
              <label htmlFor="orchestrator-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Orchestrator
              </label>
              <select
                id="orchestrator-select"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={selectedOrchestrator?.id || ''}
                onChange={handleOrchestratorChange}
                disabled={isLoading}
              >
                <option value="">Select an orchestrator</option>
                {orchestrators.map(orch => (
                  <option key={orch.id} value={orch.id}>
                    {orch.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedOrchestrator && (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Properties</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ID</span>
                      <span className="text-sm font-medium truncate max-w-[60%]">{selectedOrchestrator.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Agents</span>
                      <span className="text-sm font-medium">{selectedOrchestrator.agents?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tools</span>
                      <span className="text-sm font-medium">{selectedOrchestrator.tools?.length || 0}</span>
                    </div>
                  </div>
                </div>
                
                {selectedOrchestrator.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedOrchestrator.description}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">System Prompt</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                    <div className="font-fira-code font-light text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedOrchestrator.system_prompt || 'No system prompt defined.'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0a]">
          {/* Messages container */}
          <div className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 && !isReceivingStream ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 mb-4 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                  >
                    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                    <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Chat with an Orchestrator</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                  {selectedOrchestrator
                    ? "Ask a question or provide instructions to interact with the selected orchestrator."
                    : "Select an orchestrator from the sidebar to start a conversation."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.length > 0 && (
                  <div className="flex justify-center my-2">
                    <button
                      onClick={() => setShowExecutionFlow(!showExecutionFlow)}
                      className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-3 rounded-full flex items-center gap-1 transition-colors"
                    >
                      {showExecutionFlow ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Hide Execution Flow
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Show Execution Flow
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-lg p-4 overflow-hidden ${
                        message.role === 'user'
                          ? 'bg-primary text-black'
                          : message.error
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none break-words overflow-hidden" style={markdownStyles.prose}>
                          <ReactMarkdown components={{
                            pre: props => <pre style={markdownStyles.pre} {...props} />,
                            code: props => <code style={markdownStyles.code} {...props} />
                          }}>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {currentStreamMessage && showExecutionFlow && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] rounded-lg p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`${isReceivingStream ? 'animate-pulse' : ''} bg-blue-400 dark:bg-blue-600 h-2 w-2 rounded-full`}></div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex justify-between w-full">
                          <span>Execution Flow</span>
                          <button 
                            onClick={() => setShowExecutionFlow(false)} 
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                            title="Hide execution flow"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="prose dark:prose-invert max-w-none text-sm overflow-auto break-words font-mono" style={{
                        ...markdownStyles.prose,
                        maxHeight: '400px',
                        paddingRight: '8px'
                      }}>
                        <ReactMarkdown components={{
                          pre: props => <pre style={markdownStyles.pre} {...props} />,
                          code: props => <code style={markdownStyles.code} {...props} />
                        }}>{currentStreamMessage}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                disabled={!selectedOrchestrator || isReceivingStream}
                placeholder={selectedOrchestrator ? "Type a message..." : "Select an orchestrator to start..."}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!selectedOrchestrator || !inputValue.trim() || isReceivingStream}
                className="p-3 bg-primary text-black rounded-md hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReceivingStream ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}