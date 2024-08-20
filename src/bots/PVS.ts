// @ts-nocheck
import Game from "../model/Game.ts";
import { isPlayerMove, Move } from '../model/Move.ts';
import aStar from "../pathfinding/AStar.ts";
import { Player } from '../model/Player.ts';
import Node from "../pathfinding/Node.ts";

class PVS {
	game: Game
	depth: number
	transpositionTable: Map<number, number> = new Map()
	shortestPath1: Node[]
	shortestPath2: Node[]

	constructor(depth: number) {
		this.depth = depth;
	}

	getNextMove(game: Game): Move | undefined {
		this.game = game // test
		const color = this.game.playerIndex === 0 ? 1 : -1

		// alpha and beta are book numbers
		const [score, move] = this.pvs(this.depth, -99, 99, color)
		return move || undefined // no available moves
	}

	private pvs(depth: number, a: number, b: number, color: number): [number, Move | undefined] {
		const [player1, player2] = this.game.players

		// may cause anomalies?
		if (player1.goal.has(player1.position.x + "" + player1.position.y)) {
			return [color * 99, undefined]
		} else if (player2.goal.has(player2.position.x + "" + player2.position.y)) {
			return [color * -99, undefined]
		}

		if (depth === 0) {
			const score = this.evaluatePosition(color)
			return [score, undefined]
		}

		let bestMove
		const possibleMoves = this.getPossibleMoves(color)

		for (let i = 0; i < possibleMoves.length; i++) {
			const move = possibleMoves[i]

			let score: number
			try {
				this.game.executeMove(move) // if wall blocks someone's win condition, it will through an error
			} catch (e) {
				continue
			}

			// maxDepth - 1 = 3
			if (depth === 3) {
				this.shortestPath1 = 0
				this.shortestPath2 = 0
			}

			if (i === 0) {
				score = -(this.pvs(depth - 1, -b, -a, -color)[0])
			} else {
				score = -(this.pvs(depth - 1, -a - 1, -a, -color)[0])
				if (score > a && score < b) {
					score = -(this.pvs(depth - 1, -b, -a, -color)[0])
				}
			}

			this.game.undoLastMove()

			// should check
			if (score > a) { // can be optimised
				bestMove = move
			}

			// eslint-disable-next-line no-param-reassign
			a = Math.max(a, score)
			if (a >= b) {
				break
			}
		}

		return [a, bestMove]
	}

	private evaluatePosition(color: number) {
		const [player1, player2] = this.game.players

		let d1 = 99, d2 = 99
		const w1 = player1.walls, w2 = player2.walls

		// hash is order-sensitive, so we need to sort wall`s set, that was messed up by do-undo move functions
		//const sortedWallsAvailable = [...this.game.wallsAvailable].sort() // huge underperformance
		const sortedWallsAvailable = Array.from(this.game.wallsAvailable).sort(); // not too much difference

		const positionString: string = sortedWallsAvailable.join('') +
			player1.position.x + player1.position.y + player2.position.x + player2.position.y + w1 + w2

		const positionHash = this.hashCode(positionString)

		if (this.transpositionTable.has(positionHash)) {
			return this.transpositionTable.get(positionHash)
		}

		const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1]
		const isLastMovePlayerMove = isPlayerMove(lastMove)

		if (!this.shortestPath1 ||
			isLastMovePlayerMove ||
			!this.isPathWalkable(this.shortestPath1)) {
			player1.goal.forEach(goalStr => {
				const goalCell = { x: goalStr[0], y: goalStr[1] }
				const path = aStar(goalCell, player1.position, this.game)
				const pathLength = path.length === 0 ? 99 : path.length

				if (pathLength < d1) {
					this.shortestPath1 = path;
					d1 = pathLength;
				}
			})
		} else {
			d1 = this.shortestPath1.length
		}

