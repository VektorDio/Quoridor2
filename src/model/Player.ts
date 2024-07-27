import {Cell} from "./Cell.ts";

export type Player = {
	position: Cell,
	walls: number;
	goal: Set<string>; // format - "xy"
}
