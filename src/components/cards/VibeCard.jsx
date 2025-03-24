"use client";

export default function VibeCard({ vibe, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full rounded-xl overflow-hidden 
        transition-colors duration-200 text-left p-5
        ${isSelected 
          ? 'border-primary shadow-sm bg-blue-50 dark:bg-blue-900/20 border' 
          : 'border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-gray-900'}
      `}
    >
      {/* Selection indicator dot */}
      {isSelected && (
        <div className="absolute bottom-4 left-4">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
        </div>
      )}
      
      {/* Vibe name */}
      <h3 className="text-base font-medium mb-4">{vibe.name}</h3>
      
      {/* Vibe description when selected */}
      {isSelected && vibe.description && (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-5">
          {vibe.description.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      )}
    </button>
  );
} 