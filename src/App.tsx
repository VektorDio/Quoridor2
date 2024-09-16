import React, { createContext, useReducer, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChessBoard, faShareNodes } from '@fortawesome/free-solid-svg-icons';

import './App.css';
import TreeCanvas from './components/TreeBuilder';
import Game from './model/Game';
import { TreeNode } from './bots/PVS';
import { Action } from './reducer/type';
import { reducer } from './reducer';
import GameBoard from './pages/gameboard.tsx';

export interface AppState {
	game: Game;
	rootNode?: TreeNode;
}

export interface AppContext {
	state: AppState;
	dispatch: React.Dispatch<Action>;
}

const game = new Game();

export const GameContext = createContext<AppContext>({
	state: {} as AppState,
	dispatch: () => {}
});

function App() {
	const [isBoardVisible, setIsBoardVisible] = useState(true);
	const [appState, dispatch] = useReducer(reducer, { game, rootNode: undefined });

	const toggleView = () => setIsBoardVisible(prev => !prev);

	return (
		<div className={isBoardVisible ? 'boardRoot' : 'visualizerRoot'}>
			{appState.rootNode && (
				<button className="absolute p-2 z-10 left-4 top-4 bg-gray-500 rounded w-16 h-16" onClick={toggleView}>
					<FontAwesomeIcon icon={isBoardVisible ? faShareNodes : faChessBoard} size="3x" />
				</button>
			)}

			{isBoardVisible ? (
				<GameBoard dispatch={dispatch} state={appState} />
			) : (
				appState.rootNode && <TreeCanvas rootNode={appState.rootNode} color={1} />
			)}
		</div>
	);
}

export default App;
