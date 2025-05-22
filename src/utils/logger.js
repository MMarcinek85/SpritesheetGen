/**
 * Simple logger utility for debugging
 */
export const logger = {
    error: (message, ...args) => {
        console.error(`[SpriteGen Error]: ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[SpriteGen Warning]: ${message}`, ...args);
    },
    info: (message, ...args) => {
        console.info(`[SpriteGen Info]: ${message}`, ...args);
    },
    debug: (message, ...args) => {
        console.debug(`[SpriteGen Debug]: ${message}`, ...args);
    }
};

export default logger;
