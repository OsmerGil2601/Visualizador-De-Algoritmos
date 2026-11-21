const ROWS = 21;
const COLS = 35;

const gridEl = document.getElementById('grid');
const algorithmSelect = document.getElementById('algorithmSelect');
const speedSelect = document.getElementById('speedSelect');
const visualizeBtn = document.getElementById('visualizeBtn');
const mazeBtn = document.getElementById('mazeBtn');
const clearPathBtn = document.getElementById('clearPathBtn');
const resetBtn = document.getElementById('resetBtn');
const visitedCountEl = document.getElementById('visitedCount');
const pathLengthEl = document.getElementById('pathLength');
const algoComplexityEl = document.getElementById('algoComplexity');

let grid = [];
let startPos = { row: 9, col: 5 };
let endPos = { row: 9, col: 29 };

let isMouseDown = false;
let dragTarget = null; // 'start' | 'end' | 'wall' | 'erase'
let isAnimating = false;

const COMPLEXITY_MAP = {
  astar: 'O((V + E) log V) · Heurística Manhattan',
  dijkstra: 'O((V + E) log V) · Min-Heap',
  bfs: 'O(V + E) · Cola FIFO'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initGrid() {
  grid = [];
  gridEl.innerHTML = '';

  for (let r = 0; r < ROWS; r++) {
    const currentRow = [];
    for (let c = 0; c < COLS; c++) {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'node';
      nodeEl.dataset.row = r;
      nodeEl.dataset.col = c;

      const nodeData = {
        row: r,
        col: c,
        isWall: false,
        isVisited: false,
        distance: Infinity,
        fScore: Infinity,
        previousNode: null,
        element: nodeEl
      };

      if (r === startPos.row && c === startPos.col) {
        nodeEl.classList.add('node-start');
      } else if (r === endPos.row && c === endPos.col) {
        nodeEl.classList.add('node-end');
      }

      nodeEl.addEventListener('mousedown', () => handleMouseDown(r, c));
      nodeEl.addEventListener('mouseenter', () => handleMouseEnter(r, c));

      gridEl.appendChild(nodeEl);
      currentRow.push(nodeData);
    }
    grid.push(currentRow);
  }
}

function handleMouseDown(row, col) {
  if (isAnimating) return;
  isMouseDown = true;

  if (row === startPos.row && col === startPos.col) {
    dragTarget = 'start';
  } else if (row === endPos.row && col === endPos.col) {
    dragTarget = 'end';
  } else {
    const node = grid[row][col];
    dragTarget = node.isWall ? 'erase' : 'wall';
    toggleWall(row, col, dragTarget === 'wall');
  }
}

function handleMouseEnter(row, col) {
  if (!isMouseDown || isAnimating) return;

  if (dragTarget === 'start') {
    if ((row === endPos.row && col === endPos.col) || grid[row][col].isWall) return;
    grid[startPos.row][startPos.col].element.classList.remove('node-start');
    startPos = { row, col };
    grid[row][col].element.classList.add('node-start');
  } else if (dragTarget === 'end') {
    if ((row === startPos.row && col === startPos.col) || grid[row][col].isWall) return;
    grid[endPos.row][endPos.col].element.classList.remove('node-end');
    endPos = { row, col };
    grid[row][col].element.classList.add('node-end');
  } else if (dragTarget === 'wall' || dragTarget === 'erase') {
    toggleWall(row, col, dragTarget === 'wall');
  }
}

function toggleWall(row, col, makeWall) {
  if (
    (row === startPos.row && col === startPos.col) ||
    (row === endPos.row && col === endPos.col)
  ) {
    return;
  }

  const node = grid[row][col];
  node.isWall = makeWall;
  node.element.classList.toggle('node-wall', makeWall);
}

function clearPath() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const node = grid[r][c];
      node.isVisited = false;
      node.distance = Infinity;
      node.fScore = Infinity;
      node.previousNode = null;
      node.element.classList.remove('node-visited', 'node-path');
    }
  }
  visitedCountEl.textContent = '0';
  pathLengthEl.textContent = '0';
}

function resetBoard() {
  startPos = { row: 9, col: 5 };
  endPos = { row: 9, col: 29 };
  visitedCountEl.textContent = '0';
  pathLengthEl.textContent = '0';
  initGrid();
}

function setControlsDisabled(disabled) {
  isAnimating = disabled;
  visualizeBtn.disabled = disabled;
  mazeBtn.disabled = disabled;
  clearPathBtn.disabled = disabled;
  resetBtn.disabled = disabled;
  algorithmSelect.disabled = disabled;
}

async function runVisualization() {
  if (isAnimating) return;
  clearPath();
  setControlsDisabled(true);

  const startNode = grid[startPos.row][startPos.col];
  const endNode = grid[endPos.row][endPos.col];
  const selectedAlgo = algorithmSelect.value;
  const delay = Number(speedSelect.value);

  let visitedNodesInOrder = [];
  if (selectedAlgo === 'bfs') {
    visitedNodesInOrder = bfs(grid, startNode, endNode);
  } else if (selectedAlgo === 'dijkstra') {
    visitedNodesInOrder = dijkstra(grid, startNode, endNode);
  } else {
    visitedNodesInOrder = astar(grid, startNode, endNode);
  }

  const shortestPath = getShortestPath(endNode);

  // Animar exploración de nodos
  for (let i = 0; i < visitedNodesInOrder.length; i++) {
    const node = visitedNodesInOrder[i];
    visitedCountEl.textContent = i + 1;

    if (node !== startNode && node !== endNode) {
      node.element.classList.add('node-visited');
    }
    await sleep(delay);
  }

  // Animar ruta óptima
  for (let i = 0; i < shortestPath.length; i++) {
    const node = shortestPath[i];
    pathLengthEl.textContent = i;

    if (node !== startNode && node !== endNode) {
      node.element.classList.remove('node-visited');
      node.element.classList.add('node-path');
    }
    await sleep(delay * 1.5);
  }

  setControlsDisabled(false);
}

async function buildMaze() {
  if (isAnimating) return;
  resetBoard();
  setControlsDisabled(true);

  const walls = generateRecursiveDivisionWalls(ROWS, COLS, startPos, endPos);
  for (const { row, col } of walls) {
    toggleWall(row, col, true);
    await sleep(5);
  }

  setControlsDisabled(false);
}

// Listeners globales
document.addEventListener('mouseup', () => {
  isMouseDown = false;
  dragTarget = null;
});

algorithmSelect.addEventListener('change', e => {
  algoComplexityEl.textContent = COMPLEXITY_MAP[e.target.value];
});

visualizeBtn.addEventListener('click', runVisualization);
mazeBtn.addEventListener('click', buildMaze);
clearPathBtn.addEventListener('click', clearPath);
resetBtn.addEventListener('click', resetBoard);

// Inicializar tablero
initGrid();