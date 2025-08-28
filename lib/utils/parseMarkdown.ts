export const parseMarkdown = (text: any) => {
  if (!text) return "";

  let html = text;

  html = html.replace(/^(-{3,}|\*{3,})$/gim, "<hr />");


  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]*)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold + italic
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Lists
  html = html.replace(/^\* (.*$)/gim, "<ul><li>$1</li></ul>");
  html = html.replace(/^- (.*$)/gim, "<ul><li>$1</li></ul>");
  html = html.replace(/^\d+\. (.*$)/gim, "<ol><li>$1</li></ol>");

  // Paragraphs
  html = html.replace(/\n$/gim, "<br />");

  return html.trim();
};
