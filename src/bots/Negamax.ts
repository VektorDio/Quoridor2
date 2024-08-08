// @ts-nocheck
import Game from "../model/Game.ts";
import {Move} from "../model/Move.ts";
//import jps from "../pathfinding/JPS.ts";
import aStar from "../pathfinding/AStar.ts";

export default class Negamax {
	game: Game
	depth: number = 1
	transpositionTable: Map<string, number> = new Map()

	constructor(game: Game, depth: number) {
		this.game = game;
		this.depth = depth;
	}

	getNextMove(): Move | undefined{
		const color = this.game.playerIndex === 0 ? 1 : -1
		const depth = 2 // from 1 to 4

		const [score, move] = this.negamax(depth, color)

		if (move) {
			return move
		} else return undefined // no available moves
	}

	private evaluatePosition() {
		const [ player1, player2 ] = this.game.players

		let d1 = 99, d2 = 99
		const w1 = player1.walls, w2 = player2.walls

		player1.goal.forEach(goalStr => {
			const goalCell = {x: goalStr[0], y: goalStr[1]}
			const path = aStar(goalCell, player1.position, this.game)
			const pathLength = path.length === 0 ? 99 : path.length
			d1 = Math.min(d1, pathLength)
		})

		player2.goal.forEach(goalStr => {
			const goalCell = {x: goalStr[0], y: goalStr[1]}
			const path = aStar(goalCell, player2.position, this.game)
			const pathLength = path.length === 0 ? 99 : path.length
			d2 = Math.min(d2, pathLength)
		})

		// Return the combined evaluation
		return (d2 - d1) + ((10 - w2) - (10 - w1));
	}

	private getPossibleMoves() {
		const possibleMoves = this.game.possiblePlayerMoves()

		if (this.game.getCurrentPlayer().walls > 0) {
			this.game.wallsAvailable.forEach(wall => possibleMoves.push({ position: wall, removedWalls: []}))
		}

		return possibleMoves
	}

	private negamax(depth: number, color: number): [number, Move | undefined] {
		const [ player1, player2 ] = this.game.players

		// may cause anomalies?
		if (player1.goal.has(player1.position.x + "" + player1.position.y)) {
			return [color * 99, undefined]
		} else if (player2.goal.has(player2.position.x + "" + player2.position.y)) {
			return [color * -99, undefined]
		}

		if (depth === 0) {
			const score = color * this.evaluatePosition()
			return [score, undefined];
		}

		let bestMove
		const possibleMoves = this.getPossibleMoves()

		let score = -Infinity
		for (let i = 0; i < possibleMoves.length; i++) {
			const move = possibleMoves[i]

			try {
				this.game.executeMove(move) // if wall blocks someone's win condition, it will through an error
			} catch (e) {
				continue //scip iteration in that case
			}

			const newScore = -(this.negamax(depth - 1, -color)[0]);

			if (newScore > score) { // can be optimised
				bestMove = move
			}

			score = Math.max(score, newScore)

			this.game.undoLastMove()
		}

		return [score, bestMove]
	}
}