export function clearCanvas(canvas) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawRectangle(canvas, x, y, width, height, color) {
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

export function drawCircle(canvas, x, y, radius, color) {
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
}

export function handleMouseEvents(canvas, onMouseDown, onMouseMove, onMouseUp) {
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
}

export function setCanvasSize(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
}

/**
 * Save the current state of a layer
 * @param {string} layerId The ID of the layer to save
 * @param {HTMLCanvasElement} canvas The canvas element containing the layer
 */
export function saveLayer(layerId, canvas) {
    const layerData = canvas.toDataURL('image/png');
    
    // You could implement history tracking here for undo/redo
    // For now, we're just storing the most recent state
    sessionStorage.setItem(`layer_${layerId}`, layerData);
}

/**
 * Merge multiple layers into a single canvas
 * @param {Array} layers Array of layer objects with canvas property
 * @param {HTMLCanvasElement} targetCanvas The canvas to merge layers onto
 * @param {boolean} clearFirst Whether to clear the target canvas first
 * @returns {HTMLCanvasElement} The merged canvas
 */
export function mergeLayers(layers, targetCanvas, clearFirst = true) {
    const ctx = targetCanvas.getContext('2d');
    
    if (clearFirst) {
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    }
    
    // Draw visible layers in order
    layers.forEach(layer => {
        if (layer.visible && layer.canvas) {
            ctx.drawImage(layer.canvas, 0, 0);
        }
    });
    
    return targetCanvas;
}

/**
 * Create a new layer canvas with the same dimensions as a reference canvas
 * @param {HTMLCanvasElement} referenceCanvas Canvas to match dimensions with
 * @returns {HTMLCanvasElement} New canvas element
 */
export function createLayerCanvas(referenceCanvas) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = referenceCanvas.width;
    newCanvas.height = referenceCanvas.height;
    return newCanvas;
}

/**
 * Get image data from a specific region of a canvas
 * @param {HTMLCanvasElement} canvas The source canvas
 * @param {Object} region The region to extract {x, y, width, height}
 * @returns {ImageData} The extracted image data
 */
export function getImageRegion(canvas, region) {
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(region.x, region.y, region.width, region.height);
}

/**
 * Put image data to a specific region of a canvas
 * @param {HTMLCanvasElement} canvas The target canvas
 * @param {ImageData} imageData The image data to put
 * @param {number} x The x position
 * @param {number} y The y position
 */
export function putImageRegion(canvas, imageData, x, y) {
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, x, y);
}

/**
 * Crop and resize an image region to a new size
 * @param {HTMLCanvasElement} sourceCanvas The source canvas
 * @param {Object} region The region to extract {x, y, width, height}
 * @param {number} targetWidth The target width
 * @param {number} targetHeight The target height
 * @returns {string} Data URL of the resized image
 */
export function cropAndResizeImage(sourceCanvas, region, targetWidth, targetHeight) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw the region onto the temp canvas with resizing
    tempCtx.drawImage(
        sourceCanvas, 
        region.x, region.y, region.width, region.height,
        0, 0, targetWidth, targetHeight
    );
    
    return tempCanvas.toDataURL('image/png');
}

/**
 * Convert coordinates to be relative to canvas with scale factor 
 * @param {MouseEvent} event Mouse event
 * @param {HTMLCanvasElement} canvas Canvas element
 * @returns {Object} Object with x, y coordinates
 */
export function getCanvasCoordinates(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (event.touches && event.touches[0]) {
        return {
            x: (event.touches[0].clientX - rect.left) * scaleX,
            y: (event.touches[0].clientY - rect.top) * scaleY
        };
    }
    
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}