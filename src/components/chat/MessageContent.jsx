"use client";

import { useMemo, useRef, useEffect, useState } from 'react';

export default function MessageContent({ content }) {
  // Parse different content types (code blocks, tables, HTML)
  const parsedContent = useMemo(() => {
    if (!content) return [];
    
    // Detect if the content is HTML
    const isHtml = content.trim().startsWith('<') && 
                   content.trim().endsWith('>') && 
                   (content.includes('<div') || content.includes('<p') || 
                    content.includes('<table') || content.includes('<html') || 
                    content.includes('<body') || content.includes('<svg'));
    
    // If it's HTML and not just a simple tag, return as HTML content
    if (isHtml && content.split('<').length > 3) {
      return [{ type: 'html', content }];
    }
    
    const parts = [];
    let currentText = '';
    
    // Match code blocks with optional language
    const codeBlockRegex = /```([\w-]*)?(?:\n)?([\s\S]*?)```/g;
    // Match markdown table pattern (lines starting and ending with |)
    const tableRegex = /(\|[^\n]+\|\n\|[-:|]+\|\n(?:\|[^\n]+\|\n)+)/g;
    
    // Store all matches to process in order
    const matches = [];
    let match;
    
    // Find all code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push({ 
        type: 'code', 
        start: match.index, 
        end: match.index + match[0].length,
        language: match[1]?.trim() || '',
        content: match[2],
        raw: match[0]
      });
    }
    
    // Find all tables
    while ((match = tableRegex.exec(content)) !== null) {
      // Skip if this region is already part of a code block
      const isInCodeBlock = matches.some(
        m => m.type === 'code' && match.index >= m.start && match.index < m.end
      );
      
      if (!isInCodeBlock) {
        matches.push({ 
          type: 'table', 
          start: match.index, 
          end: match.index + match[0].length,
          content: match[1],
          raw: match[0]
        });
      }
    }
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);
    
    // Process content in order, preserving text between special elements
    let lastEnd = 0;
    for (const match of matches) {
      // Add text before this match
      if (match.start > lastEnd) {
        const textBefore = content.substring(lastEnd, match.start);
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore });
        }
      }
      
      // Add the matched content
      parts.push({ 
        type: match.type, 
        content: match.content, 
        language: match.language 
      });
      
      lastEnd = match.end;
    }
    
    // Add any remaining text
    if (lastEnd < content.length) {
      const remainingText = content.substring(lastEnd);
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText });
      }
    }
    
    return parts;
  }, [content]);
  
  // If no content or parsing failed, show raw content
  if (!content || parsedContent.length === 0) {
    return <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{content}</div>;
  }
  
  return (
    <div className="message-content">
      {parsedContent.map((part, index) => {
        switch (part.type) {
          case 'code':
            return <SimpleCodeBlock key={index} code={part.content} language={part.language} />;
            
          case 'table':
            return <MarkdownTable key={index} markdown={part.content} />;
            
          case 'html':
            return <HtmlRenderer key={index} html={part.content} />;
            
          case 'text':
          default:
            return (
              <div key={index} className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 my-2">
                {part.content}
              </div>
            );
        }
      })}
    </div>
  );
}

