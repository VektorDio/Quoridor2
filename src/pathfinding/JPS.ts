import {Cell} from "../model/Cell.ts";
import Node from "./Node.ts";
import NodeHeap from "./BinaryHeap.ts";
import Model from "../model/Model.ts";

export default function jps(start: Cell, end: Cell, model: Model) {
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
			diagnostic && console.log({iterations, neighboursChecked})
			return ret.reverse();
		}

		// move currentNode from open to closed, process each of its neighbors.
		currentNode.closed = true;

		const neighbours = findNeighbours(currentNode, model, grid)

		for (let i = 0; i < neighbours.length; i++) {
			const neighbour = neighbours[i]

			const jumpPoint = jump(neighbour[0], neighbour[1], currentNode.x, currentNode.y, grid, model, end)

			if (jumpPoint) {
				const [ jx, jy ] = jumpPoint
				const jumpNode = grid[jy][jx]

				if (jumpNode.closed) {
					// Skipping iteration
					continue
				}

				neighboursChecked++

				const d = octileDistance(Math.abs(jx - currentNode.x), Math.abs(jy - currentNode.y))
				const ng = currentNode.g + d // next `g` value

				if (!jumpNode.visited || ng < jumpNode.g) {
					jumpNode.g = ng;
					jumpNode.h = jumpNode.h || (Math.abs(jx - end.x) + Math.abs(jy - end.y));
					jumpNode.f = jumpNode.g + jumpNode.h;
					jumpNode.parent = currentNode;

					if (!jumpNode.visited) {
						heap.add(jumpNode);
						jumpNode.visited = true;
					} else {
						heap.rescoreElement(jumpNode);
					}
				}
			}
		}
	}
	diagnostic && console.log({iterations, neighboursChecked})
	// No result was found
	return []
}

function octileDistance(dx: number, dy: number) {
	const F = Math.SQRT2 - 1;
	return (dx < dy) ? F * dx + dy : F * dy + dx;
}

function jump(x: number, y: number, px: number, py: number, grid: Node[][], model: Model, endNode: Cell) {
	const dx = x - px, dy = y - py;

	if (!grid[y] || !grid[y][x]) return null

	if (x === endNode.x && y === endNode.y) {
		return [x, y];
	}

	if (dx !== 0) {
		if (dx === 1) {
			if ((model.checkWalkableTop(x, y) && !(model.checkWalkableRight(x - dx, y - 1))) ||
				(model.checkWalkableBottom(x, y) && !(model.checkWalkableRight(x - dx, y + 1)))) {
				return [x, y];
			}
		} else {
			if ((model.checkWalkableTop(x, y) && !(model.checkWalkableLeft(x - dx, y - 1))) ||
				(model.checkWalkableBottom(x, y) && !(model.checkWalkableLeft(x - dx, y + 1)))) {
				return [x, y];
			}
		}
	} else if (dy !== 0) {
		if (dy === 1) {
			if ((model.checkWalkableLeft(x, y) && !(model.checkWalkableBottom(x - 1, y - dy))) ||
				(model.checkWalkableRight(x, y) && !(model.checkWalkableBottom(x + 1, y - dy)))) {
				return [x, y];
			}
		} else {
			if ((model.checkWalkableLeft(x, y) && !(model.checkWalkableTop(x - 1, y - dy))) ||
				(model.checkWalkableRight(x, y) && !(model.checkWalkableTop(x + 1, y - dy)))) {
				return [x, y];
			}
		}

		//When moving vertically, must check for horizontal jump points
		if ((model.checkWalkableRight(x, y) && jump(x + 1, y, x, y, grid, model, endNode)) ||
			(model.checkWalkableLeft(x, y) && jump(x - 1, y, x, y, grid, model, endNode))) {
			return [x, y];
		}
	}
	else {
		throw new Error("Only horizontal and vertical movements are allowed");
	}

	return jump(x + dx, y + dy, x, y, grid, model, endNode);
}

function findNeighbours(node: Node, model: Model, grid: Node[][]) {
	const { parent, x, y} = node
	const neighbors = []

	// directed pruning: can ignore most neighbors, unless forced.
	if (parent) {
		const px = parent.x, py = parent.y;

		// get the normalized direction of travel
		const dx = (x - px) / Math.max(Math.abs(x - px), 1);
		const dy = (y - py) / Math.max(Math.abs(y - py), 1);

		if (dx !== 0) {
			if (model.checkWalkableTop(x, y)) {
				neighbors.push([x, y - 1]);
			}
			if (model.checkWalkableBottom(x, y)) {
				neighbors.push([x, y + 1]);
			}
			if (dx === 1 && model.checkWalkableRight(x, y)) {
				neighbors.push([x + dx, y]);
			} else if (dx === -1 && model.checkWalkableLeft(x, y)) {
				neighbors.push([x + dx, y]);
			}
		} else if (dy !== 0) {
			if (model.checkWalkableLeft(x, y)) {
				neighbors.push([x - 1, y]);
			}
			if (model.checkWalkableRight(x, y)) {
				neighbors.push([x + 1, y]);
			}
			if (dy === 1 && model.checkWalkableBottom(x, y)) {
				neighbors.push([x, y + dy]);
			} else if (dy === -1 && model.checkWalkableTop(x, y)) {
				neighbors.push([x, y + dy]);
			}
		}
	}
	// return all neighbors
	else {
		const neighbourNodes = []

		// Adding neighbours
		if(model.checkWalkableTop(x, y)) {
			neighbourNodes.push(grid[y - 1][x])
		}
		if(model.checkWalkableLeft(x, y)) {
			neighbourNodes.push(grid[y][x - 1])
		}
		if(model.checkWalkableRight(x, y)) {
			neighbourNodes.push(grid[y][x + 1])
		}
		if(model.checkWalkableBottom(x, y)) {
			neighbourNodes.push(grid[y + 1][x])
		}
		
		for (let i = 0; i < neighbourNodes.length; i++) {
			const neighborNode = neighbourNodes[i];
			neighbors.push([neighborNode.x, neighborNode.y]);
		}
	}

	return neighbors;
}