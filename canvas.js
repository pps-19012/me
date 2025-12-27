const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// CONFIGURATION
const CONFIG = {
    // Reduce particle count on mobile for performance
    particleCount: window.innerWidth < 768 ? 30 : 60,
    connectionRadius: 120,
    mouseRadius: 180,
    dotSpeed: 0.4,
    // Dynamic colors based on theme
    dotColor: getThemeColor(),
    lineColor: getThemeColor()
};

let particles = [];
let mouse = { x: null, y: null };

// Resize canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Track Mouse
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// CLICK INTERACTION: Spawn new particles on click
window.addEventListener('click', (e) => {
    for (let i = 0; i < 3; i++) {
        particles.push(new Particle(e.x, e.y));
    }
    // Cap the array so it doesn't get infinite
    if (particles.length > 100) {
        particles.splice(0, 3);
    }
});

function getThemeColor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    // Dark mode: dim white. Light mode: dim black.
    return isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
}

// Particle Class
class Particle {
    constructor(x, y) {
        // If x,y provided (click), use them. Else random.
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        
        this.vx = (Math.random() - 0.5) * CONFIG.dotSpeed;
        this.vy = (Math.random() - 0.5) * CONFIG.dotSpeed;
        
        // "Breathing" properties
        this.baseSize = 1.5; 
        this.size = this.baseSize;
        this.angle = Math.random() * Math.PI * 2; // Random starting point in sine wave
        this.pulseSpeed = 0.05;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Pulse Animation (Sine wave)
        this.angle += this.pulseSpeed;
        this.size = this.baseSize + Math.sin(this.angle) * 0.5; 
        // Size oscillates between 1.0 and 2.0
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.abs(this.size), 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.dotColor;
        ctx.fill();
    }
}

// Initialize
function init() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new Particle());
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    CONFIG.dotColor = getThemeColor();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw Lines
    drawLines();
}

function drawLines() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.connectionRadius) {
                let opacity = 1 - (distance / CONFIG.connectionRadius);
                ctx.strokeStyle = CONFIG.dotColor.replace('0.5)', `${opacity * 0.15})`);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
        
        // Mouse Connections
        if (mouse.x) {
            let dx = particles[i].x - mouse.x;
            let dy = particles[i].y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CONFIG.mouseRadius) {
                // Subtle attraction to mouse
                if (distance > 100) { 
                    particles[i].x -= dx * 0.01; 
                    particles[i].y -= dy * 0.01;
                }

                let opacity = 1 - (distance / CONFIG.mouseRadius);
                ctx.strokeStyle = CONFIG.dotColor.replace('0.5)', `${opacity * 0.3})`);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
}

init();
animate();