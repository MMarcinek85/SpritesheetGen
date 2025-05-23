# Spritesheet Generator for Godot

A web application that simplifies the workflow of creating spritesheets for animated sprites in the Godot game engine.

## Features

- Interactive drawing canvas with customizable tools
- Template-based sprite creation
- Automatic animation frame generation
- Real-time animation preview
- Export to spritesheets with Godot metadata

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone this repository:
```bash
git clone https://github.com/MMarcinek85/SpritesheetGen.git
cd spritesheet-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:8080`

## How to Use

### 1. Select a Template

Choose one of the predefined templates (Walk, Run, Idle) from the dropdown. Templates define the structure of your character's parts (body, arms, legs, head, etc.) and how they should move during animations.

Templates are rendered as guides on the canvas with:
- Light fill and outline in underlay mode (when not actively drawing)
- Clear part labels for each body component
- Dynamic scaling to fit the canvas regardless of window size
- Proper positioning for best drawing experience

### 2. Draw Your Character

Use the drawing tools to create your character sprite on the template. The template provides guidelines for where different parts of your character should be placed.

- **B**: Brush Tool - Draw freely on the canvas
- **E**: Eraser - Remove parts of your drawing
- **F**: Fill Tool - Fill an area with color
- **C**: Color Picker - Select colors from your drawing
- **L**: Line Tool - Draw straight lines
- **R**: Rectangle Tool - Draw rectangle shapes
- **Layer System**: Organize your drawing with multiple layers

### 3. Generate Animation Frames

Once you've finished drawing your character, click the "Generate Animation Frames" button to automatically create animation frames based on the template. The application will use your drawing to create frames for the selected animation type.

### 4. Preview Animations

Use the Animation Preview panel to see how your animations look in action. You can:
- Play/pause the animation
- Step through individual frames
- Adjust the animation speed (FPS)

### 5. Export Your Spritesheet

When you're satisfied with your animations, use the Export panel to:
- Configure spritesheet settings (frame size, padding, columns)
- Choose between exporting as a single spritesheet or individual frames
- Include Godot-specific metadata for easy import into your game

## Project Structure

