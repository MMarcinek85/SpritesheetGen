import React from 'react';
import { createRoot } from 'react-dom/client';

// Create a very simple React component
function App() {
  return (
    <div>
      <h1>Hello from React</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
}

// Use the new React 18 createRoot API if available, otherwise fall back to older method
const container = document.getElementById('root');

if (typeof createRoot === 'function') {
  // React 18
  const root = createRoot(container);
  root.render(<App />);
} else {
  // React 17 and below
  const ReactDOM = require('react-dom');
  ReactDOM.render(<App />, container);
}
