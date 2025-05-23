import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Canvas from './components/Canvas';
import ToolPanel from './components/ToolPanel';
import AnimationPreview from './components/AnimationPreview';
import TemplateSelector from './components/TemplateSelector';
import SpritesheetExporter from './components/SpritesheetExporter';
import AiFormPage from './components/AiFormPage'; // Import the new component
import { generateAnimationFrames } from './templates/templateUtils';
import './styles/main.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTemplate: null,
            spriteParts: {}, // User-drawn sprite parts
            generatedFrames: [], // Generated animation frames
            isGenerating: false,
            currentView: 'spritesheet', // 'spritesheet' or 'aiForm'
        };
        
        this.canvasRef = React.createRef();
    }
    
    handleTemplateSelected = (template) => {
        this.setState({ selectedTemplate: template });
    };
    
    captureSpriteParts = () => {
        if (!this.canvasRef.current || !this.state.selectedTemplate) {
            alert('Please select a template first!');
            return;
        }
        
        // Get the canvas data for each part from the drawing
        const template = this.state.selectedTemplate;
        const templateParts = template.frames[0].parts;
        const capturedParts = {};
        
        // For simplicity, we're just capturing the entire canvas as one part
        // In a real implementation, you'd extract each part based on the template regions
        const canvasImage = this.canvasRef.current.exportCanvasImage();
        
        // For each template part, create a captured part
        Object.entries(templateParts).forEach(([partName, partDetails]) => {
            capturedParts[partName] = {
                imageData: canvasImage,
                position: { x: 0, y: 0 },
                size: partDetails.size
            };
        });
        
        this.setState({ spriteParts: capturedParts }, this.generateAnimationFrames);
    };
    
    generateAnimationFrames = () => {
        if (!this.state.selectedTemplate || Object.keys(this.state.spriteParts).length === 0) {
            return;
        }
        
        this.setState({ isGenerating: true });
        
        // Use the template to generate animation frames
        setTimeout(() => {
            const generatedFrames = generateAnimationFrames(
                this.state.selectedTemplate,
                this.state.spriteParts
            );
            
            this.setState({ 
                generatedFrames, 
                isGenerating: false 
            });
        }, 500); // Short timeout to show loading state
    };

    setView = (view) => {
        this.setState({ currentView: view });
    };
    
    render() {
        const { selectedTemplate, generatedFrames, isGenerating, currentView } = this.state;
        
        return (
            <div className="app-container">
                <header className="header">
                    <h1>Spritesheet Generator & AI Project Assistant</h1>
                    <nav className="main-nav">
                        <button onClick={() => this.setView('spritesheet')} disabled={currentView === 'spritesheet'}>
                            Spritesheet Generator
                        </button>
                        <button onClick={() => this.setView('aiForm')} disabled={currentView === 'aiForm'}>
                            AI Project Form
                        </button>
                    </nav>
                </header>
                
                {currentView === 'spritesheet' && (
                    <main className="main-content">
                        <div className="sidebar">
                            <ToolPanel 
                                onToolChange={(tool) => {
                                    if (this.canvasRef.current) {
                                        this.canvasRef.current.changeTool(tool);
                                    }
                                }}
                                onColorChange={(color) => {
                                    if (this.canvasRef.current) {
                                        this.canvasRef.current.changeColor(color);
                                    }
                                }}
                                onBrushSizeChange={(size) => {
                                    if (this.canvasRef.current) {
                                        this.canvasRef.current.changeBrushSize(size);
                                    }
                                }}
                                onClear={() => {
                                    if (this.canvasRef.current) {
                                        this.canvasRef.current.clear();
                                    }
                                }}
                                onAddLayer={() => {
                                    if (this.canvasRef.current) {
                                        this.canvasRef.current.addNewLayer();
                                    }
                                }}
                                onSelectLayer={(index) => {
                                    if (this.canvasRef.current) {
                                        this.canvasRef.current.changeActiveLayer(index);
                                    }
                                }}
                                onToggleLayerVisibility={(index) => {
                                    if (this.canvasRef.current) {
                                        this.canvasRef.current.toggleLayerVisibility(index);
                                    }
                                }}
                                onDeleteLayer={(index) => {
                                    if (this.canvasRef.current) {
                                        this.canvasRef.current.deleteLayer(index);
                                    }
                                }}
                                layers={this.canvasRef.current?.state?.layers || []}
                                activeLayer={this.canvasRef.current?.state?.activeLayer || 0}
                            />
                            
                            <TemplateSelector onTemplateSelected={this.handleTemplateSelected} />
                            
                            <div className="generate-section">
                                <button 
                                    className="generate-button action-button"
                                    onClick={this.captureSpriteParts}
                                    disabled={!selectedTemplate || isGenerating}
                                >
                                    {isGenerating ? 'Generating...' : 'Generate Animation Frames'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="content-area">
                            <div className="canvas-section">
                                <Canvas 
                                    ref={this.canvasRef}
                                    template={selectedTemplate}
                                />
                            </div>
                            
                            <div className="bottom-panel">
                                <div className="preview-section">
                                    <AnimationPreview frames={generatedFrames} />
                                </div>
                                
                                <div className="export-section">
                                    <SpritesheetExporter frames={generatedFrames} />
                                </div>
                            </div>
                        </div>
                    </main>
                )}

                {currentView === 'aiForm' && (
                    <main className="main-content ai-form-view">
                        <AiFormPage />
                    </main>
                )}
                
                <footer className="footer">
                    <p>&copy; {new Date().getFullYear()} Spritesheet Generator & AI Project Assistant</p>
                </footer>
            </div>
        );
    }
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));