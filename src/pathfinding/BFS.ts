import {Cell} from "../model/Cell.ts";
import Node from "./Node.ts";
import Model from "../model/Model.ts";

export default function bfs(start: Cell, end: Cell, model: Model) {
	const grid = []
	// Initializing grid
	for (let i = 0; i < model.gridWidth; i++) {
		const row = []
		for (let j = 0; j < model.gridWidth; j++) {
			row.push(new Node(j, i))
		}
		grid[i] = row
	}
	
	const openList = []
	grid[start.y][start.x].visited = true // ?
	openList.push(grid[start.y][start.x])

	while (openList.length > 0) {
		const currentNode = openList.shift() as Node

		if(currentNode.x === end.x && currentNode.y === end.y) {
			let curr = currentNode;
			const ret = [];
			while(curr.parent) {
				ret.push(curr);
				curr = curr.parent;
			}
			return ret.reverse(); // ?
		}

		currentNode.closed = true

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

			if (neighbour.closed || neighbour.visited) {
				// Skipping iteration
				continue
			}

			openList.push(neighbour)
			neighbour.visited = true
			neighbour.parent = currentNode
		}
	}

	return []
}