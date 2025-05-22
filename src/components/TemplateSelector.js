import React, { Component } from 'react';
import { loadTemplate } from '../templates/templateUtils';

class TemplateSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTemplate: null,
            templates: [],
            error: null
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
            this.setState({ error: null });
            const template = await loadTemplate(templateName);
            this.setState({ selectedTemplate: templateName });
            this.props.onTemplateSelected(template);
        } catch (error) {
            console.error('Failed to load template:', error);
            this.setState({ error: `Failed to load template: ${error.message}` });
        }
    }

    render() {
        return (
            <div className="template-selector">
                <h2>Select a Template</h2>
                <select onChange={this.handleTemplateChange}>
                    <option value="">--Choose a Template--</option>
                    {this.state.templates.map(template => (
                        <option key={template.name} value={template.name}>
                            {template.displayName}
                        </option>
                    ))}
                </select>
                
                {this.state.error && (
                    <div className="error-message" style={{color: "red", marginTop: "10px"}}>
                        {this.state.error}
                    </div>
                )}
            </div>
        );
    }
}

export default TemplateSelector;