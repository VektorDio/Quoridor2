import NodeHeap from "./BinaryHeap.ts";
import {Cell} from "../model/Cell.ts";
import Node from "./Node.ts";
import Game from "../model/Game.ts";

export default function aStar(start: Cell, end: Cell, game: Game) {
	const heap = new NodeHeap()
	// adding start node to heap
	heap.add(new Node(start.x, start.y))

	while(heap.getSize() > 0) {

		// Grab the lowest f(x) to process next.
		const currentNode = heap.remove() as Node

		// End case -- result has been found, return the traced path.
		if(currentNode.x === end.x && currentNode.y === end.y) {
			let curr = currentNode;
			const ret = [];
			while(curr.parent) {
				ret.push(curr);
				curr = curr.parent;
			}
			return ret.reverse();
		}

		// Normal case - move currentNode from open to closed, process each of its neighbors.
		currentNode.closed = true;

		const neighbours = []

		if(game.checkTopEdge(currentNode.x, currentNode.y)) {
			neighbours.push(new Node(currentNode.x, currentNode.y - 1))
		}
		if(game.checkLeftEdge(currentNode.x, currentNode.y)) {
			neighbours.push(new Node(currentNode.x - 1, currentNode.y))
		}
		if(game.checkRightEdge(currentNode.x, currentNode.y)) {
			neighbours.push(new Node(currentNode.x + 1, currentNode.y))
		}
		if(game.checkBottomEdge(currentNode.x, currentNode.y)) {
			neighbours.push(new Node(currentNode.x, currentNode.y + 1))
		}

		for (let i = 0; i < neighbours.length; i++) {
			const neighbour = neighbours[i]

			if (neighbour.closed) {
				continue
			}

			// The g score is the shortest distance from start to current node.
			// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
			const gScore = currentNode.g + 1
			const beenVisited = neighbour.visited

			if (!beenVisited || gScore < neighbour.g) {
				neighbour.visited = true
				neighbour.parent = currentNode
				neighbour.h = neighbour.h || manhattanDistance({x: neighbour.x, y: neighbour.y}, end);
				neighbour.g = gScore
				neighbour.f = neighbour.g + neighbour.h

				if (!beenVisited) {
					heap.add(neighbour)
				} else {
					// Already seen the node, but since it has been re-scored we need to reorder it in the heap
					// ???
					heap.rescoreElement(neighbour)
				}
			}
		}
	}

	// No result was found - empty array signifies failure to find path.
	return []
}

function manhattanDistance(cell1: Cell, cell2: Cell) {
	return Math.abs (cell1.x - cell2.x) + Math.abs (cell1.y - cell2.y);
}