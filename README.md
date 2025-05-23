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