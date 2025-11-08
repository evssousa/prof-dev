import React from 'react';

// Exported for use in the Hardcore mode editor
export const highlightJsKeywords = (code: string): React.ReactNode => {
  // Using a try-catch because complex regex can sometimes fail on edge cases in some JS engines.
  try {
    // A simplified regex for key tokens. Using matchAll is robust against nesting.
    const tokenRegex = /(?<keywords>\b(const|let|var|function|return|if|else|for|while|async|await|new|import|export|from|default|class|extends|super|try|catch|finally|throw)\b)|(?<strings>"[^"]*"|'[^']*'|`[^`]*`)|(?<numbers>\b\d+(\.\d+)?\b)|(?<comments>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<functionNames>\b[a-zA-Z_]\w*(?=\s*\())/g;
  
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
  
    // Sanitize code to prevent weird issues with React rendering
    const sanitizedCode = code || '';
  
    for (const match of sanitizedCode.matchAll(tokenRegex)) {
      if (match.index === undefined) continue;
  
      // Add the plain text before this match
      if (match.index > lastIndex) {
        nodes.push(sanitizedCode.substring(lastIndex, match.index));
      }
  
      const groups = match.groups;
      if (groups) {
        const value = match[0];
        if (groups.keywords) nodes.push(<span className="text-purple-400">{value}</span>);
        else if (groups.strings) nodes.push(<span className="text-green-400">{value}</span>);
        else if (groups.numbers) nodes.push(<span className="text-yellow-400">{value}</span>);
        else if (groups.comments) nodes.push(<span className="text-gray-500">{value}</span>);
        else if (groups.functionNames) nodes.push(<span className="text-blue-400">{value}</span>);
        else nodes.push(value); // Fallback for unmatched but captured groups
      }
      
      lastIndex = match.index + match[0].length;
    }
  
    // Add any remaining text
    if (lastIndex < sanitizedCode.length) {
      nodes.push(sanitizedCode.substring(lastIndex));
    }
  
    return <>{nodes.map((node, i) => <React.Fragment key={i}>{node}</React.Fragment>)}</>;

  } catch (e) {
    console.error("Syntax highlighting failed", e);
    return code; // Fallback to plain text on error
  }
};


export const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-md my-2 relative text-sm not-prose">
      <div className="flex justify-between items-center px-4 py-1 bg-gray-800/50 rounded-t-md border-b border-gray-700">
        <span className="text-xs font-sans text-gray-400">JavaScript</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="font-mono">{highlightJsKeywords(code)}</code>
      </pre>
    </div>
  );
};

export const parseAndRenderText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Split by ```javascript ... ```, keeping the delimiter.
  const parts = text.split(/(```javascript[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```javascript')) {
      const code = part.replace(/^```javascript\n?/, '').replace(/```$/, '');
      return <CodeBlock key={index} code={code.trim()} />;
    }
    // Return the text part. The `prose` class will handle markdown-like formatting.
    return part;
  });
};