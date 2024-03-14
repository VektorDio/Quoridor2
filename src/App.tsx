import './App.css';
import Game from './model/Game.ts';
import Board from './components/Board';
import React, { createContext, useMemo, useReducer } from 'react';
import { reducer } from './reducer';
import { Action } from './reducer/type';
import PlayerCard from './components/PlayerCard/index.tsx';
import { getColor } from './utils';

export interface Context {
	state: Game;
	dispatch: React.Dispatch<Action>;
}

const game = new Game();

export const GameContext = createContext<Context>({
	state: {} as Game,
	dispatch: () => {}
});


function App() {
	const [state, dispatch] = useReducer(reducer, game);

	return useMemo(() => {
		return (
			<GameContext.Provider value={{ state, dispatch }}>
				<div className="flex flex-nowrap items-end justify-between">
					<div className="main-col w-1/4 text-center">
						{state.players.map((player, idx) => {
							return (
								<PlayerCard
									color={getColor(idx)}
									wallsAmount={player.walls}
									isTurn={player === state.getCurrentPlayer()}
								/>
							);
						})}
					</div>
					<Board board={Array(state.gridWidth).fill(Array(state.gridWidth).fill('0'))}></Board>
					<div className="main-col w-1/4"></div>
				</div>
			</GameContext.Provider>
		);
	}, [JSON.stringify(state.moveHistory)]);
}

export default App;
