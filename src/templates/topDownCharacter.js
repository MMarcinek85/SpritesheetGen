export const topDownCharacterTemplate = {
    body: {
        width: 32,
        height: 32,
        parts: {
            head: {
                position: { x: 0, y: 0 },
                size: { width: 32, height: 32 }
            },
            torso: {
                position: { x: 0, y: 16 },
                size: { width: 32, height: 16 }
            },
            arms: {
                left: {
                    position: { x: -8, y: 16 },
                    size: { width: 8, height: 16 }
                },
                right: {
                    position: { x: 32, y: 16 },
                    size: { width: 8, height: 16 }
                }
            },
            legs: {
                left: {
                    position: { x: 8, y: 32 },
                    size: { width: 8, height: 16 }
                },
                right: {
                    position: { x: 16, y: 32 },
                    size: { width: 8, height: 16 }
                }
            }
        }
    },
    animations: {
        walk: {
            frames: 4,
            frameDuration: 100
        },
        run: {
            frames: 6,
            frameDuration: 80
        },
        roll: {
            frames: 3,
            frameDuration: 120
        },
        pickUp: {
            frames: 2,
            frameDuration: 150
        },
        getHit: {
            frames: 4,
            frameDuration: 100
        }
    }
};