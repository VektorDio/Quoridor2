import Model from "./Model.ts";
import {isPlayerMove, Move, MovePlayer, MoveWall} from "./Move.ts";
import {Player} from "./Player.ts";

export default class Game implements Model{
	gridEdges = new Set<number>();
	moveHistory: Move[] = [];
	playerToMakeMove= 0; // counter mod amount of player
	players= [{x: 5, y: 0, walls: 10}, {x: 8, y: 5, walls: 10}];
	wallsAvailable = new Set<string>();
	gridWidth = 9;

	executeMove(move: Move): void {
		if (isPlayerMove(move)) {
			this.executePlayerMove(move)
		} else {
			this.executeWallMove(move)
		}

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
		currentPlayer.walls =- 1
		this.wallsAvailable.delete(move.position)
		const wall: string[] = move.position.split("")
		const x = parseInt(wall[0])
		const y = parseInt(wall[1])

		let wall1, wall2, wall3, firstEdge, secondEdge

		if (wall[3] === "h") {
			wall1 = "".concat(String((x + 1)), String(y), "h")
			wall2 = "".concat(String((x - 1)), String(y), "h")
			wall3 = "".concat(String((x)), String(y), "v")

			firstEdge = x + ((y - 1) * this.gridWidth)
			secondEdge = (x + 1) + ((y - 1) * this.gridWidth)
		} else {
			wall1 = "".concat(String((x)), String(y + 1), "v")
			wall2 = "".concat(String((x)), String(y - 1), "v")
			wall3 = "".concat(String((x)), String(y), "h")

			firstEdge = x + (y * this.gridWidth)
			secondEdge = x + ((y - 2) * this.gridWidth)
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
		this.playerToMakeMove = this.playerToMakeMove === 0 ? 1 : 0
		const currentPlayer = this.getCurrentPlayer()

		if (lastMove !== undefined) {
			if (isPlayerMove(lastMove)) {
				if (lastMove.previousX != null && lastMove.previousY != null) {
					currentPlayer.x = lastMove.previousX
					currentPlayer.y = lastMove.previousY
				}
			} else {
				lastMove.removedWalls.forEach(e => this.wallsAvailable.add(e))
				const wall: string[] = lastMove.position.split("")
				const x = parseInt(wall[0])
				const y = parseInt(wall[1])

				let firstEdge, secondEdge
				if (wall[3] === "h") {
					firstEdge = x + ((y - 1) * this.gridWidth)
					secondEdge = (x + 1) + ((y - 1) * this.gridWidth)
				} else {
					firstEdge = x + (y * this.gridWidth)
					secondEdge = x + ((y - 2) * this.gridWidth)
				}

				this.gridEdges.add(firstEdge)
				this.gridEdges.add(secondEdge)
			}
		}
	}

	getCurrentPlayer(): Player{
		return this.players[this.playerToMakeMove]
	}

	checkLeftEdge(nodeX: number, nodeY: number): boolean {
		const edge = (nodeX - 1) + (nodeY * this.gridWidth)
		return this.gridEdges.has(edge)
	}

	checkRightEdge(nodeX: number, nodeY: number): boolean {
		const edge = nodeX + (nodeY * this.gridWidth)
		return this.gridEdges.has(edge)
	}

	checkBottomEdge(nodeX: number, nodeY: number): boolean {
		const edge = nodeX + ((nodeY + 1) * this.gridWidth)
		return this.gridEdges.has(edge)
	}

	checkUpperEdge(nodeX: number, nodeY: number): boolean {
		const edge = nodeX + ((nodeY - 1) * this.gridWidth)
		return this.gridEdges.has(edge)
	}

	initializeEdges(): void {
		for (let i = 0; i < (this.gridWidth * (this.gridWidth - 1) * 2); i++) {
			const x = i % this.gridWidth
			const y = (i - x) / this.gridWidth

			const redundantEdge = (y % 2 == 0) && (x == (this.gridWidth - 1))

			if (!redundantEdge) {
				this.gridEdges.add(i)
			}
		}
	}
	
	testFunction() {
		//const currentPlayer = this.getCurrentPlayer()
		// const direction:
		// 		"right" | "up" | "down" | "left" |
		// 		"jumpUp" | "jumpLeft" | "jumpRight" | "jumpDown" |
		// 		"jumpUpRight" | "jumpUpLeft" |
		// 		"jumpDownRight" | "jumpDownLeft" |
		// 		"jumpLeftDown" | "jumpLeftUp" |
		// 		"jumpRightDown" | "jumpRightUp" = null
		//
		// switch (direction) {
		// 	case "down":
		// 		if (this.checkBottomEdge(currentPlayer.x, currentPlayer.y)) {
		// 			currentPlayer.y += 1
		// 		}
		// 		break
		// 	case "up":
		// 		if (this.checkUpperEdge(currentPlayer.x, currentPlayer.y)) {
		// 			currentPlayer.y -= 1
		// 		}
		// 		break
		// 	case "left":
		// 		if (this.checkLeftEdge(currentPlayer.x, currentPlayer.y)) {
		// 			currentPlayer.x -= 1
		// 		}
		// 		break
		// 	case "right":
		// 		if (this.checkRightEdge(currentPlayer.x, currentPlayer.y)) {
		// 			currentPlayer.x += 1
		// 		}
		// 		break
		// 	case "jumpUp":
		// 		if (this.checkUpperEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkUpperEdge(currentPlayer.x, currentPlayer.y - 1)) {
		// 			currentPlayer.y -= 2
		// 		}
		// 		break
		// 	case "jumpDown":
		// 		if (this.checkBottomEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkBottomEdge(currentPlayer.x, currentPlayer.y + 1)) {
		// 			currentPlayer.y += 2
		// 		}
		// 		break
		// 	case "jumpLeft":
		// 		if (this.checkLeftEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkLeftEdge(currentPlayer.x - 1, currentPlayer.y)) {
		// 			currentPlayer.x -= 2
		// 		}
		// 		break
		// 	case "jumpRight":
		// 		if (this.checkRightEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkRightEdge(currentPlayer.x + 1, currentPlayer.y)) {
		// 			currentPlayer.x += 2
		// 		}
		// 		break
		// 	case "jumpUpLeft":
		// 		if (this.checkUpperEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkLeftEdge(currentPlayer.x, currentPlayer.y - 1)) {
		// 			currentPlayer.x -= 1
		// 			currentPlayer.y -= 1
		// 		}
		// 		break
		// 	case "jumpUpRight":
		// 		if (this.checkUpperEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkRightEdge(currentPlayer.x, currentPlayer.y - 1)) {
		// 			currentPlayer.x += 1
		// 			currentPlayer.y -= 1
		// 		}
		// 		break
		// 	case "jumpDownLeft":
		// 		if (this.checkBottomEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkLeftEdge(currentPlayer.x, currentPlayer.y + 1)) {
		// 			currentPlayer.x -= 1
		// 			currentPlayer.y += 1
		// 		}
		// 		break
		// 	case "jumpDownRight":
		// 		if (this.checkBottomEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkRightEdge(currentPlayer.x, currentPlayer.y + 1)) {
		// 			currentPlayer.x += 1
		// 			currentPlayer.y += 1
		// 		}
		// 		break
		// 	case "jumpLeftUp":
		// 		if (this.checkLeftEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkUpperEdge(currentPlayer.x - 1, currentPlayer.y)) {
		// 			currentPlayer.x -= 1
		// 			currentPlayer.y -= 1
		// 		}
		// 		break
		// 	case "jumpLeftDown":
		// 		if (this.checkLeftEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkBottomEdge(currentPlayer.x - 1, currentPlayer.y)) {
		// 			currentPlayer.x -= 1
		// 			currentPlayer.y += 1
		// 		}
		// 		break
		// 	case "jumpRightUp":
		// 		if (this.checkRightEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkUpperEdge(currentPlayer.x + 1, currentPlayer.y)) {
		// 			currentPlayer.x += 1
		// 			currentPlayer.y -= 1
		// 		}
		// 		break
		// 	case "jumpRightDown":
		// 		if (this.checkRightEdge(currentPlayer.x, currentPlayer.y) &&
		// 			this.checkBottomEdge(currentPlayer.x + 1, currentPlayer.y)) {
		// 			currentPlayer.x += 1
		// 			currentPlayer.y += 1
		// 		}
		// 		break
		// }
	}
}
