import {Cell} from "./Cell.ts";

export type Wall = {
    position: Cell,
    orientation: Orientation
}

export enum Orientation {
    Horizontal = "h",
    Vertical = "v"
}

export function wallFromString(wall: string): Wall {
	const decodedPosition = wall.split("")
	//const orientation = decodedPosition[2] === "h" ? Orientation.Horizontal : Orientation.Vertical
	return {position: {x: parseInt(decodedPosition[0]), y: parseInt(decodedPosition[1])}, orientation: decodedPosition[2] as Orientation }
}

export function wallToString(wall: Wall): string {
	return "".concat(String(wall.position.x), String(wall.position.y), wall.orientation)
}