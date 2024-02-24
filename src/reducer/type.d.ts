import { Move } from '../model/Move.ts';

export type ActionTypes = 'MOVE_PLAYER' | 'PLACE_WALL' | 'UNDO_MOVE'


export interface Action {
	type: ActionTypes,
	value: Move
}
