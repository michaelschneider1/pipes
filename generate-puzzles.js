const fs = require('fs');
const path = require('path');

const GRID_SIZE = 5;
const ALL_DIRS = ['N', 'E', 'S', 'W'];
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };

function rotDir(d, r) {
  return ALL_DIRS[(ALL_DIRS.indexOf(d) + r + 400) % 4];
}

function rotConns(conns, r) {
  return conns.map(c => rotDir(c, r));
}

const TYPES = {
  E: { conns: ['N'] },
  I: { conns: ['N', 'S'] },
  L: { conns: ['N', 'E'] },
  T: { conns: ['N', 'E', 'S'] },
  X: { conns: ['N', 'E', 'S', 'W'] },
};

function getConns(tile) {
  return rotConns(TYPES[tile.type].conns, tile.rot);
}

function dirBetween(ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  for (const [d, [ddx, ddy]] of Object.entries(DIRS)) {
    if (dx === ddx && dy === ddy) return d;
  }
  return null;
}

function pickTypeAndRot(neededConns) {
  const n = neededConns.length;
  if (n === 1) {
    const rot = ALL_DIRS.indexOf(neededConns[0]);
    return { type: 'E', rot };
  }
  if (n === 2) {
    const [a, b] = neededConns;
    if (OPP[a] === b) {
      const rot = (['N', 'S'].includes(a)) ? 0 : 1;
      return { type: 'I', rot };
    }
    for (let r = 0; r < 4; r++) {
      const rc = rotConns(['N', 'E'], r);
      if (rc.includes(a) && rc.includes(b)) return { type: 'L', rot: r };
    }
  }
  if (n === 3) {
    for (let r = 0; r < 4; r++) {
      const rc = rotConns(['N', 'E', 'S'], r);
      if (neededConns.every(d => rc.includes(d))) return { type: 'T', rot: r };
    }
  }
  return { type: 'X', rot: 0 };
}

function carvePath() {
  const visited = new Set();
  const startX = Math.floor(Math.random() * GRID_SIZE);
  const path = [{ x: startX, y: 0 }];
  visited.add(`${startX},0`);

  function dfs(cx, cy) {
    if (path.length === GRID_SIZE * GRID_SIZE) return true;
    const dirs = [...ALL_DIRS].sort(() => Math.random() - 0.5);
    for (const d of dirs) {
      const [dx, dy] = DIRS[d];
      const nx = cx + dx, ny = cy + dy;
      const k = `${nx},${ny}`;
      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !visited.has(k)) {
        visited.add(k);
        path.push({ x: nx, y: ny });
        if (dfs(nx, ny)) return true;
        path.pop();
        visited.delete(k);
      }
    }
    return false;
  }

  dfs(startX, 0);
  return path;
}

function generatePuzzle() {
  let path;
  for (let t = 0; t < 500; t++) {
    path = carvePath();
    if (path.length === GRID_SIZE * GRID_SIZE) break;
  }

  const grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      grid.push({ x, y, type: 'I', rot: 0, locked: false });
    }
  }

  const pathKeys = new Set(path.map(p => `${p.x},${p.y}`));

  for (let i = 0; i < path.length; i++) {
    const { x, y } = path[i];
    const neededConns = [];
    if (i > 0) neededConns.push(dirBetween(x, y, path[i - 1].x, path[i - 1].y));
    if (i < path.length - 1) neededConns.push(dirBetween(x, y, path[i + 1].x, path[i + 1].y));

    const { type, rot } = pickTypeAndRot(neededConns);
    const cell = grid[y * GRID_SIZE + x];
    cell.type = type;
    cell.rot = rot;
    cell.solvedRot = rot;

    if (i === 0 || i === path.length - 1) cell.locked = true;
  }

  // Scramble non-locked tiles
  for (const cell of grid) {
    if (!cell.locked) {
      const offset = [1, 2, 3][Math.floor(Math.random() * 3)];
      cell.rot = (cell.solvedRot + offset) % 4;
    }
  }

  return {
    source: path[0],
    sink: path[path.length - 1],
    grid,
  };
}

// Generate puzzles
const START = 1;  // Choose start number for puzzle name
const COUNT = 30;

const outDir = path.join(__dirname, 'puzzles');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

for (let i = START; i < START + COUNT; i++) {
  const puzzle = generatePuzzle();
  fs.writeFileSync(
    path.join(outDir, `${i}.json`),
    JSON.stringify(puzzle, null, 2)
  );
  console.log(`Generated puzzle ${i}`);
}

console.log(`Done! Puzzles ${START} to ${START + COUNT - 1} saved to /puzzles`);