const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const blockSize = 30;
const cols = canvas.width / blockSize;
const rows = canvas.height / blockSize;
let score = 0;
let gameLoop;
let currentPiece;
let grid = [];

// Фигуры тетриса
const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

// Инициализация пустой сетки
function initGrid() {
    grid = Array(rows).fill().map(() => Array(cols).fill(0));
}

// Создание новой фигуры
function newPiece() {
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        shape: piece,
        x: Math.floor((cols - piece[0].length) / 2),
        y: 0
    };
}

// Отрисовка блока
function drawBlock(x, y, color = '#333') {
    context.fillStyle = color;
    context.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
}

// Отрисовка сетки
function drawGrid() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x]) {
                drawBlock(x, y);
            }
        }
    }
}

// Отрисовка текущей фигуры
function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(currentPiece.x + x, currentPiece.y + y, '#f00');
            }
        });
    });
}

// Проверка столкновений
function hasCollision() {
    return currentPiece.shape.some((row, y) => {
        return row.some((value, x) => {
            if (!value) return false;
            const newY = currentPiece.y + y;
            const newX = currentPiece.x + x;
            return newY >= rows || newX < 0 || newX >= cols || (grid[newY] && grid[newY][newX]);
        });
    });
}

// Фиксация фигуры в сетке
function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                grid[currentPiece.y + y][currentPiece.x + x] = value;
            }
        });
    });
}

// Удаление заполненных линий
function removeLines() {
    let linesRemoved = 0;
    for (let y = rows - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell)) {
            grid.splice(y, 1);
            grid.unshift(Array(cols).fill(0));
            linesRemoved++;
            y++;
        }
    }
    if (linesRemoved) {
        score += linesRemoved * 100;
        document.getElementById('score-value').textContent = score;
    }
}

// Обработка нажатий клавиш
document.addEventListener('keydown', (e) => {
    if (!currentPiece) return;

    const oldX = currentPiece.x;
    const oldY = currentPiece.y;

    switch (e.key) {
        case 'ArrowLeft':
            currentPiece.x--;
            break;
        case 'ArrowRight':
            currentPiece.x++;
            break;
        case 'ArrowDown':
            currentPiece.y++;
            break;
        case 'ArrowUp':
            const oldShape = currentPiece.shape;
            currentPiece.shape = currentPiece.shape[0].map((_, i) =>
                currentPiece.shape.map(row => row[i]).reverse()
            );
            if (hasCollision()) {
                currentPiece.shape = oldShape;
            }
            break;
    }

    if (hasCollision()) {
        currentPiece.x = oldX;
        currentPiece.y = oldY;
    }

    drawGrid();
    drawPiece();
});

// Игровой цикл
function gameStep() {
    currentPiece.y++;
    
    if (hasCollision()) {
        currentPiece.y--;
        mergePiece();
        removeLines();
        currentPiece = newPiece();
        
        if (hasCollision()) {
            clearInterval(gameLoop);
            alert('Игра окончена! Счёт: ' + score);
            return;
        }
    }
    
    drawGrid();
    drawPiece();
}

// Запуск игры
function startGame() {
    clearInterval(gameLoop);
    initGrid();
    score = 0;
    document.getElementById('score-value').textContent = score;
    currentPiece = newPiece();
    gameLoop = setInterval(gameStep, 1000);
    drawGrid();
    drawPiece();
}

// Завершение игры
function endGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.font = '30px Arial';
        context.textAlign = 'center';
        context.fillText('Игра окончена!', canvas.width / 2, canvas.height / 2 - 30);
        context.fillText(`Счёт: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    }
}