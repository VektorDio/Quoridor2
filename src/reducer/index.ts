import { Action, ActionTypes } from './type';
import { isPlayerMove, Move } from '../model/Move.ts';
import Game from '../model/Game.ts';
import { deepCopy } from '../utils';
import { Bounce, toast } from 'react-toastify';
//import Negamax from '../bots/Negamax.ts';
import pvs from '../bots/PVS.ts';
import { AppState } from '../pages/gameboard.tsx';

const ACTIONS: Record<ActionTypes, (state: Game, value: Move) => any> = {
	MOVE_PLAYER: (state, value) => {
		if (isPlayerMove(value)) {
			const { newPosition, previousPosition } = value;
			state.executeMove({ previousPosition, newPosition });
			return deepCopy(state);
		}
	},
	PLACE_WALL: (state, value) => {
		if (!isPlayerMove(value)) {
			const { position } = value;
			state.executeMove({ position, removedWalls: [] });
			return deepCopy(state);
		}
	},
	UNDO_MOVE: state => {
		state.undoLastMove();
		return deepCopy(state);
	}
};

export const reducer = (state: AppState, action: Action): AppState => {
	const actionFunction = ACTIONS[action.type];
	try {
		const newState = actionFunction(state.game, action.value);

		// console.time()
		// const bot = new Negamax(newState, 2)
		// const botMove = bot.getNextMove()
		// console.timeEnd()

		console.time();
		const botMove = pvs.getNextMove(newState);
		console.timeEnd();

		if (botMove) {
			newState.executeMove(botMove);
		}

		return { game: newState, rootNode: [pvs.rootNode] }; // move to variable
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
		console.log(e?.message);
		return { game: state.game, rootNode: [] };
	}
};
