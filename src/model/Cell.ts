export type Cell = {
    x: number,
    y: number
}

export function areCellsEqual(node1: Cell, node2: Cell):boolean {
	return node1.x === node2.x && node1.y === node2.y
}