// A simple version of ToolPanel for testing
import React from 'react';

const ToolPanel = (props) => {
  return (
    <div className="tool-panel">
      <h3>Simple Tool Panel</h3>
      <div className="tools">
        <button>Brush</button>
        <button>Eraser</button>
      </div>
    </div>
  );
};

export default ToolPanel;
