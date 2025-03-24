"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import TopNavigationBar from '@/components/navigation/TopNavigationBar';
import Sidebar from '@/components/navigation/Sidebar';
import WorkflowSidebar from '@/components/workflow/WorkflowSidebar';
import AgentNode from '@/components/workflow/nodes/AgentNode';
import ToolNode from '@/components/workflow/nodes/ToolNode';
import OrchestratorPanel from '@/components/workflow/OrchestratorPanel';

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
};

export default function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [agents, setAgents] = useState([]);
  const [tools, setTools] = useState([]);
  const [orchestrators, setOrchestrators] = useState([]);
  const [selectedOrchestrator, setSelectedOrchestrator] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrchestratorForm, setShowOrchestratorForm] = useState(false);
  
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Fetch agents, tools and orchestrators
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch agents
        const agentsResponse = await fetch('http://localhost:8000/agents/');
        if (!agentsResponse.ok) throw new Error('Failed to fetch agents');
        const agentsData = await agentsResponse.json();
        setAgents(agentsData);
        
        // Fetch tools
        const toolsResponse = await fetch('http://localhost:8000/agents/tools/available');
        if (!toolsResponse.ok) throw new Error('Failed to fetch tools');
        const toolsData = await toolsResponse.json();
        setTools(toolsData);
        
        // Fetch orchestrators
        const orchestratorsResponse = await fetch('http://localhost:8000/orchestrators/');
        if (!orchestratorsResponse.ok) throw new Error('Failed to fetch orchestrators');
        const orchestratorsData = await orchestratorsResponse.json();
        setOrchestrators(orchestratorsData);
        
        if (orchestratorsData.length > 0) {
          await loadOrchestrator(orchestratorsData[0].id);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        // Use sample data as fallback
        setAgents([
          { id: 'agent1', name: 'ClickHouse Explorer', features: ['describe_table', 'run_query', 'show_tables'] },
          { id: 'agent2', name: 'Code Assistant', features: ['code_interpreter', 'git', 'file_management'] }
        ]);
        setTools([
          'describe_table', 'run_query', 'show_tables', 'code_interpreter', 'search_documentation'
        ]);
        setOrchestrators([
          { id: 'orch1', name: 'Database Analyzer', agents: ['agent1'], tools: ['search_documentation'] }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Load orchestrator
  const loadOrchestrator = async (orchestratorId) => {
    try {
      const response = await fetch(`http://localhost:8000/orchestrators/${orchestratorId}`);
      if (!response.ok) throw new Error(`Failed to load orchestrator: ${response.status}`);
      
      const data = await response.json();
      setSelectedOrchestrator(data);
      
      // Convert orchestrator data to nodes and edges
      const flowNodes = [];
      const flowEdges = [];
      
      // Add orchestrator node
      flowNodes.push({
        id: data.id,
        type: 'default',
        data: { label: data.name, type: 'orchestrator' },
        position: { x: 250, y: 5 },
        style: { 
          background: '#3B82F6', 
          color: 'white', 
          border: '1px solid #2563EB',
          borderRadius: '8px',
          padding: '10px',
          width: 180,
        }
      });
      
      // Add agent nodes
      if (data.agents && data.agents.length > 0) {
        data.agents.forEach((agentId, index) => {
          const agent = agents.find(a => a.id === agentId) || { id: agentId, name: `Agent ${index + 1}` };
          
          flowNodes.push({
            id: agentId,
            type: 'agent',
            data: { label: agent.name, id: agent.id, tools: agent.selected_tools || agent.features || [] },
            position: { x: 100 + index * 200, y: 150 }
          });
          
          // Connect orchestrator to agent
          flowEdges.push({
            id: `e-${data.id}-${agentId}`,
            source: data.id,
            target: agentId,
            animated: true,
            style: { stroke: '#3B82F6' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#3B82F6',
            },
          });
        });
      }
      
      // Add tool nodes
      if (data.tools && data.tools.length > 0) {
        data.tools.forEach((toolId, index) => {
          flowNodes.push({
            id: toolId,
            type: 'tool',
            data: { label: toolId },
            position: { x: 100 + index * 200, y: 300 }
          });
          
          // Connect orchestrator to tool
          flowEdges.push({
            id: `e-${data.id}-${toolId}`,
            source: data.id,
            target: toolId,
            animated: true,
            style: { stroke: '#10B981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#10B981',
            },
          });
        });
      }
      
      setNodes(flowNodes);
      setEdges(flowEdges);
      
    } catch (error) {
      console.error('Error loading orchestrator:', error);
      setError(error.message);
    }
  };
  
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#3B82F6' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#3B82F6',
      },
    }, eds));
  }, [setEdges]);
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const item = JSON.parse(event.dataTransfer.getData('application/reactflow/item'));
      
      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNode = {
        id: item.id,
        type,
        position,
        data: { label: item.name || item, ...item },
      };
      
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );
  
  // Save orchestrator changes
  const saveOrchestrator = async (orchestratorData) => {
    try {
      const url = orchestratorData.id 
        ? `http://localhost:8000/orchestrators/${orchestratorData.id}`
        : 'http://localhost:8000/orchestrators/';
      
      const method = orchestratorData.id ? 'PUT' : 'POST';
      
      // Extract agent and tool ids from nodes
      const agentIds = nodes
        .filter(node => node.type === 'agent')
        .map(node => node.id);
        
      const toolIds = nodes
        .filter(node => node.type === 'tool')
        .map(node => node.id);
        
      const payload = {
        ...orchestratorData,
        agents: agentIds,
        tools: toolIds
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${orchestratorData.id ? 'update' : 'create'} orchestrator`);
      }
      
      const data = await response.json();
      
      // Refresh orchestrators
      const orchestratorsResponse = await fetch('http://localhost:8000/orchestrators/');
      const orchestratorsData = await orchestratorsResponse.json();
      setOrchestrators(orchestratorsData);
      
      setSelectedOrchestrator(data);
      setShowOrchestratorForm(false);
      
      return data;
    } catch (error) {
      console.error('Error saving orchestrator:', error);
      throw error;
    }
  };
  
  // Run orchestrator
  const runOrchestrator = async (orchestratorId) => {
    try {
      const response = await fetch(`http://localhost:8000/orchestrators/${orchestratorId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: "Analyze the database and provide insights",
          prompt_field_values: {},
          save_history: true
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to run orchestrator: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Orchestrator run response:', data);
      
      // You could handle the response data here, perhaps showing it in a result panel
      
      return data;
    } catch (error) {
      console.error('Error running orchestrator:', error);
      throw error;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopNavigationBar />
        <div className="flex justify-center items-center h-full flex-1">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavigationBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar with agents and tools */}
        <WorkflowSidebar 
          agents={agents} 
          tools={tools} 
          orchestrators={orchestrators}
          selectedOrchestratorId={selectedOrchestrator?.id}
          onOrchestratorSelect={loadOrchestrator}
          onCreateOrchestrator={() => {
            setSelectedOrchestrator(null);
            setShowOrchestratorForm(true);
          }}
        />
        
        {/* Main workflow area */}
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 m-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
        
        {/* Right panel with orchestrator details */}
        {selectedOrchestrator && (
          <OrchestratorPanel 
            orchestrator={selectedOrchestrator} 
            onEdit={() => setShowOrchestratorForm(true)}
            onRun={() => runOrchestrator(selectedOrchestrator.id)}
          />
        )}
      </div>
      
      {/* Orchestrator form modal */}
      {showOrchestratorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] overflow-y-auto w-full max-w-2xl">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">
                {selectedOrchestrator?.id ? 'Edit Orchestrator' : 'Create Orchestrator'}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  id: selectedOrchestrator?.id,
                  name: formData.get('name'),
                  description: formData.get('description'),
                  system_prompt: formData.get('system_prompt'),
                };
                saveOrchestrator(data);
              }}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedOrchestrator?.name || ''}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    defaultValue={selectedOrchestrator?.description || ''}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Prompt
                  </label>
                  <textarea
                    name="system_prompt"
                    defaultValue={selectedOrchestrator?.system_prompt || ''}
                    rows={7}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-fira-code font-light text-base"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOrchestratorForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 