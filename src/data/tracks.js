export const tracks = {
  canvas: {
    id: 'canvas',
    title: 'Visual Computing & Canvas',
    topics: {
      'radial-coordinates': {
        title: 'Radial Coordinate Math',
        lesson: {
          concept: {
            heading: 'Why radial gradients?',
            body: 'A radial gradient paints a color that radiates outward from a center point. It is how Canvas draws spotlights, glowing orbs, and sunbursts — all from a single draw call.',
            analogy: 'Think of a flashlight pressed against a wall: brightest at the center, fading outward in perfect circles.'
          },
          starterCode: `// Canvas radial gradient — first sandbox
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

// Canvas is 300x300
canvas.width = 300;
canvas.height = 300;

// TODO: fill in the inner and outer radii below.
// Hint: inner should be 0, outer should be 100.
const gradient = ctx.createRadialGradient(
  150, 150, /* YOUR_CODE_HERE */,
  150, 150, /* YOUR_CODE_HERE */
);

gradient.addColorStop(0, '#6366F1');
gradient.addColorStop(1, '#0F1115');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 300, 300);`,
          solutionCode: `// Canvas radial gradient — solution
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

canvas.width = 300;
canvas.height = 300;

const gradient = ctx.createRadialGradient(
  150, 150, 0,
  150, 150, 100
);

gradient.addColorStop(0, '#6366F1');
gradient.addColorStop(1, '#0F1115');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 300, 300);`,
          challenge: {
            prompt: 'Fill in the two radii. Inner = 0, outer = 100.',
            blankLineRange: [10, 11],
            hint: 'The inner radius is the empty hole at the center. The outer radius is where the color stops.'
          }
        }
      }
    }
  }
};
