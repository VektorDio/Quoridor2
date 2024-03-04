import Model from "./Model.ts";
import {isPlayerMove, Move, MovePlayer, MoveWall} from "./Move.ts";
import {Player} from "./Player.ts";
import {areCellsEqual, Cell} from "./Cell.ts";
import {Orientation, wallFromString, wallToString} from "./Wall.ts";

export default class Game implements Model{
	gridEdges = new Set<number>();
	wallsAvailable = new Set<string>();
	moveHistory: Move[] = [];
	playerIndex= 0;
	gridWidth = 9;
	players: Player[] = [
		{
			position: {x: 4, y: 8},
			walls: 10,
			goal: [{x: 0, y: 0},{x: 1, y: 0},{x: 2, y: 0},{x: 3, y: 0},{x: 4, y: 0},{x: 5, y: 0},{x: 6, y: 0},{x: 7, y: 0},{x: 8, y: 0}],
			goalStr: new Set(["00","10","20","30","40","50","60","70",'80'])
		},
		{
			position: {x: 4, y: 0},
			walls: 10,
			goal: [{x: 0, y: 8},{x: 1, y: 8},{x: 2, y: 8},{x: 3, y: 8},{x: 4, y: 8},{x: 5, y: 8},{x: 6, y: 8},{x: 7, y: 8},{x: 8, y: 8}],
			goalStr: new Set(["08","18","28","38","48","58","68","78","88"])
		}
	]

	constructor() {
		this.initializeWalls()
		this.initializeEdges()
	}

	executeMove(move: Move): void {
		// move will be mutated after execution
		if (isPlayerMove(move)) {
			this.executePlayerMove(move)
		} else {
			this.executeWallMove(move)
		}
		this.moveHistory.push(move)
		this.movePlayerIndex()
	}

	private executePlayerMove(move: MovePlayer): void {
		const currentPlayer = this.getCurrentPlayer()
		// mutating is a bad practise, but here we omit it for the sake of performance, as this method will be called a lot
		move.previousPosition = { x: currentPlayer.position.x, y: currentPlayer.position.y}
		currentPlayer.position = { x: move.newPosition.x, y: move.newPosition.y }
	}