// Component to render HTML content safely
function HtmlRenderer({ html }) {
  const containerRef = useRef(null);
  const [height, setHeight] = useState(400);
  
  useEffect(() => {
    if (containerRef.current) {
      // Create a sandbox iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = `${height}px`;
      iframe.style.border = 'none';
      iframe.sandbox = 'allow-scripts allow-same-origin';
      
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
      
      // Add the HTML content to the iframe
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                margin: 0; 
                padding: 16px;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.5;
              }
              canvas {
                max-width: 100%;
                height: auto !important;
              }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      doc.close();
      
      // Adjust height based on content
      const resizeObserver = new ResizeObserver(() => {
        if (iframe.contentWindow && iframe.contentWindow.document.body) {
          const newHeight = iframe.contentWindow.document.body.scrollHeight;
          if (newHeight > 100) { // Minimum height
            setHeight(newHeight + 32); // Add padding
            iframe.style.height = `${newHeight + 32}px`;
          }
        }
      });
      
      try {
        resizeObserver.observe(iframe.contentWindow.document.body);
      } catch (error) {
        console.warn('Could not observe iframe body:', error);
      }
      
      return () => {
        try {
          resizeObserver.disconnect();
        } catch (error) {
          console.warn('Could not disconnect observer:', error);
        }
      };
    }
  }, [html, height]);
  
  // Two buttons for HTML: one to copy, one to open in new tab
  return (
    <div className="my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-200 text-xs">
        <span className="font-semibold">HTML Preview</span>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              const newWindow = window.open();
              newWindow.document.write(html);
              newWindow.document.close();
            }}
            className="flex items-center text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs"
            title="Open in new tab"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open
          </button>
          <button 
            onClick={() => navigator.clipboard.writeText(html)}
            className="flex items-center text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs"
            title="Copy HTML"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="border border-gray-300 dark:border-gray-700 rounded-b-md overflow-hidden bg-white"
      ></div>
    </div>
  );
}

