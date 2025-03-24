"use client";

import { useState, useEffect } from 'react';
import TopNavigationBar from '@/components/navigation/TopNavigationBar';
import Sidebar from '@/components/navigation/Sidebar';
import AgentCard from '@/components/cards/AgentCard';
import VibeCard from '@/components/cards/VibeCard';
import ScriptPanel from '@/components/content/ScriptPanel';
import DetailsPanel from '@/components/panels/DetailsPanel';
import AgentForm from '@/components/forms/AgentForm';

// Sample data
const agents = [
  { id: 'alloy', name: 'Alloy', features: ['web', 'code'] },
  { id: 'ash', name: 'Ash', features: ['web'] },
  { id: 'ballad', name: 'Ballad', features: ['image'] },
  { id: 'coral', name: 'Coral', features: ['code'] },
  { id: 'echo', name: 'Echo', features: [] },
  { id: 'fable', name: 'Fable', features: ['web', 'image'] },
  { id: 'onyx', name: 'Onyx', features: ['code', 'image'] },
  { id: 'nova', name: 'Nova', features: [] },
  { id: 'sage', name: 'Sage', features: ['web', 'code', 'image'] },
  { id: 'shimmer', name: 'Shimmer', features: [] },
];

const vibes = [
  { 
    id: 'emo-teenager', 
    name: 'Emo Teenager',
    description: [
      'Tone: Sarcastic, disinterested, and melancholic, with a hint of passive-aggressiveness.',
      'Emotion: Apathy mixed with reluctant engagement.',
      'Delivery: Monotone with occasional sighs, drawn-out words, and subtle disdain, evoking a classic emo teenager attitude.'
    ]
  },
  { id: 'sincere', name: 'Sincere' },
  { id: 'sports-coach', name: 'Sports Coach' },
  { id: 'calm', name: 'Calm' },
  { id: 'robot', name: 'Robot' },
];

const script = {
  lines: [
    { text: "Ugh… hey… welcome to the bank, I guess. If you actually need something, listen up… or don't. Whatever." },
    { text: "If you wanna check your balance or something, press 1… not like it's ever enough." },
    { text: "Need to transfer money? Press 2… gotta keep that debt aesthetic going." },
    { text: "Lost your card? Press 3... ugh, classic." },
    { text: "If you're here to talk to a real person, press 0, but, like… do people even listen anymore?" },
    { text: "Or just stay on the line and let the silence consume you… sigh" },
    { text: "…Anyway, choose something, or don't. It's your existential crisis, not mine." }
  ]
};

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [selectedVibe, setSelectedVibe] = useState(vibes[0]);
  const [apiAgents, setApiAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTools, setAvailableTools] = useState([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState(null);
  
  // Fetch agents from API
  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/agents/');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      setApiAgents(data);
      if (data.length > 0) {
        setSelectedAgent({
          id: data[0].id,
          name: data[0].name,
          features: data[0].selected_tools || [],
          systemPrompt: data[0].system_prompt,
          type: 'API Agent',
          ...data[0]
        });
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.message);
      // Fallback to sample data
      setApiAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTools = async () => {
    try {
      const response = await fetch('http://localhost:8000/agents/tools/available');
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      const data = await response.json();
      setAvailableTools(data);
    } catch (err) {
      console.error('Error fetching tools:', err);
      setAvailableTools([]);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchTools();
  }, []);

  // Create or update agent
  const handleAgentSubmit = async (formData) => {
    try {
      const url = agentToEdit 
        ? `http://localhost:8000/agents/${agentToEdit.id}`
        : 'http://localhost:8000/agents/';
      
      const method = agentToEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${agentToEdit ? 'update' : 'create'} agent`);
      }
      
      // Refresh agents list
      await fetchAgents();
      
      // Close form
      setShowAgentForm(false);
      setAgentToEdit(null);
      
    } catch (error) {
      console.error('Error saving agent:', error);
      throw error;
    }
  };

  // Delete agent
  const handleDeleteAgent = async (id) => {
    if (!id || !window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/agents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      
      // Refresh agents list
      await fetchAgents();
      
      // If the deleted agent was selected, reset selection
      if (selectedAgent && selectedAgent.id === id) {
        setSelectedAgent(null);
      }
      
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert(`Failed to delete agent: ${error.message}`);
    }
  };

  // Combine API agents with sample agents if needed
  const displayAgents = apiAgents.length > 0 
    ? apiAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        features: agent.selected_tools || [],
        systemPrompt: agent.system_prompt,
        type: 'API Agent',
        ...agent
      }))
    : agents;
  
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavigationBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with CTA */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">Agent & Orchestrator Developer Tool</h1>
                <p className="text-gray-600 dark:text-gray-400">Create, test, and manage AI agent workflows</p>
              </div>
              
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                onClick={() => {
                  setAgentToEdit(null);
                  setShowAgentForm(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                START BUILDING
              </button>
            </div>
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* Error state */}
            {error && !isLoading && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Using sample data instead.</p>
              </div>
            )}
            
            {/* Agents section */}
            {!isLoading && (
              <div className="mb-10">
                <h2 className="text-sm font-medium uppercase text-gray-500 dark:text-gray-400 mb-4">AGENTS</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {displayAgents.map(agent => (
                    <AgentCard 
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgent && selectedAgent.id === agent.id}
                      onClick={() => setSelectedAgent(agent)}
                    />
                  ))}
                  
                  {/* Create new agent button */}
                  <button 
                    className="aspect-square border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    onClick={() => {
                      setAgentToEdit(null);
                      setShowAgentForm(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* VIBE and SCRIPT sections in a grid - hidden but not removed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 hidden">
              {/* Vibe section */}
              <div>
                <h2 className="text-sm font-medium uppercase text-gray-500 dark:text-gray-400 mb-4">VIBE</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto">
                  {vibes.map(vibe => (
                    <VibeCard 
                      key={vibe.id}
                      vibe={vibe}
                      isSelected={selectedVibe.id === vibe.id}
                      onClick={() => setSelectedVibe(vibe)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Script section */}
              <div>
                <h2 className="text-sm font-medium uppercase text-gray-500 dark:text-gray-400 mb-4">SCRIPT</h2>
                <ScriptPanel script={script} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Details panel */}
        <DetailsPanel 
          item={selectedAgent} 
          onEdit={() => {
            setAgentToEdit(selectedAgent);
            setShowAgentForm(true);
          }}
          onDelete={() => handleDeleteAgent(selectedAgent.id)}
        />
      </div>
      
      {/* Agent form modal */}
      {showAgentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] overflow-y-auto w-full max-w-2xl">
            <AgentForm 
              onSubmit={handleAgentSubmit}
              onCancel={() => {
                setShowAgentForm(false);
                setAgentToEdit(null);
              }}
              initialData={agentToEdit || {}}
              availableTools={availableTools}
            />
          </div>
        </div>
      )}
    </div>
  );
}
