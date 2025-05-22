import React, { Component } from 'react';
import { loadTemplate } from '../templates/templateUtils';

class TemplateSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTemplate: null,
            templates: []
        };
    }

    componentDidMount() {
        this.fetchTemplates();
    }

    fetchTemplates = async () => {
        // Fetch available templates (this could be from a local file or an API)
        const templates = await this.loadTemplatesFromPublic();
        this.setState({ templates });
    }

    loadTemplatesFromPublic = async () => {
        const response = await fetch('/templates/topDownCharacter.js');
        const templates = await response.json();
        return templates;
    }

    handleTemplateChange = (event) => {
        const selectedTemplate = event.target.value;
        this.setState({ selectedTemplate });
        this.applyTemplate(selectedTemplate);
    }

    applyTemplate = (templateName) => {
        const template = loadTemplate(templateName);
        this.props.onTemplateSelected(template);
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
            </div>
        );
    }
}

export default TemplateSelector;