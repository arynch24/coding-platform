import React from 'react';
import { Button } from '../ui/Button';

interface MarkdownPreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    title: string;
}

export const MarkdownPreviewDialog: React.FC<MarkdownPreviewDialogProps> = ({
    isOpen,
    onClose,
    content,
    title
}) => {
    if (!isOpen) return null;

    // Enhanced markdown parser
    const parseMarkdown = (text: string) => {
        if (!text) return '';
        
        return text
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 text-gray-900">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 text-gray-900">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-gray-900">$1</h1>')
            // Bold and Italic
            .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
            // Inline code
            .replace(/`([^`]*)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>$2</code></pre>')
            .replace(/```\n([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>$1</code></pre>')
            // Lists
            .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
            .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks and paragraphs
            .replace(/\n\n/gim, '</p><p class="mb-4">')
            .replace(/\n/gim, '<br/>');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </Button>
                </div>
                
                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-gray-50 rounded-md p-4 min-h-[200px] border">
                        {content ? (
                            <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                    __html: `<p class="mb-4">${parseMarkdown(content)}</p>` 
                                }}
                            />
                        ) : (
                            <p className="text-gray-400 italic text-center py-8">
                                No content to preview
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MarkdownPreviewDialog;