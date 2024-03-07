import './App.css';
import Game from './model/Game.ts';
import Board from './components/Board';
import React, { createContext, useMemo, useReducer } from 'react';
import { reducer } from './reducer';
import { Action } from './reducer/type';

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
				<div className="flex justify-center items-center">
					<Board board={Array(state.gridWidth).fill(Array(state.gridWidth).fill('0'))}></Board>
				</div>
			</GameContext.Provider>
		);
	}, [JSON.stringify(state.moveHistory), JSON.stringify(state.showGameState())]);
}

export default App;
