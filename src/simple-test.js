import React from 'react';
import ReactDOM from 'react-dom';
import SimpleToolPanel from './components/SimpleToolPanel';
import './styles/main.css';

const TestApp = () => {
  return (
    <div className="app-container">
      <header>
        <h1>SpriteGen Test App</h1>
      </header>
      <main>
        <SimpleToolPanel />
      </main>
    </div>
  );
};

ReactDOM.render(<TestApp />, document.getElementById('root'));
