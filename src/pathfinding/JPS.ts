import {Cell} from "../model/Cell.ts";
import Game from "../model/Game.ts";
import Node from "./Node.ts";
import NodeHeap from "./BinaryHeap.ts";

export default function jps(start: Cell, end: Cell, game: Game) {
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

		const neighbours = findNeighbours(currentNode, game, grid)

		for (let i = 0; i < neighbours.length; i++) {
			const neighbour = neighbours[i]
			const jumpPoint = jump(neighbour[0], neighbour[1], currentNode.x, currentNode.y, game, end)

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

function jump(x: number, y: number, px: number, py: number, game: Game, endNode: Cell): [x: number, y: number] | null {
	const dx = x - px, dy = y - py;

	if (x === endNode.x && y === endNode.y) {
		return [x, y];
	}

	function checkHorizontal(xv: number, yv: number) {
		return dx === 1 ? game.checkRightEdge(xv, yv) : game.checkLeftEdge(xv, yv)
	}

	function checkVertical(xv: number, yv: number) {
		return dy === 1 ? game.checkBottomEdge(xv, yv) : game.checkTopEdge(xv, yv)
	}

	if (dx !== 0) {
		// top right or left cell is blocked from at least one side
		const topCheck = !checkHorizontal(x - dx, y - 1) || !game.checkBottomEdge(x - dx, y - 1)
		// bottom right or left cell is blocked from at least one side
		const bottomCheck = !checkHorizontal(x - dx,y + 1) || !game.checkTopEdge(x - dx, y + 1)

		// Pruning rules
		if ((game.checkTopEdge(x, y) && topCheck) || (game.checkBottomEdge(x, y) && bottomCheck)) {
			return [x, y]
		}
	} else if (dy !== 0) {
		// right bottom or top cell is blocked from at least one side
		const topCheck = !checkVertical(x + 1, y - dy) || !game.checkLeftEdge(x + 1, y - dy)
		// left bottom or top cell is blocked from at least one side
		const bottomCheck = !checkVertical(x - 1,y - dy) || !game.checkRightEdge(x - 1, y - dy)

		// Pruning rules
		if ((game.checkRightEdge(x, y) && topCheck) || (game.checkLeftEdge(x, y) && bottomCheck)) {
			return [x, y]
		}

		//When moving vertically, must check for horizontal jump points
		if ((game.checkRightEdge(x, y) && jump(x + 1, y, x, y, game, endNode)) ||
			(game.checkLeftEdge(x, y) && jump(x - 1, y, x, y, game, endNode))) {
			return [x, y];
		}
	}
	else {
		throw new Error("Only horizontal and vertical movements are allowed");
	}

	// Continue to jump in direction, discarding whole jump when facing a direct obstacle or map edge
	if (dx !== 0) {
		return checkHorizontal(x, y) ? jump(x + dx, y, x, y, game, endNode) : null;
	} else {
		return checkVertical(x, y) ? jump(x, y + dy, x, y, game, endNode) : null;
	}
}

function findNeighbours(node: Node, game: Game, grid: Node[][]) {
	const { parent, x, y} = node
	const neighbors = []

	// directed pruning: can ignore most neighbors, unless forced.
	if (parent) {
		const px = parent.x, py = parent.y;

		// get the normalized direction of travel
		const dx = (x - px) / Math.max(Math.abs(x - px), 1);
		const dy = (y - py) / Math.max(Math.abs(y - py), 1);

		if (dx !== 0) {
			if (game.checkTopEdge(x, y)) {
				neighbors.push([x, y - 1]);
			}
			if (game.checkBottomEdge(x, y)) {
				neighbors.push([x, y + 1]);
			}
			if (dx === 1 && game.checkRightEdge(x, y)) {
				neighbors.push([x + 1, y]);
			} else if (game.checkLeftEdge(x, y)) {
				neighbors.push([x - 1, y]);
			}
		} else if (dy !== 0) {
			if (game.checkLeftEdge(x, y)) {
				neighbors.push([x - 1, y]);
			}
			if (game.checkRightEdge(x, y)) {
				neighbors.push([x + 1, y]);
			}
			if (dy === 1 && game.checkBottomEdge(x, y)) {
				neighbors.push([x, y + 1]);
			} else if (game.checkTopEdge(x, y)) {
				neighbors.push([x, y - 1]);
			}
		}
	}
	// return all neighbors
	else {
		const neighbourNodes = []

		// Adding neighbours
		if(game.checkTopEdge(x, y)) {
			neighbourNodes.push(grid[y - 1][x])
		}
		if(game.checkLeftEdge(x, y)) {
			neighbourNodes.push(grid[y][x - 1])
		}
		if(game.checkRightEdge(x, y)) {
			neighbourNodes.push(grid[y][x + 1])
		}
		if(game.checkBottomEdge(x, y)) {
			neighbourNodes.push(grid[y + 1][x])
		}

		for (let i = 0; i < neighbourNodes.length; i++) {
			const neighborNode = neighbourNodes[i];
			neighbors.push([neighborNode.x, neighborNode.y]);
		}
	}

	return neighbors;
}