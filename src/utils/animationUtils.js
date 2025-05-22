
/**
 * Generate frames based on a sprite and template
 * @param {HTMLImageElement} sprite The source sprite
 * @param {Object} template The animation template
 * @param {number} frameCount Number of frames to generate
 * @returns {Array} Array of frame images
 */
export function generateFrames(sprite, template, frameCount) {
    const frames = [];
    const spriteWidth = template.width;
    const spriteHeight = template.height;

    for (let i = 0; i < frameCount; i++) {
        const frame = createFrame(sprite, template, i);
        frames.push(frame);
    }

    return frames;
}

/**
 * Create a single frame from a sprite using template
 * @param {HTMLImageElement} sprite The source sprite
 * @param {Object} template The animation template
 * @param {number} frameIndex The index of the frame to create
 * @returns {HTMLImageElement} The generated frame image
 */
function createFrame(sprite, template, frameIndex) {
    const frame = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = template.width;
    canvas.height = template.height;
    const ctx = canvas.getContext('2d');

    // Draw the sprite on the canvas based on the template
    ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height);

    // Apply template transformations for the current frame
    applyTemplateTransformations(ctx, template, frameIndex);

    frame.src = canvas.toDataURL();
    return frame;
}

/**
 * Apply template transformations to a canvas context
 * @param {CanvasRenderingContext2D} ctx The canvas context
 * @param {Object} template The animation template
 * @param {number} frameIndex The index of the frame
 */
function applyTemplateTransformations(ctx, template, frameIndex) {
    // Example transformation logic based on the template
    // This should be customized based on the template structure
    const transformations = template.transformations[frameIndex];

    transformations.forEach(transformation => {
        ctx.save();
        ctx.translate(transformation.x, transformation.y);
        ctx.rotate(transformation.rotation);
        ctx.drawImage(transformation.image, -transformation.width / 2, -transformation.height / 2, transformation.width, transformation.height);
        ctx.restore();
    });
}

/**
 * Calculate intermediate frames between two keyframes
 * @param {Object} startFrame The starting keyframe
 * @param {Object} endFrame The ending keyframe
 * @param {number} frameCount Number of frames to generate (excluding start and end)
 * @returns {Array} Array of intermediate frames
 */
export function interpolateFrames(startFrame, endFrame, frameCount) {
    const frames = [];
    
    // For each intermediate frame
    for (let i = 1; i <= frameCount; i++) {
        const t = i / (frameCount + 1); // Interpolation factor (0 to 1)
        const frame = {
            id: `interpolated_${startFrame.id}_${endFrame.id}_${i}`,
            parts: {}
        };
        
        // Interpolate each part
        Object.keys(startFrame.parts).forEach(partName => {
            // Skip if part doesn't exist in both frames
            if (!endFrame.parts[partName]) return;
            
            const startPart = startFrame.parts[partName];
            const endPart = endFrame.parts[partName];
            
            frame.parts[partName] = {
                imageData: startPart.imageData, // Use start frame's image
                position: {
                    x: startPart.position.x + (endPart.position.x - startPart.position.x) * t,
                    y: startPart.position.y + (endPart.position.y - startPart.position.y) * t
                },
                rotation: startPart.rotation + (endPart.rotation - startPart.rotation) * t,
                scale: {
                    x: startPart.scale?.x + (endPart.scale?.x - startPart.scale?.x) * t || 1,
                    y: startPart.scale?.y + (endPart.scale?.y - startPart.scale?.y) * t || 1
                }
            };
        });
        
        frames.push(frame);
    }
    
    return frames;
}

/**
 * Generate a walking animation from a single frame
 * @param {Object} baseFrame The base frame with parts
 * @param {number} frameCount Total number of frames to generate
 * @returns {Array} Array of animation frames
 */
