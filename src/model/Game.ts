import Model from "./Model.ts";
import {isPlayerMove, Move, MovePlayer, MoveWall} from "./Move.ts";
import {Player} from "./Player.ts";
import {areCellsEqual, Cell} from "./Cell.ts";

export default class Game implements Model{
	gridEdges = new Set<number>();
	moveHistory: Move[] = [];
	playerToMakeMove= 0; // counter mod amount of player
	wallsAvailable = new Set<string>();
	gridWidth = 9;
	players= [
		{
			position: {x: 4, y: 0},
			walls: 10,
			goal: [
				{x: 0, y: 8},
				{x: 1, y: 8},
				{x: 2, y: 8},
				{x: 3, y: 8},
				{x: 4, y: 8},
				{x: 5, y: 8},
				{x: 6, y: 8},
				{x: 7, y: 8},
				{x: 8, y: 8},
			]
		},
		{
			position: {x: 4, y: 8},
			walls: 10,
			goal: [
				{x: 0, y: 0},
				{x: 1, y: 0},
				{x: 2, y: 0},
				{x: 3, y: 0},
				{x: 4, y: 0},
				{x: 5, y: 0},
				{x: 6, y: 0},
				{x: 7, y: 0},
				{x: 8, y: 0},
			]
		}
	];

	executeMove(move: Move): void {
		isPlayerMove(move) ? this.executePlayerMove(move) : this.executeWallMove(move)
		this.moveHistory.push(move)
		this.playerToMakeMove = this.playerToMakeMove === 0 ? 1 : 0
	}

	executePlayerMove(move: MovePlayer): void {
		const currentPlayer = this.getCurrentPlayer()
		move.previousPosition = { ...currentPlayer.position }
		currentPlayer.position = { ...move.newPosition }
	}

