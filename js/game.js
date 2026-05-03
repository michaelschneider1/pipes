const GRID_SIZE = 5;
const ALL_DIRS = ['N', 'E', 'S', 'W'];
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };

const TYPES = {
  E: { conns: ['N'] },
  I: { conns: ['N', 'S'] },
  L: { conns: ['N', 'E'] },
  T: { conns: ['N', 'E', 'S'] },
  X: { conns: ['N', 'E', 'S', 'W'] },
};

//rotates
function rotDir(d, r) {
  return ALL_DIRS[(ALL_DIRS.indexOf(d) + r + 400) % 4];
}

//returns the direction based on r rotations
function rotConns(conns, r) {
  return conns.map(c => rotDir(c, r));
}

//returns a current pipes current connections
function getConns(tile) {
  return rotConns(TYPES[tile.type].conns, tile.rot);
}


//returns tile at specific location
function getCellAt(grid, x, y) {
  return grid.find(c => c.x === x && c.y === y);
}

//goes through all the visited pipes
function floodFill(grid, source) {
  const visited = new Set();
  const queue = [source];
  visited.add(`${source.x},${source.y}`);

  while (queue.length > 0) {
    const current = queue.shift();

    for (const dir of getConns(current)) {
      const [dx, dy] = DIRS[dir];
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;

      const neighbor = getCellAt(grid, nx, ny);
      const key = `${nx},${ny}`;

      if (!visited.has(key) && getConns(neighbor).includes(OPP[dir])) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

//Checks if the puzzle is solved
function isSolved(grid, source, sink) {
  const filled = floodFill(grid, source);

  const allFilled = filled.size === GRID_SIZE * GRID_SIZE;
  const reachesSink = filled.has(`${sink.x},${sink.y}`);

  return allFilled && reachesSink;
}

//puzzle loader
async function loadPuzzle() {
  const start = new Date('2026-05-03');
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const puzzleNumber = (diff % 30) + 1;

  const response = await fetch(`puzzles/${puzzleNumber}.json`);
  const data = await response.json();

  return { ...data, puzzleNumber };
}

// rotates a tile 90 degrees clockwise
function rotateTile(tile) {
  if (tile.locked) return false;
  tile.rot = (tile.rot + 1) % 4;
  return true;
}