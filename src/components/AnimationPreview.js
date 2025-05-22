import React, { Component } from 'react';

class AnimationPreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false,
            currentFrame: 0,
            fps: 12,
            animationInterval: null
        };
        
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        this.canvas = this.canvasRef.current;
        this.ctx = this.canvas.getContext('2d');
        this.drawFrame(0);
    }
    
    componentDidUpdate(prevProps) {
        // If frames have changed, reset playback
        if (prevProps.frames !== this.props.frames) {
            this.stopAnimation();
            this.setState({ currentFrame: 0 }, () => {
                this.drawFrame(0);
                
                // Auto-play if we have frames
                if (this.props.frames && this.props.frames.length > 1) {
                    this.playAnimation();
                }
            });
        }
    }
    
    componentWillUnmount() {
        this.stopAnimation();
    }
    
    drawFrame(frameIndex) {
        const { frames } = this.props;
        if (!frames || frames.length === 0) {
            this.clearCanvas();
            return;
        }
        
        if (frameIndex >= frames.length) {
            frameIndex = 0;
        }
        
        const frame = frames[frameIndex];
        this.clearCanvas();
        
        // If frame contains a single image data URL
        if (frame.imageData) {
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            };
            img.src = frame.imageData;
            return;
        }
        
        // If frame contains multiple parts
        if (frame.parts) {
            Object.entries(frame.parts).forEach(([partName, part]) => {
                if (part.imageData) {
                    const img = new Image();
                    img.onload = () => {
                        this.ctx.save();
                        
                        // Apply transformations
                        this.ctx.translate(part.position.x, part.position.y);
                        
                        if (part.rotation) {
                            const pivotX = part.pivot?.x || 0;
                            const pivotY = part.pivot?.y || 0;
                            this.ctx.translate(pivotX, pivotY);
                            this.ctx.rotate(part.rotation * Math.PI / 180);
                            this.ctx.translate(-pivotX, -pivotY);
                        }
                        
                        if (part.scale) {
                            this.ctx.scale(part.scale.x, part.scale.y);
                        }
                        
                        this.ctx.drawImage(img, 0, 0);
                        this.ctx.restore();
                    };
                    img.src = part.imageData;
                }
            });
        }
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    playAnimation = () => {
        if (this.state.isPlaying) return;
        
        const { frames } = this.props;
        if (!frames || frames.length <= 1) return;
        
        const animationInterval = setInterval(() => {
            this.setState(prevState => {
                const nextFrame = (prevState.currentFrame + 1) % frames.length;
                this.drawFrame(nextFrame);
                return { currentFrame: nextFrame };
            });
        }, 1000 / this.state.fps);
        
        this.setState({ isPlaying: true, animationInterval });
    };
    
    stopAnimation = () => {
        if (this.state.animationInterval) {
            clearInterval(this.state.animationInterval);
        }
        this.setState({ isPlaying: false, animationInterval: null });
    };
    
    togglePlayback = () => {
        if (this.state.isPlaying) {
            this.stopAnimation();
        } else {
            this.playAnimation();
        }
    };
    
    nextFrame = () => {
        if (!this.props.frames || this.props.frames.length === 0) return;
        
        this.setState(prevState => {
            const nextFrame = (prevState.currentFrame + 1) % this.props.frames.length;
            this.drawFrame(nextFrame);
            return { currentFrame: nextFrame };
        });
    };
    
    prevFrame = () => {
        if (!this.props.frames || this.props.frames.length === 0) return;
        
        this.setState(prevState => {
            const prevFrame = prevState.currentFrame - 1 < 0 ? 
                this.props.frames.length - 1 : 
                prevState.currentFrame - 1;
            this.drawFrame(prevFrame);
            return { currentFrame: prevFrame };
        });
    };
    
    handleFpsChange = (e) => {
        const fps = parseInt(e.target.value, 10);
        this.setState({ fps }, () => {
            if (this.state.isPlaying) {
                this.stopAnimation();
                this.playAnimation();
            }
        });
    };
    
    render() {
        const { isPlaying, currentFrame, fps } = this.state;
        const { frames } = this.props;
        const frameCount = frames ? frames.length : 0;
        
        return (
            <div className="animation-preview">
                <h3>Animation Preview</h3>
                
                <div className="preview-canvas-container">
                    <canvas 
                        ref={this.canvasRef} 
                        width={200} 
                        height={200} 
                        className="preview-canvas"
                    />
                </div>
                
                <div className="preview-controls">
                    <div className="frame-navigation">
                        <button 
                            onClick={this.prevFrame}
                            disabled={frameCount <= 1}
                        >
                            &lt;
                        </button>
                        
                        <span className="frame-counter">
                            Frame {frameCount > 0 ? currentFrame + 1 : 0} / {frameCount}
                        </span>
                        
                        <button 
                            onClick={this.nextFrame}
                            disabled={frameCount <= 1}
                        >
                            &gt;
                        </button>
                    </div>
                    
                    <button 
                        className="play-button"
                        onClick={this.togglePlayback}
                        disabled={frameCount <= 1}
                    >
                        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>
                    
                    <div className="fps-control">
                        <label htmlFor="fps-slider">FPS: {fps}</label>
                        <input 
                            id="fps-slider"
                            type="range" 
                            min="1" 
                            max="60" 
                            value={fps} 
                            onChange={this.handleFpsChange} 
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default AnimationPreview;