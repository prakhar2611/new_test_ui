"use client";

export default function AgentCard({ agent, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full aspect-square border rounded-xl overflow-hidden 
        transition-colors duration-200 text-center flex flex-col items-center justify-center p-4
        ${isSelected 
          ? 'border-primary shadow-sm bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-gray-900'}
      `}
    >
      {/* Selection indicator dot */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
        </div>
      )}
      
      {/* Icon or avatar */}
      <div className="mb-4 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      
      {/* Agent name */}
      <span className="text-base font-medium">{agent.name}</span>
      
      {/* Quick indicator if the agent has certain features */}
      {agent.features && agent.features.length > 0 && (
        <div className="flex gap-1 mt-2">
          {agent.features.includes('web') && (
            <FeatureIndicator label="Web" />
          )}
          {agent.features.includes('code') && (
            <FeatureIndicator label="Code" />
          )}
          {agent.features.includes('image') && (
            <FeatureIndicator label="Image" />
          )}
        </div>
      )}
    </button>
  );
}

function FeatureIndicator({ label }) {
  return (
    <div className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
      {label}
    </div>
  );
} 