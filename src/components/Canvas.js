import * as React from 'react';
import { applyTemplate, resetTemplate } from '../templates/templateUtils';
import { saveLayer, mergeLayers } from '../utils/canvasUtils';

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDrawing: false,
            currentTool: 'brush',
            currentColor: '#000000',
            brushSize: 5,
            layers: [],
            activeLayer: 0,
            template: null,
            frames: [],
            currentFrameIndex: 0
        };
        
        this.canvasRef = React.createRef();
        this.isDrawingShape = false;
        this.startX = 0;
        this.startY = 0;
    }

    componentDidMount() {
        this.canvas = this.canvasRef.current;
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.setupLayers();
        this.setupEventListeners();
        
        // Initialize with a default layer if there are none
        if (!this.state.layers.length) {
            this.addNewLayer();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // When template changes, apply it to the canvas
        if (this.props.template !== prevProps.template && this.props.template) {
            this.applyNewTemplate(this.props.template);
        }
        
        // Update frames if frame data changed
        if (prevState.frames !== this.state.frames || 
            prevState.currentFrameIndex !== this.state.currentFrameIndex) {
            this.updateFrames();
        }
    }

    setupLayers() {
        // Create a default layer
        this.addNewLayer();
    }

    addNewLayer() {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = this.canvas.width;
        layerCanvas.height = this.canvas.height;
        
        const newLayer = {
            id: Date.now(),
            name: `Layer ${this.state.layers.length + 1}`,
            canvas: layerCanvas,
            visible: true
        };
        
        this.setState(prevState => ({
            layers: [...prevState.layers, newLayer],
            activeLayer: prevState.layers.length
        }), this.redrawCanvas);
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.startDrawing);
        this.canvas.addEventListener('mousemove', this.draw);
        this.canvas.addEventListener('mouseup', this.stopDrawing);
        this.canvas.addEventListener('mouseout', this.stopDrawing);
    }

    startDrawing = (e) => {
        const { offsetX, offsetY } = this.getCoordinates(e);
        
        this.setState({ isDrawing: true });
        
        // Save the starting position for all tools
        this.startX = offsetX;
        this.startY = offsetY;
        this.lastX = offsetX;
        this.lastY = offsetY;
        
        // For shape tools, we'll start drawing mode but not apply the tool yet
        const shapeTool = ['line', 'rectangle', 'circle'].includes(this.state.currentTool);
        this.isDrawingShape = shapeTool;
        
        // For non-shape tools, apply immediately for single clicks
        if (!shapeTool) {
            this.applyTool(offsetX, offsetY);
        }
    }
    
    draw = (e) => {
        if (!this.state.isDrawing) return;
        
        const { offsetX, offsetY } = this.getCoordinates(e);
        
        // For shape tools, we'll draw a preview until mouse up
        if (this.isDrawingShape) {
            this.applyTool(offsetX, offsetY);
        } else {
            this.applyTool(offsetX, offsetY);
            // Update last position
            this.lastX = offsetX;
            this.lastY = offsetY;
        }
    }
    
    stopDrawing = (e) => {
        // If we were drawing a shape, apply the final shape on mouse up
        if (this.state.isDrawing && this.isDrawingShape && e) {
            const { offsetX, offsetY } = this.getCoordinates(e);
            this.isDrawingShape = false;
            this.applyTool(offsetX, offsetY);
            this.redrawCanvas();
        }
        
        this.setState({ isDrawing: false });
        this.isDrawingShape = false;
        
        // Save the layer state after drawing is complete
        if (this.state.layers[this.state.activeLayer]) {
            saveLayer(this.state.layers[this.state.activeLayer].id, this.getActiveLayerCanvas());
        }
    }
    
    getCoordinates(e) {
        // Handle both direct mouse events and touch events
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        if (e.touches && e.touches[0]) {
            return {
                offsetX: (e.touches[0].clientX - rect.left) * scaleX,
                offsetY: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        
        return {
            offsetX: (e.clientX - rect.left) * scaleX,
            offsetY: (e.clientY - rect.top) * scaleY
        };
    }

    applyTool(x, y) {
        const layerCtx = this.getActiveLayerCanvas().getContext('2d');
        const { currentTool, currentColor, brushSize } = this.state;
        
        layerCtx.lineJoin = 'round';
        layerCtx.lineCap = 'round';
        layerCtx.strokeStyle = currentColor;
        layerCtx.lineWidth = brushSize;
        
        switch (currentTool) {
            case 'brush':
                layerCtx.beginPath();
                layerCtx.moveTo(this.lastX, this.lastY);
                layerCtx.lineTo(x, y);
                layerCtx.stroke();
                break;
                
            case 'eraser':
                layerCtx.globalCompositeOperation = 'destination-out';
                layerCtx.beginPath();
                layerCtx.moveTo(this.lastX, this.lastY);
                layerCtx.lineTo(x, y);
                layerCtx.stroke();
                layerCtx.globalCompositeOperation = 'source-over';
                break;
                
            case 'fill':
                this.floodFill(layerCtx, x, y, currentColor);
                break;
                
            case 'eyedropper':
                const pixelData = layerCtx.getImageData(x, y, 1, 1).data;
                const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
                this.setState({ currentColor: color });
                if (this.props.onColorChange) {
                    this.props.onColorChange(color);
                }
                break;
                
            case 'line':
                // For the line tool, we'll draw from the last position to the current position
                if (this.isDrawing && !this.isDrawingShape) {
                    // Draw a preview line directly on the canvas
                    this.redrawCanvas(); // Clear previous preview
                    this.ctx.save();
                    this.ctx.strokeStyle = currentColor;
                    this.ctx.lineWidth = brushSize;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.startX, this.startY);
                    this.ctx.lineTo(x, y);
                    this.ctx.stroke();
                    this.ctx.restore();
                } else {
                    // When mouse is released, draw the final line on the layer
                    layerCtx.beginPath();
                    layerCtx.moveTo(this.startX, this.startY);
                    layerCtx.lineTo(x, y);
                    layerCtx.stroke();
                }
                break;
                
            case 'rectangle':
                if (this.isDrawing && !this.isDrawingShape) {
                    // Draw a preview rectangle
                    this.redrawCanvas(); // Clear previous preview
                    this.ctx.save();
                    this.ctx.strokeStyle = currentColor;
                    this.ctx.lineWidth = brushSize;
                    this.ctx.beginPath();
                    const width = x - this.startX;
                    const height = y - this.startY;
                    this.ctx.rect(this.startX, this.startY, width, height);
                    this.ctx.stroke();
                    this.ctx.restore();
                } else {
                    // Draw the final rectangle
                    layerCtx.beginPath();
                    const width = x - this.startX;
                    const height = y - this.startY;
                    layerCtx.rect(this.startX, this.startY, width, height);
                    layerCtx.stroke();
                }
                break;
                
            case 'circle':
                if (this.isDrawing && !this.isDrawingShape) {
                    // Draw a preview circle
                    this.redrawCanvas(); // Clear previous preview
                    this.ctx.save();
                    this.ctx.strokeStyle = currentColor;
                    this.ctx.lineWidth = brushSize;
                    this.ctx.beginPath();
                    const radius = Math.sqrt(Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2));
                    this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                    this.ctx.stroke();
                    this.ctx.restore();
                } else {
                    // Draw the final circle
                    layerCtx.beginPath();
                    const radius = Math.sqrt(Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2));
                    layerCtx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                    layerCtx.stroke();
                }
                break;
                
            default:
                break;
        }
        
        this.redrawCanvas();
    }

    floodFill(ctx, x, y, fillColor) {
        // Basic implementation of flood fill
        // For a production app, consider using a more efficient algorithm
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        x = Math.floor(x);
        y = Math.floor(y);
        
        const targetColor = this.getPixelColor(data, x, y, width);
        
        // Don't fill if colors are the same
        if (this.colorsEqual(targetColor, this.hexToRgba(fillColor))) {
            return;
        }
        
        const stack = [{x, y}];
        
        while (stack.length > 0) {
            const pixel = stack.pop();
            const px = pixel.x;
            const py = pixel.y;
            
            if (px < 0 || px >= width || py < 0 || py >= height) {
                continue;
            }
            
            if (!this.colorsEqual(this.getPixelColor(data, px, py, width), targetColor)) {
                continue;
            }
            
            // Fill the pixel
            this.setPixelColor(data, px, py, width, this.hexToRgba(fillColor));
            
            // Check neighboring pixels
            stack.push({x: px + 1, y: py});
            stack.push({x: px - 1, y: py});
            stack.push({x: px, y: py + 1});
            stack.push({x: px, y: py - 1});
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    getPixelColor(data, x, y, width) {
        const index = (y * width + x) * 4;
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
        };
    }
    
    setPixelColor(data, x, y, width, color) {
        const index = (y * width + x) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = color.a;
    }
    
    colorsEqual(color1, color2) {
        return color1.r === color2.r && 
               color1.g === color2.g && 
               color1.b === color2.b && 
               color1.a === color2.a;
    }
    
    hexToRgba(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b, a: 255 };
    }

    redrawCanvas() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw template underlay if present
        if (this.state.template) {
            applyTemplate(this.state.template, ctx, true); // true for "isUnderlay"
        }
        
        // Draw visible layers
        this.state.layers.forEach(layer => {
            if (layer.visible) {
                ctx.drawImage(layer.canvas, 0, 0);
            }
        });
        
        // Draw template overlay if present
        if (this.state.template) {
            applyTemplate(this.state.template, ctx, false); // false for overlay
        }
    }

    applyNewTemplate(template) {
        this.setState({ template }, () => {
            resetTemplate(this.ctx);
            this.redrawCanvas();
        });
    }

    changeTool = (tool) => {
        this.setState({ currentTool: tool });
    }

    changeColor = (color) => {
        this.setState({ currentColor: color });
    }
    
    changeBrushSize = (size) => {
        this.setState({ brushSize: size });
    }
    
    changeActiveLayer = (layerIndex) => {
        this.setState({ activeLayer: layerIndex });
    }
    
    toggleLayerVisibility = (layerIndex) => {
        this.setState(prevState => {
            const updatedLayers = [...prevState.layers];
            updatedLayers[layerIndex].visible = !updatedLayers[layerIndex].visible;
            return { layers: updatedLayers };
        }, this.redrawCanvas);
    }
    
    deleteLayer = (layerIndex) => {
        this.setState(prevState => {
            const updatedLayers = prevState.layers.filter((_, index) => index !== layerIndex);
            let activeLayer = prevState.activeLayer;
            
            // Adjust active layer if necessary
            if (activeLayer === layerIndex) {
                activeLayer = Math.max(0, layerIndex - 1);
            } else if (activeLayer > layerIndex) {
                activeLayer--;
            }
            
            return { 
                layers: updatedLayers,
                activeLayer: activeLayer
            };
        }, this.redrawCanvas);
    }
    
    getActiveLayerCanvas() {
        return this.state.layers[this.state.activeLayer]?.canvas;
    }
    
    clear() {
        // Clear all layers instead of just the active one
        this.state.layers.forEach(layer => {
            const layerCtx = layer.canvas.getContext('2d');
            layerCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        });
        this.redrawCanvas();
    }
    
    // Export canvas as data URL
    canvasToDataURL() {
        return this.canvas.toDataURL('image/png');
    }
    
    // Export canvas image for animation frames
    exportCanvasImage() {
        return this.canvasToDataURL();
    }
    
    // Update frames when needed
    updateFrames() {
        if (this.props.onFramesUpdated) {
            // Make sure we have valid frames
            const exportedFrames = this.state.frames.map(frame => {
                // Make sure we have a valid dataURL - if not, generate one from the frame's layers
                let frameDataURL = frame.dataURL;
                if (!frameDataURL && frame.layers && frame.layers.length > 0) {
                    // Create a temporary canvas to combine the layers
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = this.canvas.width;
                    tempCanvas.height = this.canvas.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // Draw all visible layers to this temp canvas
                    frame.layers.forEach(layer => {
                        if (layer.visible && layer.canvas) {
                            tempCtx.drawImage(layer.canvas, 0, 0);
                        }
                    });
                    
                    frameDataURL = tempCanvas.toDataURL('image/png');
                }
                
                // Convert each frame to a renderable format
                return {
                    id: frame.id || Math.random(),
                    duration: 100, // Default frame duration
                    dataURL: frameDataURL // Use the stored dataURL or generated one
                };
            });
            
            // Only update if we have valid frames
            if (exportedFrames.length > 0) {
                this.props.onFramesUpdated(exportedFrames);
            }
        }
    }

    // New methods for frame management
    addNewFrame() {
        // If there are existing frames, save the current one first
        if (this.state.frames.length > 0) {
            this.saveCurrentFrame();
        }
        
        // Create a copy of the current state as a new frame
        const currentFrameData = {
            layers: this.state.layers.map(layer => {
                // Create a new canvas for this frame's layer
                const newLayerCanvas = document.createElement('canvas');
                newLayerCanvas.width = this.canvas.width;
                newLayerCanvas.height = this.canvas.height;
                
                // Copy the current layer content to the new canvas
                const newLayerCtx = newLayerCanvas.getContext('2d');
                if (layer.canvas) {
                    newLayerCtx.drawImage(layer.canvas, 0, 0);
                }
                
                return {
                    ...layer,
                    canvas: newLayerCanvas,
                    id: Date.now() + Math.random() // Ensure unique ID
                };
            }),
            activeLayer: this.state.activeLayer,
            id: Date.now(), // Add unique ID for the frame
            dataURL: this.canvasToDataURL() // Capture current canvas state
        };
        
        // Add the current frame data to frames array
        this.setState(prevState => ({
            frames: [...prevState.frames, currentFrameData],
            currentFrameIndex: prevState.frames.length
        }), () => {
            // Update the animation frames after state is updated
            this.updateFrames();
            
            // Clear the canvas AFTER we've saved its state for the new frame
            this.clear();
        });
    }
    
    switchToFrame(frameIndex) {
        // Save the current frame state before switching
        this.saveCurrentFrame();
        
        // Get the updated frames array
        const updatedFrames = [...this.state.frames];
        
        // Get the frame we want to switch to
        const targetFrame = updatedFrames[frameIndex];
        if (!targetFrame) return;
        
        // Set the current state to the target frame
        this.setState({
            layers: targetFrame.layers,
            activeLayer: targetFrame.activeLayer,
            currentFrameIndex: frameIndex,
            frames: updatedFrames
        }, () => {
            this.redrawCanvas();
            this.updateFrames();
        });
    }

    // Save the current frame state
    saveCurrentFrame() {
        // If we don't have any frames yet, nothing to save
        if (this.state.frames.length === 0) return;
        
        // Create frame data with the current canvas state
        const currentFrameData = {
            layers: this.state.layers.map(layer => ({
                ...layer,
                canvas: layer.canvas
            })),
            activeLayer: this.state.activeLayer,
            id: this.state.frames[this.state.currentFrameIndex]?.id || Date.now(),
            dataURL: this.canvasToDataURL() // Capture current canvas state
        };
        
        // Update the frame at current index
        const updatedFrames = [...this.state.frames];
        if (this.state.currentFrameIndex < updatedFrames.length) {
            updatedFrames[this.state.currentFrameIndex] = currentFrameData;
            
            // Update the frames array with the current state
            this.setState({
                frames: updatedFrames
            });
        }
    }
    
    // Duplicate previous frame
    duplicatePreviousFrame() {
        // First save the current frame's state before duplication
        this.saveCurrentFrame();
        
        // If no frames yet, just create a new one
        if (this.state.frames.length === 0) {
            this.addNewFrame();
            return;
        }
        
        // Get the most recent frame (current one or last one in frames array)
        const frameToClone = this.state.frames[this.state.currentFrameIndex] || 
                             this.state.frames[this.state.frames.length - 1];
        
        if (!frameToClone) return;
        
        // Create deep copy of the frame's layers
        const duplicatedLayers = frameToClone.layers.map(layer => {
            // Create a new canvas for this frame's layer
            const newLayerCanvas = document.createElement('canvas');
            newLayerCanvas.width = this.canvas.width;
            newLayerCanvas.height = this.canvas.height;
            
            // Copy the layer content to the new canvas
            const newLayerCtx = newLayerCanvas.getContext('2d');
            // Make sure to drawImage only if the source canvas exists
            if (layer.canvas) {
                newLayerCtx.drawImage(layer.canvas, 0, 0);
            }
            
            return {
                ...layer,
                canvas: newLayerCanvas,
                id: Date.now() + Math.random() // Ensure unique ID
            };
        });
        
        // Generate a new dataURL from the duplicated layers to ensure proper preview
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw all visible duplicated layers to this temp canvas
        duplicatedLayers.forEach(layer => {
            if (layer.visible && layer.canvas) {
                tempCtx.drawImage(layer.canvas, 0, 0);
            }
        });
        
        const newDataURL = tempCanvas.toDataURL('image/png');
        
        // Create a duplicate frame with its own copy of the layer data
        const duplicatedFrameData = {
            layers: duplicatedLayers,
            activeLayer: frameToClone.activeLayer,
            id: Date.now(),
            dataURL: newDataURL // Use the newly generated dataURL
        };
        
        // Update the frame array with the duplicated frame and set it as current
        this.setState(prevState => {
            const newFrames = [...prevState.frames];
            newFrames.splice(prevState.currentFrameIndex + 1, 0, duplicatedFrameData);
            
            return {
                frames: newFrames,
                layers: duplicatedLayers,
                activeLayer: duplicatedFrameData.activeLayer,
                currentFrameIndex: prevState.currentFrameIndex + 1
            };
        }, () => {
            // Redraw the canvas with duplicated content
            this.redrawCanvas();
            this.updateFrames();
        });
    }

    render() {
        return (
            <div className="canvas-container">
                <div className="canvas-actions">
                    <div className="action-buttons">
                        <button 
                            className="canvas-button add-frame-button"
                            onClick={() => this.addNewFrame()}
                        >
                            Add New Frame
                        </button>
                        <button 
                            className="canvas-button duplicate-button"
                            onClick={() => this.duplicatePreviousFrame()}
                        >
                            Duplicate Frame
                        </button>
                    </div>
                    <div className="frames-indicator">
                        Frame: {this.state.currentFrameIndex + 1} / {Math.max(1, this.state.frames.length)}
                    </div>
                </div>
                <canvas 
                    ref={this.canvasRef}
                    width={800}
                    height={600}
                    className="drawing-canvas"
                />
                {this.state.frames.length > 0 && (
                    <div className="frame-navigation">
                        <button 
                            onClick={() => this.switchToFrame(0)}
                            disabled={this.state.currentFrameIndex === 0}
                        >
                            First
                        </button>
                        <button 
                            onClick={() => this.switchToFrame(this.state.currentFrameIndex - 1)}
                            disabled={this.state.currentFrameIndex === 0}
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => this.switchToFrame(this.state.currentFrameIndex + 1)}
                            disabled={this.state.currentFrameIndex >= this.state.frames.length - 1}
                        >
                            Next
                        </button>
                        <button 
                            onClick={() => this.switchToFrame(this.state.frames.length - 1)}
                            disabled={this.state.currentFrameIndex >= this.state.frames.length - 1}
                        >
                            Last
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export default Canvas;