/**
 * Cola de prioridad basada en un Montículo Binario Mínimo (Min-Heap).
 * Permite extraer el nodo con menor coste en tiempo O(log n).
 */
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(node, priority) {
    this.heap.push({ node, priority });
    this._bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return min.node;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(index) {
    const element = this.heap[index];
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIdx];
      if (element.priority >= parent.priority) break;
      this.heap[parentIdx] = element;
      this.heap[index] = parent;
      index = parentIdx;
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      const leftIdx = 2 * index + 1;
      const rightIdx = 2 * index + 2;
      let swap = null;

      if (leftIdx < length && this.heap[leftIdx].priority < element.priority) {
        swap = leftIdx;
      }

      if (rightIdx < length) {
        const rightPriority = this.heap[rightIdx].priority;
        if (
          (swap === null && rightPriority < element.priority) ||
          (swap !== null && rightPriority < this.heap[leftIdx].priority)
        ) {
          swap = rightIdx;
        }
      }

      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  const rows = grid.length;
  const cols = grid[0].length;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < rows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < cols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter(neighbor => !neighbor.isWall);
}

function manhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

/**
 * Búsqueda en Anchura (BFS)
 */
function bfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const queue = [startNode];
  startNode.isVisited = true;
  startNode.distance = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    visitedNodesInOrder.push(current);

    if (current === endNode) return visitedNodesInOrder;

    for (const neighbor of getNeighbors(current, grid)) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.distance = current.distance + 1;
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }
  }

  return visitedNodesInOrder;
}

/**
 * Algoritmo de Dijkstra
 */
function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const pq = new MinPriorityQueue();

  startNode.distance = 0;
  pq.enqueue(startNode, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();

    if (current.isWall || current.isVisited) continue;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current === endNode) return visitedNodesInOrder;

    for (const neighbor of getNeighbors(current, grid)) {
      if (neighbor.isVisited) continue;
      const tentativeDistance = current.distance + 1;

      if (tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance;
        neighbor.previousNode = current;
        pq.enqueue(neighbor, neighbor.distance);
      }
    }
  }

  return visitedNodesInOrder;
}

/**
 * Algoritmo A* (A-Star) con heurística Manhattan
 */
function astar(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const pq = new MinPriorityQueue();

  startNode.distance = 0; // g(n)
  startNode.fScore = manhattanDistance(startNode, endNode); // f(n) = g(n) + h(n)
  pq.enqueue(startNode, startNode.fScore);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();

    if (current.isWall || current.isVisited) continue;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current === endNode) return visitedNodesInOrder;

    for (const neighbor of getNeighbors(current, grid)) {
      if (neighbor.isVisited) continue;
      const tentativeG = current.distance + 1;

      if (tentativeG < neighbor.distance) {
        neighbor.distance = tentativeG;
        neighbor.fScore = tentativeG + manhattanDistance(neighbor, endNode);
        neighbor.previousNode = current;
        pq.enqueue(neighbor, neighbor.fScore);
      }
    }
  }

  return visitedNodesInOrder;
}

/**
 * Reconstruye la ruta más corta retrocediendo mediante los punteros previousNode
 */
function getShortestPath(endNode) {
  const path = [];
  let current = endNode;

  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }

  // Si el primer nodo no tiene distancia 0, no hubo camino posible
  return path.length > 1 ? path : [];
}

/**
 * Generador de laberintos por División Recursiva
 */
function generateRecursiveDivisionWalls(rows, cols, startPos, endPos) {
  const walls = [];
  const isProtected = (r, c) =>
    (r === startPos.row && c === startPos.col) ||
    (r === endPos.row && c === endPos.col);

  // Bordes exteriores
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        if (!isProtected(r, c)) walls.push({ row: r, col: c });
      }
    }
  }

  function divide(rStart, rEnd, cStart, cEnd, orientation) {
    if (rEnd - rStart < 2 || cEnd - cStart < 2) return;

    const horizontal = orientation === 'H';

    if (horizontal) {
      const possibleRows = [];
      for (let r = rStart + 1; r <= rEnd - 1; r += 2) possibleRows.push(r);
      const possibleCols = [];
      for (let c = cStart; c <= cEnd; c += 2) possibleCols.push(c);

      if (possibleRows.length === 0 || possibleCols.length === 0) return;

      const wallRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
      const passageCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];

      for (let c = cStart; c <= cEnd; c++) {
        if (c !== passageCol && !isProtected(wallRow, c)) {
          walls.push({ row: wallRow, col: c });
        }
      }

      divide(rStart, wallRow - 1, cStart, cEnd, chooseOrientation(wallRow - 1 - rStart, cEnd - cStart));
      divide(wallRow + 1, rEnd, cStart, cEnd, chooseOrientation(rEnd - (wallRow + 1), cEnd - cStart));
    } else {
      const possibleCols = [];
      for (let c = cStart + 1; c <= cEnd - 1; c += 2) possibleCols.push(c);
      const possibleRows = [];
      for (let r = rStart; r <= rEnd; r += 2) possibleRows.push(r);

      if (possibleCols.length === 0 || possibleRows.length === 0) return;

      const wallCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];
      const passageRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];

      for (let r = rStart; r <= rEnd; r++) {
        if (r !== passageRow && !isProtected(r, wallCol)) {
          walls.push({ row: r, col: wallCol });
        }
      }

      divide(rStart, rEnd, cStart, wallCol - 1, chooseOrientation(rEnd - rStart, wallCol - 1 - cStart));
      divide(rStart, rEnd, wallCol + 1, cEnd, chooseOrientation(rEnd - rStart, cEnd - (wallCol + 1)));
    }
  }

  function chooseOrientation(height, width) {
    if (width < height) return 'H';
    if (height < width) return 'V';
    return Math.random() < 0.5 ? 'H' : 'V';
  }

  divide(1, rows - 2, 1, cols - 2, chooseOrientation(rows - 2, cols - 2));
  return walls;
}