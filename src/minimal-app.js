import React from 'react';
import ReactDOM from 'react-dom';

const SimpleApp = () => {
  return (
    <div>
      <h1>Hello, React!</h1>
      <p>This is a simple test app.</p>
    </div>
  );
};

ReactDOM.render(<SimpleApp />, document.getElementById('root'));
