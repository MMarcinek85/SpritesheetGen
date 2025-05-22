import * as React from 'react';

class ToolPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTool: 'brush',
            selectedColor: '#000000',
            brushSize: 5,
            colorHistory: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'],
            showColorPicker: false
        };
    }

    tools = [
        { id: 'brush', name: 'Brush', icon: 'brush' },
        { id: 'eraser', name: 'Eraser', icon: 'eraser' },
        { id: 'fill', name: 'Fill', icon: 'fill' },
        { id: 'eyedropper', name: 'Color Picker', icon: 'eyedropper' },
        { id: 'line', name: 'Line', icon: 'line' },
        { id: 'rectangle', name: 'Rectangle', icon: 'rectangle' },
        { id: 'circle', name: 'Circle', icon: 'circle' }
    ];

    handleToolChange = (toolId) => {
        this.setState({ selectedTool: toolId });
        
        if (this.props.onToolChange) {
            this.props.onToolChange(toolId);
        }
    };

    handleColorChange = (e) => {
        const newColor = e.target.value;
        this.setState({ 
            selectedColor: newColor,
            showColorPicker: false
        });
        
        // Add to color history if not already present
        if (!this.state.colorHistory.includes(newColor)) {
            this.setState(prevState => ({
                colorHistory: [newColor, ...prevState.colorHistory.slice(0, 4)]
            }));
        }
        
        if (this.props.onColorChange) {
            this.props.onColorChange(newColor);
        }
    };

    handleBrushSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        this.setState({ brushSize: newSize });
        
        if (this.props.onBrushSizeChange) {
            this.props.onBrushSizeChange(newSize);
        }
    };

    selectHistoryColor = (color) => {
        this.setState({ selectedColor: color });
        
        if (this.props.onColorChange) {
            this.props.onColorChange(color);
        }
    };

    toggleColorPicker = () => {
        this.setState(prevState => ({ showColorPicker: !prevState.showColorPicker }));
    };

    render() {
        const { selectedTool, selectedColor, brushSize, colorHistory, showColorPicker } = this.state;

        return (
            <div className="tool-panel">
                <div className="tool-section">
                    <h3>Tools</h3>
                    <div className="tool-buttons">
                        {this.tools.map(tool => (
                            <button
                                key={tool.id}
                                className={`tool-button ${selectedTool === tool.id ? 'selected' : ''}`}
                                onClick={() => this.handleToolChange(tool.id)}
                                title={tool.name}
                            >
                                <span className={`icon-${tool.icon}`}>{tool.name.charAt(0)}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="color-section">
                    <h3>Color</h3>
                    <div className="color-preview" onClick={this.toggleColorPicker}>
                        <div className="color-swatch" style={{ backgroundColor: selectedColor }}></div>
                        <span>{selectedColor}</span>
                    </div>
                    
                    {showColorPicker && (
                        <div className="color-picker-container">
                            <input 
                                type="color" 
                                value={selectedColor} 
                                onChange={this.handleColorChange} 
                                className="color-picker"
                            />
                        </div>
                    )}
                    
                    <div className="color-history">
                        {colorHistory.map((color, index) => (
                            <div 
                                key={index}
                                className="history-color"
                                style={{ backgroundColor: color }}
                                onClick={() => this.selectHistoryColor(color)}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
                
                <div className="brush-size-section">
                    <h3>Brush Size: {brushSize}px</h3>
                    <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={brushSize} 
                        onChange={this.handleBrushSizeChange} 
                        className="brush-size-slider"
                    />
                    <div className="brush-size-preview">
                        <div 
                            className="brush-preview" 
                            style={{ 
                                width: `${brushSize}px`, 
                                height: `${brushSize}px`,
                                backgroundColor: selectedColor
                            }}
                        />
                    </div>
                </div>
                
                <div className="tool-actions">
                    <button 
                        className="action-button"
                        onClick={this.props.onUndo}
                        disabled={!this.props.canUndo}
                    >
                        Undo
                    </button>
                    <button 
                        className="action-button"
                        onClick={this.props.onRedo}
                        disabled={!this.props.canRedo}
                    >
                        Redo
                    </button>
                    <button 
                        className="action-button"
                        onClick={this.props.onClear}
                    >
                        Clear
                    </button>
                </div>

                <div className="layers-section">
                    <h3>Layers</h3>
                    <button className="action-button" onClick={this.props.onAddLayer}>
                        Add Layer
                    </button>
                    
                    {this.props.layers && (
                        <div className="layers-list">
                            {this.props.layers.map((layer, index) => (
                                <div 
                                    key={layer.id}
                                    className={`layer-item ${this.props.activeLayer === index ? 'active' : ''}`}
                                    onClick={() => this.props.onSelectLayer(index)}
                                >
                                    <span>{layer.name}</span>
                                    <div className="layer-actions">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                this.props.onToggleLayerVisibility(index);
                                            }}
                                            className="visibility-toggle"
                                        >
                                            {layer.visible ? 'Show' : 'Hide'}
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                this.props.onDeleteLayer(index);
                                            }}
                                            className="delete-layer"
                                            disabled={this.props.layers.length <= 1}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ToolPanel;