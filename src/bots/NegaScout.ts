import Game from "../model/Game.ts";
import {isPlayerMove, Move} from "../model/Move.ts";
import jps from "../pathfinding/JPS.ts";
//import aStar from "../pathfinding/AStar.ts";

export default function getNextMove(game: Game): Move {
	const color = game.playerIndex === 0 ? 1 : -1
	const depth = 6

	// right now, if you call function in an ended position, it will crush
	const [score, move ] = pvs(depth, -999, 999, color, game) // I don`t know where I got th alpha beta value
	console.log("Color: " + color + " Score: " + score)
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	console.log(isPlayerMove(move) ? move.newPosition : move.position)
	return move!
}

function pvs(depth: number, a: number, b: number, color: number, game: Game): [number, Move | undefined] {
	const [ player1, player2 ] = game.players
	// checking if position is terminal
	if (player1.position.y === player1.goal[0].y) {
		return [color * 99, undefined]
	}

	if (player2.position.y === player2.goal[0].y) {
		return [color * -99, undefined]
	}

	if (depth === 0) {
		return [color * evaluatePosition(game), undefined] // color multiplication need to change player side/POV
	}

	let bestMove
	const possibleMoves = getPossibleMoves(game, depth)

	for (let i = 0; i < possibleMoves.length; i++) {
		const move = possibleMoves[i]

		let score
		try {
			game.executeMove(move) // if wall blocks someone's win condition, it will through an error
		} catch (e) {
			//console.log(e)
			continue
		}

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

		// if I leave (score > a), it will really don't want to place walls, probably an evaluation function oversight
		if (score >= a || !bestMove) { // can be optimised
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
	// const d1 =  Math.abs(player1.goal[0].y - player1.position.y)
	// const d2 =  Math.abs(player2.goal[0].y - player2.position.y)

	let d1 = 99, d2 = 99

	player1.goal.forEach(goalCell => {
		const path = jps(goalCell, player1.position, game) // searching path from goal to player, can be optimised
		// g supposed to be travel distance, i really hope jps returns in correctly
		const pathLength = path.length > 0 ? path[path.length - 1].g : 99 // if goal blocked, pathfinding return empty array
		d1 = Math.min(d1, pathLength)
	})

	player2.goal.forEach(goalCell => {
		const path = jps(goalCell, player2.position, game)
		const pathLength = path.length > 0 ? path[path.length - 1].g : 99
		d2 = Math.min(d2, pathLength)
	})

	return (player1.walls + (8 - d1)) - (player2.walls + (8 - d2)) // should be wrong, 8 must be 99
}

function getPossibleMoves(game: Game, depth: number) {
	const possibleMoves = game.possiblePlayerMoves()

	if (depth > 1 && game.getCurrentPlayer().walls > 0) {
		game.wallsAvailable.forEach(wall => possibleMoves.push({ position: wall, removedWalls: []}))
	}

	return possibleMoves
}