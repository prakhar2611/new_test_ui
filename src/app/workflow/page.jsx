"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import WorkflowSidebar from '@/components/workflow/WorkflowSidebar';
import OrchestratorPanel from '@/components/workflow/OrchestratorPanel';
import AgentNode from '@/components/workflow/nodes/AgentNode';
import ToolNode from '@/components/workflow/nodes/ToolNode';
import OrchestratorNode from '@/components/workflow/nodes/OrchestratorNode';
import CustomEdge from '@/components/workflow/edges/CustomEdge';
import OrchestratorModal from '@/components/workflow/OrchestratorModal';
import HelpOverlay from '@/components/workflow/HelpOverlay';
import TopNavigationBar from '@/components/navigation/TopNavigationBar';
import useOrchestratorData from '@/hooks/useOrchestratorData';

// Define node and edge types outside the component
const NODE_TYPES = {
  agent: AgentNode,
  tool: ToolNode,
  orchestrator: OrchestratorNode,
};

// Edge types registration
const EDGE_TYPES = {
  custom: CustomEdge,
};

// Default edge options
const defaultEdgeOptions = {
  type: 'custom',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
  },
  style: {
    strokeWidth: 2,
    stroke: '#6366f1',
  },
  animated: true,
};

export default function WorkflowPage() {
  // State for selected orchestrator
  const [selectedOrchestratorId, setSelectedOrchestratorId] = useState(null);
  
  // Use our custom hook to get data
  const {
    agents,
    tools,
    orchestrators,
    orchestratorDetails,
    isLoading,
    error,
    saveOrchestrator,
    deleteOrchestrator,
    runOrchestrator,
  } = useOrchestratorData(selectedOrchestratorId);
  
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Reference to the ReactFlow wrapper and instance
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // State for tracking whether a node is being dragged
  const [isDragging, setIsDragging] = useState(false);
  
  // State for orchestrator modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Reference to store layout data for orchestrators
  const [orchestratorLayouts, setOrchestratorLayouts] = useState({});
  
  // State for help overlay
  const [showHelp, setShowHelp] = useState(false);

  // Use memoized node and edge types
  const nodeTypes = useMemo(() => NODE_TYPES, []);
  const edgeTypes = useMemo(() => EDGE_TYPES, []);

  // Set the first orchestrator as selected when data loads
  useEffect(() => {
    if (orchestrators.length > 0 && !selectedOrchestratorId) {
      setSelectedOrchestratorId(orchestrators[0].id);
    }
  }, [orchestrators, selectedOrchestratorId]);
  
  // Load layout when an orchestrator is selected
  useEffect(() => {
    if (selectedOrchestratorId && orchestratorLayouts[selectedOrchestratorId]) {
      const layout = orchestratorLayouts[selectedOrchestratorId];
      setNodes(layout.nodes || []);
      setEdges(layout.edges || []);
    } else if (selectedOrchestratorId && orchestratorDetails) {
      // Clear the canvas and create nodes from orchestrator details
      const newNodes = [];
      const newEdges = [];
      
      // Add agent nodes if they exist
      if (orchestratorDetails.agents && orchestratorDetails.agents.length > 0) {
        orchestratorDetails.agents.forEach((agentId, index) => {
          const agent = agents.find(a => a.id === agentId);
          if (agent) {
            // Create agent node
            newNodes.push({
              id: `agent-${agentId}`,
              type: 'agent',
              position: { x: 100, y: 100 + (index * 150) },
              data: { 
                ...agent,
                label: agent.name 
              },
            });
          }
        });
      }
      
      // Add tool nodes if they exist
      if (orchestratorDetails.tools && orchestratorDetails.tools.length > 0) {
        orchestratorDetails.tools.forEach((toolId, index) => {
          const tool = tools.find(t => t.id === toolId);
          if (tool) {
            // Create tool node
            newNodes.push({
              id: `tool-${toolId}`,
              type: 'tool',
              position: { x: 400, y: 100 + (index * 150) },
              data: { 
                ...tool,
                label: tool.name 
              },
            });
          }
        });
      }
      
      // Add edges between agents and tools (simple implementation)
      if (orchestratorDetails.agents && orchestratorDetails.agents.length > 0 && 
          orchestratorDetails.tools && orchestratorDetails.tools.length > 0) {
        
        orchestratorDetails.agents.forEach(agentId => {
          orchestratorDetails.tools.forEach(toolId => {
            // Make sure we have valid IDs for edge creation
            if (agentId && toolId) {
              newEdges.push({
                id: `edge-${agentId}-${toolId}`,
                source: `agent-${agentId}`,
                target: `tool-${toolId}`,
                type: 'custom',
                data: { label: 'uses' }
              });
            }
          });
        });
      }
      
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [selectedOrchestratorId, orchestratorLayouts, orchestratorDetails, agents, tools, setNodes, setEdges]);
  
  // Save current layout to selected orchestrator
  const saveCurrentLayout = useCallback(() => {
    if (!selectedOrchestratorId) {
      alert('Please select an orchestrator first');
      return;
    }
    
    setOrchestratorLayouts(prev => ({
      ...prev,
      [selectedOrchestratorId]: {
        nodes,
        edges
      }
    }));
    
    // Show success message
    alert('Layout saved successfully');
  }, [selectedOrchestratorId, nodes, edges]);
  
  // Handle node connections
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [setEdges]);
  
  // Handle ReactFlow instance initialization
  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);
  
  // Handle dropping elements onto the canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      // Reset dragging state
      setIsDragging(false);
      
      if (!reactFlowInstance || !reactFlowWrapper.current) return;
      
      try {
        // Get the bounding rectangle of the flow wrapper
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        
        // Extract the data from the drag event
        const type = event.dataTransfer.getData('application/reactflow/type');
        
        if (!type) {
          console.warn('No type found in drag data');
          return;
        }
        
        // Parse the item data, with error handling
        let item;
        try {
          const itemData = event.dataTransfer.getData('application/reactflow/item');
          item = JSON.parse(itemData);
        } catch (err) {
          console.error('Error parsing drag data:', err);
          return;
        }
        
        if (!item || !item.id) {
          console.warn('Invalid item data in drag event');
          return;
        }
        
        // Calculate the position where the element was dropped
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        
        // Create a new node
        const newNode = {
          id: `${type}-${item.id}`, // Use the actual ID for better connections
          type,
          position,
          data: { 
            ...item,
            label: item.name || `${type.charAt(0).toUpperCase() + type.slice(1)}` 
          },
        };
        
        // Add the new node to the canvas
        setNodes((nds) => nds.concat(newNode));
      } catch (err) {
        console.error('Error handling drop event:', err);
      }
    },
    [reactFlowInstance, setNodes]
  );
  
  // Handle drag over event
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Handle drag start event from sidebar
  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  // Create a new orchestrator
  const handleCreateOrchestrator = useCallback(() => {
    setIsCreating(true);
    setIsModalOpen(true);
  }, []);
  
  // Edit the selected orchestrator
  const handleEditOrchestrator = useCallback(() => {
    setIsCreating(false);
    setIsModalOpen(true);
  }, []);
  
  // Save orchestrator data
  const handleSaveOrchestrator = useCallback(async (data) => {
    try {
      const savedOrchestrator = await saveOrchestrator(data);
      if (isCreating) {
        setSelectedOrchestratorId(savedOrchestrator.id);
      }
    } catch (error) {
      console.error('Error saving orchestrator:', error);
      alert('Failed to save orchestrator. Please try again.');
    }
  }, [isCreating, saveOrchestrator]);
  
  // Run the selected orchestrator
  const handleRunOrchestrator = useCallback(async (id, input = "Run the workflow", saveHistory = true) => {
    const orchestratorId = id || selectedOrchestratorId;
    if (!orchestratorId) return;
    
    try {
      const result = await runOrchestrator(orchestratorId, input, {}, saveHistory);
      return {
        response: result.response || "Orchestrator ran successfully.",
        success: true
      };
    } catch (error) {
      console.error('Error running orchestrator:', error);
      return {
        response: `Error: ${error.message}`,
        success: false
      };
    }
  }, [selectedOrchestratorId, runOrchestrator]);
  
  return (
    <div className="flex flex-col h-screen">
      <TopNavigationBar />
      
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar for draggable components */}
        <WorkflowSidebar
          agents={agents}
          tools={tools}
          orchestrators={orchestrators}
          selectedOrchestratorId={selectedOrchestratorId}
          onOrchestratorSelect={setSelectedOrchestratorId}
          onCreateOrchestrator={handleCreateOrchestrator}
          onDragStart={onDragStart}
          isLoading={isLoading}
        />
        
        {/* Main Flow Canvas */}
        <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg shadow-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-300">{error}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              minZoom={0.1}
              maxZoom={2}
              attributionPosition="bottom-left"
            >
              <Controls />
              <Background color="#aaa" gap={16} />
              
              {/* Help Button */}
              <Panel position="top-left">
                <button
                  onClick={() => setShowHelp(true)}
                  className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Show Help"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </Panel>
              
              {/* Welcome Message when no orchestrator selected */}
              {!selectedOrchestratorId && !isLoading && (
                <Panel position="center">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                      >
                        <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875 4.03-4.875 9-4.875 9 2.183 9 4.875Z" />
                        <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z" />
                        <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 15.914 9.315 16.5 12 16.5Z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Welcome to Workflow Builder</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Create or select an orchestrator from the sidebar to start building your agent workflow.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleCreateOrchestrator}
                        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-black rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5 mr-2"
                        >
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Create New Orchestrator
                      </button>
                      <button
                        onClick={() => setShowHelp(true)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5 mr-2"
                        >
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        View Tutorial
                      </button>
                    </div>
                  </div>
                </Panel>
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <Panel position="center">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading workflow data...</p>
                  </div>
                </Panel>
              )}
              
              <Panel position="top-right">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md">
                  <h3 className="text-sm font-medium mb-2">
                    {orchestratorDetails ? `Editing: ${orchestratorDetails.name}` : 'Select an orchestrator'}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 text-xs bg-primary text-black rounded hover:bg-blue-600 hover:text-white transition-colors"
                      onClick={saveCurrentLayout}
                      disabled={!selectedOrchestratorId}
                    >
                      Save Layout
                    </button>
                    <button
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => {
                        setNodes([]);
                        setEdges([]);
                      }}
                    >
                      Clear Canvas
                    </button>
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        
        {/* Orchestrator Details Panel */}
        {orchestratorDetails && (
          <OrchestratorPanel
            orchestrator={orchestratorDetails}
            onEdit={handleEditOrchestrator}
            onRun={handleRunOrchestrator}
          />
        )}
        
        {/* Orchestrator Modal */}
        <OrchestratorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOrchestrator}
          orchestrator={!isCreating ? orchestratorDetails : null}
          isCreating={isCreating}
          agents={agents}
          tools={tools}
        />
        
        {/* Help Overlay */}
        {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      </div>
    </div>
  );
} 