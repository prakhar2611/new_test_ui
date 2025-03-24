"use client";

import { useState, useEffect } from 'react';
import { agentApi, orchestratorApi, toolsApi } from '@/services/api';

export default function useOrchestratorData(selectedOrchestratorId) {
  const [agents, setAgents] = useState([]);
  const [tools, setTools] = useState([]);
  const [orchestrators, setOrchestrators] = useState([]);
  const [orchestratorDetails, setOrchestratorDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [agentsData, toolsData, orchestratorsData] = await Promise.all([
          agentApi.getAll(),
          toolsApi.getAll(),
          orchestratorApi.getAll()
        ]);
        
        // Format agents for display
        const formattedAgents = agentsData.map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.additional_prompt || agent.system_prompt.slice(0, 100),
          system_prompt: agent.system_prompt,
          type: 'agent'
        }));
        
        // Format tools for display with improved error handling
        let formattedTools = [];
        try {
          if (Array.isArray(toolsData)) {
            formattedTools = toolsData.map((tool, index) => {
              // Handle string tools
              if (typeof tool === 'string') {
                return {
                  id: tool,
                  name: tool,
                  description: `Tool: ${tool}`,
                  type: 'tool'
                };
              }
              
              // Handle object tools
              if (tool && typeof tool === 'object') {
                return {
                  id: tool.name || tool.id || `tool-${index}`,
                  name: tool.display_name || tool.name || `Tool ${index + 1}`,
                  description: tool.description || `Tool with ID: ${tool.id || tool.name || index}`,
                  type: 'tool'
                };
              }
              
              // Default fallback for unexpected formats
              return {
                id: `tool-${index}`,
                name: `Tool ${index + 1}`,
                description: `Unknown tool format`,
                type: 'tool'
              };
            });
          } else if (toolsData && typeof toolsData === 'object') {
            // Handle tools data provided as an object with key/value pairs
            formattedTools = Object.entries(toolsData).map(([id, tool], index) => ({
              id: id || `tool-${index}`,
              name: tool.display_name || tool.name || id || `Tool ${index + 1}`,
              description: tool.description || `Tool: ${id}`,
              type: 'tool'
            }));
          } else {
            console.warn('Unexpected tools data format:', toolsData);
            formattedTools = [];
          }
        } catch (err) {
          console.error('Error formatting tools:', err);
          formattedTools = [];
        }
        
        setAgents(formattedAgents);
        setTools(formattedTools);
        setOrchestrators(orchestratorsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // Fetch orchestrator details when selected
  useEffect(() => {
    const fetchOrchestratorDetails = async () => {
      if (!selectedOrchestratorId) {
        setOrchestratorDetails(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const details = await orchestratorApi.getById(selectedOrchestratorId);
        setOrchestratorDetails(details);
      } catch (err) {
        console.error(`Error fetching orchestrator details for ${selectedOrchestratorId}:`, err);
        setError('Failed to load orchestrator details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrchestratorDetails();
  }, [selectedOrchestratorId]);
  
  // Save a new or updated orchestrator
  const saveOrchestrator = async (data) => {
    try {
      setIsLoading(true);
      
      if (data.id && orchestrators.some(o => o.id === data.id)) {
        // Update existing orchestrator
        const updatedOrchestrator = await orchestratorApi.update(data.id, data);
        setOrchestrators(prev => 
          prev.map(orch => (orch.id === data.id ? updatedOrchestrator : orch))
        );
        if (selectedOrchestratorId === data.id) {
          setOrchestratorDetails(updatedOrchestrator);
        }
        return updatedOrchestrator;
      } else {
        // Create new orchestrator
        const newOrchestrator = await orchestratorApi.create(data);
        setOrchestrators(prev => [...prev, newOrchestrator]);
        return newOrchestrator;
      }
    } catch (err) {
      console.error('Error saving orchestrator:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete an orchestrator
  const deleteOrchestrator = async (id) => {
    try {
      setIsLoading(true);
      await orchestratorApi.delete(id);
      setOrchestrators(prev => prev.filter(orch => orch.id !== id));
      if (selectedOrchestratorId === id) {
        setOrchestratorDetails(null);
      }
      return true;
    } catch (err) {
      console.error(`Error deleting orchestrator ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run an orchestrator
  const runOrchestrator = async (id, input = "Run the workflow", fieldValues = {}) => {
    try {
      const result = await orchestratorApi.runOrchestrator(id, input, fieldValues);
      return result;
    } catch (err) {
      console.error(`Error running orchestrator ${id}:`, err);
      throw err;
    }
  };
  
  // Get connections between agents and tools for the selected orchestrator
  const getConnections = () => {
    if (!orchestratorDetails) return [];
    
    const connections = [];
    
    // Connect agents to their tools
    if (orchestratorDetails.agents && orchestratorDetails.tools) {
      // Simple implementation - connect each agent to each tool
      // This would need to be enhanced with actual connection data from the API
      for (const agentId of orchestratorDetails.agents) {
        for (const toolId of orchestratorDetails.tools) {
          connections.push({
            id: `${agentId}-${toolId}`,
            source: agentId,
            target: toolId,
            type: 'custom',
            data: { label: 'uses' }
          });
        }
      }
    }
    
    return connections;
  };
  
  return {
    agents,
    tools,
    orchestrators,
    orchestratorDetails,
    isLoading,
    error,
    saveOrchestrator,
    deleteOrchestrator,
    runOrchestrator,
    getConnections,
  };
} 