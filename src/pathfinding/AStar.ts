import NodeHeap from "./BinaryHeap.ts";
import {Cell} from "../model/Cell.ts";
import Node from "./Node.ts";
import Model from "../model/Model.ts";

export default function aStar(start: Cell, end: Cell, model: Model) {
	const diagnostic = false
	const grid = []
	// Initializing grid
	for (let i = 0; i < model.gridWidth; i++) {
		const row = []
		for (let j = 0; j < model.gridWidth; j++) {
			row.push(new Node(j, i))
		}
		grid[i] = row
	}

	const heap = new NodeHeap()

	// Adding start node to heap
	heap.add(grid[start.y][start.x])

	while(heap.getSize() > 0) {
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
			return ret.reverse(); // ?
		}

		// move currentNode from open to closed, process each of its neighbors.
		currentNode.closed = true;

		const neighbours = []

		// Adding neighbours
		if(model.checkWalkableTop(currentNode.x, currentNode.y)) {
			neighbours.push(grid[currentNode.y - 1][currentNode.x])
		}
		if(model.checkWalkableLeft(currentNode.x, currentNode.y)) {
			neighbours.push(grid[currentNode.y][currentNode.x - 1])
		}
		if(model.checkWalkableRight(currentNode.x, currentNode.y)) {
			neighbours.push(grid[currentNode.y][currentNode.x + 1])
		}
		if(model.checkWalkableBottom(currentNode.x, currentNode.y)) {
			neighbours.push(grid[currentNode.y + 1][currentNode.x])
		}

		for (let i = 0; i < neighbours.length; i++) {
			const neighbour = neighbours[i]

			if (neighbour.closed) {
				// Skipping iteration
				continue
			}

			// The g score is the shortest distance from start to current node.
			// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
			const gScore = currentNode.g + 1 // Adding one, as all cells has equal cost
			const beenVisited = neighbour.visited

			if (!beenVisited || gScore < neighbour.g) {
				neighbour.visited = true
				neighbour.parent = currentNode

				// Distance to the end
				neighbour.h = neighbour.h || Math.abs(neighbour.x - end.x) + Math.abs(neighbour.y - end.y); // manhattan distance
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
	// No result was found
	return []
}