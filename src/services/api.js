const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Agent API endpoints
export const agentApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      return await response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch agent with ID: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error);
      throw error;
    }
  },
  
  create: async (agentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) throw new Error('Failed to create agent');
      return await response.json();
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  },
  
  update: async (id, agentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) throw new Error(`Failed to update agent with ID: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error updating agent ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error(`Failed to delete agent with ID: ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting agent ${id}:`, error);
      throw error;
    }
  },
  
  getAvailableTools: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/tools/available`);
      if (!response.ok) throw new Error('Failed to fetch available tools');
      return await response.json();
    } catch (error) {
      console.error('Error fetching available tools:', error);
      throw error;
    }
  },
  
  runAgent: async (id, input, fieldValues) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: input,
          prompt_field_values: fieldValues,
        }),
      });
      
      if (!response.ok) throw new Error(`Failed to run agent with ID: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error running agent ${id}:`, error);
      throw error;
    }
  },
};

// Orchestrator API endpoints
export const orchestratorApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orchestrators/`);
      if (!response.ok) throw new Error('Failed to fetch orchestrators');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orchestrators:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orchestrators/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch orchestrator with ID: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching orchestrator ${id}:`, error);
      throw error;
    }
  },
  
  create: async (orchestratorData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orchestrators/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orchestratorData),
      });
      
      if (!response.ok) throw new Error('Failed to create orchestrator');
      return await response.json();
    } catch (error) {
      console.error('Error creating orchestrator:', error);
      throw error;
    }
  },
  
  update: async (id, orchestratorData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orchestrators/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orchestratorData),
      });
      
      if (!response.ok) throw new Error(`Failed to update orchestrator with ID: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error updating orchestrator ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orchestrators/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error(`Failed to delete orchestrator with ID: ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting orchestrator ${id}:`, error);
      throw error;
    }
  },
  
  runOrchestrator: async (id, user_input = "Run the workflow", prompt_field_values = {}, save_history = true) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orchestrators/${id}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_input,
        prompt_field_values,
        save_history
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to run orchestrator: ${response.status}`);
    }
    
    return response.json();
  },
  
  getHistory: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orchestrators/${id}/history`);
      if (!response.ok) throw new Error(`Failed to fetch history for orchestrator with ID: ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching history for orchestrator ${id}:`, error);
      throw error;
    }
  },
};

// Tools API endpoints
export const toolsApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/tools/available`);
      if (!response.ok) throw new Error('Failed to fetch available tools');
      return await response.json();
    } catch (error) {
      console.error('Error fetching available tools:', error);
      throw error;
    }
  }
};

// Add conversation API service
export const conversationApi = {
  // Get all conversations
  getAll: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/conversations/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status}`);
    }
    return response.json();
  },
  
  // Get conversation by ID with optional pagination and filtering
  getById: async (id, options = {}) => {
    const { limit = 50, offset = 0, sort = 'desc', startDate, endDate } = options;
    
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/conversations/${id}?limit=${limit}&offset=${offset}&sort=${sort}`;
    
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }
    return response.json();
  },
  
  // Get conversation history for an orchestrator
  getConversationHistory: async (orchestratorId) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orchestrators/${orchestratorId}/history`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation history: ${response.status}`);
    }
    return response.json();
  },
  
  // Search conversations by query
  search: async (query, limit = 20) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/conversations/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to search conversations: ${response.status}`);
    }
    return response.json();
  },
  
  // Delete a conversation
  delete: async (id) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/conversations/${id}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }
    return true;
  },
  
  // Clear conversation messages
  clearMessages: async (id) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/conversations/${id}/messages`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error(`Failed to clear conversation messages: ${response.status}`);
    }
    return true;
  },
  
  // Clear conversation history for an orchestrator
  clearConversation: async (orchestratorId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/orchestrators/${orchestratorId}/history`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error(`Failed to clear conversation history: ${response.status}`);
    }
    return true;
  }
}; 