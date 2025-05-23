import React, { Component } from 'react';
import { loadTemplate } from '../templates/templateUtils';

class TemplateSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTemplate: null,
            templates: [],
            error: null,
            loading: false
        };
    }

    componentDidMount() {
        this.fetchTemplates();
    }

    fetchTemplates = async () => {
        // List of available templates
        const templateNames = ['walk', 'run', 'idle'];
        
        // Create template objects with display names
        const templates = templateNames.map(name => ({
            name,
            displayName: name.charAt(0).toUpperCase() + name.slice(1)
        }));
        
        this.setState({ templates });
    }

    handleTemplateChange = async (event) => {
        const templateName = event.target.value;
        if (!templateName) return;
        
        try {
            this.setState({ error: null, loading: true });
            const template = await loadTemplate(templateName);
            this.setState({ selectedTemplate: templateName, loading: false });
            this.props.onTemplateSelected(template);
        } catch (error) {
            console.error('Failed to load template:', error);
            this.setState({ 
                error: `Failed to load template "${templateName}": ${error.message}`, 
                loading: false,
                selectedTemplate: null
            });
        }
    }

    render() {
        return (
            <div className="template-selector">
                <h2>Select a Template</h2>
                <select 
                    onChange={this.handleTemplateChange} 
                    disabled={this.state.loading}
                    className={this.state.error ? 'template-select-error' : ''}
                    style={{
                        padding: '8px',
                        borderRadius: '4px',
                        width: '100%',
                        marginBottom: '10px',
                        borderColor: this.state.error ? '#ff3333' : '#dddddd'
                    }}
                >
                    <option value="">--Choose a Template--</option>
                    {this.state.templates.map(template => (
                        <option key={template.name} value={template.name}>
                            {template.displayName}
                        </option>
                    ))}
                </select>
                
                {this.state.loading && (
                    <div className="loading-indicator" style={{
                        color: "#3498db", 
                        marginTop: "10px", 
                        fontStyle: "italic"
                    }}>
                        Loading template...
                    </div>
                )}
                
                {this.state.error && (
                    <div className="error-message" style={{
                        color: "#ff3333", 
                        marginTop: "10px", 
                        padding: "8px", 
                        backgroundColor: "#ffeeee", 
                        borderRadius: "4px", 
                        border: "1px solid #ff9999"
                    }}>
                        <strong>Error:</strong> {this.state.error}
                    </div>
                )}
            </div>
        );
    }
}

export default TemplateSelector;