		if (!this.shortestPath2 ||
			isLastMovePlayerMove ||
			!this.isPathWalkable(this.shortestPath2)) {
			player2.goal.forEach(goalStr => {
				const goalCell = { x: goalStr[0], y: goalStr[1] }
				const path = aStar(goalCell, player2.position, this.game)
				const pathLength = path.length === 0 ? 99 : path.length

				if (pathLength < d2) {
					this.shortestPath2 = path;
					d2 = pathLength;
				}
			})
		} else {
			d2 = this.shortestPath2.length
		}

		// Adjusting the score based on remaining walls
		const wallDifference = (10 - w2) - (10 - w1);
		const multiplier = (color === 1 && w1 < 10) || (color === -1 && w2 < 10) ? 2 : 1;

		const centrality1 = Math.abs(player1.position.x - 4)
		const centrality2 = Math.abs(player2.position.x - 4)

		// Return the combined evaluation
		let score = (d2 - d1);
		score += wallDifference * multiplier;
		score += (centrality2 - centrality1) / 2;

		// color multiplication need to change player side/POV
		this.transpositionTable.set(positionHash, color * score)
		return color * score;
	}

	private isPathWalkable(path: Node[]): boolean {
		let currentNode: Node, nextNode: Node;
		for (let i = 0; i < path.length - 1; i++) {
			currentNode = path[i];
			nextNode = path[i + 1];

			// Calculate deltas
			const deltaX = nextNode.x - currentNode.x;
			const deltaY = nextNode.y - currentNode.y;

			// Early exit if any move is not walkable
			if ((deltaX === -1 && !this.game.checkWalkableLeft(currentNode.x, currentNode.y)) ||
				(deltaX === 1 && !this.game.checkWalkableRight(currentNode.x, currentNode.y)) ||
				(deltaY === -1 && !this.game.checkWalkableTop(currentNode.x, currentNode.y)) ||
				(deltaY === 1 && !this.game.checkWalkableBottom(currentNode.x, currentNode.y))) {
				return false;
			}
		}
		return true;
	}

	private hashCode(str: string): number {
		let hash = 0, i, chr;
		//if (str.length === 0) return hash; // this function will always be used with non-zero length strings
		for (i = 0; i < str.length; i++) {
			chr = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}

	private getPossibleMoves(color: number) {
		const possibleMoves = this.game.possiblePlayerMoves()

		if (this.game.getCurrentPlayer().walls > 0) {
			const possibleWalls = new Set<string>()
			const [player1, player2] = this.game.players

			const player1Walls = this.getWallsAroundPlayer(player1)
			const player2Walls = this.getWallsAroundPlayer(player2)

			// adding walls around players
			if (color === 1) {
				player1Walls.forEach(wall => possibleWalls.add(wall))
				player2Walls.forEach(wall => possibleWalls.add(wall))
			} else {
				player2Walls.forEach(wall => possibleWalls.add(wall))
				player1Walls.forEach(wall => possibleWalls.add(wall))
			}

			// adding all other walls
			this.game.wallsAvailable.forEach(wall => possibleWalls.add(wall))

			possibleWalls.forEach(wall => possibleMoves.push({ position: wall, removedWalls: [] }))
		}

		return possibleMoves
	}

	private getWallsAroundPlayer(player: Player): string[] {
		const walls: string[] = []
		const possibleWalls: string[] = []

		possibleWalls.push((player.position.x - 1) + "" + (player.position.y - 1) + "h")
		possibleWalls.push((player.position.x - 1) + "" + (player.position.y - 1) + "v")

		possibleWalls.push((player.position.x) + "" + (player.position.y - 1) + "h")
		possibleWalls.push((player.position.x) + "" + (player.position.y - 1) + "v")

		possibleWalls.push((player.position.x - 1) + "" + (player.position.y) + "h")
		possibleWalls.push((player.position.x - 1) + "" + (player.position.y) + "v")

		possibleWalls.push((player.position.x) + "" + (player.position.y) + "h")
		possibleWalls.push((player.position.x) + "" + (player.position.y) + "v")

		possibleWalls.forEach(wall => {
			if (this.game.wallsAvailable.has(wall)) {
				walls.push(wall)
			}
		})

		return walls
	}
}
// depth from 1 to 4
export default new PVS(4)