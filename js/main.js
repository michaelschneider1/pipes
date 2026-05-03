let puzzle = null;
let timerInterval = null;
let seconds = 0;

window.addEventListener('load', async () => {
  puzzle = await loadPuzzle();

  const dateEl = document.getElementById('puzzle-info');
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  dateEl.textContent = `${dateStr} · Puzzle #${puzzle.puzzleNumber}`;

  document.getElementById('start-btn').addEventListener('click', startGame);

  drawPreviews();
});

function startGame() {
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');

  const filledSet = floodFill(puzzle.grid, getCellAt(puzzle.grid, puzzle.source.x, puzzle.source.y));
  drawGrid(puzzle.grid, puzzle.source, puzzle.sink, filledSet);

  addTileListeners();
  startTimer();
}

function addTileListeners() {
  const cells = document.querySelectorAll('.cell');

  cells.forEach((div, index) => {
    div.addEventListener('click', () => {
      const tile = puzzle.grid[index];
      const rotated = rotateTile(tile);

      if (!rotated) return;

      const sourceCell = getCellAt(puzzle.grid, puzzle.source.x, puzzle.source.y);
      const filledSet = floodFill(puzzle.grid, sourceCell);
      drawGrid(puzzle.grid, puzzle.source, puzzle.sink, filledSet);
      addTileListeners();

      if (isSolved(puzzle.grid, sourceCell, getCellAt(puzzle.grid, puzzle.sink.x, puzzle.sink.y))) {
        onSolved();
      }
    });
  });
}

function startTimer() {
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const display = `${mins}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function formatTime(secs) {
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  return `${mins}:${s.toString().padStart(2, '0')}`;
}

function onSolved() {
  stopTimer();

  document.getElementById('final-time').textContent = formatTime(seconds);

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msLeft = midnight - now;

  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
  const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById('countdown').textContent = `${hoursLeft}h ${minsLeft}m`;

  document.getElementById('game-over').classList.remove('hidden');
}

function drawPreviews() {
  const srcCanvas = document.getElementById('preview-S');
  const sinkCanvas = document.getElementById('preview-E');

  drawCell(srcCanvas, { type: 'E', rot: 1 }, true, true, false);
  drawCell(sinkCanvas, { type: 'E', rot: 1 }, true, false, true);
}