import Model from "./Model.ts";
import {isPlayerMove, Move, MovePlayer, MoveWall} from "./Move.ts";
import {Player} from "./Player.ts";

export default class Game implements Model{
	gridEdges = new Set<number>();
	moveHistory: Move[] = [];
	playerToMakeMove= 0; // counter mod amount of player
	players= [{x: 4, y: 0, walls: 10}, {x: 4, y: 8, walls: 10}];
	wallsAvailable = new Set<string>();
	gridWidth = 9;

	executeMove(move: Move): void {
		isPlayerMove(move) ? this.executePlayerMove(move) : this.executeWallMove(move)
		this.moveHistory.push(move)
		this.playerToMakeMove = this.playerToMakeMove === 0 ? 1 : 0
	}

	executePlayerMove(move: MovePlayer): void {
		const currentPlayer = this.getCurrentPlayer()
		move.previousX = currentPlayer.x
		move.previousY = currentPlayer.y
		currentPlayer.x = move.newX
		currentPlayer.y = move.newY
	}

	executeWallMove(move: MoveWall): void {
		const currentPlayer = this.getCurrentPlayer()
		currentPlayer.walls-- // reducing player wall counter
		this.wallsAvailable.delete(move.position)
		const { x, y, orientation } = this.wallToString(move.position)

		let wall1, wall2, wall3, firstEdge, secondEdge

		if (orientation === "h") {
			wall1 = this.stringToWall((x + 1), y, "h")
			wall2 = this.stringToWall((x - 1), y, "h")
			wall3 = this.stringToWall(x, y, "v")

			firstEdge = this.getBottomEdge(x, y)
			secondEdge = this.getBottomEdge(x + 1, y)
		} else {
			wall1 = this.stringToWall(x, (y + 1), "v")
			wall2 = this.stringToWall(x, (y - 1), "v")
			wall3 = this.stringToWall(x, y, "h")

			firstEdge = this.getRightEdge(x, y)
			secondEdge = this.getRightEdge(x, y + 1)
		}

		this.gridEdges.delete(firstEdge)
		this.gridEdges.delete(secondEdge)

		if (this.wallsAvailable.has(wall1)) {
			this.wallsAvailable.delete(wall1)
			move.removedWalls.push(wall1)
		}
		if (this.wallsAvailable.has(wall2)) {
			this.wallsAvailable.delete(wall2)
			move.removedWalls.push(wall2)
		}
		if (this.wallsAvailable.has(wall3)) {
			this.wallsAvailable.delete(wall3)
			move.removedWalls.push(wall3)
		}
	}

	undoLastMove(): void {
		const lastMove = this.moveHistory.pop()
		if (lastMove !== undefined) {
			this.playerToMakeMove = this.playerToMakeMove === 0 ? 1 : 0
			const currentPlayer = this.getCurrentPlayer()

			if (isPlayerMove(lastMove)) {
				if (lastMove.previousX != null && lastMove.previousY != null) { // typescript go brr
					currentPlayer.x = lastMove.previousX
					currentPlayer.y = lastMove.previousY
				}
			} else {
				lastMove.removedWalls.forEach(e => this.wallsAvailable.add(e))
				const { x, y, orientation } = this.wallToString(lastMove.position)

				let firstEdge, secondEdge
				if (orientation === "h") {
					firstEdge = this.getBottomEdge(x, y)
					secondEdge = this.getBottomEdge(x + 1, y)
				} else {
					firstEdge = this.getRightEdge(x, y)
					secondEdge = this.getRightEdge(x, y + 1)
				}

				this.gridEdges.add(firstEdge)
				this.gridEdges.add(secondEdge)
			}
		}
	}

	getCurrentPlayer(): Player{
		return this.players[this.playerToMakeMove]
	}

	getNextPlayer(): Player {
		return this.playerToMakeMove === 0 ? this.players[1] : this.players[0]
	}

	wallToString(wallPosition: string): {x: number, y: number, orientation: string} {
		const decodedPosition = wallPosition.split("")
		return {x: parseInt(decodedPosition[0]), y: parseInt(decodedPosition[1]), orientation: decodedPosition[2]}
	}

	stringToWall(x: number, y: number, orientation: string): string {
		return "".concat(String(x), String(y), orientation)
	}

	getLeftEdge(nodeX: number, nodeY: number): number {
		return (nodeX - 1) + (nodeY * 2 * this.gridWidth)
	}

	getRightEdge(nodeX: number, nodeY: number): number {
		return (nodeX) + (nodeY * 2 * this.gridWidth)
	}

	getTopEdge(nodeX: number, nodeY: number): number {
		return (nodeX) + ((nodeY * 2 - 1) * this.gridWidth)
	}

	getBottomEdge(nodeX: number, nodeY: number): number {
		return (nodeX) + ((nodeY * 2 + 1) * this.gridWidth)
	}

	initializeEdges(): void {
		// actually, its (width * (width - 1)) * 2, but we need this to make it square
		const amountOfEdges = (this.gridWidth * this.gridWidth) + (this.gridWidth * (this.gridWidth - 1))
		// generating edges as linear sequence
		for (let i = 0; i < amountOfEdges; i++) {
			const x = i % this.gridWidth
			const y = (i - x) / this.gridWidth

			// removing rightmost horizontal edges, as there newer will be existing
			const isRedundantEdge = (y % 2 == 0) && (x == (this.gridWidth - 1))

			if (!isRedundantEdge) {
				this.gridEdges.add(i)
			}
		}
	}

