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

## Customization

### Adding New Templates

To add a new animation template:

1. Create a new JSON file in `public/templates/`
2. Follow the template format (see existing templates for reference)
3. Your new template will automatically appear in the template selector

## Technologies Used

- React
- HTML Canvas API
- Webpack
- Babel