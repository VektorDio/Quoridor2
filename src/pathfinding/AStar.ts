import NodeHeap from "./BinaryHeap.ts";
import {Cell} from "../model/Cell.ts";
import Node from "./Node.ts";
import Game from "../model/Game.ts";

export default function aStar(start: Cell, end: Cell, game: Game) {
	const grid = []
	// Initializing grid
	for (let i = 0; i < game.gridWidth; i++) {
		const row = []
		for (let j = 0; j < game.gridWidth; j++) {
			row.push(new Node(j, i))
		}
		grid[i] = row
	}

	const heap = new NodeHeap()

	// Adding start node to heap
	heap.add(grid[start.y][start.x])

	let iterations = 0
	let neighboursChecked = 0

	while(heap.getSize() > 0) {
		iterations++
		// Grab the lowest f(x) to process next.
		const currentNode = heap.remove() as Node

		// Result has been found, return the traced path.
		if(currentNode.x === end.x && currentNode.y === end.y) {
			let curr = currentNode;
			const ret = [];
			while(curr.parent) {
				ret.push(curr);
				curr = curr.parent;
			}
			console.log({iterations, neighboursChecked})
			return ret.reverse(); // ?
		}

		// move currentNode from open to closed, process each of its neighbors.
		currentNode.closed = true;

		const neighbours = []

		// Adding neighbours
		if(game.checkTopEdge(currentNode.x, currentNode.y)) {
			neighbours.push(grid[currentNode.y - 1][currentNode.x])
		}
		if(game.checkLeftEdge(currentNode.x, currentNode.y)) {
			neighbours.push(grid[currentNode.y][currentNode.x - 1])
		}
		if(game.checkRightEdge(currentNode.x, currentNode.y)) {
			neighbours.push(grid[currentNode.y][currentNode.x + 1])
		}
		if(game.checkBottomEdge(currentNode.x, currentNode.y)) {
			neighbours.push(grid[currentNode.y + 1][currentNode.x])
		}

		for (let i = 0; i < neighbours.length; i++) {
			const neighbour = neighbours[i]

			if (neighbour.closed) {
				// Skipping iteration
				continue
			}

			neighboursChecked++

			// The g score is the shortest distance from start to current node.
			// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
			const gScore = currentNode.g + 1 // Adding one, as all cells has equal cost
			const beenVisited = neighbour.visited

			if (!beenVisited || gScore < neighbour.g) {
				neighbour.visited = true
				neighbour.parent = currentNode

				// Distance to the end
				neighbour.h = neighbour.h || manhattanDistance(neighbour, end);
				neighbour.g = gScore
				neighbour.f = neighbour.g + neighbour.h

				if (!beenVisited) {
					heap.add(neighbour)
				} else {
					// Already seen the node, but since it has been re-scored we need to reorder it in the heap
					heap.rescoreElement(neighbour) // ??
				}
			}
		}
	}
	console.log({iterations, neighboursChecked})
	// No result was found
	return []
}

function manhattanDistance(cell1: Cell | Node, cell2: Cell) {
	return Math.abs (cell1.x - cell2.x) + Math.abs (cell1.y - cell2.y);
}