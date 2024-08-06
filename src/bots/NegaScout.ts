// @ts-nocheck
import Game from "../model/Game.ts";
import {isPlayerMove, Move} from "../model/Move.ts";
//import jps from "../pathfinding/JPS.ts";
import aStar from "../pathfinding/AStar.ts";
import Cell from '../components/Cell';

export default function getNextMove(game: Game): Move | undefined{
	const color = game.playerIndex === 0 ? 1 : -1
	const depth = 2 // from 1 to 8

	// alpha and beta supposed to be book numbers
	//const [score, move] = pvs(depth, -999, 999, color, game)
	const [score, move ] = negamax(depth, color, game)

	if (move) {
		//console.log("Color: " + color + " Score: " + score)
		//console.log(isPlayerMove(move) ? move.newPosition : move.position)
		return move
	} else return undefined // no available moves
}

function pvs(depth: number, a: number, b: number, color: number, game: Game): [number, Move | undefined] {
	const [ player1, player2 ] = game.players

	// checking if position is terminal
	// if (player1.goal.has(player1.position.x + "" + player1.position.y)) {
	// 	return [999, undefined]
	// } else if (player2.goal.has(player2.position.x + "" + player2.position.y)) {
	// 	return [-999, undefined]
	// }

	if (depth === 0) {
		return [color * evaluatePosition2(game), undefined] // color multiplication need to change player side/POV
	}

	let bestMove
	const possibleMoves = getPossibleMoves(game, depth)

	//const scores = []

	for (let i = 0; i < possibleMoves.length; i++) {
		const move = possibleMoves[i]

		let score
		try {
			game.executeMove(move) // if wall blocks someone's win condition, it will through an error
		} catch (e) {
			continue
		}

		if (i === 0) {
			score = -pvs(depth - 1, -b, -a, -color, game)[0]
		} else {
			score = -pvs(depth - 1, -a - 1, -a, -color, game)[0]
			if (score > a && score < b) {
				score = -pvs(depth - 1, -b, -a, -color, game)[0]
			}
		}

		//scores.push(score)

		game.undoLastMove()

		// should check
		if (score > a) { // can be optimised
			bestMove = move
		}

		// eslint-disable-next-line no-param-reassign
		a = Math.max(a, score)
		if (a >= b) break
	}

	//console.log("Depth: " + depth)
	//console.log(scores)

	return [a, bestMove]
}

export function evaluatePosition(game: Game) {
	const [ player1, player2 ] = game.players

	let d1 = 99, d2 = 99

	player1.goal.forEach(goalStr => {
		// const path = jps(goalCell, player1.position, game) // searching path from goal to player, can be optimised
		// // g supposed to be travel distance, I really hope jps returns in correctly
		// const pathLength = path.length > 0 ? path[path.length - 1].g : 99 // if goal blocked, pathfinding return empty array
		const goalCell = {x: goalStr[0], y: goalStr[1]}
		const path = aStar(goalCell, player1.position, game)
		const pathLength = path.length === 0 ? 99 : path.length
		d1 = Math.min(d1, pathLength)
	})

	player2.goal.forEach(goalStr => {
		// const path = jps(goalCell, player2.position, game)
		// const pathLength = path.length > 0 ? path[path.length - 1].g : 99
		const goalCell = {x: goalStr[0], y: goalStr[1]}
		const path = aStar(goalCell, player2.position, game)
		const pathLength = path.length === 0 ? 99 : path.length
		d2 = Math.min(d2, pathLength)
	})

	return (player1.walls + (8 - d1)) - (player2.walls + (8 - d2)) // should be wrong, 8 must be 72
}

export function evaluatePosition2(game: Game) {
	const [ player1, player2 ] = game.players

	let d1 = 99, d2 = 99
	const w1 = player1.walls, w2 = player2.walls

	player1.goal.forEach(goalStr => {
		const goalCell = {x: goalStr[0], y: goalStr[1]}
		const path = aStar(goalCell, player1.position, game)
		const pathLength = path.length === 0 ? 99 : path.length
		d1 = Math.min(d1, pathLength)
	})

	player2.goal.forEach(goalStr => {
		const goalCell = {x: goalStr[0], y: goalStr[1]}
		const path = aStar(goalCell, player2.position, game)
		const pathLength = path.length === 0 ? 99 : path.length
		d2 = Math.min(d2, pathLength)
	})

	// Return the combined evaluation
	return (d2 - d1) + (w2 - w1);
}

export function getPossibleMoves(game: Game) {
	const possibleMoves = game.possiblePlayerMoves()

	if (game.getCurrentPlayer().walls > 0) {
		game.wallsAvailable.forEach(wall => possibleMoves.push({ position: wall, removedWalls: []}))
	}

	return possibleMoves
}

function negamax(depth: number, color: number, game: Game): [number, Move | undefined] {
	const [ player1, player2 ] = game.players

	// may cause anomalies?
	if (player1.goal.has(player1.position.x + "" + player1.position.y)) {
		return [color * 99, undefined]
	} else if (player2.goal.has(player2.position.x + "" + player2.position.y)) {
		return [color * -99, undefined]
	}

	if (depth === 0) {
		const score = color * evaluatePosition2(game)
		//console.log("Score: " + score + " Color: " + color)
		return [score, undefined];
	}

	let bestMove
	const possibleMoves = getPossibleMoves(game)

	let score = -Infinity
	for (let i = 0; i < possibleMoves.length; i++) {
		const move = possibleMoves[i]

		try {
			game.executeMove(move) // if wall blocks someone's win condition, it will through an error
		} catch (e) {
			continue //scip iteration in that case
		}

		const newScore = -negamax(depth - 1, -color, game)[0];

		if (newScore > score) { // can be optimised
			bestMove = move
		}

		score = Math.max(score, newScore)

		game.undoLastMove()
	}

	return [score, bestMove]
}