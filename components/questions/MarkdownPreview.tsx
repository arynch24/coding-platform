import React from 'react';

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  // Simple markdown parser - in production, use a library like react-markdown
  const parseMarkdown = (text: string) => {
    if (!text) return '';
    
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-gray-900">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/`([^`]*)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, '<br/>');
  };

  return (
    <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-32">
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: `<p class="mb-4">${parseMarkdown(content)}</p>` 
        }}
      />
      {!content && (
        <p className="text-gray-400 italic">Preview will appear here...</p>
      )}
    </div>
  );
};