	initializeWalls(): void {
		for (let i = 0; i < this.gridWidth - 1; i++) {
			for (let j = 0; j < this.gridWidth - 1; j++){
				const wallH = "".concat(String(i), String(j), "h")
				const wallV = "".concat(String(i), String(j), "v")
				this.wallsAvailable.add(wallV)
				this.wallsAvailable.add(wallH)
			}
		}
	}

	generatePossibleMoves(): Move[] {
		const moveSet = []
		const currentPlayer = this.getCurrentPlayer()
		const nextPlayer = this.getNextPlayer()

		if (this.gridEdges.has(this.getTopEdge(currentPlayer.x, currentPlayer.y))) {
			// check if there is another player above
			if (currentPlayer.x === nextPlayer.x && currentPlayer.y === (nextPlayer.y + 1)) {
				if (this.gridEdges.has(this.getTopEdge(nextPlayer.x, nextPlayer.y))) {
					moveSet.push({newX: currentPlayer.x, newY: currentPlayer.y - 2}) // jump over other player
				} else {
					if (this.gridEdges.has(this.getLeftEdge(nextPlayer.x, nextPlayer.y))) {
						moveSet.push({newX: currentPlayer.x - 1, newY: currentPlayer.y - 1}) // jump left to the other player
					}
					if (this.gridEdges.has(this.getRightEdge(nextPlayer.x, nextPlayer.y))) {
						moveSet.push({newX: currentPlayer.x + 1, newY: currentPlayer.y - 1}) // jump right to the other player
					}
				}
			} else {
				moveSet.push({newX: currentPlayer.x, newY: currentPlayer.y - 1})
			}
		}

		if (this.gridEdges.has(this.getRightEdge(currentPlayer.x, currentPlayer.y))) {
			if (currentPlayer.x === (nextPlayer.x - 1) && currentPlayer.y === nextPlayer.y) {
				if (this.gridEdges.has(this.getRightEdge(nextPlayer.x, nextPlayer.y))) {
					moveSet.push({newX: currentPlayer.x + 2, newY: currentPlayer.y})
				} else {
					if (this.gridEdges.has(this.getTopEdge(nextPlayer.x, nextPlayer.y))) {
						moveSet.push({newX: currentPlayer.x + 1, newY: currentPlayer.y - 1})
					}
					if (this.gridEdges.has(this.getBottomEdge(nextPlayer.x, nextPlayer.y))) {
						moveSet.push({newX: currentPlayer.x + 1, newY: currentPlayer.y + 1})
					}
				}
			} else {
				moveSet.push({newX: currentPlayer.x + 1, newY: currentPlayer.y})
			}
		}

		if (this.gridEdges.has(this.getLeftEdge(currentPlayer.x, currentPlayer.y))) {
			if (currentPlayer.x === (nextPlayer.x + 1) && currentPlayer.y === nextPlayer.y) {
				if (this.gridEdges.has(this.getLeftEdge(nextPlayer.x, nextPlayer.y))) {
					moveSet.push({newX: currentPlayer.x - 2, newY: currentPlayer.y})
				} else {
					if (this.gridEdges.has(this.getTopEdge(nextPlayer.x, nextPlayer.y))) {
						moveSet.push({newX: currentPlayer.x - 1, newY: currentPlayer.y - 1})
					}
					if (this.gridEdges.has(this.getBottomEdge(nextPlayer.x, nextPlayer.y))) {
						moveSet.push({newX: currentPlayer.x - 1, newY: currentPlayer.y + 1})
					}
				}
			} else {
				moveSet.push({newX: currentPlayer.x - 1, newY: currentPlayer.y})
			}
		}

		if (this.gridEdges.has(this.getBottomEdge(currentPlayer.x, currentPlayer.y))) {
			if (currentPlayer.x === nextPlayer.x && currentPlayer.y === (nextPlayer.y - 1)) {
				if (this.gridEdges.has(this.getBottomEdge(nextPlayer.x, nextPlayer.y))) {
					moveSet.push({newX: currentPlayer.x, newY: currentPlayer.y + 2})
				} else {
					if (this.gridEdges.has(this.getLeftEdge(nextPlayer.x, nextPlayer.y))) {
						moveSet.push({newX: currentPlayer.x - 1, newY: currentPlayer.y + 1})
					}
					if (this.gridEdges.has(this.getRightEdge(nextPlayer.x, nextPlayer.y))) {
						moveSet.push({newX: currentPlayer.x + 1, newY: currentPlayer.y + 1})
					}
				}
			} else {
				moveSet.push({newX: currentPlayer.x, newY: currentPlayer.y + 1})
			}
		}

		this.wallsAvailable.forEach(value => moveSet.push({position: value, removedWalls: []}))

		return moveSet
	}

	showGameState() {
		const stateSize = this.gridWidth * 2 - 1
		const state = new Array(stateSize).fill(0).map(() => new Array(stateSize).fill("0")) // i love js

		for (let i = 0; i < this.gridWidth; i++) {
			for (let j = 0; j < this.gridWidth; j++) {
				if(this.gridEdges.has(this.getRightEdge(i, j))) {
					state[j*2][(i * 2) + 1] = "-"
				}
				if(this.gridEdges.has(this.getBottomEdge(i, j))) {
					state[(j * 2) + 1][i*2] = "|"
				}
			}
		}

		this.players.forEach((value, index) => {
			state[value.y * 2][value.x * 2] = index + 1
		})
		return state
	}
}
