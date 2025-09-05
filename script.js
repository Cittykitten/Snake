// Game variables
        const canvas = document.getElementById('game-board');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('high-score');
        const startButton = document.getElementById('start-btn');
        const pauseButton = document.getElementById('pause-btn');
        const gameOverText = document.getElementById('game-over');
        
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [];
        let food = {};
        let dx = 0;
        let dy = 0;
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let gameSpeed = 9;
        let gameRunning = false;
        let gameLoop;
        
        highScoreElement.textContent = highScore;
        
        // Initialize game
        function initGame() {
            snake = [
                { x: 10, y: 10 }
            ];
            
            generateFood();
            
            score = 0;
            dx = 0;
            dy = 0;
            
            scoreElement.textContent = score;
            gameOverText.style.display = 'none';
        }
        
        // Generate food at random position
        function generateFood() {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // Make sure food doesn't appear on snake
            for (let part of snake) {
                if (part.x === food.x && part.y === food.y) {
                    generateFood();
                    break;
                }
            }
        }
        
        // Draw game elements
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw snake
            ctx.fillStyle = '#4CAF50';
            for (let part of snake) {
                ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
            }
            
            // Draw snake head
            ctx.fillStyle = '#357a38';
            ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);
            
            // Draw food
            ctx.fillStyle = '#ff5252';
            ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
        }
        
        // Move snake
        function moveSnake() {
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            
            // Game over conditions - wall collision
            if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
                gameOver();
                return;
            }
            
            // Game over condition - self collision
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === head.x && snake[i].y === head.y) {
                    gameOver();
                    return;
                }
            }
            
            // Add new head
            snake.unshift(head);
            
            // Food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = highScore;
                    localStorage.setItem('snakeHighScore', highScore);
                }
                
                generateFood();
                
                // Increase speed slightly with each food eaten
                if (gameSpeed < 18 && score % 50 === 0) {
                    gameSpeed++;
                }
            } else {
                // Remove tail if no food eaten
                snake.pop();
            }
        }
        
        // Game over function
        function gameOver() {
            clearInterval(gameLoop);
            gameRunning = false;
            gameOverText.style.display = 'block';
            startButton.textContent = 'Restart Game';
        }
        
        // Main game function
        function game() {
            moveSnake();
            draw();
        }
        
        // Start game function
        function startGame() {
            if (gameRunning) return;
            
            initGame();
            gameRunning = true;
            gameLoop = setInterval(game, 1000 / gameSpeed);
            startButton.textContent = 'Restart Game';
            gameOverText.style.display = 'none';
        }
        
        // Pause game function
        function pauseGame() {
            if (gameRunning) {
                clearInterval(gameLoop);
                gameRunning = false;
                pauseButton.textContent = 'Resume';
                gameOverText.textContent = 'Game Paused';
                gameOverText.style.display = 'block';
            } else {
                gameLoop = setInterval(game, 1000 / gameSpeed);
                gameRunning = true;
                pauseButton.textContent = 'Pause';
                gameOverText.style.display = 'none';
            }
        }
        
        // Keydown event listener
        document.addEventListener('keydown', (e) => {
            // Prevent default arrow key behavior (scrolling)
            if ([37, 38, 39, 40, 65, 87, 83, 68].includes(e.keyCode)) {
                e.preventDefault();
            }
            
            // Left arrow or A
            if ((e.keyCode === 37 || e.keyCode === 65) && dx === 0) {
                dx = -1;
                dy = 0;
            }
            // Up arrow or W
            else if ((e.keyCode === 38 || e.keyCode === 87) && dy === 0) {
                dx = 0;
                dy = -1;
            }
            // Right arrow or D
            else if ((e.keyCode === 39 || e.keyCode === 68) && dx === 0) {
                dx = 1;
                dy = 0;
            }
            // Down arrow or S
            else if ((e.keyCode === 40 || e.keyCode === 83) && dy === 0) {
                dx = 0;
                dy = 1;
            }
            // Space bar to start/pause
            else if (e.keyCode === 32) {
                if (!gameRunning && dx === 0 && dy === 0) {
                    startGame();
                } else {
                    pauseGame();
                }
            }
        });
        
        // Button event listeners
        startButton.addEventListener('click', startGame);
        pauseButton.addEventListener('click', pauseGame);
        
        // Initial draw
        initGame();
        draw();
