import Game from "../model/Game.ts";
import {Move} from "../model/Move.ts";

export default function getNextMove(game: Game): Move {
	const color = game.playerIndex === 0 ? 1 : -1
	const depth = 2

	// right now, if you call function in a ended position, it will crush
	const move = pvs(depth, -999, 999, color, game)[1]! // I don`t know where I got th alpha beta value
	console.log("Color: " + color)
	// @ts-ignore
	console.log(move["newPosition"]!)
	return move
}

function pvs(depth: number, a: number, b: number, color: number, game: Game): [number, Move | undefined]{
	if (depth === 0 || isPositionTerminal(game)) {
		return [color * evaluatePosition(game), undefined]
	}

	let bestMove
	const possibleMoves = getPossibleMoves(game)

	for (let i = 0; i < possibleMoves.length; i++) {
		const move = possibleMoves[i]
		let score

		game.executeMove(move)

		if (i === 0) {
			score = -pvs(depth - 1, -b, -a, -color, game)[0]
			game.undoLastMove()
		} else {
			score = -pvs(depth - 1, -a - 1, -a, -color, game)[0]
			if (score > a && score < b) {
				score = -pvs(depth - 1, -b, -a, -color, game)[0]
			}
			game.undoLastMove() //?
		}

		if (score > a || !bestMove) { // can be optimised
			bestMove = move
		}

		// eslint-disable-next-line no-param-reassign
		a = Math.max(a, score)
		if (a >= b) break
	}

	return [a, bestMove]
}

function evaluatePosition(game: Game) {
	const [ player1, player2 ] = game.players
	const d1 =  Math.abs(player1.goal[0].y - player1.position.y)
	const d2 =  Math.abs(player2.goal[0].y - player2.position.y)

	return (8 - d1) - (8 - d2)
}

function isPositionTerminal(game: Game) {
	const [ player1, player2 ] = game.players
	return (player1.position.y === player1.goal[0].y || player2.position.y === player2.goal[0].y)
}

function getPossibleMoves(game: Game) {
	return game.possiblePlayerMoves()
}