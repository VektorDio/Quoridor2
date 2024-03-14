import { Action, ActionTypes } from './type';
import { isPlayerMove, Move } from '../model/Move.ts';
import Game from '../model/Game.ts';
import { deepCopy } from '../utils';

const ACTIONS: Record<ActionTypes, (state: Game, value: Move) => any> = {
	MOVE_PLAYER: (state, value) => {
		if(isPlayerMove(value)) {
			const { newPosition, previousPosition } = value
			state.executeMove({ previousPosition, newPosition })
			return deepCopy(state)
		}
	},
	PLACE_WALL: (state, value) => {
		if(!isPlayerMove(value)) {
			const { position } = value
			state.executeMove({ position, removedWalls: [] })
			return deepCopy(state)
		}
	},
	UNDO_MOVE: state => {
		state.undoLastMove()
		return deepCopy(state)
	}
}

export const reducer = (state: Game, action: Action): Game => {
	const actionFunction = ACTIONS[action.type]
	return actionFunction(state, action.value)
}
