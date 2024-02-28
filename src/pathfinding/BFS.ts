import Game from "../model/Game.ts";
import {Cell} from "../model/Cell.ts";
import Node from "./Node.ts";

export default function BFS(start: Cell, end: Cell, game: Game) {
	const grid = []
	// Initializing grid
	for (let i = 0; i < game.gridWidth; i++) {
		const row = []
		for (let j = 0; j < game.gridWidth; j++) {
			row.push(new Node(j, i))
		}
		grid[i] = row
	}
	
	const openList = []
	grid[start.y][start.x].visited = true // ?
	openList.push(grid[start.y][start.x])

	let iterations = 0
	let neighboursChecked = 0

	while (openList.length > 0) {
		iterations++

		const currentNode = openList.shift() as Node

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

		currentNode.closed = true

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

			if (neighbour.closed || neighbour.visited) {
				// Skipping iteration
				continue
			}

			neighboursChecked++

			openList.push(neighbour)
			neighbour.visited = true
			neighbour.parent = currentNode
		}
	}

	console.log({iterations, neighboursChecked})
	return []
}