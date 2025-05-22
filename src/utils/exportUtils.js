/**
 * Export a basic spritesheet (single row)
 * @param {Array} frames Array of frame images
 * @param {string} fileName Name for the exported file
 */
export function exportSpritesheet(frames, fileName) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const frameWidth = frames[0].width;
    const frameHeight = frames[0].height;
    const totalFrames = frames.length;

    canvas.width = frameWidth * totalFrames;
    canvas.height = frameHeight;

    frames.forEach((frame, index) => {
        context.drawImage(frame, index * frameWidth, 0);
    });

    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

/**
 * Export JSON data to a file
 * @param {Object} data The JSON data
 * @param {string} fileName Name for the exported file
 */
export function exportJSON(data, fileName) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.json`;
    link.click();
}

/**
 * Generate a spritesheet from an array of frames
 * @param {Array} frames Array of animation frames
 * @param {Object} options Configuration options for the spritesheet
 * @returns {Promise<string>} Promise resolving to spritesheet data URL
 */
export async function generateSpritesheet(frames, options) {
    const {
        frameWidth = 64,
        frameHeight = 64,
        columns = 8,
        padding = 2,
        format = 'png'
    } = options;
    const rows = Math.ceil(frames.length / columns);
    const canvas = document.createElement('canvas');
    canvas.width = columns * (frameWidth + padding) - padding;
    canvas.height = rows * (frameHeight + padding) - padding;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => {
        try {
            const drawPromises = frames.map((frame, index) => {
                return new Promise(frameResolve => {
                    const col = index % columns;
                    const row = Math.floor(index / columns);
                    const x = col * (frameWidth + padding);
                    const y = row * (frameHeight + padding);
                    renderFrameToCanvas(frame, ctx, x, y, frameWidth, frameHeight, frameResolve);
                });
            });
            Promise.all(drawPromises).then(() => {
                const dataUrl = canvas.toDataURL(`image/${format}`);
                resolve(dataUrl);
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Render a frame to a canvas context
 * @param {Object} frame The frame to render
 * @param {CanvasRenderingContext2D} ctx The canvas context
 * @param {number} x The x position
 * @param {number} y The y position
 * @param {number} width The frame width
 * @param {number} height The frame height
 * @param {Function} callback Called when rendering is complete
 */
export function renderFrameToCanvas(frame, ctx, x, y, width, height, callback) {
    if (frame.imageData) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, x, y, width, height);
            if (callback) callback();
        };
        img.onerror = () => {
            if (callback) callback();
        };
        img.src = frame.imageData;
        return;
    }
    if (frame.parts) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        const partCount = Object.keys(frame.parts).length;
        let loadedCount = 0;
        if (partCount === 0 && callback) {
            callback();
            return;
        }
        Object.entries(frame.parts).forEach(([partName, part]) => {
            if (part.imageData) {
                const img = new Image();
                img.onload = () => {
                    tempCtx.save();
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
                    if (loadedCount === partCount) {
                        ctx.drawImage(tempCanvas, x, y, width, height);
                        if (callback) callback();
                    }
                };
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === partCount && callback) callback();
                };
                img.src = part.imageData;
            } else {
                loadedCount++;
                if (loadedCount === partCount && callback) callback();
            }
        });
    } else if (callback) {
        callback();
    }
}

/**
 * Generate Godot metadata for a spritesheet
 * @param {Array} frames Array of animation frames
 * @param {Object} options Configuration options
 * @returns {string} Godot resource file content
 */
export function generateGodotMetadata(frames, options) {
    const {
        frameWidth,
        frameHeight,
        columns,
        padding,
        format = 'png',
        fps = 10,
        animationName = 'default'
    } = options;
    return `[gd_resource type="SpriteFrames" load_steps=${frames.length + 1} format=2]

[ext_resource path="res://spritesheet.${format}" type="Texture" id=1]

[resource]
animations = [ {
"frames": [ ${Array.from({ length: frames.length }, (_, i) => {
        return `SubResource( ${i + 2} )`;
    }).join(", ")} ],
"loop": true,
"name": "${animationName}",
"speed": ${fps}.0
} ]

${Array.from({ length: frames.length }, (_, i) => {
        const x = (i % columns) * (frameWidth + padding);
        const y = Math.floor(i / columns) * (frameHeight + padding);
        return `[sub_resource type="AtlasTexture" id=${i + 2}]
atlas = ExtResource( 1 )
region = Rect2( ${x}, ${y}, ${frameWidth}, ${frameHeight} )`;
    }).join("\n\n")}
`;
}

/**
 * Download an image file from data URL
 * @param {string} dataUrl The data URL of the image
 * @param {string} filename The filename to save as
 */
export function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Download a text file
 * @param {string} text The text content
 * @param {string} filename The filename to save as
 */
export function downloadText(text, filename) {
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

/**
 * Export animation frames as individual images
 * @param {Array} frames Array of animation frames
 * @param {Object} options Configuration options
 */
export async function exportFrameImages(frames, options) {
    const {
        frameWidth = 64,
        frameHeight = 64,
        format = 'png',
        filenamePrefix = 'frame'
    } = options;
    frames.forEach(async (frame, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');
        await new Promise(resolve => {
            renderFrameToCanvas(frame, ctx, 0, 0, frameWidth, frameHeight, resolve);
        });
        const dataUrl = canvas.toDataURL(`image/${format}`);
        downloadImage(dataUrl, `${filenamePrefix}_${index + 1}.${format}`);
    });
}