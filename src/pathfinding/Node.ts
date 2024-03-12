export default class Node {
	x: number
	y: number
    
	constructor(x: number, y: number,
				public g = 0,
				public h = 0,
				public f = 0,
				public visited= false,
				public closed = false,
				public parent: Node | null = null
	) {
		this.x = x;
		this.y = y;
	}
}