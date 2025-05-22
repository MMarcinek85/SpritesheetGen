const fs = require('fs');
const path = require('path');

// Ensure the public/templates directory exists
const templateDir = path.join(__dirname, 'public', 'templates');
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
  console.log('Created public/templates directory');
}

// List of templates to check/create
const templates = [
  {
    name: 'walk',
    content: {
      name: 'walk',
      displayName: 'Walk Animation',
      frames: [
        {
          id: 1,
          parts: {
            body: {
              position: { x: 50, y: 100 },
              size: { width: 32, height: 32 }
            },
            leftLeg: {
              position: { x: 50, y: 130 },
              size: { width: 10, height: 20 },
              rotation: -15
            },
            rightLeg: {
              position: { x: 70, y: 130 },
              size: { width: 10, height: 20 }
            },
            leftArm: {
              position: { x: 30, y: 100 },
              size: { width: 10, height: 20 },
              rotation: 20
            },
            rightArm: {
              position: { x: 70, y: 100 },
              size: { width: 10, height: 20 }
            },
            head: {
              position: { x: 50, y: 80 },
              size: { width: 32, height: 32 }
            }
          }
        },
        {
          id: 2,
          parts: {
            body: {
              position: { x: 50, y: 100 },
              size: { width: 32, height: 32 }
            },
            leftLeg: {
              position: { x: 50, y: 130 },
              size: { width: 10, height: 20 }
            },
            rightLeg: {
              position: { x: 70, y: 130 },
              size: { width: 10, height: 20 },
              rotation: -15
            },
            leftArm: {
              position: { x: 30, y: 100 },
              size: { width: 10, height: 20 }
            },
            rightArm: {
              position: { x: 70, y: 100 },
              size: { width: 10, height: 20 },
              rotation: 20
            },
            head: {
              position: { x: 50, y: 80 },
              size: { width: 32, height: 32 }
            }
          }
        }
      ]
    }
  },
  {
    name: 'run',
    content: {
      name: 'run',
      displayName: 'Run Animation',
      frames: [
        {
          id: 1,
          parts: {
            body: {
              position: { x: 50, y: 100 },
              size: { width: 32, height: 32 }
            },
            leftLeg: {
              position: { x: 50, y: 130 },
              size: { width: 10, height: 20 },
              rotation: -30
            },
            rightLeg: {
              position: { x: 70, y: 130 },
              size: { width: 10, height: 20 },
              rotation: 30
            },
            leftArm: {
              position: { x: 30, y: 100 },
              size: { width: 10, height: 20 },
              rotation: 45
            },
            rightArm: {
              position: { x: 70, y: 100 },
              size: { width: 10, height: 20 },
              rotation: -45
            },
            head: {
              position: { x: 50, y: 80 },
              size: { width: 32, height: 32 }
            }
          }
        },
        {
          id: 2,
          parts: {
            body: {
              position: { x: 50, y: 100 },
              size: { width: 32, height: 32 }
            },
            leftLeg: {
              position: { x: 50, y: 130 },
              size: { width: 10, height: 20 },
              rotation: 30
            },
            rightLeg: {
              position: { x: 70, y: 130 },
              size: { width: 10, height: 20 },
              rotation: -30
            },
            leftArm: {
              position: { x: 30, y: 100 },
              size: { width: 10, height: 20 },
              rotation: -45
            },
            rightArm: {
              position: { x: 70, y: 100 },
              size: { width: 10, height: 20 },
              rotation: 45
            },
            head: {
              position: { x: 50, y: 80 },
              size: { width: 32, height: 32 }
            }
          }
        }
      ]
    }
  },
  {
    name: 'idle',
    content: {
      name: 'idle',
      displayName: 'Idle Animation',
      frames: [
        {
          id: 1,
          parts: {
            body: {
              position: { x: 50, y: 100 },
              size: { width: 32, height: 32 }
            },
            leftLeg: {
              position: { x: 50, y: 130 },
              size: { width: 10, height: 20 }
            },
            rightLeg: {
              position: { x: 70, y: 130 },
              size: { width: 10, height: 20 }
            },
            leftArm: {
              position: { x: 30, y: 100 },
              size: { width: 10, height: 20 }
            },
            rightArm: {
              position: { x: 70, y: 100 },
              size: { width: 10, height: 20 }
            },
            head: {
              position: { x: 50, y: 80 },
              size: { width: 32, height: 32 }
            }
          }
        },
        {
          id: 2,
          parts: {
            body: {
              position: { x: 50, y: 101 },
              size: { width: 32, height: 31 }
            },
            leftLeg: {
              position: { x: 50, y: 130 },
              size: { width: 10, height: 20 }
            },
            rightLeg: {
              position: { x: 70, y: 130 },
              size: { width: 10, height: 20 }
            },
            leftArm: {
              position: { x: 30, y: 101 },
              size: { width: 10, height: 20 }
            },
            rightArm: {
              position: { x: 70, y: 101 },
              size: { width: 10, height: 20 }
            },
            head: {
              position: { x: 50, y: 81 },
              size: { width: 32, height: 32 }
            }
          }
        }
      ]
    }
  }
];

// Write template files
templates.forEach(template => {
  const filePath = path.join(templateDir, `${template.name}.json`);
  
  // Write the template file
  fs.writeFileSync(
    filePath,
    JSON.stringify(template.content, null, 2),
    'utf8'
  );
  console.log(`Created/updated template: ${template.name}.json`);
});

console.log('Template setup complete.');
