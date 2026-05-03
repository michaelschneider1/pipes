const CELL_SIZE = 64;

function drawGrid(grid, source, sink, filledSet) {
  const gridEl = document.getElementById('grid');
  gridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`;
  gridEl.innerHTML = '';

  for (const cell of grid) {
    const div = document.createElement('div');
    div.className = 'cell' + (cell.locked ? ' locked' : '');

    const canvas = document.createElement('canvas');
    canvas.width = CELL_SIZE;
    canvas.height = CELL_SIZE;

    const isSrc = cell.x === source.x && cell.y === source.y;
    const isSink = cell.x === sink.x && cell.y === sink.y;
    const filled = filledSet.has(`${cell.x},${cell.y}`);

    drawCell(canvas, cell, filled, isSrc, isSink);
    div.appendChild(canvas);
    gridEl.appendChild(div);
  }
}

function drawCell(canvas, cell, filled, isSrc, isSink) {
  const ctx = canvas.getContext('2d');
  const C = CELL_SIZE / 2;
  const T = 12;

  ctx.clearRect(0, 0, CELL_SIZE, CELL_SIZE);

  const pipeColor = filled ? '#004d8b' : '#a0c4e8';

  // rotate the canvas around the center
  ctx.save();
  ctx.translate(C, C);
  ctx.rotate(cell.rot * Math.PI / 2);
  ctx.translate(-C, -C);

  // draw the pipe shape
  ctx.lineWidth = T;
  ctx.lineCap = 'round';
  ctx.strokeStyle = pipeColor;

  if (cell.type === 'I') {
    line(ctx, C, 4, C, CELL_SIZE - 4);
  } else if (cell.type === 'L') {
    line(ctx, C, 4, C, C);
    line(ctx, C, C, CELL_SIZE - 4, C);
  } else if (cell.type === 'T') {
    line(ctx, C, 4, C, CELL_SIZE - 4);
    line(ctx, C, C, CELL_SIZE - 4, C);
  } else if (cell.type === 'X') {
    line(ctx, C, 4, C, CELL_SIZE - 4);
    line(ctx, 4, C, CELL_SIZE - 4, C);
  } else if (cell.type === 'E') {
    line(ctx, C, 4, C, C);
  }

  ctx.restore();

  // center dot
  ctx.beginPath();
  ctx.arc(C, C, T / 2 - 1, 0, Math.PI * 2);
  ctx.fillStyle = pipeColor;
  ctx.fill();

  // source and sink markers
  if (isSrc || isSink) {
    ctx.beginPath();
    ctx.arc(C, C, 8, 0, Math.PI * 2);
    ctx.fillStyle = isSrc ? '#ffcc00' : '#ff4d6d';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px DM Sans';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isSrc ? 'S' : 'E', C, C);
  }
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}