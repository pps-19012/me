const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Configuration
const CELL_SIZE = 24; // Matches your CSS grid size (24px)
const SPEED = 200;    // Milliseconds between updates (Slower is classier)
let color = getThemeColor();

let cols, rows;
let grid;

// Resize & Setup
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width / CELL_SIZE);
    rows = Math.ceil(canvas.height / CELL_SIZE);
    initGrid();
}
window.addEventListener('resize', resize);

// Helper: Get color based on theme
function getThemeColor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '#333333' : '#bbbbbb'; 
}

// Initialize Grid with random "life"
function initGrid() {
    grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
    
    // Fill with random noise (15% chance of being alive)
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = Math.random() < 0.15 ? 1 : 0;
        }
    }
}

// The Rules of Life
function updateGrid() {
    let nextGrid = grid.map(arr => [...arr]);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Count neighbors
            let neighbors = 0;
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    if (x === 0 && y === 0) continue;
                    const col = (i + x + cols) % cols; // Wrap around edges
                    const row = (j + y + rows) % rows;
                    neighbors += grid[col][row];
                }
            }

            // Apply Rules
            const cell = grid[i][j];
            if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
                nextGrid[i][j] = 0; // Dies
            } else if (cell === 0 && neighbors === 3) {
                nextGrid[i][j] = 1; // Born
            }
        }
    }
    grid = nextGrid;
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Check for theme update
    color = getThemeColor();
    ctx.fillStyle = color;

    // Draw only alive cells
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === 1) {
                // Draw a circle for the "dot" look
                ctx.beginPath();
                ctx.arc(
                    i * CELL_SIZE + CELL_SIZE/2, 
                    j * CELL_SIZE + CELL_SIZE/2, 
                    2, // Radius of the dot
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
}

// Animation Loop
let lastTime = 0;
function animate(time) {
    requestAnimationFrame(animate);

    // Control the speed (unlike normal requestAnimationFrame which is 60fps)
    if (time - lastTime > SPEED) {
        updateGrid();
        draw();
        lastTime = time;
    }
}

// Interaction: Click to spawn life
window.addEventListener('mousedown', (e) => {
    const i = Math.floor(e.clientX / CELL_SIZE);
    const j = Math.floor(e.clientY / CELL_SIZE);
    // Spawn a "Glider" pattern where user clicks
    if (grid[i] && grid[i][j] !== undefined) {
        grid[i][j] = 1;
        grid[i+1][j+1] = 1;
        grid[i+1][j+2] = 1;
        grid[i][j+2] = 1;
        grid[i-1][j+2] = 1;
        draw();
    }
});

// Start
resize();
animate(0);