const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const CONFIG = {
    lines: 20,            // Number of horizontal lines
    pointsPerLine: 100,   // Smoothness of the curve
    mouseRadius: 200,     // Interaction radius
    amplitude: 40,        // Height of the wave
    speed: 0.002,         // Drifting speed
    color: getThemeColor()
};

let mouse = { x: null, y: null };
let time = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

function getThemeColor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
}

function animate() {
    requestAnimationFrame(animate);
    CONFIG.color = getThemeColor();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += CONFIG.speed;

    const spacing = canvas.height / (CONFIG.lines + 2);

    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = 1.5;

    for (let i = 1; i <= CONFIG.lines; i++) {
        ctx.beginPath();
        
        const yBase = i * spacing;
        
        for (let j = 0; j <= CONFIG.pointsPerLine; j++) {
            const x = (j / CONFIG.pointsPerLine) * canvas.width;
            
            // Base flow (sine wave)
            let noise = Math.sin(j * 0.1 + time * 5 + i); 
            let y = yBase + noise * 5;

            // Mouse Interaction
            if (mouse.x != null) {
                const dx = x - mouse.x;
                const dy = yBase - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONFIG.mouseRadius) {
                    // Calculate "bump" effect based on distance
                    const force = (1 - distance / CONFIG.mouseRadius) * CONFIG.amplitude;
                    // Using sine to make it ripple
                    y -= Math.sin(distance * 0.05) * force; 
                }
            }

            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

animate();