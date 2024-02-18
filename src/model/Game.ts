import { Cell } from './Cell.ts';
import Player from './PLayer.ts';

export class Game {

	private board: Cell[][];

	private walls: Set<string>;

	private players: Player[];

	constructor() {
		this.board = [];

		this.walls = new Set();

		this.players = [];
	}

	setBoard(board: Cell[][]): void {
		this.board = board;
	}

	getCell(x: number, y: number): Cell {
		return this.board[y][x];
	}

	setWalls(walls: Set<string>): void {
		this.walls = walls;
	}

	getBoard(): Cell[][] {
		return this.board;
	}

	getWalls(): Set<string> {
		return this.walls;
	}
}
