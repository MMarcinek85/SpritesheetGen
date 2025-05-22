import React, { Component } from 'react';

class SpritesheetExporter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            frameWidth: 64,
            frameHeight: 64,
            padding: 2,
            columns: 8,
            exportFormat: 'png',
            exportType: 'spritesheet', // 'spritesheet' or 'individual'
            includeGodotMetadata: true,
            showPreview: false // Ensure it's initially false if not set
        };
        
        this.canvasRef = React.createRef();
        this.canvas = null; // Initialize canvas and ctx as null
        this.ctx = null;
    }
    
    componentDidMount() {
        // Intentionally left blank for canvas/ctx initialization
        // We will initialize when the preview is shown
    }
    
    componentDidUpdate(prevProps, prevState) {
        // If frames changed and preview is showing, update the preview
        if (prevProps.frames !== this.props.frames && this.state.showPreview && this.ctx) {
            this.generatePreview();
        }

        // Initialize canvas and context when showPreview becomes true and canvas is rendered
        if (this.state.showPreview && !prevState.showPreview && this.canvasRef.current) {
            this.canvas = this.canvasRef.current;
            this.ctx = this.canvas.getContext('2d');
            this.generatePreview(); // Generate preview once context is set
        } else if (!this.state.showPreview && prevState.showPreview) {
            // Optional: Clear canvas or reset when preview is hidden
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            this.canvas = null;
            this.ctx = null;
        }
    }
    
    handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        this.setState({ [name]: type === 'number' ? parseInt(newValue, 10) : newValue }, () => {
            if (this.state.showPreview) {
                this.generatePreview();
            }
        });
    };
    
    togglePreview = () => {
        this.setState(prevState => ({ showPreview: !prevState.showPreview }), () => {
            // If we are showing the preview and the context isn't set up yet
            // (e.g., first time or if it was cleared), componentDidUpdate will handle it.
            // If we are hiding, componentDidUpdate will also handle cleanup.
            // If already showing and context exists, generatePreview.
            if (this.state.showPreview && this.ctx) {
                this.generatePreview();
            }
        });
    };
    
    generatePreview() {
        if (!this.ctx) { // Check if context is available
            // console.warn("Attempted to generate preview, but canvas context is not initialized.");
            return; 
        }
        const { frames } = this.props;
        if (!frames || frames.length === 0) return;
        
        const { frameWidth, frameHeight, padding, columns, exportType } = this.state;
        
        // Reset canvas size based on export type and frame count
        if (exportType === 'spritesheet') {
            const rows = Math.ceil(frames.length / columns);
            this.canvas.width = columns * (frameWidth + padding) - padding;
            this.canvas.height = rows * (frameHeight + padding) - padding;
        } else {
            // For individual frames, just show the first frame
            this.canvas.width = frameWidth;
            this.canvas.height = frameHeight;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (exportType === 'spritesheet') {
            // Draw frames as a spritesheet
            frames.forEach((frame, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                const x = col * (frameWidth + padding);
                const y = row * (frameHeight + padding);
                
                this.drawFrameToCanvas(frame, x, y, frameWidth, frameHeight);
            });
        } else {
            // Draw just the first frame for individual export preview
            this.drawFrameToCanvas(frames[0], 0, 0, frameWidth, frameHeight);
        }
    }
    
    drawFrameToCanvas(frame, x, y, width, height) {
        // If frame has single image data
        if (frame.imageData) {
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, x, y, width, height);
            };
            img.src = frame.imageData;
            return;
        }
        
        // If frame has multiple parts
        if (frame.parts) {
            // Create a temporary canvas to compose the frame
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw all parts to the temporary canvas
            Object.entries(frame.parts).forEach(([partName, part]) => {
                if (part.imageData) {
                    const img = new Image();
                    img.onload = () => {
                        tempCtx.save();
                        
                        // Apply transformations
                        tempCtx.translate(part.position.x, part.position.y);
                        
                        if (part.rotation) {
                            const pivotX = part.pivot?.x || 0;
                            const pivotY = part.pivot?.y || 0;
                            tempCtx.translate(pivotX, pivotY);
                            tempCtx.rotate(part.rotation * Math.PI / 180);
                            tempCtx.translate(-pivotX, -pivotY);
                        }
                        
                        if (part.scale) {
                            tempCtx.scale(part.scale.x, part.scale.y);
                        }
                        
                        tempCtx.drawImage(img, 0, 0);
                        tempCtx.restore();
                        
                        // After drawing all parts, copy to the main canvas
                        this.ctx.drawImage(tempCanvas, x, y, width, height);
                    };
                    img.src = part.imageData;
                }
            });
        }
    }
    
    exportSpritesheet = () => {
        const { frames } = this.props;
        if (!frames || frames.length === 0) {
            alert('No frames to export!');
            return;
        }
        
        const { frameWidth, frameHeight, padding, columns, exportFormat, exportType } = this.state;
        
        if (exportType === 'spritesheet') {
            // Create final spritesheet canvas
            const rows = Math.ceil(frames.length / columns);
            const canvas = document.createElement('canvas');
            canvas.width = columns * (frameWidth + padding) - padding;
            canvas.height = rows * (frameHeight + padding) - padding;
            const ctx = canvas.getContext('2d');
            
            // Function to draw all frames to the spritesheet
            const drawAllFrames = async () => {
                // Promise to ensure all frames are drawn before exporting
                const drawPromises = frames.map((frame, index) => {
                    return new Promise(resolve => {
                        const row = Math.floor(index / columns);
                        const col = index % columns;
                        const x = col * (frameWidth + padding);
                        const y = row * (frameHeight + padding);
                        
                        this.renderFrameToCanvas(frame, ctx, x, y, frameWidth, frameHeight, resolve);
                    });
                });
                
                // Wait for all frames to be drawn
                await Promise.all(drawPromises);
                
                // Export the spritesheet
                const dataUrl = canvas.toDataURL(`image/${exportFormat}`);
                this.downloadImage(dataUrl, `spritesheet.${exportFormat}`);
                
                // Export Godot metadata if selected
                if (this.state.includeGodotMetadata) {
                    const metadata = this.generateGodotMetadata(frames.length, columns, rows, frameWidth, frameHeight);
                    this.downloadText(metadata, 'spritesheet.tres');
                }
            };
            
            drawAllFrames();
        } else {
            // Export individual frames
            frames.forEach((frame, index) => {
                const canvas = document.createElement('canvas');
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                const ctx = canvas.getContext('2d');
                
                this.renderFrameToCanvas(frame, ctx, 0, 0, frameWidth, frameHeight, () => {
                    const dataUrl = canvas.toDataURL(`image/${exportFormat}`);
                    this.downloadImage(dataUrl, `frame_${index + 1}.${exportFormat}`);
                });
            });
        }
    };
    
    renderFrameToCanvas(frame, ctx, x, y, width, height, callback) {
        // If frame has single image data
        if (frame.imageData) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, x, y, width, height);
                if (callback) callback();
            };
            img.src = frame.imageData;
            return;
        }
        
        // If frame has multiple parts
        if (frame.parts) {
            // Create a temporary canvas to compose the frame
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Count how many parts we need to load
            const partCount = Object.keys(frame.parts).length;
            let loadedCount = 0;
            
            // Draw all parts to the temporary canvas
            Object.entries(frame.parts).forEach(([partName, part]) => {
                if (part.imageData) {
                    const img = new Image();
                    img.onload = () => {
                        tempCtx.save();
                        
                        // Apply transformations
                        tempCtx.translate(part.position.x, part.position.y);
                        
                        if (part.rotation) {
                            const pivotX = part.pivot?.x || 0;
                            const pivotY = part.pivot?.y || 0;
                            tempCtx.translate(pivotX, pivotY);
                            tempCtx.rotate(part.rotation * Math.PI / 180);
                            tempCtx.translate(-pivotX, -pivotY);
                        }
                        
                        if (part.scale) {
                            tempCtx.scale(part.scale.x, part.scale.y);
                        }
                        
                        tempCtx.drawImage(img, 0, 0);
                        tempCtx.restore();
                        
                        loadedCount++;
                        
                        // After drawing all parts, copy to the main canvas
                        if (loadedCount === partCount) {
                            ctx.drawImage(tempCanvas, x, y, width, height);
                            if (callback) callback();
                        }
                    };
                    img.src = part.imageData;
                } else {
                    loadedCount++;
                }
            });
            
            // Handle case with no valid parts
            if (loadedCount === partCount && callback) {
                callback();
            }
        }
    }
    
    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    downloadText(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    generateGodotMetadata(frameCount, columns, rows, frameWidth, frameHeight) {
        // Basic Godot SpriteFrames resource
        return `[gd_resource type="SpriteFrames" load_steps=${frameCount + 1} format=2]

[ext_resource path="res://spritesheet.${this.state.exportFormat}" type="Texture" id=1]

[resource]
animations = [ {
"frames": [ ${Array.from({ length: frameCount }, (_, i) => {
            const x = (i % columns) * (frameWidth + this.state.padding);
            const y = Math.floor(i / columns) * (frameHeight + this.state.padding);
            return `SubResource( ${i + 2} )`;
        }).join(", ")} ],
"loop": true,
"name": "default",
"speed": ${this.state.fps || 10}.0
} ]

${Array.from({ length: frameCount }, (_, i) => {
            const x = (i % columns) * (frameWidth + this.state.padding);
            const y = Math.floor(i / columns) * (frameHeight + this.state.padding);
            return `[sub_resource type="AtlasTexture" id=${i + 2}]
atlas = ExtResource( 1 )
region = Rect2( ${x}, ${y}, ${frameWidth}, ${frameHeight} )`;
        }).join("\n\n")}
`;
    }
    
    render() {
        const { frameWidth, frameHeight, padding, columns, exportFormat, exportType, includeGodotMetadata, showPreview } = this.state;
        const { frames } = this.props;
        const frameCount = frames ? frames.length : 0;
        
        return (
            <div className="spritesheet-exporter">
                <h3>Export Settings</h3>
                
                <div className="export-settings">
                    <div className="setting-group">
                        <label>
                            Export Type:
                            <select name="exportType" value={exportType} onChange={this.handleInputChange}>
                                <option value="spritesheet">Spritesheet</option>
                                <option value="individual">Individual Frames</option>
                            </select>
                        </label>
                    </div>
                    
                    <div className="setting-group">
                        <label>
                            Frame Width:
                            <input 
                                type="number" 
                                name="frameWidth" 
                                value={frameWidth} 
                                onChange={this.handleInputChange} 
                                min="16" 
                                max="512"
                            />
                        </label>
                    </div>
                    
                    <div className="setting-group">
                        <label>
                            Frame Height:
                            <input 
                                type="number" 
                                name="frameHeight" 
                                value={frameHeight} 
                                onChange={this.handleInputChange}
                                min="16" 
                                max="512" 
                            />
                        </label>
                    </div>
                    
                    {exportType === 'spritesheet' && (
                        <>
                            <div className="setting-group">
                                <label>
                                    Padding:
                                    <input 
                                        type="number" 
                                        name="padding" 
                                        value={padding} 
                                        onChange={this.handleInputChange}
                                        min="0" 
                                        max="20" 
                                    />
                                </label>
                            </div>
                            
                            <div className="setting-group">
                                <label>
                                    Columns:
                                    <input 
                                        type="number" 
                                        name="columns" 
                                        value={columns} 
                                        onChange={this.handleInputChange}
                                        min="1" 
                                        max="16" 
                                    />
                                </label>
                            </div>
                        </>
                    )}
                    
                    <div className="setting-group">
                        <label>
                            Format:
                            <select name="exportFormat" value={exportFormat} onChange={this.handleInputChange}>
                                <option value="png">PNG</option>
                                <option value="jpeg">JPEG</option>
                            </select>
                        </label>
                    </div>
                    
                    <div className="setting-group">
                        <label>
                            <input 
                                type="checkbox" 
                                name="includeGodotMetadata" 
                                checked={includeGodotMetadata} 
                                onChange={this.handleInputChange}
                            />
                            Include Godot Metadata
                        </label>
                    </div>
                </div>
                
                <div className="export-preview-section">
                    <button 
                        className="preview-button"
                        onClick={this.togglePreview}
                        disabled={frameCount === 0}
                    >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    
                    {showPreview && (
                        <div className="preview-canvas-container">
                            <h4>Preview:</h4>
                            <canvas 
                                ref={this.canvasRef} 
                                style={{ border: '1px solid #ccc', marginTop: '10px' }}
                            />
                        </div>
                    )}
                </div>
                
                <div className="export-info">
                    <p>
                        {frameCount} frame{frameCount !== 1 ? 's' : ''} available for export.
                        {exportType === 'spritesheet' && frameCount > 0 && (
                            <> Final size: {columns * (frameWidth + padding) - padding} x {Math.ceil(frameCount / columns) * (frameHeight + padding) - padding} pixels.</>
                        )}
                    </p>
                </div>
                
                <button 
                    className="export-button"
                    onClick={this.exportSpritesheet}
                    disabled={frameCount === 0}
                >
                    Export {exportType === 'spritesheet' ? 'Spritesheet' : 'Frames'}
                </button>
            </div>
        );
    }
}

export default SpritesheetExporter;