// Component to render markdown tables
function MarkdownTable({ markdown }) {
  // Parse table rows from markdown
  const rows = markdown.split('\n').filter(row => row.trim().startsWith('|') && row.trim().endsWith('|'));
  
  if (rows.length < 2) return null;
  
  // Extract header and determine if we have an alignment row
  const headerRow = rows[0];
  const potentialAlignmentRow = rows[1];
  
  // Check if the second row is an alignment row (contains only -, :, and |)
  const isAlignmentRow = potentialAlignmentRow.replace(/[\|\s\-:]/g, '').length === 0;
  
  // Parse column alignments if alignment row exists
  const alignments = [];
  if (isAlignmentRow) {
    const cols = potentialAlignmentRow.split('|').filter(Boolean).map(col => col.trim());
    alignments.push(...cols.map(col => {
      if (col.startsWith(':') && col.endsWith(':')) return 'center';
      if (col.endsWith(':')) return 'right';
      return 'left';
    }));
  }
  
  // Split rows into headers and body
  const headers = headerRow.split('|').filter(Boolean).map(cell => cell.trim());
  const bodyRows = rows.slice(isAlignmentRow ? 2 : 1);
  
  return (
    <div className="w-full overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {headers.map((header, i) => (
              <th 
                key={i} 
                className="py-2 px-4 border border-gray-300 dark:border-gray-700 text-left font-medium text-gray-700 dark:text-gray-300"
                style={{ textAlign: alignments[i] || 'left' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {bodyRows.map((row, rowIndex) => {
            const cells = row.split('|').filter(Boolean).map(cell => cell.trim());
            return (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                {cells.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className="py-2 px-4 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                    style={{ textAlign: alignments[cellIndex] || 'left' }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Escape HTML entities
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Fix the order of operations for highlighting code
const getHighlightedCode = (code, language) => {
  // First escape the HTML
  let safeCode = escapeHtml(code);
  
  // If no language specified or not supported, return the escaped code
  if (!language || language === '') return safeCode;
  
  let highlightedCode = safeCode;
  
  // Process the code based on language
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts':
      // Highlight JS/TS syntax
      highlightedCode = highlightedCode
        // Keywords
        .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|super|extends|null|undefined|true|false)\b/g, '<span class="text-purple-400">$1</span>')
        // Strings
        .replace(/(['"`])(.*?)(?<!\\)\1/g, '<span class="text-yellow-300">$1$2$1</span>')
        // Numbers
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-cyan-300">$1</span>')
        // Comments
        .replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>')
        // Function calls
        .replace(/(\w+)(\s*\()/g, '<span class="text-blue-400">$1</span>$2')
        // Arrow functions
        .replace(/=&gt;/g, '<span class="text-purple-400">=&gt;</span>');
      break;
      
    case 'python':
    case 'py':
      highlightedCode = highlightedCode
        // Keywords
        .replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|with|lambda|raise|pass|None|True|False)\b/g, '<span class="text-purple-400">$1</span>')
        // Strings
        .replace(/(['"`])(.*?)(?<!\\)\1/g, '<span class="text-yellow-300">$1$2$1</span>')
        // Numbers
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-cyan-300">$1</span>')
        // Comments
        .replace(/(#.*$)/gm, '<span class="text-gray-500">$1</span>')
        // Function calls
        .replace(/(\w+)(\s*\()/g, '<span class="text-blue-400">$1</span>$2');
      break;
      
    case 'html':
      highlightedCode = highlightedCode
        // Tags
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="text-pink-400">$2</span>')
        // Attributes
        .replace(/\s([\w-]+)=["']/g, ' <span class="text-yellow-300">$1</span>=&quot;')
        // Values
        .replace(/=["'](.+?)["']/g, '=&quot;<span class="text-green-300">$1</span>&quot;')
        // Comments
        .replace(/(&lt;!--.*?--&gt;)/gs, '<span class="text-gray-500">$1</span>');
      break;
      
    case 'css':
    case 'scss':
      highlightedCode = highlightedCode
        // Selectors
        .replace(/([\.\#]?[\w-]+\s*(?:\,|\{))/g, '<span class="text-blue-400">$1</span>')
        // Properties
        .replace(/\b([\w-]+)(?=\s*:)/g, '<span class="text-cyan-300">$1</span>')
        // Values
        .replace(/:\s*([^;]+);/g, ': <span class="text-green-300">$1</span>;')
        // Units
        .replace(/(\d+)(px|em|rem|%|vh|vw|ms|s|fr|deg)/g, '<span class="text-purple-400">$1$2</span>');
      break;
      
    case 'json':
      highlightedCode = highlightedCode
        // Keys
        .replace(/"([\w-]+)"(?=\s*:)/g, '&quot;<span class="text-cyan-300">$1</span>&quot;')
        // String values
        .replace(/:\s*"(.+?)"/g, ': &quot;<span class="text-green-300">$1</span>&quot;')
        // Numbers, null, boolean
        .replace(/:\s*(\d+\.?\d*|null|true|false)(?=\s*[,\}])/g, ': <span class="text-purple-400">$1</span>');
      break;
      
    case 'sql':
      highlightedCode = highlightedCode
        // Keywords
        .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|AS|ORDER BY|GROUP BY|HAVING|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|FUNCTION|PROCEDURE|TRIGGER)\b/gi, '<span class="text-purple-400">$1</span>')
        // Strings
        .replace(/(['"`])(.*?)(?<!\\)\1/g, '<span class="text-yellow-300">$1$2$1</span>')
        // Numbers
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-cyan-300">$1</span>')
        // Comments
        .replace(/(--.*$)/gm, '<span class="text-gray-500">$1</span>');
      break;
      
    default:
      // For other languages, do minimal highlighting
      highlightedCode = highlightedCode
        // Strings
        .replace(/(['"`])(.*?)(?<!\\)\1/g, '<span class="text-yellow-300">$1$2$1</span>')
        // Numbers
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-cyan-300">$1</span>');
  }
  
  return highlightedCode;
};

// Update the SimpleCodeBlock component
function SimpleCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const highlightedCode = useMemo(() => getHighlightedCode(code, language), [code, language]);
  
  return (
    <div className="my-4 rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-200 text-xs">
        <span className="font-semibold">
          {language ? language.toUpperCase() : 'CODE'}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition duration-200"
          title="Copy code"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="max-h-96 overflow-auto bg-gray-900 px-4 py-3 text-sm">
        <pre className="whitespace-pre-wrap">
          <code
            className="text-gray-200"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
} 