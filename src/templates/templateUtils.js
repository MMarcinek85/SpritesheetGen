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
    
    // Set rendering styles based on whether it's an underlay or overlay
    if (isUnderlay) {
        context.globalAlpha = 0.2; // Faded for underlays
        context.strokeStyle = '#999999';
        context.fillStyle = '#eeeeee';
    } else {
        context.globalAlpha = 0.6; // More visible for overlays
        context.strokeStyle = '#333333';
        context.lineWidth = 1;
        context.setLineDash([3, 3]); // Dashed lines for overlays
    }
    
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
        
        // Add part name label
        context.font = '12px Arial';
        context.fillStyle = isUnderlay ? '#666666' : '#000000';
        context.textAlign = 'center';
        context.fillText(
            partName,
            part.position.x + part.size.width / 2,
            part.position.y + part.size.height / 2
        );
    });
    
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