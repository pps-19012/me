const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// CONFIGURATION
const CONFIG = {
    gridSpacing: 40,      // Distance between dots
    lineLength: 12,       // Length of the little needles
    mouseRadius: 250,     // How far the mouse influence reaches
    color: getThemeColor()
};

let needles = [];
let mouse = { x: null, y: null };

// Resize & Init
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGrid();
}
window.addEventListener('resize', resize);

// Track Mouse
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
// Reset on mouse leave so they return to neutral
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

function getThemeColor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    // Dark mode: dim white. Light mode: dim black.
    return isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
}

class Needle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0; // Default angle (0 radians = horizontal)
        this.targetAngle = 0;
    }

    update() {
        // If mouse is present, calculate angle to mouse
        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < CONFIG.mouseRadius) {
                // Calculate angle to point at mouse
                // Math.atan2(dy, dx) gives the angle in radians
                this.targetAngle = Math.atan2(dy, dx);
            } else {
                // Reset to default if mouse is far
                this.targetAngle = 0;
            }
        } else {
            this.targetAngle = 0;
        }

        // Smooth rotation (Linear Interpolation for "lag" effect)
        // 0.1 is the easing factor (lower = smoother/slower)
        this.angle += (this.targetAngle - this.angle) * 0.1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.strokeStyle = CONFIG.color;
        ctx.lineWidth = 1.5; // Thickness of the needle
        ctx.lineCap = 'round';

        // Draw the needle centered at 0,0
        ctx.beginPath();
        ctx.moveTo(-CONFIG.lineLength / 2, 0);
        ctx.lineTo(CONFIG.lineLength / 2, 0);
        ctx.stroke();

        ctx.restore();
    }
}

function initGrid() {
    needles = [];
    const cols = Math.ceil(canvas.width / CONFIG.gridSpacing);
    const rows = Math.ceil(canvas.height / CONFIG.gridSpacing);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = i * CONFIG.gridSpacing + CONFIG.gridSpacing / 2;
            const y = j * CONFIG.gridSpacing + CONFIG.gridSpacing / 2;
            needles.push(new Needle(x, y));
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Check for theme updates
    CONFIG.color = getThemeColor();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    needles.forEach(n => {
        n.update();
        n.draw();
    });
}

resize();
animate();