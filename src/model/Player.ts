import {Cell} from "./Cell.ts";

export type Player = {
	position: Cell,
	walls: number;
	goal: Cell[];
	goalStr: Set<string>;
}
