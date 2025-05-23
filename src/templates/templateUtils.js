/**
 * Apply a template to the canvas context
 * @param {Object} template The template object containing part definitions
 * @param {CanvasRenderingContext2D} context The canvas rendering context
 * @param {Boolean} isUnderlay Whether to render as underlay (faded guide) or overlay (outline)
 */
export function applyTemplate(template, context, isUnderlay = true) {
    if (!template || !template.frames || !template.frames.length) {
        console.warn('Invalid template provided to applyTemplate');
        return;
    }
    
    // Default to first frame for drawing template
    const frame = template.frames[0];
    
    // Calculate scaling factor - dynamically adjust based on canvas size
    // Base scale of 6.0 works for 800x600, but adjust as needed
    const baseScaleFactor = 6.0;
    
    // Get canvas dimensions
    const canvasWidth = context.canvas.width;
    const canvasHeight = context.canvas.height;
    
    // Calculate template bounds
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    Object.values(frame.parts).forEach(part => {
        minX = Math.min(minX, part.position.x);
        minY = Math.min(minY, part.position.y);
        maxX = Math.max(maxX, part.position.x + part.size.width);
        maxY = Math.max(maxY, part.position.y + part.size.height);
    });
    
    // Calculate template width and height
    const templateWidth = maxX - minX;
    const templateHeight = maxY - minY;
    
    // Dynamically adjust scale factor based on template size and canvas dimensions
    // This ensures the template fits well regardless of canvas size
    const widthScale = (canvasWidth * 0.8) / templateWidth;  // Use 80% of canvas width
    const heightScale = (canvasHeight * 0.8) / templateHeight; // Use 80% of canvas height
    const scaleFactor = Math.min(widthScale, heightScale, baseScaleFactor * 1.2); // Don't go too large
    
    // Calculate translation to properly center the template
    const translateX = (canvasWidth - templateWidth * scaleFactor) / 2 - minX * scaleFactor;
    // Position slightly above center for better composition (characters typically need more space below)
    const translateY = (canvasHeight - templateHeight * scaleFactor) / 2 - minY * scaleFactor - (canvasHeight * 0.05);
    
    // Set rendering styles based on whether it's an underlay or overlay
    if (isUnderlay) {
        context.globalAlpha = 0.25; // Visible but not distracting for underlays
        context.strokeStyle = '#444444'; // Darker stroke for better visibility
        context.fillStyle = '#f0f0f0'; // Light fill for better contrast
        context.lineWidth = 1.5; // Slightly thicker lines
    } else {
        context.globalAlpha = 0.75; // More visible for overlays when actively drawing
        context.strokeStyle = '#222222'; // Very dark for clear outline visibility
        context.lineWidth = 2; // Thicker lines for better visibility
        context.setLineDash([5, 5]); // More visible dashes for overlays
    }
    
    // Save context state before transformations
    context.save();
    
    // Apply transformations for centering and scaling
    context.translate(translateX, translateY);
    context.scale(scaleFactor, scaleFactor);
    
    // Draw each template part
    Object.entries(frame.parts).forEach(([partName, part]) => {
        // Draw part outline
        context.beginPath();
        context.rect(
            part.position.x,
            part.position.y,
            part.size.width,
            part.size.height
        );
        
        if (isUnderlay) {
            context.fill();
        }
        context.stroke();
        
        // Add part name label with larger font size proportional to the scale factor
        context.font = '4px Arial'; // Smaller base font since we're scaling up
        context.fillStyle = isUnderlay ? '#444444' : '#000000'; // Darker text for better readability
        context.textAlign = 'center';
        context.textBaseline = 'middle'; // Better vertical alignment
        
        // Add a slight background for better text visibility
        if (!isUnderlay) {
            const textWidth = context.measureText(partName).width;
            const padding = 2;
            context.fillStyle = 'rgba(255,255,255,0.7)';
            context.fillRect(
                part.position.x + part.size.width / 2 - textWidth / 2 - padding,
                part.position.y + part.size.height / 2 - 4 - padding,
                textWidth + padding * 2,
                8 + padding * 2
            );
            context.fillStyle = '#000000';
        }
        
        context.fillText(
            partName,
            part.position.x + part.size.width / 2,
            part.position.y + part.size.height / 2
        );
    });
    
    // Restore context state to undo transformations
    context.restore();
    
    // Reset context properties
    context.globalAlpha = 1.0;
    context.setLineDash([]);
}

