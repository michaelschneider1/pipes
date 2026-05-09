let puzzle = null;
let timerInterval = null;
let seconds = 0;
let gameOver = false;


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

  //admire button 
    document.getElementById('admire-btn').addEventListener('click', function () {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('view-results-btn').classList.remove('hidden');
    });

    //view results button
    document.getElementById('view-results-btn').addEventListener('click', function () {
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('view-results-btn').classList.add('hidden');
    });

    //leaderboard
    document.getElementById('submit-score-btn').addEventListener('click', async function () {
    const name = document.getElementById('player-name').value.trim();
    if (!name) return;
    document.getElementById('leaderboard-entry').style.display = 'none';
    document.getElementById('leaderboard').classList.remove('hidden');
    const scores = await saveScore(name, formatTime(seconds));
    renderLeaderboard(scores, name);
});
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
      if (gameOver) return; //stops game from rotating tiles after solving
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
  //Stops timer and locks game so tiles can't be changed once solved
    stopTimer();
  gameOver = true;

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

// Leaderboard functions
const supabase = window.supabase.createClient(
  'https://sbxdajannvtifsuzhjyh.supabase.co',
  'sb_publishable_t1C_9u9XAESdich6qmwMrQ_I8opR5P8'
);

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

async function saveScore(name, timeString) {
  await supabase.from('scores').insert({
    name: name,
    time_string: timeString,
    time_raw: seconds,
    puzzle_date: getTodayKey()
  });
  return await loadLeaderboard();
}

async function loadLeaderboard() {
  const { data } = await supabase
    .from('scores')
    .select('name, time_string, time_raw')
    .eq('puzzle_date', getTodayKey())
    .order('time_raw', { ascending: true })
    .limit(5);
  return data || [];
}

function renderLeaderboard(scores, highlightName) {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  if (scores.length === 0) {
    list.innerHTML = '<li style="color:#a0c4e8;text-align:center;justify-content:center">No scores yet today</li>';
    return;
  }
  scores.forEach((entry, i) => {
    const li = document.createElement('li');
    if (entry.name === highlightName) li.classList.add('you');
    li.innerHTML = `
      <span class="lb-rank">#${i + 1}</span>
      <span class="lb-name">${entry.name}</span>
      <span class="lb-time">${entry.time_string}</span>
    `;
    list.appendChild(li);
  });
}