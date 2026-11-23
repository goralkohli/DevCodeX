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
      },
      'parametric-star': {
        title: 'Parametric Star Drawing',
        lesson: {
          concept: {
            heading: 'Why parametric stars?',
            body: 'A star alternates vertices between an outer radius and an inner radius as it sweeps around a circle. Canvas has no "drawStar" method — we compute every vertex ourselves using sine and cosine.',
            analogy: "Imagine plotting points on two concentric circles — every other point lands on the outer ring, creating the star's sharp tips."
          },
          starterCode: `// 🎯 CHALLENGE: Fill in the angle step for a 5-point star.
// A full circle is 2 * Math.PI radians.
// You need 10 total vertices (5 outer + 5 inner), evenly spaced.

const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
canvas.width = 300;
canvas.height = 300;

const cx = 150;
const cy = 150;
const outerRadius = 80;
const innerRadius = 35;
const points = 5;

// TODO: calculate the angle step.
// Hint: 10 vertices total, so the step is (2 * Math.PI) / 10.
const angleStep = /* YOUR_CODE_HERE */;

ctx.fillStyle = '#181B22';
ctx.fillRect(0, 0, 300, 300);

ctx.beginPath();
for (let i = 0; i < points * 2; i++) {
  const r = (i % 2 === 0) ? outerRadius : innerRadius;
  const angle = i * angleStep - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  if (i === 0) ctx.moveTo(x, y);
  else ctx.lineTo(x, y);
}
ctx.closePath();

ctx.fillStyle = '#6366F1';
ctx.fill();
ctx.strokeStyle = '#818CF8';
ctx.lineWidth = 2;
ctx.stroke();`,
          solutionCode: `// Canvas parametric star — solution
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
canvas.width = 300;
canvas.height = 300;

const cx = 150;
const cy = 150;
const outerRadius = 80;
const innerRadius = 35;
const points = 5;

const angleStep = (Math.PI * 2) / (points * 2);

ctx.fillStyle = '#181B22';
ctx.fillRect(0, 0, 300, 300);

ctx.beginPath();
for (let i = 0; i < points * 2; i++) {
  const r = (i % 2 === 0) ? outerRadius : innerRadius;
  const angle = i * angleStep - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  if (i === 0) ctx.moveTo(x, y);
  else ctx.lineTo(x, y);
}
ctx.closePath();

ctx.fillStyle = '#6366F1';
ctx.fill();
ctx.strokeStyle = '#818CF8';
ctx.lineWidth = 2;
ctx.stroke();`,
          challenge: {
            prompt: 'Fill in the angle step. A 5-point star needs 10 evenly spaced vertices.',
            blankLineRange: [17, 17],
            hint: 'A full circle is 2 * Math.PI. You need 10 equal steps around it.'
          }
        }
      }
    }
  }
};
