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

	withTransposition: boolean = true
	withPathCash: boolean = true
	withAdjacentWalls: boolean = true
	withCentrality: boolean = true

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

		// color inverted because this fragment accessed through pvs call
		// edge cases need to be tested
		const player = color === -1 ? player1 : player2;
		if (player.goal.has(`${player.position.x}${player.position.y}`)) {
			return [-99, undefined];
		}

		if (depth === 0) {
			const score = this.evaluatePosition(color)
			return [score, undefined]
		}

		let bestMove
		const possibleMoves = this.getPossibleMoves(color, depth)

		for (let i = 0; i < possibleMoves.length; i++) {
			const move = possibleMoves[i]

			let score: number
			try {
				this.game.executeMove(move) // if wall blocks someone's win condition, it will through an error
			} catch (e) {
				continue
			}

			// maxDepth - 1 = 3
			if (depth === 3 && this.withPathCash) {
				this.shortestPath1 = null
				this.shortestPath2 = null
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
				// eslint-disable-next-line no-param-reassign
				a = score
				bestMove = move
			}

			if (a >= b) {
				break
			}
		}

		return [a, bestMove]
	}

	private evaluatePosition(color: number): number {
		const [player1, player2] = this.game.players

		let d1 = 99, d2 = 99
		const w1 = player1.walls, w2 = player2.walls

		let positionHash
		if (this.withTransposition) {
			positionHash = this.hashPosition(player1, player2, this.game.wallsAvailable, w1, w2);
			if (this.transpositionTable.has(positionHash)) {
				return this.transpositionTable.get(positionHash)
			}
		}

		if (this.withPathCash) {
			const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1]
			const isLastMovePlayerMove = isPlayerMove(lastMove)

			//need separate method
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
		} else {
			player1.goal.forEach(goalStr => {
				const goalCell = { x: goalStr[0], y: goalStr[1] }
				const path = aStar(goalCell, player1.position, this.game)
				const pathLength = path.length === 0 ? 99 : path.length

				d1 = Math.min(d1, pathLength)
			})

			player2.goal.forEach(goalStr => {
				const goalCell = { x: goalStr[0], y: goalStr[1] }
				const path = aStar(goalCell, player2.position, this.game)
				const pathLength = path.length === 0 ? 99 : path.length

				d2 = Math.min(d2, pathLength)
			})
		}

		// Adjusting the score based on remaining walls
		const wallDifference = (10 - w2) - (10 - w1);
		const multiplier = (color === 1 && w1 < 10) || (color === -1 && w2 < 10) ? 2 : 1;

		// Return the combined evaluation
		let score = (d2 - d1);
		score += wallDifference * multiplier;

		if (this.withCentrality) {
			const centrality1 = Math.abs(player1.position.x - 4)
			const centrality2 = Math.abs(player2.position.x - 4)
			score += (centrality2 - centrality1) / 2;
		}

		if (this.withTransposition) {
			// color multiplication need to change player side/POV
			this.transpositionTable.set(positionHash, color * score)
		}
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

	private hashPosition(player1: Player, player2: Player, walls: Set<string>, w1: number, w2: number): number {
		let hash = 0, i, chr;

		const sortedWallsAvailable = Array.from(walls).sort().join('');

		for (i = 0; i < sortedWallsAvailable.length; i++) {
			chr = sortedWallsAvailable.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}

		hash = '' + player1.position.x + player1.position.y + player2.position.x + player2.position.y + w1 + w2

		return hash;
	}

	private getPossibleMoves(color: number) {
		const possibleMoves = new Map<string, Move>();

		const playerMoves = this.game.possiblePlayerMoves();
		for (const move of playerMoves) {
			const key = move.newPosition.x + '' + move.newPosition.y;
			if (!possibleMoves.has(key)) {
				possibleMoves.set(key, move);
			}
		}

		// Add wall moves if the current player has walls left
		if (this.game.getCurrentPlayer().walls > 0) {
			const [player1, player2] = this.game.players;

			if (this.withAdjacentWalls) {
				// adding walls first depending on player that moves
				const playerWalls = color === 1
					? [...this.getWallsAroundPlayer(player1), ...this.getWallsAroundPlayer(player2)]
					: [...this.getWallsAroundPlayer(player2), ...this.getWallsAroundPlayer(player1)];

				for (const wall of playerWalls) {
					if (!possibleMoves.has(wall)) {
						possibleMoves.set(wall, { position: wall, removedWalls: [] });
					}
				}
			}

			for (const wall of this.game.wallsAvailable) {
				if (!possibleMoves.has(wall)) {
					possibleMoves.set(wall, { position: wall, removedWalls: [] });
				}
			}
		}

		return Array.from(possibleMoves.values());
	}

	private getWallsAroundPlayer(player: Player): string[] {
		const { x, y } = player.position;
		const possibleWalls = [
			`${x - 1}${y - 1}h`, `${x - 1}${y - 1}v`,
			`${x}${y - 1}h`, `${x}${y - 1}v`,
			`${x - 1}${y}h`, `${x - 1}${y}v`,
			`${x}${y}h`, `${x}${y}v`
		];

		return possibleWalls.filter(wall => this.game.wallsAvailable.has(wall));
	}
}
// depth from 1 to 4
export default new PVS(4)