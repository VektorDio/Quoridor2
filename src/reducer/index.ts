import { Action, ActionTypes } from './type';
import { isPlayerMove, Move } from '../model/Move.ts';
import Game from '../model/Game.ts';
import { deepCopy } from '../utils';
import { Bounce, toast } from 'react-toastify';

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
	try {
		return actionFunction(state, action.value)

	} catch (e: any) {
		toast.error(e?.message, {
			position: 'bottom-right',
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: 'dark',
			transition: Bounce
		});
		console.log(e)
		return state
	}
}