/**
 * Get all parts defined in a template
 * @param {Object} template The template object
 * @returns {Array} Array of part objects with name, position, and size
 */
export function getTemplateParts(template) {
    if (!template || !template.frames || !template.frames.length) {
        return [];
    }
    
    // Default to first frame for parts
    const frame = template.frames[0];
    
    return Object.entries(frame.parts).map(([name, part]) => ({
        name,
        position: part.position,
        size: part.size,
        rotation: part.rotation || 0,
        pivot: part.pivot || { x: part.size.width / 2, y: part.size.height / 2 }
    }));
}

/**
 * Clear template visualization from the canvas
 * @param {CanvasRenderingContext2D} context The canvas rendering context
 */
export function resetTemplate(context) {
    // Clears the entire canvas
    const { width, height } = context.canvas;
    context.clearRect(0, 0, width, height);
}

/**
 * Load a template from a file path
 * @param {string} templateName The name of the template to load
 * @returns {Promise<Object>} Promise resolving to the template object
 */
export async function loadTemplate(templateName) {
    try {
        const response = await fetch(`/templates/${templateName}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load template: ${response.statusText}`);
        }
        const template = await response.json();
        return template;
    } catch (error) {
        console.error(`Error loading template "${templateName}":`, error);
        throw error;
    }
}

/**
 * Generate animation frames based on a template and user-drawn sprite parts
 * @param {Object} template The animation template
 * @param {Object} spriteParts Object containing user-drawn sprite parts
 * @returns {Array} Array of generated animation frames
 */
export function generateAnimationFrames(template, spriteParts) {
    if (!template || !template.frames || !spriteParts) {
        return [];
    }
    
    // Create frames based on template
    return template.frames.map(frame => {
        const frameData = {
            id: frame.id,
            duration: frame.duration || 100, // Default 100ms per frame
            parts: {}
        };
        
        // Position each sprite part according to template frame
        Object.entries(frame.parts).forEach(([partName, partTemplate]) => {
            // Skip if user hasn't drawn this part
            if (!spriteParts[partName] || !spriteParts[partName].imageData) {
                return;
            }
            
            // Use template to position the user-drawn part
            frameData.parts[partName] = {
                imageData: spriteParts[partName].imageData,
                position: {
                    x: partTemplate.position.x,
                    y: partTemplate.position.y
                },
                rotation: partTemplate.rotation || 0,
                scale: partTemplate.scale || { x: 1, y: 1 }
            };
        });
        
        return frameData;
    });
}

/**
 * Creates a composite image from an animation frame
 * @param {Object} frame The animation frame object
 * @param {Number} width The width of the output image
 * @param {Number} height The height of the output image
 * @returns {String} Base64 encoded PNG data URL
 */
export function renderAnimationFrame(frame, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw each part in the correct position
    Object.entries(frame.parts).forEach(([partName, part]) => {
        // Create temporary image to draw the part
        const img = new Image();
        img.src = part.imageData;
        
        // Save context state before transformations
        ctx.save();
        
        // Apply transformations (position, rotation, scale)
        ctx.translate(part.position.x, part.position.y);
        
        if (part.rotation) {
            // Rotate around pivot point
            const pivotX = part.pivot?.x || 0;
            const pivotY = part.pivot?.y || 0;
            ctx.translate(pivotX, pivotY);
            ctx.rotate(part.rotation * Math.PI / 180);
            ctx.translate(-pivotX, -pivotY);
        }
        
        if (part.scale) {
            ctx.scale(part.scale.x, part.scale.y);
        }
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Restore context state
        ctx.restore();
    });
    
    return canvas.toDataURL('image/png');
}