- **src/**
  - **components/**: React components for UI
  - **templates/**: Animation templates and utilities
  - **utils/**: Helper functions
  - **styles/**: CSS styles
- **public/**
  - **templates/**: JSON template files for animations

## Development

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the application for production
- `npm run clean` - Remove the dist and node_modules folders
- `npm run rebuild` - Clean and reinstall everything

## Code Cleanup

This repository has been cleaned up to remove test files and redundant configuration files used during the initial development process. If you need any of the removed files, check the `backups` directory that was created during cleanup.

## Troubleshooting

### Template Loading Issues

If templates fail to load or display correctly:

1. Check browser console for specific error messages
2. Verify template JSON structure matches the required format
3. Make sure template files are properly located in the `/public/templates/` directory
4. Check that template scaling is appropriate for the canvas size
5. For blank screens, ensure all required parts exist in the template

### Webpack and Build Issues

If you encounter build issues:

1. Make sure all required dependencies are installed with `npm install`
2. Check that webpack.new.js is being used as the configuration
3. Verify that babel.config.js exists and contains required presets
4. Try rebuilding with `npm run rebuild`
5. For template loading issues, ensure copy-webpack-plugin is correctly copying files

## Customization

### Adding New Templates

To add a new animation template:

1. Create a new JSON file in `public/templates/`
2. Follow the template format (see existing templates for reference)
3. Your new template will automatically appear in the template selector

### Template Structure

Templates must follow this JSON structure:

```json
{
  "name": "templateName",
  "frames": [
    {
      "id": 1,
      "parts": {
        "body": {
          "position": { "x": 50, "y": 100 },
          "size": { "width": 32, "height": 32 }
        },
        "head": {
          "position": { "x": 50, "y": 80 },
          "size": { "width": 32, "height": 32 }
        },
        "leftArm": {
          "position": { "x": 40, "y": 100 },
          "size": { "width": 10, "height": 20 }
        },
        "rightArm": {
          "position": { "x": 80, "y": 100 },
          "size": { "width": 10, "height": 20 }
        },
        "leftLeg": {
          "position": { "x": 50, "y": 140 },
          "size": { "width": 10, "height": 20 }
        },
        "rightLeg": {
          "position": { "x": 70, "y": 140 },
          "size": { "width": 10, "height": 20 }
        }
      },
      "duration": 100
    }
  ]
}
```

**Required Fields:**
- `name`: Identifier for the template
- `frames`: Array of frame objects that make up the animation
- Each frame needs an `id` and `parts` object
- Each part requires `position` and `size` properties
- Required part names: `body`, `head`, `leftArm`, `rightArm`, `leftLeg`, `rightLeg`

## Development Notes

### Recent Improvements

- **Dynamic Template Rendering**: Templates now scale properly based on canvas dimensions
- **Enhanced Error Handling**: Better validation and error messages for template loading
- **Visual Improvements**: Better template visibility and part labeling
- **Template System**: Centralized template loading and validation

### Known Issues

- Large templates may appear blurry when scaled too much
- Template positioning can still be improved for certain animation types
- Additional validation for more complex template structures is needed

### Future Enhancements

- Add template preview thumbnails in the selector
- Create more animation templates (attack, jump, etc.)
- Implement frame-by-frame animation editing
- Add sprite part isolation for detailed editing
- Create export profiles for different game engines

## Technologies Used

- React
- HTML Canvas API
- Webpack
- Babel
- Fetch API for template loading
- Babel

### Perplexity Research

-Lightweight Web-Based Sprite Drawing and Animation System: Technologies and Implementation Strategies
Creating a lightweight web-based sprite drawing and animation system requires careful consideration of drawing technologies, spritesheet generation tools, and performance optimization strategies. This comprehensive analysis examines the available technologies and methodologies for building a system that allows users to create sprites through browser-based drawing tools and automatically converts them into animated spritesheets suitable for web applications and games.

Drawing Tools and Canvas Libraries
HTML5 Canvas Foundation
The foundation of any lightweight sprite drawing application lies in HTML5 Canvas technology, which provides native browser support for 2D graphics rendering without requiring external plugins. The basic implementation involves finding the canvas element using getElementById(), creating a drawing context with getContext("2d"), and utilizing drawing methods like fillRect() for basic shape creation. This native approach ensures maximum compatibility and minimal overhead, making it ideal for lightweight applications where performance and browser support are paramount.

The HTML5 Canvas API offers fundamental drawing capabilities including path drawing, shape creation, image manipulation, and pixel-level control. For sprite creation specifically, the pixel-level access provided by Canvas allows developers to implement custom drawing tools that can create precise pixel art suitable for game development. The fillStyle property can be configured to use colors, gradients, or patterns, while methods like fillRect() enable the creation of basic geometric shapes that form the building blocks of sprite art.

Performance-Optimized Canvas Libraries
When evaluating canvas libraries for sprite drawing applications, performance becomes a critical factor, especially when handling multiple elements or complex drawings. According to performance comparisons, different libraries exhibit vastly different capabilities when handling large numbers of elements. FabricJS demonstrates significant performance limitations, supporting only approximately 200 elements before experiencing slowdowns. Similarly, KonvaJS also shows performance constraints with the same 200-element threshold.

In contrast, Excalidraw demonstrates exceptional performance capabilities, supporting up to 15,000 elements before experiencing significant lag. This makes Excalidraw particularly suitable for complex sprite creation workflows where users might work with detailed pixel art or multiple animation frames simultaneously. The library's high performance characteristics, combined with its comprehensive feature set including shortcuts and drawing tools, position it as an excellent choice for sprite creation applications.

Specialized Pixel Art Solutions
For applications specifically focused on pixel art creation, specialized tools like Piskel offer comprehensive feature sets tailored to sprite development workflows. Piskel provides real-time animation preview capabilities, allowing users to see their sprite animations as they create them. The platform supports multiple export formats including animated GIFs for sharing and spritesheet PNG/ZIP files for integration into larger projects. Additionally, Piskel's open-source nature and availability across multiple platforms including desktop applications for Windows, OSX, and Linux make it an excellent reference implementation for sprite creation functionality.

The Pixellate project demonstrates another approach to pixel art creation using HTML5 Canvas technology. This Progressive Web App (PWA) implementation offers offline compatibility and mobile-friendly design, crucial features for modern web applications. The tool supports various canvas dimensions with 16x16 as the default, and recommends keeping dimensions below 128x128 for optimal performance. The comprehensive toolset includes pencil, eraser, paint bucket, line drawing using Bresenham's algorithm, and geometric shape tools for circles and ellipses.

Advanced Graphics Libraries
GraphicsJS for Complex Rendering
For applications requiring more sophisticated graphics capabilities, GraphicsJS offers a lightweight yet powerful solution built on SVG/VML technology. This library provides capabilities for drawing interactive and animated graphics with visual effects, making it suitable for complex sprite creation workflows. GraphicsJS implements a Virtual DOM system that enhances drawing robustness and manageability, crucial for applications handling multiple sprite frames and animations.

The library's mathematical function support enables the creation of complex curves and shapes that go beyond basic Bezier curves, offering capabilities for creating sophisticated sprite designs. Additionally, GraphicsJS provides rich text features including multiline text support, text measurement, and various formatting options like wrap, overflow, indent, spacing, and alignment. These text capabilities could be valuable for sprite applications that include text elements or user interface components.

Smart Layering and Z-Index Management
GraphicsJS implements intelligent layering systems and z-index support, addressing common challenges in sprite creation where overlapping elements need to be managed efficiently. Traditional graphics systems often require complete redrawing when changing element order, but GraphicsJS allows dynamic manipulation of element stacking without performance penalties. This capability is particularly valuable in sprite creation workflows where users need to organize different sprite components or animation layers.

Spritesheet Generation Technologies
Automated Spritesheet Creation
The transformation of individual sprite frames into optimized spritesheets requires specialized tools that can handle image processing and atlas generation. Spritesheet-js provides a comprehensive command-line and Node.js solution for generating spritesheets from multiple image sources. The tool supports various industry-standard formats including Starling/Sparrow, JSON for libraries like PIXI.js, Easel.js, and cocos2d variants.

The spritesheet generation process offers numerous optimization options including trimming transparent whitespace around images, which can significantly improve packing efficiency and rendering performance. Additional features include padding control between images, scaling options, and various packing algorithms including growing-binpacking, standard binpacking, and vertical or horizontal arrangements. These optimization capabilities are crucial for creating efficient spritesheets that minimize memory usage and loading times.

CSS-Based Sprite Solutions
For web-focused applications, CSS sprite generation tools like css-sprite provide specialized functionality for creating web-optimized sprite assets. The tool generates both sprite images and corresponding CSS files, streamlining the integration process for web applications. Support for retina displays through high-resolution sprite generation ensures compatibility with modern high-DPI displays. The ability to create base64-encoded inline sprites offers an alternative approach for small sprite sets where reducing HTTP requests is prioritized over file size optimization.

Animation and Rendering Systems
SpriteSheet Animation Management
The EaselJS SpriteSheet class provides a robust framework for managing sprite animations within web applications. The system requires two essential properties: images arrays containing source images and frames definitions specifying individual frame positions and dimensions. Optional properties include framerate for controlling animation speed and animations for defining named animation sequences.

The frame definition system supports both uniform grid-based layouts and variable-sized frame arrays, providing flexibility for different sprite creation workflows. Grid-based definitions use properties like width, height, regX, regY, and count to automatically calculate frame positions, while array-based definitions allow precise control over individual frame specifications. This dual approach accommodates both systematic sprite creation processes and custom sprite layouts.

Performance Optimization Strategies
When implementing sprite animation systems, performance considerations become critical for maintaining smooth user experiences. The registration point (regX, regY) system in sprite frameworks allows precise control over sprite positioning and rotation origins, essential for creating smooth animations. Proper spacing and margin specifications prevent visual artifacts during animation playback while optimizing memory usage.

Frame counting mechanisms help optimize memory allocation by allowing systems to pre-calculate total animation requirements. The automatic calculation based on source image dimensions and frame specifications reduces manual configuration requirements while ensuring efficient resource utilization.

Implementation Architecture
Progressive Web App Considerations
Modern sprite creation applications benefit significantly from Progressive Web App (PWA) architecture, as demonstrated by implementations like Pixellate. PWA functionality enables offline compatibility, crucial for creative applications where users may not have consistent internet connectivity. Mobile-friendly design ensures accessibility across different device types, expanding the potential user base beyond desktop environments.

The PWA approach also enables advanced features like background processing for spritesheet generation, local storage for project persistence, and push notifications for collaboration features. Service worker implementation can cache drawing tools and libraries, reducing loading times and improving user experience during subsequent visits.

Canvas Dimension and Performance Optimization
Optimal canvas sizing represents a critical balance between functionality and performance. Research indicates that dimensions below 128x128 pixels provide smooth operation for most sprite creation tasks. This limitation stems from the computational complexity of pixel manipulation operations and the memory requirements for storing canvas states for undo/redo functionality.

The undo/redo implementation in sprite applications typically faces limitations due to memory constraints and processing requirements. Basic implementations may only support single-pixel operations, requiring users to work carefully or utilize frame-based checkpointing systems for major changes. Advanced implementations might use delta-based change tracking or compressed state storage to extend undo/redo capabilities while maintaining performance.

Integration and Export Workflows
Multi-Format Export Support
Comprehensive sprite creation systems require robust export capabilities supporting various output formats tailored to different use cases. Image export functionality typically includes PNG format for high-quality static sprites with transparency support. Animated GIF export enables easy sharing and preview of sprite animations across platforms and social media.

For game development workflows, spritesheet export in ZIP format containing both image files and metadata enables integration with game engines and development frameworks. The metadata typically includes frame dimensions, animation sequences, and timing information necessary for proper sprite animation implementation.

Web Integration Considerations
CSS sprite integration requires careful consideration of image paths and web server configuration. Tools like css-sprite provide configurable image path options to accommodate different hosting environments and CDN configurations. The generated CSS files include precise positioning information for background-image sprites, enabling efficient web implementation with minimal additional development work.

Base64 encoding options offer alternative implementation strategies for small sprite sets where reducing HTTP requests takes priority over file size optimization. This approach can be particularly valuable for critical sprites that need immediate availability or for applications with strict caching requirements.

Conclusion
Creating a lightweight web-based sprite drawing and animation system requires thoughtful integration of multiple technologies and careful performance optimization. HTML5 Canvas provides the foundational drawing capabilities, while specialized libraries like Excalidraw offer enhanced performance for complex operations. Automated spritesheet generation tools like spritesheet-js enable efficient conversion of individual sprites into optimized animation assets.

The most effective implementations combine native Canvas APIs for core drawing functionality with performance-optimized libraries for advanced features. Progressive Web App architecture ensures broad accessibility and offline functionality, while careful attention to canvas dimensions and export formats maintains optimal performance across different devices and use cases. Success in this domain requires balancing feature richness with performance constraints, prioritizing user experience while maintaining the lightweight characteristics essential for web-based creative tools.

Future development directions should focus on advanced collaboration features, cloud-based project storage, and integration with popular game development frameworks. The continued evolution of web technologies, particularly WebAssembly and advanced Canvas APIs, presents opportunities for even more sophisticated sprite creation tools that maintain the accessibility and lightweight characteristics that make web-based solutions attractive to creators and developers alike.