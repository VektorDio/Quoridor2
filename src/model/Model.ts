import { Move } from "./Move.ts";
import { Player } from "./Player.ts";

export default interface Model {
    players: Player[];
    playerToMakeMove: number;
    wallsAvailable: Set<string>;
    gridEdges: Set<number>;
    gridWidth: number;

    executeMove(move: Move): void;
    undoLastMove(): void;
    moveHistory: Move[];
}


