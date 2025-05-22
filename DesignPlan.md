# Spritesheet Generator for Godot - Design Document

## Project Overview

The Spritesheet Generator is a web application designed to simplify the workflow of creating spritesheets for animated sprites in the Godot game engine. It provides an intuitive interface where users can draw sprite components on templates and automatically generate animation frames for various actions like walking, running, and idle animations.

## Target Users

- Game developers using Godot Engine
- Indie game developers with limited animation resources
- Hobbyists creating 2D games who want to streamline their asset creation

## Core Features

### 1. Drawing Interface
- Canvas with basic drawing tools (brush, eraser, fill, etc.)
- Color picker and brush size selector
- Layer management for different sprite parts
- Undo/redo functionality

### 2. Template System
- Pre-designed templates for common character animations
- Template parts for body, head, arms, legs, etc.
- Reference outlines for drawing consistent sprites
- Ability to save and load custom templates

### 3. Animation Generator
- Automatic generation of animation frames based on drawn sprite
- Support for common animations:
  - Walking (4-8 directions)
  - Running
  - Idle
  - Attack/Action
  - Jump/Fall
  - Pick up
  - Get hit
- Preview of generated animations
- Configurable frame count and animation properties

### 4. Export System
- Export as spritesheet image (PNG)
- Godot-specific metadata export (.tres or .res)
- Configuration options for frame dimensions and padding
- Output customization (individual frames vs. spritesheet)

## Technical Architecture

### Frontend Components

1. **Canvas Component**
   - Drawing surface with HTML5 Canvas API
   - Handles user input for drawing operations
   - Manages drawing state and tool selection

2. **Tool Panel Component**
   - Contains drawing tools UI
   - Manages tool selection and configuration
   - Controls for brush size, color, and other tool properties

3. **Template Selector Component**
   - UI for selecting and applying templates
   - Preview of available templates
   - Template configuration options

4. **Animation Preview Component**
   - Displays real-time preview of animations
   - Controls for playback (play, pause, speed)
   - Frame scrubbing and navigation

5. **Spritesheet Exporter Component**
   - UI for export configuration
   - Preview of final spritesheet
   - Export button and format options

### Backend Services

1. **Template Service**
   - Loading template definitions from JSON files
   - Applying templates to the canvas
   - Managing template parts and properties

2. **Animation Generator Service**
   - Logic for generating animation frames
   - Transforming sprite parts based on animation rules
   - Creating intermediate frames for smooth animations

3. **Export Service**
   - Creating spritesheet images from canvas content
   - Generating metadata for Godot integration
   - File saving and downloading

## Data Models

### Template
```json
{
  "name": "string",
  "frames": [
    {
      "id": "number",
      "parts": {
        "partName": {
          "position": { "x": "number", "y": "number" },
          "size": { "width": "number", "height": "number" },
          "rotation": "number",
          "pivot": { "x": "number", "y": "number" }
        }
      }
    }
  ]
}
```

### Sprite
```json
{
  "name": "string",
  "parts": {
    "partName": {
      "imageData": "string", // Base64 encoded image data
      "position": { "x": "number", "y": "number" },
      "size": { "width": "number", "height": "number" }
    }
  }
}
```

### Animation
```json
{
  "name": "string",
  "frames": [
    {
      "id": "number",
      "duration": "number", // in milliseconds
      "parts": {
        "partName": {
          "imageData": "string",
          "position": { "x": "number", "y": "number" },
          "rotation": "number",
          "scale": { "x": "number", "y": "number" }
        }
      }
    }
  ]
}
```

## Implementation Plan

### Phase 1: Core Drawing Interface
- Set up the canvas and basic drawing tools
- Implement color selection and brush properties
- Add basic layer management
- Create initial UI layout

### Phase 2: Template System
- Design and implement default templates
- Create template loading and application logic
- Add template preview and selection UI
- Implement template part highlighting

### Phase 3: Animation Generation
- Develop algorithms for basic animations
- Implement sprite part transformation logic
- Create animation preview system
- Build frame generation pipeline

### Phase 4: Export System
- Create spritesheet composition logic
- Implement export options and configurations
- Add Godot-specific metadata generation
- Build download and saving functionality

### Phase 5: Refinement and Additional Features
- User testing and feedback incorporation
- Performance optimizations
- Additional templates and animations
- UI/UX improvements

## Development Technologies

### Frontend
- **React.js** for component-based UI
- **HTML5 Canvas API** for drawing functionality
- **CSS/SASS** for styling
- **WebPack** for bundling

### Build and Deployment
- **Webpack** for bundling and development server
- **GitHub Pages** or **Netlify** for deployment

## VS Code Extension Recommendations

For an enhanced development experience in VS Code, the following extensions are recommended:

1. **ES7+ React/Redux/React-Native snippets** - Provides shortcuts for React components
2. **ESLint** - For code quality and consistency
3. **Prettier** - Code formatting
4. **Live Server** - For local development and testing
5. **Debugger for Chrome** - For debugging the application in Chrome
6. **Color Highlight** - Visualizes colors in your code

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Modern web browser with HTML5 Canvas support

### Setup Instructions
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server
4. Open `http://localhost:8080` in your browser

## Future Enhancements

- Collaborative editing features
- More animation types (special moves, emotes, etc.)
- Advanced drawing tools (symmetry, guides)
- Animation easing and tweening options
- Direct Godot integration via plugin
- Custom animation path editing
- Expanded template library

## User Flow

1. User selects a template for their character
2. User draws the character parts using the drawing tools
3. User configures desired animations
4. User generates the animations using the "Generate" button
5. User previews the animations and makes adjustments if needed
6. User exports the final spritesheet for use in Godot

## Questions to Consider

1. What specific animation types are most important for your Godot projects?
2. Do you need support for specific sprite aspect ratios or sizes?
3. Would you prefer to draw each animation frame manually or have them auto-generated?
4. What export formats would be most useful for your workflow?
5. Do you need specific Godot-specific metadata in the exports?
6. How much control do you want over individual animation frames vs. automation?
