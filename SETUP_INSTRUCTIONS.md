# Running the Spritesheet Generator Project

## Fix PowerShell Execution Policy

You're encountering a PowerShell security restriction. To fix it:

1. Open PowerShell as Administrator:
   - Right-click on the Windows Start button
   - Select "Windows PowerShell (Admin)" or "Windows Terminal (Admin)"

2. Run this command:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

3. Type `Y` when prompted to confirm

## Install Dependencies and Start the Project

After fixing the execution policy, open a new PowerShell window and run:

1. Navigate to your project folder:
   ```powershell
   cd C:\SpriteGen\spritesheet-generator
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Install specific required dependencies:
   ```powershell
   npm install --save-dev @babel/core @babel/preset-env @babel/preset-react html-webpack-plugin file-loader
   ```

4. Start the development server:
   ```powershell
   npm start
   ```

The application should automatically open in your default browser at http://localhost:8080.

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed:
   ```powershell
   npm install
   ```

2. Create a public/templates directory if it doesn't exist:
   ```powershell
   mkdir -p public\templates
   ```

3. Check for errors in the console output and follow any specific instructions provided.

4. If webpack fails, try running webpack directly:
   ```powershell
   npx webpack serve --open
   ```

## VS Code Tasks

For future convenience, you can create VS Code tasks:

1. Press Ctrl+Shift+P and type "Tasks: Configure Task"
2. Select "Create tasks.json file from template"
3. Choose "npm" from the list

This will create a tasks.json file that allows you to run npm scripts with keyboard shortcuts.
