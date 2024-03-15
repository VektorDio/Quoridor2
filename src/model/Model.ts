import { Move } from "./Move.ts";
import { Player } from "./Player.ts";
import {Cell} from "./Cell.ts";

export default interface Model {
    players: Player[];
    playerIndex: number;
    wallsAvailable: Set<string>;
    gridEdges: Set<number>;
    gridWidth: number;
    moveHistory: Move[];

    executeMove(move: Move): void;
    undoLastMove(): void;
    getCurrentPlayer(): Player;
    getOtherPlayer(): Player;
    possiblePlayerMoves(): Move[];
    checkWinCondition(playerNode: Cell, playerGoal: Set<string>): boolean;
    checkWalkableLeft(nodeX: number, nodeY: number): boolean;
    checkWalkableRight(nodeX: number, nodeY: number): boolean;
    checkWalkableTop(nodeX: number, nodeY: number): boolean;
    checkWalkableBottom(nodeX: number, nodeY: number): boolean;
}


