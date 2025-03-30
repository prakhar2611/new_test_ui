"use client";

import { useEffect, useRef } from 'react';
import Prism from 'prismjs';

// Load base Prism styles
import 'prismjs/themes/prism-tomorrow.css';

// Load common languages
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

// Add mermaid if needed
import mermaid from 'mermaid';

export default function CodeRenderer({ code, language }) {
  const codeRef = useRef(null);
  const mermaidRef = useRef(null);
  
  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);
  
  // Highlight code with Prism or render with mermaid
  useEffect(() => {
    if (language === 'mermaid' && mermaidRef.current) {
      try {
        mermaid.render('mermaid-svg', code, (svg) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div class="text-red-500">Error rendering diagram: ${error.message}</div>`;
        }
      }
    } else if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);
  
  // If it's a mermaid diagram
  if (language === 'mermaid') {
    return (
      <div className="my-2 overflow-auto max-w-full">
        <div ref={mermaidRef} className="mermaid-diagram flex justify-center"></div>
      </div>
    );
  }
  
  // Normalize language name for Prism
  const normalizedLanguage = getNormalizedLanguage(language);

  return (
    <div className="my-2 overflow-auto rounded-md">
      <div className="flex items-center justify-between px-4 py-1 bg-gray-800 text-gray-200 text-xs">
        <span>{getLanguageDisplayName(language)}</span>
        <button 
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-gray-400 hover:text-white"
          title="Copy code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      <pre className="p-4 m-0 overflow-auto bg-gray-900 text-white text-sm">
        <code 
          ref={codeRef} 
          className={`language-${normalizedLanguage}`}
        >
          {code}
        </code>
      </pre>
    </div>
  );
}

// Helper function to normalize language names for Prism
function getNormalizedLanguage(language) {
  if (!language) return 'plaintext';
  
  const languageMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'sql': 'sql',
    'bash': 'bash',
    'sh': 'bash',
    'shell': 'bash',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'c++': 'cpp',
    'jsx': 'jsx',
    'tsx': 'tsx',
    'plaintext': 'plaintext',
    'text': 'plaintext',
  };
  
  return languageMap[language.toLowerCase()] || 'plaintext';
}

// Helper function to get a display name for the language
function getLanguageDisplayName(language) {
  if (!language) return 'Plain Text';
  
  const displayNameMap = {
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'py': 'Python',
    'python': 'Python',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'sql': 'SQL',
    'bash': 'Bash',
    'sh': 'Shell',
    'shell': 'Shell',
    'yaml': 'YAML',
    'yml': 'YAML',
    'md': 'Markdown',
    'markdown': 'Markdown',
    'java': 'Java',
    'c': 'C',
    'cpp': 'C++',
    'c++': 'C++',
    'jsx': 'JSX',
    'tsx': 'TSX',
    'mermaid': 'Mermaid Diagram',
    'plaintext': 'Plain Text',
    'text': 'Plain Text',
  };
  
  return displayNameMap[language.toLowerCase()] || language;
} 