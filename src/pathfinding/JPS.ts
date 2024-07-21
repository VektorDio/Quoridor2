import {Cell} from "../model/Cell.ts";
import Node from "./Node.ts";
import NodeHeap from "./BinaryHeap.ts";
import Model from "../model/Model.ts";

export default function jps(start: Cell, end: Cell, model: Model) {

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
			return ret.reverse();
		}

		// move currentNode from open to closed, process each of its neighbors.
		currentNode.closed = true;

		const neighbours = findNeighbours(currentNode, model, grid)

		for (let i = 0; i < neighbours.length; i++) {
			const neighbour = neighbours[i]
      
			const jumpPoint = jump(neighbour[0], neighbour[1], currentNode.x, currentNode.y, model, end)

			if (jumpPoint) {
				const [ jx, jy ] = jumpPoint
				const jumpNode = grid[jy][jx]

				if (jumpNode.closed) {
					// Skipping iteration
					continue
				}

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
	// No result was found
	return []
}

function octileDistance(dx: number, dy: number) {
	const F = Math.SQRT2 - 1;
	return (dx < dy) ? F * dx + dy : F * dy + dx;
}

function jump(x: number, y: number, px: number, py: number, model: Model, endNode: Cell): [x: number, y: number] | null {
	const dx = x - px, dy = y - py;

	if (x === endNode.x && y === endNode.y) {
		return [x, y];
	}

	function checkHorizontal(xv: number, yv: number) {
		return dx === 1 ? model.checkWalkableRight(xv, yv) : model.checkWalkableLeft(xv, yv)
	}

	function checkVertical(xv: number, yv: number) {
		return dy === 1 ? model.checkWalkableBottom(xv, yv) : model.checkWalkableTop(xv, yv)
	}

	if (dx !== 0) {
		// top right or left cell is blocked from at least one side
		const topCheck = !checkHorizontal(x - dx, y - 1) || !model.checkWalkableBottom(x - dx, y - 1)
		// bottom right or left cell is blocked from at least one side
		const bottomCheck = !checkHorizontal(x - dx,y + 1) || !model.checkWalkableTop(x - dx, y + 1)

		// Pruning rules
		if ((model.checkWalkableTop(x, y) && topCheck) || (model.checkWalkableBottom(x, y) && bottomCheck)) {
			return [x, y]
		}
	} else if (dy !== 0) {
		// right bottom or top cell is blocked from at least one side
		const topCheck = !checkVertical(x + 1, y - dy) || !model.checkWalkableLeft(x + 1, y - dy)
		// left bottom or top cell is blocked from at least one side
		const bottomCheck = !checkVertical(x - 1,y - dy) || !model.checkWalkableRight(x - 1, y - dy)

		// Pruning rules
		if ((model.checkWalkableRight(x, y) && topCheck) || (model.checkWalkableLeft(x, y) && bottomCheck)) {
			return [x, y]
		}

		//When moving vertically, must check for horizontal jump points
		if ((model.checkWalkableRight(x, y) && jump(x + 1, y, x, y, model, endNode)) ||
			(model.checkWalkableLeft(x, y) && jump(x - 1, y, x, y, model, endNode))) {
			return [x, y];
		}
	}
	else {
		throw new Error("Only horizontal and vertical movements are allowed");
	}

	// Continue to jump in direction, discarding whole jump when facing a direct obstacle or map edge
	if (dx !== 0) {
		return checkHorizontal(x, y) ? jump(x + dx, y, x, y, model, endNode) : null;
	} else {
		return checkVertical(x, y) ? jump(x, y + dy, x, y, model, endNode) : null;
	}
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
				neighbors.push([x + 1, y]);
			} else if (model.checkWalkableLeft(x, y)) {
				neighbors.push([x - 1, y]);
			}
      
		} else if (dy !== 0) {
			if (model.checkWalkableLeft(x, y)) {
				neighbors.push([x - 1, y]);
			}
			if (model.checkWalkableRight(x, y)) {
				neighbors.push([x + 1, y]);
			}
      
			if (dy === 1 && model.checkWalkableBottom(x, y)) {
				neighbors.push([x, y + 1]);
			} else if (model.checkWalkableTop(x, y)) {
				neighbors.push([x, y - 1]);
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