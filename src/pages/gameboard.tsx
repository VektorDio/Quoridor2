import Game from '../model/Game.ts';
import Board from '../components/Board';
import React, { createContext, useEffect, useMemo, useReducer } from 'react';
import { reducer } from '../reducer';
import { Action } from '../reducer/type';
import PlayerCard from '../components/PlayerCard/index.tsx';
import { getColor } from '../utils';
import { TreeNode } from '../bots/PVS.ts';

export interface AppState {
	game: Game;
	rootNode: TreeNode[];
}

export interface Context {
	state: AppState;
	dispatch: React.Dispatch<Action>;
}

const game = new Game();

export const GameContext = createContext<Context>({
	state: {} as AppState,
	dispatch: () => {}
});

function GameBoard({ setBotState }) {
	const [state, dispatch] = useReducer(reducer, { game, rootNode: [] });

	useEffect(() => {
		setBotState(state.rootNode);
	}, [state.rootNode]);

	return useMemo(() => {
		return (
			<GameContext.Provider value={{ state, dispatch }}>
				<div className="flex flex-nowrap items-end justify-between">
					<div className="main-col w-1/4 text-center">
						{state.game.players.map((player, idx) => {
							return (
								<PlayerCard
									color={getColor(idx)}
									wallsAmount={player.walls}
									key={idx}
									isTurn={player === state.game.getCurrentPlayer()}
								/>
							);
						})}
					</div>
					<Board board={Array(state.game.gridWidth).fill(Array(state.game.gridWidth).fill('0'))}></Board>
					<div className="main-col w-1/4"></div>
				</div>
			</GameContext.Provider>
		);
	}, [JSON.stringify(state.game.moveHistory)]);
}

export default GameBoard;
