import React, { useState, useEffect, useRef } from 'react';
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
    
    // Create a stable reference to answers for use in callbacks
    const answersRef = useRef(answers);
    useEffect(() => {
        answersRef.current = answers;
        console.log("Answers state updated:", answers);
    }, [answers]);
      useEffect(() => {
        // Using an async function inside useEffect for better error handling
        const fetchMarkdown = async () => {            
            try {
                console.log('Fetching markdown form...');
                // Add cache-busting query parameter to prevent caching
                const timestamp = new Date().getTime();
                console.log(`Adding cache-busting timestamp: ${timestamp}`);
                
                // Try to fetch directly from the server rather than the cached version
                const response = await fetch(`/AI_Project_Requirements_Form.md?nocache=${timestamp}`, {
                    method: 'GET',
                    cache: 'no-cache', // Tell browser not to use cache
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const text = await response.text();
                console.log('Received form content length:', text.length);
                
                // Check if we got valid content
                if (!text || text.trim() === '') {
                    throw new Error('Empty content received from server');
                }
                
                console.log('Setting markdown content...');
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

    const handleInputChange = (id, value) => {
        console.log(`Updating answer for ${id}:`, value);
        setAnswers(prevAnswers => {
            const newAnswers = {
                ...prevAnswers,
                [id]: value
            };
            return newAnswers;
        });
    };
    
    function renderFormElements() {
        if (!markdownContent) return [];

        const lines = markdownContent.split('\n');
        const elements = [];
        let currentQuestionId = null;
        let lastQuestionId = null; // Track the last seen question ID
        let inCheckboxList = false;
        let checkboxItems = [];
        let inUlList = false;
        let ulItems = [];
        let inOlList = false;
        let olItems = [];
        let currentListNumber = 1;
        let renderedAiPrompt = false;
        
        // Use the latest answers state directly
        const currentAnswers = answers || {};

        const closeCheckboxList = () => {
            if (inCheckboxList && checkboxItems.length > 0) {
                // Generate a unique key for each checkbox list
                const listKey = `checkbox-list-${currentQuestionId || elements.length}-${Math.random().toString(36).substring(2, 9)}`;
                elements.push(
                    <ul key={listKey} className="form-checkbox-list">
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
        };        const closeAllLists = () => {
            closeCheckboxList();
            closeUlList();
            closeOlList();
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Debugging for Section 6
            const isSection6Debug = (currentQuestionId && currentQuestionId.startsWith("6.")) || (lastQuestionId && lastQuestionId.startsWith("6."));
            if (isSection6Debug) {
                console.log(`[S6 DEBUG] Line ${index + 1}: "${trimmedLine}" | currentQ: ${currentQuestionId} | lastQ: ${lastQuestionId}`);
            }

            // Skip empty lines but don't close lists (allows for spacing in lists)
            if (trimmedLine === '') {
                if (!inCheckboxList && !inUlList && !inOlList) {
                    elements.push(<div key={`empty-${index}`} className="empty-line" />);
                }
                return;
            }            // 1. Horizontal Rule
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
                lastQuestionId = currentQuestionId; // Update last seen question ID
                const questionTextHtml = formatLineAsHtml(line.replace(/^\s*\*\s*/, ''));                elements.push(
                    <div key={`question-${currentQuestionId}-${index}`} className="form-question-block"
                         dangerouslySetInnerHTML={{ __html: questionTextHtml }} />
                );
                return;
            }

            // 3. "Your Answer" Line
            if ((trimmedLine.toLowerCase().startsWith('*   your answer') || trimmedLine.toLowerCase().startsWith('* your answer'))) {
                const fieldId = lastQuestionId ? `field-${lastQuestionId}-${index}` : `field-unknown-${index}`;
                
                if (isSection6Debug) {
                    console.log(`[S6 DEBUG] Matched "Your Answer" for line ${index + 1}. lastQ: ${lastQuestionId}, fieldId: ${fieldId}`);
                }
                
                if (!lastQuestionId) {
                    console.warn(`No question ID found for answer at line ${index}. Using fallback ID: ${fieldId}`);
                } else {
                    console.log(`Creating answer field with ID: ${fieldId} for question ${lastQuestionId} at line ${index}`);
                }
                
                closeAllLists();
                
                elements.push(
                    <div key={`container-${fieldId}`} className="textarea-container">
                        <textarea
                            id={fieldId}
                            key={fieldId}
                            className="form-answer-textarea"
                            // Use fieldId as the state key rather than lastQuestionId
                            value={currentAnswers[fieldId] || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                console.log(`Textarea change for fieldId=${fieldId} (question=${lastQuestionId}, line=${index}):`, value);
                                handleInputChange(fieldId, value);
                            }}
                            onFocus={(e) => console.log(`Textarea focused: fieldId=${fieldId}, question=${lastQuestionId}, line=${index}`)}
                            placeholder="Type your answer here..."
                            rows={trimmedLine.toLowerCase().includes('(list)') ? 6 : 3}
                            style={{
                                // Direct inline styles to override any problematic CSS
                                color: 'black',
                                backgroundColor: 'white',
                                border: '2px solid #3498db',
                                padding: '10px',
                                width: '100%',
                                minHeight: '80px',
                                zIndex: 1000,
                                opacity: 1,
                                position: 'relative'
                            }}
                        />
                    </div>
                );
                return;
            }

            // 4. Checkbox Line
            const checkboxMatch = currentQuestionId && trimmedLine.match(/^\s*\*\s*\[( |x)\]\s*(.*)/i);
            if (checkboxMatch) {
                closeUlList();
                closeOlList();
                // Moved labelText and isOtherOption definitions up for early access in debug log
                const currentLabelText = checkboxMatch[2]; 
                const currentIsOtherOption = currentLabelText.toLowerCase().includes('other') || 
                                             currentLabelText.toLowerCase().includes('please describe');

                if (isSection6Debug) {
                    console.log(`[S6 DEBUG] Matched Checkbox for line ${index + 1}. currentQ: ${currentQuestionId}, label: "${currentLabelText}"`);
                    if (currentIsOtherOption) {
                        const checkboxId = `checkbox-${currentQuestionId}-${currentLabelText.trim().toLowerCase().replace(/\W+/g, '-')}`;
                        console.log(`[S6 DEBUG] Checkbox is "Other" type. checkboxId: ${checkboxId}`);
                    }
                }
                
                if (!inCheckboxList) {
                    inCheckboxList = true;
                }

                const checkboxId = `checkbox-${currentQuestionId}-${currentLabelText.trim().toLowerCase().replace(/\W+/g, '-')}`;
                const uniqueKey = `${checkboxId}-${index}`;
                
                const item = (
                    <li key={uniqueKey} className="form-checkbox-item">
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id={checkboxId}
                                checked={!!currentAnswers[checkboxId]}
                                onChange={(e) => {
                                    console.log(`Checkbox change for ${checkboxId}:`, e.target.checked);
                                    handleInputChange(checkboxId, e.target.checked);
                                    
                                    if (!e.target.checked && currentIsOtherOption) { // Use currentIsOtherOption
                                        handleInputChange(`${checkboxId}-text`, '');
                                    }
                                }}
                            />
                            <label htmlFor={checkboxId} dangerouslySetInnerHTML={{ __html: formatLineAsHtml(currentLabelText, true) }} /> {/* Use currentLabelText */}
                        </div>
                    </li>
                );
                
                checkboxItems.push(item);
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
                
                // Create a more unique and stable key
                const itemContent = ulItemMatch[1].trim();
                const uniqueItemKey = `ul-item-${currentQuestionId || ''}-${index}-${itemContent.substring(0, 10).replace(/\W+/g, '-')}`;
                
                ulItems.push(
                    <li key={uniqueItemKey} dangerouslySetInnerHTML={{ __html: formatLineAsHtml(itemContent, true) }} />
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
                
                // Create a more unique and stable key
                const itemContent = olItemMatch[2].trim();
                const uniqueItemKey = `ol-item-${currentQuestionId || ''}-${index}-${olItemMatch[1]}-${itemContent.substring(0, 10).replace(/\W+/g, '-')}`;
                
                olItems.push(
                    <li key={uniqueItemKey} value={olItemMatch[1]} dangerouslySetInnerHTML={{ __html: formatLineAsHtml(itemContent, true) }} />
                );
                return;
            }

            // If we get here, we're not in a list item, so close any open lists
            // but not the AI prompt blockquote, as it can span multiple lines.
            closeCheckboxList();
            closeUlList();
            closeOlList();


            // Specific handler for the "**Suggested Prompt to Use with an AI:**" line
            const targetBoldedLine = "**Suggested Prompt to Use with an AI:**";
            const displayTextForButtonSection = "Suggested Prompt to Use with an AI:";

            if (trimmedLine === targetBoldedLine) {
                elements.push(
                    <div key={`suggested-prompt-container-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '20px' }}>
                        <h3 style={{ margin: '0', marginRight: '10px', flexGrow: 1 }}>{displayTextForButtonSection}</h3>
                        <button
                            key={`copy-prompt-btn-${index}`}
                            onClick={copyPromptToClipboard}
                            className="action-button copy-prompt-button"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            Copy Suggested AI Prompt
                        </button>
                    </div>
                );
                elements.push(
                    <p key={`copy-prompt-desc-${index}`} style={{fontSize: '0.9em', marginTop: '5px', marginBottom: '15px', width: '100%'}}>
                        <em>Copies a template prompt for when you submit your form to an AI. Remember to attach/paste your downloaded form.</em>
                    </p>
                );
                // Render the hardcoded prompt text in a single blue box, only once
                if (!renderedAiPrompt) {
                    const promptText = `I want to create a coding project and I've filled out a requirements form. Please analyze my answers and help me plan and build this project step by step.\n\nPlease review my form responses and:\n1. Suggest the best technologies and frameworks for my project\n2. Create a detailed project structure\n3. Help me break down the development into manageable tasks\n4. Provide code examples and guidance for implementation\n5. Suggest best practices and potential challenges to consider\n\nHere is my completed requirements form: [Please paste or attach your downloaded form file here]`;
                    elements.push(
                        <div key="ai-prompt-single-block" className="ai-prompt-suggestion" style={{whiteSpace: 'pre-line', marginTop: 10, marginBottom: 20}}>
                            {promptText}
                        </div>
                    );
                    renderedAiPrompt = true;
                }
                return;
            }            // Skip blockquotes in the markdown since we're using hardcoded prompt
            else if (trimmedLine.startsWith('> ')) {
                // Skip blockquote lines entirely - they're replaced by our hardcoded prompt
                return;
            }
            // Process actual Markdown Headers (e.g., #, ##, ###)
            else if (trimmedLine.startsWith('#')) {
                const formattedHeader = formatLineAsHtml(trimmedLine);
                if (formattedHeader) {
                    elements.push(<div key={`header-${index}`} dangerouslySetInnerHTML={{ __html: formattedHeader }} />);
                }
                return;
            }
            // Process all other regular content lines
            else {
                const formattedLine = formatLineAsHtml(trimmedLine);
                if (formattedLine) {
                    // Avoid wrapping the "Suggested Prompt..." H3 again if formatLineAsHtml adds <p>
                    if (trimmedLine === targetBoldedLine) {
                        // Already handled, but if formatLineAsHtml was called, it might wrap it.
                        // This path should ideally not be hit for the targetBoldedLine if handled above.
                    } else {
                        elements.push(<div key={`line-${index}`} dangerouslySetInnerHTML={{ __html: formattedLine }} />);
                    }
                }
            }
        });        closeAllLists();
        return elements;
    }

    const handleDownloadAnswers = () => {
        if (!markdownContent) {
            alert('Error: Form content is missing. Please refresh the page and try again.');
            return;
        }
        
        const currentAnswers = answersRef.current;
        
        try {
            let output = `# AI Project Requirements - My Answers\n\n`;
            const lines = markdownContent.split('\n');
            let currentQuestionContextId = null; 
    
            lines.forEach(line => {
                if (!line && !line.trim()) { // Keep empty lines from markdown for spacing if they are not just whitespace
                    output += '\n';
                    return;
                }
                if (!line.trim()) return; // Skip lines that are only whitespace
                
                const trimmedLine = line.trim();
                const questionIdMatch = trimmedLine.match(/^\*\s*\*\*(\d+\.\d+)\.\s*([^:]+):/);
                const isAnswerLine = currentQuestionContextId && (trimmedLine.toLowerCase().startsWith('*   your answer') || trimmedLine.toLowerCase().startsWith('* your answer'));
                const checkboxMatch = currentQuestionContextId && trimmedLine.match(/^\s*\*\s*\[( |x)\]\s*(.*)/i);

                if (questionIdMatch) {
                    currentQuestionContextId = questionIdMatch[1];
                    output += `${line}\n`;
                } else if (isAnswerLine) {
                    output += `${line}\n`;
                    let answerText = 'No answer provided.';
                    for (const key in currentAnswers) {
                        if (key.startsWith(`field-${currentQuestionContextId}-`)) {
                            answerText = currentAnswers[key] || 'No answer provided.';
                            break; 
                        }
                    }
                    output += `        \`\`\`text\n${answerText}\n        \`\`\`\n\n`;
                } else if (checkboxMatch) {
                    const labelText = checkboxMatch[2];
                    const checkboxId = `checkbox-${currentQuestionContextId}-${labelText.trim().toLowerCase().replace(/\W+/g, '-')}`;
                    const isChecked = !!currentAnswers[checkboxId];
                    output += `    *   [${isChecked ? 'x' : ' '}] ${labelText}\n`;
                } else {
                    output += `${line}\n`;
                }
            });

            const blob = new Blob([output], { type: 'text/markdown;charset=utf-8;' });
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
    };

    const generateTxtOutput = (markdown, answers) => {
        let output = "AI Project Requirements - My Answers (Text Version)\n\n";
        const lines = markdown.split('\n');
        let currentQuestionNumber = null;
        let currentSectionTitle = "";
    
        lines.forEach(line => {
            const trimmedLine = line.trim();
    
            const sectionHeaderMatch = trimmedLine.match(/^##\s+(.*)/); // e.g., ## 1. Your Project Idea
            const questionMatch = trimmedLine.match(/^\*\s*\*\*(\d+\.\d+(.\d+)?)\.\s*([^:]+):/); // e.g., * **1.1. Project Title/Name:**
            const checkboxMatch = trimmedLine.match(/^\s*\*\s*\[( |x)\]\s*(.*)/i); // e.g., * [ ] Web browser
            const yourAnswerMarker = trimmedLine.toLowerCase().startsWith('* your answer') || trimmedLine.toLowerCase().startsWith('*   your answer');
            const descriptiveLine = !questionMatch && !checkboxMatch && !yourAnswerMarker && !sectionHeaderMatch && 
                                   trimmedLine && !trimmedLine.startsWith('---') && !trimmedLine.startsWith('<!--') && 
                                   !trimmedLine.startsWith('>') && !trimmedLine.startsWith('**Instructions:**') && !trimmedLine.startsWith('**Hello Future Developer!') &&
                                   !trimmedLine.startsWith('**Thank you for your detailed input!') && !trimmedLine.startsWith('**Suggested Prompt to Use with an AI:') &&
                                   !trimmedLine.match(/^Remember to replace/);


            if (sectionHeaderMatch) {
                currentSectionTitle = sectionHeaderMatch[1].trim();
                output += `\n${currentSectionTitle.toUpperCase()}\n====================================\n`;
                currentQuestionNumber = null; 
            } else if (questionMatch) {
                currentQuestionNumber = questionMatch[1];
                const questionText = questionMatch[3].trim();
                output += `\n${currentQuestionNumber}. ${questionText}:\n`;
            } else if (checkboxMatch && currentQuestionNumber) {
                const labelText = checkboxMatch[2].trim();
                const checkboxId = `checkbox-${currentQuestionNumber}-${labelText.toLowerCase().replace(/\W+/g, '-')}`;
                const isChecked = !!answers[checkboxId];
                output += `  [${isChecked ? 'x' : ' '}] ${labelText}\n`;
            } else if (yourAnswerMarker && currentQuestionNumber) {
                let answerText = 'No answer provided.';
                for (const key in answers) {
                    if (key.startsWith(`field-${currentQuestionNumber}-`)) {
                        answerText = answers[key] || 'No answer provided.';
                        break;
                    }
                }
                output += `\n  Your Answer:\n    ${answerText.split('\n').join('\n    ')}\n`;
            } else if (descriptiveLine && (trimmedLine.startsWith('Common options:') || trimmedLine.startsWith('*   Example:'))) {
                 output += `  ${trimmedLine}\n`;
            }
        });
        return output;
    };

    const handleDownloadAnswersAsTxt = () => {
        if (!markdownContent) {
            alert('Error: Form content is missing. Please refresh the page and try again.');
            return;
        }
        const currentAnswers = answersRef.current;
        try {
            const txtOutput = generateTxtOutput(markdownContent, currentAnswers);
            const blob = new Blob([txtOutput], { type: 'text/plain;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'AI_Project_Filled_Form.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download TXT answers:", error);
            alert('There was an error downloading your answers as TXT. Please try again.');
        }
    };
    
    const copyPromptToClipboard = async () => {
        const promptText = `I want to create a coding project and I've filled out a requirements form. Please analyze my answers and help me plan and build this project step by step.\r\n\r\nPlease review my form responses and:\r\n1. Suggest the best technologies and frameworks for my project\r\n2. Create a detailed project structure\r\n3. Help me break down the development into manageable tasks\r\n4. Provide code examples and guidance for implementation\r\n5. Suggest best practices and potential challenges to consider\r\n\r\nHere is my completed requirements form: [Please paste or attach your downloaded form file here]`;

        try {
            // First try using the modern Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(promptText);
                alert('Suggested AI prompt copied to clipboard!');
                return;
            }
            
            // Fall back to the older execCommand method
            const textArea = document.createElement('textarea');
            textArea.value = promptText; // Ensure this uses the correct promptText variable
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
    };

    // Render the content based on current state
    const renderContent = () => {
        if (isLoading) {
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

        // Main form content
        return (
            <>
                {renderFormElements()}
                <hr />
                <div className="form-actions-section">
                    <h3>Actions</h3>
                    <button onClick={handleDownloadAnswers} className="action-button download-button">
                        Download Completed Form (Markdown)
                    </button>
                    <p style={{fontSize: '0.9em', marginTop: '5px', marginBottom: '15px'}}>
                        <em>Download your answers in a Markdown file to share with an AI.</em>
                    </p>
                    <button onClick={handleDownloadAnswersAsTxt} className="action-button download-button">
                        Download Completed Form (TXT)
                    </button>
                    <p style={{fontSize: '0.9em', marginTop: '5px'}}>
                        <em>Download your answers in a plain text file.</em>
                    </p>
                </div>
            </>
        );
    };

    console.log("Rendering AiFormPage, answers:", answers);
    return (
        <div className="ai-form-page-container content-container" style={{ overflowY: "auto", height: "calc(100vh - 120px)" }}>
            {renderContent()}
        </div>
    );
};

export default AiFormPage;