export function generateWalkAnimation(baseFrame, frameCount = 8) {
    const frames = [];
    
    for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount; // 0 to 1
        const angle = t * Math.PI * 2; // 0 to 2π
        
        const frame = {
            id: `walk_${i}`,
            parts: JSON.parse(JSON.stringify(baseFrame.parts)) // Deep clone
        };
        
        // Animate legs
        if (frame.parts.leftLeg) {
            frame.parts.leftLeg.position.y = baseFrame.parts.leftLeg.position.y + Math.sin(angle) * 5;
            frame.parts.leftLeg.rotation = Math.sin(angle) * 15;
        }
        
        if (frame.parts.rightLeg) {
            frame.parts.rightLeg.position.y = baseFrame.parts.rightLeg.position.y + Math.sin(angle + Math.PI) * 5;
            frame.parts.rightLeg.rotation = Math.sin(angle + Math.PI) * 15;
        }
        
        // Animate arms
        if (frame.parts.leftArm) {
            frame.parts.leftArm.rotation = Math.sin(angle + Math.PI) * 20;
        }
        
        if (frame.parts.rightArm) {
            frame.parts.rightArm.rotation = Math.sin(angle) * 20;
        }
        
        // Slight body movement
        if (frame.parts.body) {
            frame.parts.body.position.y = baseFrame.parts.body.position.y + Math.sin(angle * 2) * 2;
        }
        
        frames.push(frame);
    }
    
    return frames;
}

/**
 * Generate a running animation from a single frame
 * @param {Object} baseFrame The base frame with parts
 * @param {number} frameCount Total number of frames to generate
 * @returns {Array} Array of animation frames
 */
export function generateRunAnimation(baseFrame, frameCount = 6) {
    const frames = [];
    
    for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount; // 0 to 1
        const angle = t * Math.PI * 2; // 0 to 2π
        
        const frame = {
            id: `run_${i}`,
            parts: JSON.parse(JSON.stringify(baseFrame.parts)) // Deep clone
        };
        
        // More exaggerated leg movements
        if (frame.parts.leftLeg) {
            frame.parts.leftLeg.position.y = baseFrame.parts.leftLeg.position.y + Math.sin(angle) * 8;
            frame.parts.leftLeg.rotation = Math.sin(angle) * 30;
        }
        
        if (frame.parts.rightLeg) {
            frame.parts.rightLeg.position.y = baseFrame.parts.rightLeg.position.y + Math.sin(angle + Math.PI) * 8;
            frame.parts.rightLeg.rotation = Math.sin(angle + Math.PI) * 30;
        }
        
        // More exaggerated arm movements
        if (frame.parts.leftArm) {
            frame.parts.leftArm.rotation = Math.sin(angle + Math.PI) * 45;
        }
        
        if (frame.parts.rightArm) {
            frame.parts.rightArm.rotation = Math.sin(angle) * 45;
        }
        
        // More body movement
        if (frame.parts.body) {
            frame.parts.body.position.y = baseFrame.parts.body.position.y + Math.sin(angle * 2) * 4;
            // Slight rotation for running
            frame.parts.body.rotation = Math.sin(angle) * 3;
        }
        
        frames.push(frame);
    }
    
    return frames;
}

/**
 * Generate an idle animation from a single frame
 * @param {Object} baseFrame The base frame with parts
 * @param {number} frameCount Total number of frames to generate
 * @returns {Array} Array of animation frames
 */
export function generateIdleAnimation(baseFrame, frameCount = 4) {
    const frames = [];
    
    for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount; // 0 to 1
        const angle = t * Math.PI * 2; // 0 to 2π
        
        const frame = {
            id: `idle_${i}`,
            parts: JSON.parse(JSON.stringify(baseFrame.parts)) // Deep clone
        };
        
        // Subtle breathing movement
        if (frame.parts.body) {
            frame.parts.body.position.y = baseFrame.parts.body.position.y + Math.sin(angle) * 2;
        }
        
        // Slight arm movement
        if (frame.parts.leftArm) {
            frame.parts.leftArm.position.y = baseFrame.parts.leftArm.position.y + Math.sin(angle) * 1;
        }
        
        if (frame.parts.rightArm) {
            frame.parts.rightArm.position.y = baseFrame.parts.rightArm.position.y + Math.sin(angle) * 1;
        }
        
        // Head might nod or look around occasionally
        if (frame.parts.head) {
            frame.parts.head.rotation = Math.sin(angle) * 2;
        }
        
        frames.push(frame);
    }
    
    return frames;
}

/**
 * Generate a set of animation frames based on animation type
 * @param {Object} baseFrame The base frame with all parts
 * @param {string} animationType The type of animation to generate
 * @returns {Array} Array of animation frames
 */
export function generateAnimation(baseFrame, animationType) {
    switch (animationType) {
        case 'walk':
            return generateWalkAnimation(baseFrame);
        case 'run':
            return generateRunAnimation(baseFrame);
        case 'idle':
            return generateIdleAnimation(baseFrame);
        default:
            return [baseFrame]; // Return the base frame if no valid animation type
    }
}