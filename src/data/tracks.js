export const tracks = {
  canvas: {
    id: 'canvas',
    title: 'Visual Computing & Canvas',
    topics: {
      'radial-coordinates': {
        title: 'Radial Coordinate Math',
        badge: 'Radial Coordinates',
        tags: ['createRadialGradient', 'DPR', 'Color Stops'],
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
          solutionRecipe: {
            code: `// Canvas radial gradient — solution
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
            compatNote: 'Canvas 2D is supported in all modern browsers (Chrome 4+, Firefox 3.6+, Safari 3.1+). No polyfills needed.'
          },
          tweaks: [
            {
              line: 12,
              label: 'Inner Radius',
              variable: 'r0',
              hint: 'Inner radius of the gradient. Set to 0 for a solid core spotlight, or > 0 for a hollow ring.'
            },
            {
              line: 13,
              label: 'Outer Radius',
              variable: 'r1',
              hint: 'Outer radius boundary where the final color stop completes.'
            },
            {
              line: 16,
              label: 'Core Glow Color',
              variable: 'addColorStop(0)',
              hint: 'Color at the focal origin (e.g. #6366F1 or #EC4899).'
            }
          ],
          challengeAnswer: '150, 150, 0, 150, 150, 100',
          challenge: {
            prompt: 'Fill in the two radii. Inner = 0, outer = 100.',
            blankLineRange: [10, 13],
            hint: 'The inner radius is the empty hole at the center. The outer radius is where the color stops.'
          },
          overlay: {
            type: 'radial',
            params: { cx: 150, cy: 150, r0: 0, r1: 100, labels: true }
          }
        }
      },
      'parametric-star': {
        title: 'Parametric Star Drawing',
        badge: 'Trigonometry & Polar Math',
        tags: ['Math.cos', 'Math.sin', 'closePath', 'Concentric Radii'],
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
          solutionRecipe: {
            code: `// Canvas parametric star — solution
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
            compatNote: 'Canvas 2D is supported in all modern browsers (Chrome 4+, Firefox 3.6+, Safari 3.1+). No polyfills needed.'
          },
          tweaks: [
            {
              line: 11,
              label: 'Outer Radius',
              variable: 'outerRadius',
              hint: 'Distance from center (cx, cy) to the sharp outer tips of the star.'
            },
            {
              line: 12,
              label: 'Inner Radius',
              variable: 'innerRadius',
              hint: 'Distance from center to the inner concavities between points.'
            },
            {
              line: 13,
              label: 'Star Points',
              variable: 'points',
              hint: 'Number of star points. Try 4, 6, 8, or 12.'
            }
          ],
          challengeAnswer: '(Math.PI * 2) / (points * 2);',
          challenge: {
            prompt: 'Fill in the angle step. A 5-point star needs 10 evenly spaced vertices.',
            blankLineRange: [17, 17],
            hint: 'A full circle is 2 * Math.PI. You need 10 equal steps around it.'
          },
          overlay: {
            type: 'radial',
            params: {
              cx: 150,
              cy: 150,
              r0: 35,
              r1: 80,
              labels: true,
              innerLabel: 'r_inner = 35',
              outerLabel: 'r_outer = 80'
            }
          }
        }
      },
      'coordinate-transforms': {
        title: 'Matrix Transformations',
        badge: 'Coordinate Space',
        tags: ['translate', 'rotate', 'ctx.save', 'Local Origin'],
        lesson: {
          concept: {
            heading: 'Why translate before rotating?',
            body: 'By default ctx.rotate() pivots around (0, 0) — the top-left corner of the canvas. To rotate a shape around its center, translate the origin first, then rotate, then draw around local (0, 0).',
            analogy: 'Imagine sticking a pin through a photo: if you pin the top-left corner and spin, the photo swings wildly off the table. Pin the exact center, and it spins perfectly in place.'
          },
          starterCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cx = 150, cy = 150;
const rectWidth = 80, rectHeight = 80;
const angleDegrees = 45;

ctx.fillStyle = '#181B22';
ctx.fillRect(0, 0, 300, 300);

ctx.save();
// 🎯 CHALLENGE: Translate the origin to the center of the square
// before rotating. Without translation, rotation pivots around
// (0, 0) and clips the shape!
/* YOUR_CODE_HERE */

ctx.rotate((angleDegrees * Math.PI) / 180);

ctx.fillStyle = '#6366F1';
ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
ctx.restore();`,
          solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cx = 150, cy = 150;
const rectWidth = 80, rectHeight = 80;
const angleDegrees = 45;

ctx.fillStyle = '#181B22';
ctx.fillRect(0, 0, 300, 300);

ctx.save();
// 🎯 CHALLENGE: Translate the origin to the center of the square
// before rotating. Without translation, rotation pivots around
// (0, 0) and clips the shape!
ctx.translate(cx, cy);

ctx.rotate((angleDegrees * Math.PI) / 180);

ctx.fillStyle = '#6366F1';
ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
ctx.restore();`,
          solutionRecipe: {
            code: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cx = 150, cy = 150;
const rectWidth = 80, rectHeight = 80;
const angleDegrees = 45;

ctx.fillStyle = '#181B22';
ctx.fillRect(0, 0, 300, 300);

ctx.save();
ctx.translate(cx, cy);
ctx.rotate((angleDegrees * Math.PI) / 180);

ctx.fillStyle = '#6366F1';
ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
ctx.restore();`,
            compatNote: 'Canvas 2D transforms (translate, rotate, scale, save, restore) are universally supported across all browsers.'
          },
          tweaks: [
            {
              line: 3,
              label: 'Center Origin',
              variable: 'cx, cy',
              hint: 'Coordinates where the local transform origin is placed.'
            },
            {
              line: 4,
              label: 'Square Dimensions',
              variable: 'rectWidth, rectHeight',
              hint: 'Width and height of the centered rectangle.'
            },
            {
              line: 5,
              label: 'Rotation Angle',
              variable: 'angleDegrees',
              hint: 'Angle of rotation in degrees around local (0, 0).'
            }
          ],
          challengeAnswer: 'ctx.translate(cx, cy);',
          challenge: {
            prompt: 'Translate the coordinate origin to (cx, cy) before applying the rotation.',
            blankLineRange: [14, 14],
            hint: 'Call ctx.translate with the target center coordinates cx and cy.'
          },
          overlay: {
            type: 'axes',
            params: { cx: 150, cy: 150, angleDeg: 45, length: 100 }
          }
        }
      },
      'bezier-curves': {
        title: 'Cubic Bézier Splines',
        badge: 'Curves & Paths',
        tags: ['bezierCurveTo', 'Control Points', 'Splines'],
        lesson: {
          concept: {
            heading: 'Understanding Cubic Bézier Control Points',
            body: 'A cubic Bézier interpolates between start and end, pulled by two control points. In Canvas, Y increases downward, so to peak upward by height h, subtract h from the baseline Y.',
            analogy: 'Imagine two magnetic tractors pulling a flexible ribbon anchored at two points: each tractor exerts force toward its position.'
          },
          starterCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startX = 50, startY = 180;
const endX = 250, endY = 180;
const peakHeight = 70;

ctx.fillStyle = '#181B22';
ctx.fillRect(0, 0, 300, 300);

// 🎯 CHALLENGE: Calculate the control point Y coordinate so the
// wave arches upward. In Canvas, Y points downward. To peak above
// startY, subtract peakHeight!
const cpY = /* YOUR_CODE_HERE */;

ctx.beginPath();
ctx.moveTo(startX, startY);
ctx.bezierCurveTo(100, cpY, 200, cpY, endX, endY);
ctx.strokeStyle = '#818CF8';
ctx.lineWidth = 4;
ctx.stroke();`,
          solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startX = 50, startY = 180;
const endX = 250, endY = 180;
const peakHeight = 70;

ctx.fillStyle = '#181B22';
ctx.fillRect(0, 0, 300, 300);

// 🎯 CHALLENGE: Calculate the control point Y coordinate so the
// wave arches upward. In Canvas, Y points downward. To peak above
// startY, subtract peakHeight!
const cpY = startY - peakHeight;

ctx.beginPath();
ctx.moveTo(startX, startY);
ctx.bezierCurveTo(100, cpY, 200, cpY, endX, endY);
ctx.strokeStyle = '#818CF8';
ctx.lineWidth = 4;
ctx.stroke();`,
          solutionRecipe: {
            code: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startX = 50, startY = 180;
const endX = 250, endY = 180;
const peakHeight = 70;

ctx.fillStyle = '#181B22';
ctx.fillRect(0, 0, 300, 300);

const cpY = startY - peakHeight;

ctx.beginPath();
ctx.moveTo(startX, startY);
ctx.bezierCurveTo(100, cpY, 200, cpY, endX, endY);
ctx.strokeStyle = '#818CF8';
ctx.lineWidth = 4;
ctx.stroke();`,
            compatNote: 'ctx.bezierCurveTo is a core Canvas 2D API supported in all browsers since Chrome 1+, Firefox 1.5+, Safari 2+.'
          },
          tweaks: [
            {
              line: 3,
              label: 'Baseline Height',
              variable: 'startY, endY',
              hint: 'Y position of the curve start and end endpoints.'
            },
            {
              line: 5,
              label: 'Wave Peak Height',
              variable: 'peakHeight',
              hint: 'Distance the control points pull upward above the baseline.'
            },
            {
              line: 18,
              label: 'Stroke Width',
              variable: 'ctx.lineWidth',
              hint: 'Visual thickness of the interpolated spline curve.'
            }
          ],
          challengeAnswer: 'startY - peakHeight;',
          challenge: {
            prompt: 'Calculate the upward control point Y: startY - peakHeight.',
            blankLineRange: [13, 13],
            hint: 'Canvas Y points downward; subtract peakHeight from startY to arch upward.'
          },
          overlay: {
            type: 'bezier-handles',
            params: {
              startX: 50,
              startY: 180,
              cp1X: 100,
              cp1Y: 110,
              cp2X: 200,
              cp2Y: 110,
              endX: 250,
              endY: 180
            }
          }
        }
      },
      'stroke-animation': {
        title: 'Procedural Stroke Animation',
        badge: 'Animation & Math',
        tags: ['setLineDash', 'lineDashOffset', 'rAF', 'Rangoli'],
        lesson: {
          concept: {
            heading: 'The Magic of lineDashOffset Animation',
            body: 'setLineDash([totalLength, totalLength]) + decrementing lineDashOffset from totalLength to 0 inside requestAnimationFrame creates the illusion of a pen drawing the line.',
            analogy: 'Think of a curtain sliding across a lit window: the window is already shaped, but the curtain position reveals it bit by bit.'
          },
          starterCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const totalLength = 500;
let offset = totalLength;
const speed = 4;

function draw() {
  ctx.fillStyle = '#181B22';
  ctx.fillRect(0, 0, 300, 300);

  // 🎯 CHALLENGE: Decrement the offset on each frame to reveal
  // the stroke. When offset reaches 0, the full stroke is visible!
  offset = /* YOUR_CODE_HERE */;

  ctx.beginPath();
  ctx.arc(150, 150, 75, 0, Math.PI * 2);
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 5;

  ctx.setLineDash([totalLength, totalLength]);
  ctx.lineDashOffset = offset;
  ctx.stroke();

  requestAnimationFrame(draw);
}
draw();`,
          solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const totalLength = 500;
let offset = totalLength;
const speed = 4;

function draw() {
  ctx.fillStyle = '#181B22';
  ctx.fillRect(0, 0, 300, 300);

  // 🎯 CHALLENGE: Decrement the offset on each frame to reveal
  // the stroke. When offset reaches 0, the full stroke is visible!
  offset = Math.max(0, offset - speed);

  ctx.beginPath();
  ctx.arc(150, 150, 75, 0, Math.PI * 2);
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 5;

  ctx.setLineDash([totalLength, totalLength]);
  ctx.lineDashOffset = offset;
  ctx.stroke();

  requestAnimationFrame(draw);
}
draw();`,
          solutionRecipe: {
            code: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const totalLength = 500;
let offset = totalLength;
const speed = 4;

function draw() {
  ctx.fillStyle = '#181B22';
  ctx.fillRect(0, 0, 300, 300);

  offset = Math.max(0, offset - speed);

  ctx.beginPath();
  ctx.arc(150, 150, 75, 0, Math.PI * 2);
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 5;

  ctx.setLineDash([totalLength, totalLength]);
  ctx.lineDashOffset = offset;
  ctx.stroke();

  requestAnimationFrame(draw);
}
draw();`,
            compatNote: 'ctx.setLineDash and lineDashOffset are supported in all modern browsers (Chrome 23+, Firefox 27+, Safari 7+).'
          },
          tweaks: [
            {
              line: 4,
              label: 'Path Total Length',
              variable: 'totalLength',
              hint: 'Total circumference or arc length of the target path.'
            },
            {
              line: 6,
              label: 'Draw Speed',
              variable: 'speed',
              hint: 'Offset decrement per frame; higher values complete the stroke faster.'
            },
            {
              line: 18,
              label: 'Circle Radius',
              variable: 'arc radius',
              hint: 'Radius of the animated circular stroke (default 75).'
            }
          ],
          challengeAnswer: 'Math.max(0, offset - speed);',
          challenge: {
            prompt: 'Decrement offset each frame using Math.max(0, offset - speed).',
            blankLineRange: [14, 14],
            hint: 'Use Math.max to stop at 0 so the stroke does not wrap or loop.'
          },
          overlay: {
            type: 'progress-vector',
            params: { pathLength: 500, width: 300, height: 300 }
          }
        }
      }
    }
  }
};