	private executeWallMove(move: MoveWall): void {
		const { position: { x, y}, orientation } = wallFromString(move.position)
		let firstEdge, secondEdge
		if (orientation === Orientation.Horizontal) {
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
			if (!this.checkWinConditionStr(player.position, player.goalStr)) {
				winConditionsIsAccessible = false
				break
			}
		}

		if (!winConditionsIsAccessible) {
			this.gridEdges.add(firstEdge)
			this.gridEdges.add(secondEdge)
			console.log("Wall blocks someone`s path")
			throw new Error("Wall blocks someone`s path")
		}

		const currentPlayer = this.getCurrentPlayer()
		currentPlayer.walls -= 1 // reducing player wall counter
		this.wallsAvailable.delete(move.position)

		let wall1, wall2, wall3

		if (orientation === "h") {
			wall1 = wallToString({ position: { x: x + 1, y }, orientation: Orientation.Horizontal })
			wall2 = wallToString({ position: { x: x - 1, y }, orientation: Orientation.Horizontal })
			wall3 = wallToString({ position: { x, y }, orientation: Orientation.Vertical })
		} else {
			wall1 = wallToString({ position: { x, y: y + 1 }, orientation: Orientation.Vertical })
			wall2 = wallToString({ position: { x, y: y - 1 }, orientation: Orientation.Vertical })
			wall3 = wallToString({ position: { x, y }, orientation: Orientation.Horizontal })
		}

		// mutating variable again
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
			this.movePlayerIndex() // moving turn back
			const currentPlayer = this.getCurrentPlayer()

			if (isPlayerMove(lastMove)) {
				if (lastMove.previousPosition != null) {
					currentPlayer.position.x = lastMove.previousPosition.x
					currentPlayer.position.y = lastMove.previousPosition.y
				}
			} else {
				const { position: { x, y }, orientation } = wallFromString(lastMove.position)
				// restore available moves
				lastMove.removedWalls.forEach(e => this.wallsAvailable.add(e))

				let firstEdge, secondEdge
				if (orientation === Orientation.Horizontal) {
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
		return this.players[this.playerIndex]
	}

	getOtherPlayer(): Player {
		return this.playerIndex === 0 ? this.players[1] : this.players[0]
	}

	private movePlayerIndex(): void {
		this.playerIndex = this.playerIndex === 0 ? 1 : 0
	}

	private getLeftEdge(nodeX: number, nodeY: number): number {
		if (nodeX <= 0) return -1 // left edge can generate negative numbers, so we need to check
		return (nodeX - 1) + (nodeY * 2 * this.gridWidth)
	}

	private getRightEdge(nodeX: number, nodeY: number): number {
		return (nodeX) + (nodeY * 2 * this.gridWidth)
	}

	private getTopEdge(nodeX: number, nodeY: number): number {
		return (nodeX) + ((nodeY * 2 - 1) * this.gridWidth)
	}

	private getBottomEdge(nodeX: number, nodeY: number): number {
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
		// adding starting player position
		const toDo: Cell[] = [{x: playerNode.x, y:playerNode.y}]
		const done: Cell[] = []

		while (toDo.length > 0) {
			const node = toDo.pop()
			if (node !== undefined) { // node can't be undefined, but precompiler don't know this
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

	private adjustedNodes(node: Cell): Cell[] {
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

	checkWinConditionStr(playerNode: Cell, playerGoal: Set<string>): boolean {
		const toDoSet:Set<string> = new Set()
		const doneSet:Set<string> = new Set()
		toDoSet.add(playerNode.x + "" + playerNode.y)

		while (toDoSet.size > 0) {
			//const node = toDoSet.values().next().value
			const node = [...toDoSet].pop()

			if (node !== undefined) { // node can't be undefined, but precompiler don't know this
				toDoSet.delete(node)
				doneSet.add(node)
				for (const adjustedNode of this.adjustedNodesStr(node)) {
					if (playerGoal.has(adjustedNode)) {
						return true
					}
					if (!doneSet.has(adjustedNode)) { // here we don't need duplicate check, as we're using set
						toDoSet.add(adjustedNode)
					}
				}
			}
		}
		return false
	}

	private adjustedNodesStr(node: string): string[] {
		const nodes = []
		const x = parseInt(node[0])
		const y = parseInt(node[1])

		if(this.checkTopEdge(x, y)) {
			// this is not very readable, but should be one of the fastest way to convert int to string
			nodes.push(x + "" + (y - 1))
		}
		if(this.checkLeftEdge(x, y)) {
			nodes.push((x - 1) + "" + y)
		}
		if(this.checkRightEdge(x, y)) {
			nodes.push((x + 1) + "" + y)
		}
		if(this.checkBottomEdge(x, y)) {
			nodes.push(x + "" + (y + 1))
		}
		return nodes
	}

	private initializeEdges(): void {
		// actually, its (width * (width - 1)) * 2, but we need this to make it square
		const amountOfEdges = (this.gridWidth * this.gridWidth) + (this.gridWidth * (this.gridWidth - 1))
		// generating edges as linear sequence
		for (let i = 0; i < amountOfEdges; i++) {
			const x = i % this.gridWidth
			const y = (i - x) / this.gridWidth

			// removing rightmost horizontal edges, as they will newer exist
			const isRedundantEdge = (y % 2 == 0) && (x == (this.gridWidth - 1))

			if (!isRedundantEdge) {
				this.gridEdges.add(i)
			}
		}
	}

	private initializeWalls(): void {
		for (let i = 0; i < this.gridWidth - 1; i++) {
			for (let j = 0; j < this.gridWidth - 1; j++){
				// we have wall to string conversion, but here we're using this to avoid object creation
				const wallH = "".concat(String(i), String(j), "h")
				const wallV = "".concat(String(i), String(j), "v")
				this.wallsAvailable.add(wallV)
				this.wallsAvailable.add(wallH)
			}
		}
	}

	possiblePlayerMoves(): Move[] {
		const moveSet = []
		// getting players positions
		const { position} = this.getCurrentPlayer()
		const { position: nextPlayerPos} = this.getOtherPlayer()

		if (this.checkTopEdge(position.x, position.y)) {
			// check if there is another player above
			if (position.x === nextPlayerPos.x && position.y === nextPlayerPos.y + 1) {
				if (this.checkTopEdge(nextPlayerPos.x, nextPlayerPos.y)) {
					// jump over other player
					moveSet.push({newPosition: {x: position.x, y: position.y - 2}})
				} else {
					if (this.checkLeftEdge(nextPlayerPos.x, nextPlayerPos.y)) {
						// jump left to the other player
						moveSet.push({newPosition: {x: position.x - 1, y: position.y - 1}})
					}
					if (this.checkRightEdge(nextPlayerPos.x, nextPlayerPos.y)) {
						// jump right to the other player
						moveSet.push({newPosition: {x: position.x + 1, y: position.y - 1}})
					}
				}
			} else {
				// moving one cell forward
				moveSet.push({newPosition: {x: position.x, y: position.y - 1}})
			}
		}

		if (this.checkRightEdge(position.x, position.y)) {
			if (position.x === nextPlayerPos.x - 1 && position.y === nextPlayerPos.y) {
				if (this.checkRightEdge(nextPlayerPos.x, nextPlayerPos.y)) {
					moveSet.push({newPosition: {x: position.x + 2, y: position.y}})
				} else {
					if (this.checkTopEdge(nextPlayerPos.x, nextPlayerPos.y)) {
						moveSet.push({newPosition: {x: position.x + 1, y: position.y - 1}})
					}
					if (this.checkBottomEdge(nextPlayerPos.x, nextPlayerPos.y)) {
						moveSet.push({newPosition: {x: position.x + 1, y: position.y + 1}})
					}
				}
			} else {
				moveSet.push({newPosition: {x: position.x + 1, y: position.y}})
			}
		}

		if (this.checkLeftEdge(position.x, position.y)) {
			if (position.x === nextPlayerPos.x + 1 && position.y === nextPlayerPos.y) {
				if (this.checkLeftEdge(nextPlayerPos.x, nextPlayerPos.y)) {
					moveSet.push({newPosition: {x: position.x - 2, y: position.y}})
				} else {
					if (this.checkTopEdge(nextPlayerPos.x, nextPlayerPos.y)) {
						moveSet.push({newPosition: {x: position.x - 1, y: position.y - 1}})
					}
					if (this.checkBottomEdge(nextPlayerPos.x, nextPlayerPos.y)) {
						moveSet.push({newPosition: {x: position.x - 1, y: position.y + 1}})
					}
				}
			} else {
				moveSet.push({newPosition: {x: position.x - 1, y: position.y}})
			}
		}

		if (this.checkBottomEdge(position.x, position.y)) {
			if (position.x === nextPlayerPos.x && position.y === (nextPlayerPos.y - 1)) {
				if (this.checkBottomEdge(nextPlayerPos.x, nextPlayerPos.y)) {
					moveSet.push({newPosition: {x: position.x, y: position.y + 2}})
				} else {
					if (this.checkLeftEdge(nextPlayerPos.x, nextPlayerPos.y)) {
						moveSet.push({newPosition: {x: position.x - 1, y: position.y + 1}})
					}
					if (this.checkRightEdge(nextPlayerPos.x, nextPlayerPos.y)) {
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
		const stateSize = this.gridWidth * 2 - 1 // or rather, state width, that's why we do -1
		// it's really hard to initialize 2d array in js
		const state = new Array(stateSize).fill(0).map(() => new Array(stateSize).fill("0"))

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