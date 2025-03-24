"use client";

export default function ScriptPanel({ script }) {
  if (!script || !script.lines) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-full">
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No script selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-full">
      <div className="space-y-4">
        {script.lines.map((line, index) => (
          <ScriptLine key={index} line={line} index={index} />
        ))}
      </div>
      
      {/* Audio controls */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-3">
          <button className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>
        
        {/* Audio waveform visualization or progress */}
        <div className="flex-grow mx-4 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/3" />
        </div>
        
        <span className="text-sm text-gray-500 dark:text-gray-400">00:45</span>
      </div>
    </div>
  );
}

function ScriptLine({ line, index }) {
  return (
    <div className="group flex items-start">
      {/* Line number or option */}
      {line.option ? (
        <div className="flex items-center justify-center w-8 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium mr-3 mt-1">
          {line.option}
        </div>
      ) : (
        <div className="w-8 text-right mr-3 text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          {index + 1}
        </div>
      )}
      
      {/* Line text */}
      <p className="text-sm">{line.text}</p>
    </div>
  );
} 