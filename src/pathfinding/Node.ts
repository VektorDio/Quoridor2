export default class Node {
	x: number
	y: number
	f: number
	g: number
	h: number
	visited: boolean
	closed: boolean
    
	constructor(x: number, y: number, g?: number, h?: number, visited?: boolean, closed?: boolean) {
		this.x = x;
		this.y = y;
		this.g = g || 0;
		this.h = h || 0;
		this.f = this.g + this.h
		this.visited = visited || false
		this.closed = closed || false
	}
}