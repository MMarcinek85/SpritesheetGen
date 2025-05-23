import React, { useState, useEffect } from 'react';
import '../styles/main.css'; // Assuming you might want to share some styles

const AiFormPage = () => {
    const [markdownContent, setMarkdownContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/AI_Project_Requirements_Form.md') // Assuming the MD file is in the public folder
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                setMarkdownContent(text);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load Markdown file:", err);
                setError("Failed to load the AI Project Requirements Form. Please try again later.");
                setIsLoading(false);
            });
    }, []);

    // Basic Markdown to HTML conversion (simplified)
    const renderMarkdown = (md) => {
        let html = md;
        // Headers
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
        // Italic
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
        // Lists (very basic)
        html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>'); // Convert to <li> and wrap with <ul> later if consecutive
        html = html.replace(/^\s*\* (.*$)/gim, '<ul><li>$1</li></ul>');
        html = html.replace(/^\s*\d+\. (.*$)/gim, '<ol><li>$1</li></ol>');
        // Combine adjacent lists (basic)
        html = html.replace(/<\/ul>\s*<ul>/gim, '');
        html = html.replace(/<\/ol>\s*<ol>/gim, '');
        // Links
        html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        // Code blocks (simple pre)
        html = html.replace(/```(.*?)```/gis, '<pre><code>$1</code></pre>');
        // Inline code
        html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
        // Paragraphs (basic: wrap lines that are not part of other elements)
        // This is tricky without a proper parser. A simpler approach for now:
        html = html.split('\n').map(line => {
            if (line.trim() === '' || line.startsWith('<') || line.startsWith('#')) return line;
            return `<p>${line}</p>`;
        }).join('\n');
        // Newlines to <br> (careful not to add too many)
        html = html.replace(/\n/g, '<br />');
        // Clean up extra <br> from paragraph logic
        html = html.replace(/<br \/>(<\/?(h[1-6]|ul|ol|li|p|pre|strong|em|code|a))/gi, '$1');


        return { __html: html };
    };

    if (isLoading) {
        return <div className="loading-indicator">Loading AI Form...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="ai-form-page-container content-container">
            <div dangerouslySetInnerHTML={renderMarkdown(markdownContent)} />
            <hr />
            <p><em>To use this form, please copy the text into your favorite text editor, fill it out, and then you can share the completed form with an AI assistant.</em></p>
        </div>
    );
};

export default AiFormPage;
