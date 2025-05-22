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
git clone https://github.com/yourusername/spritesheet-generator.git
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

Choose one of the predefined templates for your character type. Templates define the structure of your character's parts (body, arms, legs, head, etc.) and how they should move during animations.

### 2. Draw Your Character

Use the drawing tools to create your character sprite on the template. The template provides guidelines for where different parts of your character should be placed.

- **Brush Tool**: Draw freely on the canvas
- **Eraser**: Remove parts of your drawing
- **Fill Tool**: Fill an area with color
- **Color Picker**: Select colors from your drawing
- **Layer System**: Organize your drawing with multiple layers

### 3. Generate Animation Frames

Once you've finished drawing your character, click the "Generate Animation Frames" button to automatically create animation frames based on the template. The application will use your drawing to create frames for walking, running, idle, and other animations.

### 4. Preview Animations

Use the Animation Preview panel to see how your animations look in action. You can:
- Play/pause the animation
- Step through individual frames
- Adjust the animation speed

### 5. Export Your Spritesheet

When you're satisfied with your animations, use the Export panel to:
- Configure spritesheet settings (frame size, padding, columns)
- Choose between exporting as a single spritesheet or individual frames
- Include Godot-specific metadata for easy import into your game
- Preview the final spritesheet before exporting

## Project Structure

- **src/**
  - **components/**: React components for UI
  - **templates/**: Animation templates
  - **utils/**: Helper functions
  - **styles/**: CSS styles

## Customization

### Adding New Templates

To add a new animation template:

1. Create a new JSON file in `public/templates/`
2. Follow the template format (see existing templates for reference)
3. Your new template will automatically appear in the template selector

### Extending Functionality

The application is built with modularity in mind. To add new features:

1. Create new components in the `src/components/` directory
2. Add new utility functions in `src/utils/`
3. Update styles in `src/styles/main.css`

## Technologies Used

- React.js for UI components
- HTML5 Canvas API for drawing
- Webpack for bundling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Godot Engine community for inspiration
- All open-source contributors whose work made this project possible