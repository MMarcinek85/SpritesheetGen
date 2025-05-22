import React from 'react';
import ReactDOM from 'react-dom';
import './styles/main.css';

// Simple test component
class App extends React.Component {
  render() {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Spritesheet Generator for Godot</h1>
        </header>
        <div className="main-content">
          <p>Loading application...</p>
        </div>
      </div>
    );
  }
}

// Render the application
ReactDOM.render(<App />, document.getElementById('root'));
