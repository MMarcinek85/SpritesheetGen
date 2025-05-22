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
            template: null
        };
        
        this.canvasRef = React.createRef();
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

    componentDidUpdate(prevProps) {
        // When template changes, apply it to the canvas
        if (this.props.template !== prevProps.template && this.props.template) {
            this.applyNewTemplate(this.props.template);
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
        
        // Save the starting position
        this.lastX = offsetX;
        this.lastY = offsetY;
        
        // Apply tool immediately for single clicks
        this.applyTool(offsetX, offsetY);
    }
    
    draw = (e) => {
        if (!this.state.isDrawing) return;
        
        const { offsetX, offsetY } = this.getCoordinates(e);
        this.applyTool(offsetX, offsetY);
        
        // Update last position
        this.lastX = offsetX;
        this.lastY = offsetY;
    }
    
    stopDrawing = () => {
        this.setState({ isDrawing: false });
        
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
        const layerCtx = this.getActiveLayerCanvas().getContext('2d');
        layerCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.redrawCanvas();
    }
    
    exportCanvasImage() {
        // Create a merged canvas of all layers
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');
        
        // Draw visible layers
        this.state.layers.forEach(layer => {
            if (layer.visible) {
                exportCtx.drawImage(layer.canvas, 0, 0);
            }
        });
        
        return exportCanvas.toDataURL('image/png');
    }

    render() {
        return (
            <div className="canvas-container">
                <canvas 
                    ref={this.canvasRef}
                    width={800}
                    height={600}
                    className="drawing-canvas"
                />
            </div>
        );
    }
}

export default Canvas;