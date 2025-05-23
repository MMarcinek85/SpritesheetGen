import React, { useState, useEffect, useCallback } from 'react';
import '../styles/main.css';

// Helper to format a line of Markdown text, potentially containing inline styles.
const formatLineAsHtml = (line, isListItemContent = false) => {
    if (!line) return '';
    
    let processedLine = line;

    // Headers - should be full lines, not typically list item content
    if (!isListItemContent) {
        if (processedLine.startsWith('# ')) return `<h1>${processedLine.substring(2)}</h1>`;
        if (processedLine.startsWith('## ')) return `<h2>${processedLine.substring(3)}</h2>`;
        if (processedLine.startsWith('### ')) return `<h3>${processedLine.substring(4)}</h3>`;
        if (processedLine.startsWith('> ')) return `<blockquote class="ai-prompt-suggestion">${processedLine.substring(2)}</blockquote>`;
    }

    // Inline styling - use non-greedy matching with ? to prevent issues with multiple ** in the same line
    processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedLine = processedLine.replace(/__(.*?)__/g, '<strong>$1</strong>');
    processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
    processedLine = processedLine.replace(/_(.*?)_/g, '<em>$1</em>');
    processedLine = processedLine.replace(/`(.*?)`/g, '<code>$1</code>');
    processedLine = processedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    if (processedLine.trim() === '') return '';

    // Avoid wrapping if it's already an HTML block or if it's list content meant to be plain
    if (!isListItemContent && !processedLine.match(/^<(h[1-6]|p|blockquote|ul|ol|li|div|hr|table|thead|tbody|tr|th|td)/i)) {
        return `<p>${processedLine}</p>`;
    }

    return processedLine;
};

