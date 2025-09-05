    // Grid and drawing
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const size = 20; // size of one cell in px
    const cells = canvas.width / size; // 21x21 grid for 420px

    // Game state
    let snake, dir, nextDir, food, score, speed, timer, paused, gameOver;

    function reset() {
      snake = [{x:10, y:10}, {x:9, y:10}, {x:8, y:10}];
      dir = {x:1, y:0};
      nextDir = {...dir};
      food = spawnFood();
      score = 0;
      speed = 120; // ms per tick, gets faster
      paused = false;
      gameOver = false;
      updateScore();
      startLoop();
      draw();
    }

    function startLoop(){ clearInterval(timer); timer = setInterval(tick, speed); }

    function spawnFood(){
      let p;
      do { p = { x: Math.floor(Math.random()*cells), y: Math.floor(Math.random()*cells) }; }
      while (snake.some(s => s.x === p.x && s.y === p.y));
      return p;
    }

    function tick(){
      if (paused || gameOver) return;
      dir = nextDir; // lock in the latest valid input once per tick

      const head = { x: (snake[0].x + dir.x), y: (snake[0].y + dir.y) };

      // bounds check
      if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells ||
          snake.some(s => s.x === head.x && s.y === head.y)) {
        return endGame();
      }

      snake.unshift(head);

      // food check
      if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        // increase speed slightly every 3 foods
        if (score % 3 === 0 && speed > 60) { speed -= 6; startLoop(); }
        food = spawnFood();
      } else {
        snake.pop();
      }

      draw();
    }

    function draw(){
      // clear grid background handled by CSS; still clear canvas to avoid artifacts
      ctx.clearRect(0,0,canvas.width,canvas.height);

      // draw food
      drawCell(food.x, food.y, getColor('--food'), 0.6);

      // draw snake
      snake.forEach((p, i) => {
        const isHead = i === 0;
        drawCell(p.x, p.y, isHead ? getColor('--head') : getColor('--snake'), isHead ? 0.9 : 0.75);
        if (isHead) drawEyes(p, dir);
      });
    }

    function drawCell(x, y, color, alpha=1){
      const px = x*size, py = y*size; ctx.globalAlpha = alpha;
      ctx.fillStyle = color; ctx.fillRect(px, py, size, size);
      // soft inner highlight
      ctx.globalAlpha = 0.25; ctx.fillStyle = '#ffffff';
      ctx.fillRect(px+3, py+3, size-6, size-6);
      ctx.globalAlpha = 1;
    }

    function drawEyes(head, dir){
      const px = head.x*size, py = head.y*size; ctx.fillStyle = '#0b0f14';
      const e = 4; // eye size
      const off = 4; // eye offset from center
      // two eyes based on moving direction
      if (dir.x === 1) { // right
        ctx.fillRect(px+size-off-e, py+6, e, e);
        ctx.fillRect(px+size-off-e, py+size-6-e, e, e);
      } else if (dir.x === -1) { // left
        ctx.fillRect(px+off, py+6, e, e);
        ctx.fillRect(px+off, py+size-6-e, e, e);
      } else if (dir.y === 1) { // down
        ctx.fillRect(px+6, py+size-off-e, e, e);
        ctx.fillRect(px+size-6-e, py+size-off-e, e, e);
      } else { // up
        ctx.fillRect(px+6, py+off, e, e);
        ctx.fillRect(px+size-6-e, py+off, e, e);
      }
    }

    function getColor(varName){ return getComputedStyle(document.documentElement).getPropertyValue(varName).trim(); }

    // Input
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (k === ' '){ togglePause(); return; }
      const map = { arrowup:'up', w:'up', arrowdown:'down', s:'down', arrowleft:'left', a:'left', arrowright:'right', d:'right' };
      if (!map[k]) return;
      const want = map[k];
      const dirs = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
      const nd = dirs[want];
      // prevent immediate reversal
      if (snake.length > 1 && (nd.x === -dir.x && nd.y === -dir.y)) return;
      nextDir = nd;
    });

    function updateScore(){ document.getElementById('score').textContent = score; }

    function togglePause(){
      if (gameOver) { reset(); return; }
      paused = !paused;
      document.getElementById('pause').textContent = paused ? 'Resume' : 'Pause';
    }

    function endGame(){
      gameOver = true; clearInterval(timer);
      // overlay
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#e5e7eb'; ctx.font = '700 28px system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
      ctx.textAlign = 'center'; ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 8);
      ctx.font = '500 14px system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
      ctx.fillText('Press Space to restart', canvas.width/2, canvas.height/2 + 18);
      ctx.restore();
    }

    // UI button
    document.getElementById('pause').addEventListener('click', togglePause);

    // Boot
    reset();
