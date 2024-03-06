import { Move } from "./Move.ts";
import { Player } from "./Player.ts";

export default interface Model {
    gridEdges: Set<number>;
    wallsAvailable: Set<string>;
    moveHistory: Move[];
    playerIndex: number;
    gridWidth: number;
    players: Player[];

    executeMove(move: Move): void;
    undoLastMove(): void;

}


