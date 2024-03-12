import './App.css';
import Game from './model/Game.ts';
import Board from './components/Board';
import React, { createContext, useMemo, useReducer } from 'react';
import { reducer } from './reducer';
import { Action } from './reducer/type';
import PlayerCard from './components/PlayerCard/index.tsx';
import { getColor } from './utils/index.ts';

export interface Context {
	state: Game;
	dispatch: React.Dispatch<Action>;
}

const game = new Game();

export const GameContext = createContext<Context>({
	state: {} as Game,
	dispatch: () => {}
});

import jps from "./pathfinding/JPS.ts";
import aStar from "./pathfinding/AStar.ts";

function App() {
	const [state, dispatch] = useReducer(reducer, game);

	return useMemo(() => {
		return (
			<GameContext.Provider value={{ state, dispatch }}>
				<div className="flex flex-nowrap items-end">
					<div className="grow main-col text-center">
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
					<div className="flex justify-center  items-center">
						<Board board={Array(state.gridWidth).fill(Array(state.gridWidth).fill('0'))}></Board>
					</div>
					<div className="main-col"></div>
				</div>
			</GameContext.Provider>
		);
	}, [JSON.stringify(state.moveHistory), JSON.stringify(state.showGameState())]);
}

export default App;
