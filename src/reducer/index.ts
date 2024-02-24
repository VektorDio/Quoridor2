import { Action, ActionTypes } from './type';
import Model from '../model/Model.ts';
import { isPlayerMove, Move } from '../model/Move.ts';

const ACTIONS: Record<ActionTypes, (state: Model, value: Move) => any> = {
	MOVE_PLAYER: (state, value) => {
		if(isPlayerMove(value)) {
			const { newPosition, previousPosition } = value
			state.executeMove({ previousPosition, newPosition })
			return state
		}
	},
	PLACE_WALL: (state, value) => {
		if(!isPlayerMove(value)) {
			const { position } = value
			state.executeMove({ position, removedWalls: [] })
			return state
		}
	},
	UNDO_MOVE: state => {
		state.undoLastMove()
		return state
	}
}

export const reducer = (state: Model, action: Action) => {
	const actionFunction = ACTIONS[action.type]
	return actionFunction(state, action.value)
}
