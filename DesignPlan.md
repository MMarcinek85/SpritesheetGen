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

## Agent Recommendations (May 22, 2025)

### Creating Good-Looking Spritesheets with the Current App

Leveraging the recent improvements to the template system is key to creating visually appealing and consistent spritesheets. Here’s how you can make the most of the current features:

1.  **Master the Templates:**
    *   **Use Outlines as Guides:** The core strength of your app lies in its template system. Religiously use the provided outlines for `body`, `head`, `arms`, `legs`, etc., as your primary guides for size, proportion, and placement. The recent fixes for dynamic scaling and centering ensure that what you draw within these guides will translate well.
    *   **Consistency Across Templates:** When drawing parts for different animation states (e.g., `walk`, `run`, `idle`), strive to maintain the character's fundamental appearance (e.g., head shape, core body features) unless an animation specifically requires a change (like a character puffing out their chest for an attack).

2.  **Focus on Clarity and Consistency:**
    *   **Art Style:** Define an art style (e.g., pixel art, clean vector-like lines) and stick to it for all parts of a character. This includes line thickness, shading style, and overall detail level.
    *   **Silhouette:** Aim for a clear and recognizable silhouette for your character. This is crucial for readability, especially when the sprite is small or in motion.
    *   **Part Labels:** Utilize the enhanced visibility of template part labels. This will help you accurately identify which part you are drawing, reducing errors and ensuring consistency.

3.  **Strategic Color Usage:**
    *   **Limited Palette:** Choose a limited, harmonious color palette for each character and adhere to it. This greatly enhances the professionalism and cohesiveness of your sprites.
    *   **Contrast:** Ensure enough contrast between different parts of the character and between the character and typical backgrounds it might appear against in a game.

4.  **Detail Management:**
    *   **Appropriate Detail:** Add detail that enhances the character without cluttering the design, especially considering the final size of the sprite in-game. Sometimes, simpler designs are more effective.
    *   **Pixel Art Considerations (if applicable):** If you're aiming for a pixel art style, every pixel counts. Focus on clean lines and deliberate pixel placement for shading and highlights.

5.  **Iterative Process & (Future) Preview:**
    *   While the full animation preview system is planned for a later phase (as per `DesignPlan.md`), you can still iterate. After drawing parts for a few templates, mentally (or by quickly sketching on paper) "animate" them to see if the transitions would make sense.
    *   Once the export functionality is in place, frequently export and test your spritesheets in Godot or an animation preview tool to get a feel for the actual motion.

### New Technologies to Further the Design Plan

Based on your `DesignPlan.md` and the current React/Webpack/Canvas API setup, here are some technologies and libraries that could help you implement planned features and enhance the application:

1.  **Advanced 2D Canvas Libraries (e.g., `Konva.js`, `Fabric.js`, `Paper.js`)**
    *   **Addresses:**
        *   `DesignPlan.md` Core Feature: "Drawing Interface" (Layer management, Undo/redo).
        *   `DesignPlan.md` Future Enhancement: "Advanced drawing tools (symmetry, guides)."
    *   **Benefits:** These libraries offer a more robust, object-oriented approach to working with the HTML5 canvas. They can simplify:
        *   **Layer Management:** Creating and managing distinct drawing layers.
        *   **Object Model:** Treating drawn shapes/paths as selectable, modifiable objects.
        *   **Event Handling:** More sophisticated event handling for interactions.
        *   **Undo/Redo:** Implementing undo/redo functionality by managing a history of operations on these objects.
        *   **Advanced Tools:** Easier implementation of features like drawing guides, snapping, or symmetry tools.
    *   **Consideration:** Integrating one ofthese would likely involve a significant refactor of your current `Canvas.js` component but would provide a much stronger foundation for advanced drawing features.

2.  **Animation Tweening Libraries (e.g., `GSAP (GreenSock)`, `Tween.js`)**
    *   **Addresses:**
        *   `DesignPlan.md` Core Feature: "Animation Preview Component" (real-time preview, playback controls).
        *   `DesignPlan.md` Future Enhancement: "Animation easing and tweening options."
    *   **Benefits:**
        *   **Smooth Previews:** For the "Animation Preview Component," these libraries can smoothly interpolate (tween) between the states of sprite parts (position, rotation, scale) defined in your animation data, creating fluid previews.
        *   **Easing Functions:** Essential for implementing "animation easing and tweening options," allowing for more natural and expressive animations (e.g., ease-in, ease-out, bounce).
    *   **Integration:** Can be used to drive the visual properties of elements or canvas drawings in your preview component.

3.  **State Management Libraries (e.g., `Zustand`, `Jotai`, or `Redux` for larger scale)**
    *   **Addresses:**
        *   `DesignPlan.md` Core Feature: "Drawing Interface" (Undo/redo functionality).
        *   Overall application complexity as more features (tool states, color palettes, layer visibility, animation timelines) are added.
    *   **Benefits:**
        *   **Centralized State:** Provides a predictable way to manage global application state.
        *   **Undo/Redo:** Simplifies implementing undo/redo by managing snapshots of the relevant state.
        *   **Maintainability:** Makes the codebase easier to reason about and debug as features grow.
    *   **Choice:** `Zustand` or `Jotai` are often favored for their simplicity in React projects, while `Redux` is more comprehensive for very complex applications.

4.  **Godot Resource File Generation (Custom Logic + String/File Manipulation)**
    *   **Addresses:**
        *   `DesignPlan.md` Core Feature: "Export System" (Godot-specific metadata export .tres or .res).
    *   **Benefits:** Directly generating Godot-compatible resource files (`.tres` for text-based resources like `Animation` or `SpriteFrames` is a good starting point) will massively improve workflow for Godot users.
    *   **Implementation:** This doesn't require a specific JS library for Godot formats per se, but rather careful construction of strings that match Godot's resource file syntax.
        *   **Strategy:** Create example resources (e.g., a `SpriteFrames` resource with a simple animation) directly in Godot, save them as `.tres` (text resource), inspect their structure, and then write JavaScript functions to generate similar text output based on your application's data.

5.  **UI Component Libraries (e.g., `Material-UI`, `Chakra UI`, `Ant Design`)**
    *   **Addresses:**
        *   `DesignPlan.md` Phase 5: "UI/UX improvements."
        *   Efficiently building the UI for "Frontend Components" like the Tool Panel, Animation Preview, and Spritesheet Exporter.
    *   **Benefits:**
        *   **Rapid Development:** Provides pre-built, customizable, and often accessible React components (sliders, modals, complex forms, layout grids, etc.).
        *   **Consistent Look and Feel:** Helps maintain a consistent design across the application.
    *   **Consideration:** Choose a library that aligns with your desired aesthetic and doesn't add excessive overhead if your UI needs are relatively simple.
