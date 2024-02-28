import {Cell} from "./Cell.ts";

export type MovePlayer = {
	newPosition: Cell,
	previousPosition?: Cell
}

export type MoveWall = {
	position: string,
	removedWalls: string[], //?
}

export type Move = MovePlayer | MoveWall

export const isPlayerMove = (move: Move) : move is MovePlayer => {
	return (move as MovePlayer).newPosition !== undefined
}

