import './App.css';
import GameBoard from './pages/gameboard.tsx';
import TreeCanvas from './components/TreeBuilder';
import React, { createContext, useReducer, useState } from 'react';
import Game from './model/Game.ts';
import { TreeNode } from './bots/PVS.ts';
import { Action } from './reducer/type';
import { reducer } from './reducer';

export interface AppState {
	game: Game;
	rootNode?: TreeNode;
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

function App() {
	const [showBoard, setShowBoard] = useState(true);
	const [appState, dispatch] = useReducer(reducer, { game, rootNode: undefined });

	return (
		<div className={showBoard ? 'boardRoot' : 'visualizerRoot'}>
			<button
				className="absolute p-4 z-10 left-4 top-4 bg-gray-500 rounded"
				onClick={() => setShowBoard(prev => !prev)}
			>
				Change
			</button>
			{showBoard ? (
				<GameBoard dispatch={dispatch} state={appState} />
			) : (
				appState.rootNode && <TreeCanvas rootNode={appState.rootNode} />
			)}
		</div>
	);
}

export default App;
