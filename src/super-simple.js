import React from 'react';
import { createRoot } from 'react-dom/client';

// Simplest possible React component
function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>If you see this, React is working!</p>
    </div>
  );
}

// Modern React 18 rendering method
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
