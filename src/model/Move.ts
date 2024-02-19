export type MovePlayer = {
	newX: number,
	newY: number
	previousX?: number,
	previousY?: number
}

export type MoveWall = {
	position: string,
	removedWalls: [string],
}

export type Move = MovePlayer | MoveWall

export const isPlayerMove = (move: Move) : move is MovePlayer => {
	return (move as MovePlayer).newX !== undefined
}

