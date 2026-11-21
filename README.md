# Pathfinding Visualizer (A*, Dijkstra & BFS)

Visualizador interactivo de algoritmos de busqueda de rutas sobre grafos en cuadricula, desarrollado en Vanilla JavaScript sin dependencias externas.

## Algoritmos y estructuras de datos
- **A* (A-Star):** Busqueda informada que combina el coste real recorrido $g(n)$ con la distancia heuristica de Manhattan $h(n)$.
- **Dijkstra:** Busqueda de coste uniforme implementada con una cola de prioridad basada en un **Monticulo Binario Minimo (`MinPriorityQueue`)** construido desde cero ($O((V + E) \log V)$).
- **Breadth-First Search (BFS):** Recorrido por niveles con cola FIFO para grafos no ponderados.
- **Generador de laberintos:** Implementacion del algoritmo de **Division Recursiva** que garantiza que siempre exista solucion entre el nodo inicial y el final.

## Arquitectura
- `algorithms.js`: Logica algoritmica pura desacoplada del DOM.
- `app.js`: Gestion de eventos de raton, renderizado de cuadricula y planificador de animaciones asincronas (`async/await`).