const AiFormPage = () => {
    const [markdownContent, setMarkdownContent] = useState('');
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentList, setCurrentList] = useState(null);    useEffect(() => {
        // Using an async function inside useEffect for better error handling
        const fetchMarkdown = async () => {
            try {
                const response = await fetch('/AI_Project_Requirements_Form.md');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const text = await response.text();
                
                // Check if we got valid content
                if (!text || text.trim() === '') {
                    throw new Error('Empty content received from server');
                }
                
                setMarkdownContent(text);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load Markdown file:", err);
                setError(`Failed to load the AI Project Requirements Form: ${err.message}. Please try again later.`);
                setIsLoading(false);
            }
        };
        
        // Call the fetch function
        fetchMarkdown();
    }, []);

    const handleInputChange = useCallback((id, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [id]: value
        }));
    }, []);    const renderFormElements = useCallback(() => {
        if (!markdownContent) return [];

        const lines = markdownContent.split('\n');
        const elements = [];
        let currentQuestionId = null;
        let inCheckboxList = false;
        let checkboxItems = [];
        let inUlList = false;
        let ulItems = [];
        let inOlList = false;
        let olItems = [];
        let currentListNumber = 1;

        const closeCheckboxList = () => {
            if (inCheckboxList && checkboxItems.length > 0) {
                elements.push(
                    <ul key={`checkbox-list-${elements.length}`} className="form-checkbox-list">
                        {checkboxItems}
                    </ul>
                );
                checkboxItems = [];
                inCheckboxList = false;
            }
        };

        const closeUlList = () => {
            if (inUlList && ulItems.length > 0) {
                elements.push(
                    <ul key={`ul-list-${elements.length}`} className="form-list">
                        {ulItems}
                    </ul>
                );
                ulItems = [];
                inUlList = false;
            }
        };

        const closeOlList = () => {
            if (inOlList && olItems.length > 0) {
                elements.push(
                    <ol key={`ol-list-${elements.length}`} className="form-list">
                        {olItems}
                    </ol>
                );
                olItems = [];
                inOlList = false;
                currentListNumber = 1;
            }
        };

        const closeAllLists = () => {
            closeCheckboxList();
            closeUlList();
            closeOlList();
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Skip empty lines but don't close lists (allows for spacing in lists)
            if (trimmedLine === '') {
                if (!inCheckboxList && !inUlList && !inOlList) {
                    elements.push(<div key={`empty-${index}`} className="empty-line" />);
                }
                return;
            }

            // 1. Horizontal Rule
            if (trimmedLine === '---') {
                closeAllLists();
                elements.push(<hr key={`hr-${index}`} />);
                currentQuestionId = null;
                return;
            }

            // 2. Main Question (e.g., * **1.1. Question:**)
            const questionIdMatch = trimmedLine.match(/^\*\s*\*\*(\d+\.\d+)\.\s*([^:]+):/);
            if (questionIdMatch) {
                closeAllLists();
                currentQuestionId = questionIdMatch[1];
                const questionTextHtml = formatLineAsHtml(line.replace(/^\s*\*\s*/, ''));
                elements.push(
                    <div key={`question-${currentQuestionId}`} className="form-question-block"
                         dangerouslySetInnerHTML={{ __html: questionTextHtml }} />
                );
                return;
            }

            // 3. "Your Answer" Line
            if (currentQuestionId && (trimmedLine.toLowerCase().startsWith('*   your answer') || trimmedLine.toLowerCase().startsWith('* your answer'))) {
                closeAllLists();
                elements.push(
                    <textarea
                        key={`answer-${currentQuestionId}`}
                        className="form-answer-textarea"
                        value={answers[currentQuestionId] || ''}
                        onChange={(e) => handleInputChange(currentQuestionId, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={trimmedLine.toLowerCase().includes('(list)') ? 6 : 3}
                    />
                );
                return;
            }

            // 4. Checkbox Line
            const checkboxMatch = currentQuestionId && trimmedLine.match(/^\s*\*\s*\[( |x)\]\s*(.*)/i);
            if (checkboxMatch) {
                // Close other list types if open
                closeUlList();
                closeOlList();
                
                if (!inCheckboxList) {
                    inCheckboxList = true;
                }
                
                const labelText = checkboxMatch[2];
                const checkboxId = `checkbox-${currentQuestionId}-${labelText.trim().toLowerCase().replace(/\W+/g, '-')}`;
                
                checkboxItems.push(
                    <li key={checkboxId} className="form-checkbox-item">
                        <input
                            type="checkbox"
                            id={checkboxId}
                            checked={!!answers[checkboxId]}
                            onChange={(e) => handleInputChange(checkboxId, e.target.checked)}
                        />
                        <label htmlFor={checkboxId} dangerouslySetInnerHTML={{ __html: formatLineAsHtml(labelText, true) }} />
                    </li>
                );
                return;
            }

            // 5. Generic list items
            const ulItemMatch = trimmedLine.match(/^\s*\*\s+(.*)/);
            // Exclude lines that are section headers or user answers prompts
            const isSpecialBullet = trimmedLine.includes('**') && (trimmedLine.includes('Question:') || trimmedLine.toLowerCase().includes('your answer'));
            
            if (ulItemMatch && !isSpecialBullet) {
                // Close other list types
                closeCheckboxList();
                closeOlList();
                
                if (!inUlList) {
                    inUlList = true;
                }
                
                ulItems.push(
                    <li key={`ul-item-${index}`} dangerouslySetInnerHTML={{ __html: formatLineAsHtml(ulItemMatch[1], true) }} />
                );
                return;
            }

            const olItemMatch = trimmedLine.match(/^\s*(\d+)\.\s+(.*)/);
            if (olItemMatch) {
                // Close other list types
                closeCheckboxList();
                closeUlList();
                
                if (!inOlList) {
                    inOlList = true;
                    currentListNumber = parseInt(olItemMatch[1]);
                }
                
                olItems.push(
                    <li key={`ol-item-${index}`} value={olItemMatch[1]} dangerouslySetInnerHTML={{ __html: formatLineAsHtml(olItemMatch[2], true) }} />
                );
                return;
            }

            // If we get here, we're not in a list item, so close any open lists
            closeAllLists();

            // Headers and other special content
            if (trimmedLine.startsWith('#')) {
                const formattedHeader = formatLineAsHtml(trimmedLine);
                if (formattedHeader) {
                    elements.push(<div key={`header-${index}`} dangerouslySetInnerHTML={{ __html: formattedHeader }} />);
                }
                return;
            }

            // Regular content
            const formattedLine = formatLineAsHtml(trimmedLine);
            if (formattedLine) {
                elements.push(<div key={`line-${index}`} dangerouslySetInnerHTML={{ __html: formattedLine }} />);
            }
        });

        closeAllLists();
        return elements;
    }, [markdownContent, answers, handleInputChange]);    const handleDownloadAnswers = useCallback(() => {
        if (!markdownContent) {
            alert('Error: Form content is missing. Please refresh the page and try again.');
            return;
        }
        
        try {
            let output = `# AI Project Requirements - My Answers\n\n`;
            const lines = markdownContent.split('\n');
            let currentQuestionContextId = null;
    
            lines.forEach(line => {
                if (!line) return;
                
                const trimmedLine = line.trim();
                const questionIdMatch = trimmedLine.match(/^\*\s*\*\*(\d+\.\d+)\.\s*([^:]+):/);
                const isAnswerLine = currentQuestionContextId && (trimmedLine.toLowerCase().startsWith('*   your answer') || trimmedLine.toLowerCase().startsWith('* your answer'));
                const checkboxMatch = currentQuestionContextId && trimmedLine.match(/^\s*\*\s*\[( |x)\]\s*(.*)/i);

            if (questionIdMatch) {
                currentQuestionContextId = questionIdMatch[1];
                output += `${line}\n`;
            } else if (isAnswerLine) {
                output += `${line}\n`;
                output += `        \`\`\`text\n${answers[currentQuestionContextId] || 'No answer provided.'}\n        \`\`\`\n\n`;
            } else if (checkboxMatch) {
                const labelText = checkboxMatch[2];
                const checkboxId = `checkbox-${currentQuestionContextId}-${labelText.trim().toLowerCase().replace(/\W+/g, '-')}`;
                const isChecked = !!answers[checkboxId];
                output += `    *   [${isChecked ? 'x' : ' '}] ${labelText}\n`;
            } else {
                output += `${line}\n`;
            }
        });        const blob = new Blob([output], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'AI_Project_Filled_Form.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download answers:", error);
            alert('There was an error downloading your answers. Please try again.');
        }
    }, [markdownContent, answers]);    const copyPromptToClipboard = useCallback(async () => {
        const prompt = `I want to create a coding project and I've filled out a requirements form. Please analyze my answers and help me plan and build this project step by step.

Please review my form responses and:
1. Suggest the best technologies and frameworks for my project
2. Create a detailed project structure
3. Help me break down the development into manageable tasks
4. Provide code examples and guidance for implementation
5. Suggest best practices and potential challenges to consider

Here is my completed requirements form: [Please paste or attach your downloaded form file here]`;

        try {
            // First try using the modern Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(prompt);
                alert('Suggested AI prompt copied to clipboard!');
                return;
            }
            
            // Fall back to the older execCommand method
            const textArea = document.createElement('textarea');
            textArea.value = prompt;
            // Make the textarea out of viewport
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                alert('Suggested AI prompt copied to clipboard!');
            } else {
                throw new Error('Failed to copy text using execCommand');
            }
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            alert('Sorry, we couldn\'t copy to your clipboard. Please download the form and manually copy the text.');
        }
    }, []);    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading AI Project Requirements Form...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Error Loading Form</h3>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="action-button"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-form-page-container content-container">
            {renderFormElements()}
            <hr />
            <div className="form-actions-section">
                <h3>Actions</h3>
                <button onClick={handleDownloadAnswers} className="action-button download-button">
                    Download Completed Form (Markdown)
                </button>
                <p style={{fontSize: '0.9em', marginTop: '5px'}}>
                    <em>Download your answers in a Markdown file to share with an AI.</em>
                </p>
                <button onClick={copyPromptToClipboard} className="action-button copy-prompt-button" style={{marginTop: '15px'}}>
                    Copy Suggested AI Prompt
                </button>
                <p style={{fontSize: '0.9em', marginTop: '5px'}}>
                    <em>Copies a template prompt for when you submit your form to an AI. Remember to attach/paste your downloaded form.</em>
                </p>
            </div>
        </div>
    );
};

export default AiFormPage;