	executeWallMove(move: MoveWall): void {
		const { x, y, orientation } = this.wallToString(move.position)
		let firstEdge, secondEdge
		if (orientation === "h") {
			firstEdge = this.getBottomEdge(x, y)
			secondEdge = this.getBottomEdge(x + 1, y)
		} else {
			firstEdge = this.getRightEdge(x, y)
			secondEdge = this.getRightEdge(x, y + 1)
		}

		// trying to place wall
		this.gridEdges.delete(firstEdge)
		this.gridEdges.delete(secondEdge)

		let winConditionsIsAccessible = true

		for (const player of this.players) {
			winConditionsIsAccessible =
				winConditionsIsAccessible && this.checkWinCondition({ ...player.position }, player.goal)
		}

		if (!winConditionsIsAccessible) {
			this.gridEdges.add(firstEdge)
			this.gridEdges.add(secondEdge)
			console.log("Wall blocks someone`s path")
			//throw new Error("Wall blocks someone`s path")
		}

		const currentPlayer = this.getCurrentPlayer()
		currentPlayer.walls-- // reducing player wall counter
		this.wallsAvailable.delete(move.position)

		let wall1, wall2, wall3

		if (orientation === "h") {
			wall1 = this.stringToWall((x + 1), y, "h")
			wall2 = this.stringToWall((x - 1), y, "h")
			wall3 = this.stringToWall(x, y, "v")
		} else {
			wall1 = this.stringToWall(x, (y + 1), "v")
			wall2 = this.stringToWall(x, (y - 1), "v")
			wall3 = this.stringToWall(x, y, "h")
		}

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
				if (lastMove.previousPosition != null) { // typescript go brr
					currentPlayer.position = { ...lastMove.previousPosition}
				}
			} else {
				const { x, y, orientation } = this.wallToString(lastMove.position)
				// restore available moves
				lastMove.removedWalls.forEach(e => this.wallsAvailable.add(e))

				let firstEdge, secondEdge
				if (orientation === "h") {
					firstEdge = this.getBottomEdge(x, y)
					secondEdge = this.getBottomEdge(x + 1, y)
				} else {
					firstEdge = this.getRightEdge(x, y)
					secondEdge = this.getRightEdge(x, y + 1)
				}

				// restoring edges
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
		if (nodeX <= 0) return -1 // left edge can generate negative numbers
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

	checkLeftEdge(nodeX: number, nodeY: number): boolean {
		return this.gridEdges.has(this.getLeftEdge(nodeX, nodeY))
	}

	checkRightEdge(nodeX: number, nodeY: number): boolean {
		return this.gridEdges.has(this.getRightEdge(nodeX, nodeY))
	}

	checkTopEdge(nodeX: number, nodeY: number): boolean {
		return this.gridEdges.has(this.getTopEdge(nodeX, nodeY))
	}

	checkBottomEdge(nodeX: number, nodeY: number): boolean {
		return this.gridEdges.has(this.getBottomEdge(nodeX, nodeY))
	}

	checkWinCondition(playerNode: Cell, playerGoal: Cell[]): boolean {
		const toDo: Cell[] = []
		const done: Cell[] = []
		toDo.push({x: playerNode.x, y:playerNode.y})
		while (toDo.length > 0) {
			const node = toDo.pop()
			if (node !== undefined) { // typescript cancer
				done.push(node)
				for (const adjustedNode of this.adjustedNodes(node)) {
					if (playerGoal.find(goal => areCellsEqual(goal, adjustedNode))) {
						return true
					}
					if (done.find(doneNode => areCellsEqual(doneNode, adjustedNode)) === undefined &&
						toDo.find(doneNode => areCellsEqual(doneNode, adjustedNode)) === undefined) {
						toDo.push(adjustedNode)
					}
				}
			}
		}
		return false
	}


	adjustedNodes(node: Cell): Cell[] {
		const nodes = []
		if(this.checkTopEdge(node.x, node.y)) {
			nodes.push({x: node.x, y: node.y - 1})
		}
		if(this.checkLeftEdge(node.x, node.y)) {
			nodes.push({x: node.x - 1, y: node.y})
		}
		if(this.checkRightEdge(node.x, node.y)) {
			nodes.push({x: node.x + 1, y: node.y})
		}
		if(this.checkBottomEdge(node.x, node.y)) {
			nodes.push({x: node.x, y: node.y + 1})
		}
		return nodes
	}

	initializeEdges(): void {
		// actually, its (width * (width - 1)) * 2, but we need this to make it square
		const amountOfEdges = (this.gridWidth * this.gridWidth) + (this.gridWidth * (this.gridWidth - 1))
		// generating edges as linear sequence
		for (let i = 0; i < amountOfEdges; i++) {
			const x = i % this.gridWidth
			const y = (i - x) / this.gridWidth

			// removing rightmost horizontal edges, as they newer will exist
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

	possiblePlayerMoves(): Move[] {
		const moveSet = []
		const { position} = this.getCurrentPlayer()
		const { position: nextPlayerPos} = this.getNextPlayer()

		if (this.checkTopEdge(position.x, position.y)) {
			// check if there is another player above
			if (position.x === nextPlayerPos.x && position.y === nextPlayerPos.y + 1) {
				if (this.checkTopEdge(nextPlayerPos.x, nextPlayerPos.y)) {
					// jump over other player
					moveSet.push({newPosition: {x: position.x, y: position.y - 2}})
				} else {
					if (this.gridEdges.has(this.getLeftEdge(nextPlayerPos.x, nextPlayerPos.y))) {
						// jump left to the other player
						moveSet.push({newPosition: {x: position.x - 1, y: position.y - 1}})
					}
					if (this.gridEdges.has(this.getRightEdge(nextPlayerPos.x, nextPlayerPos.y))) {
						// jump right to the other player
						moveSet.push({newPosition: {x: position.x + 1, y: position.y - 1}})
					}
				}
			} else {
				moveSet.push({newPosition: {x: position.x, y: position.y - 1}})
			}
		}

		if (this.checkRightEdge(position.x, position.y)) {
			if (position.x === nextPlayerPos.x - 1 && position.y === nextPlayerPos.y) {
				if (this.gridEdges.has(this.getRightEdge(nextPlayerPos.x, nextPlayerPos.y))) {
					moveSet.push({newPosition: {x: position.x + 2, y: position.y}})
				} else {
					if (this.gridEdges.has(this.getTopEdge(nextPlayerPos.x, nextPlayerPos.y))) {
						moveSet.push({newPosition: {x: position.x + 1, y: position.y - 1}})
					}
					if (this.gridEdges.has(this.getBottomEdge(nextPlayerPos.x, nextPlayerPos.y))) {
						moveSet.push({newPosition: {x: position.x + 1, y: position.y + 1}})
					}
				}
			} else {
				moveSet.push({newPosition: {x: position.x + 1, y: position.y}})
			}
		}

		if (this.checkLeftEdge(position.x, position.y)) {
			if (position.x === nextPlayerPos.x + 1 && position.y === nextPlayerPos.y) {
				if (this.gridEdges.has(this.getLeftEdge(nextPlayerPos.x, nextPlayerPos.y))) {
					moveSet.push({newPosition: {x: position.x - 2, y: position.y}})
				} else {
					if (this.gridEdges.has(this.getTopEdge(nextPlayerPos.x, nextPlayerPos.y))) {
						moveSet.push({newPosition: {x: position.x - 1, y: position.y - 1}})
					}
					if (this.gridEdges.has(this.getBottomEdge(nextPlayerPos.x, nextPlayerPos.y))) {
						moveSet.push({newPosition: {x: position.x - 1, y: position.y + 1}})
					}
				}
			} else {
				moveSet.push({newPosition: {x: position.x - 1, y: position.y}})
			}
		}

		if (this.checkBottomEdge(position.x, position.y)) {
			if (position.x === nextPlayerPos.x && position.y === (nextPlayerPos.y - 1)) {
				if (this.gridEdges.has(this.getBottomEdge(nextPlayerPos.x, nextPlayerPos.y))) {
					moveSet.push({newPosition: {x: position.x, y: position.y + 2}})
				} else {
					if (this.gridEdges.has(this.getLeftEdge(nextPlayerPos.x, nextPlayerPos.y))) {
						moveSet.push({newPosition: {x: position.x - 1, y: position.y + 1}})
					}
					if (this.gridEdges.has(this.getRightEdge(nextPlayerPos.x, nextPlayerPos.y))) {
						moveSet.push({newPosition: {x: position.x + 1, y: position.y + 1}})
					}
				}
			} else {
				moveSet.push({newPosition: {x: position.x, y: position.y + 1}})
			}
		}

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
			state[value.position.y * 2][value.position.x * 2] = index + 1
		})
		return state
	}
}
