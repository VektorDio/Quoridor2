import './App.css'
import Game from "./model/Game.ts";
import Board from './components/Board';
import React, { createContext, useEffect, useReducer } from 'react';
import { reducer } from './reducer';
import Model from './model/Model.ts';
import { Action } from './reducer/type';

export interface Context {
	state: Model,
	dispatch: React.Dispatch<Action>
}

const game = new Game()

export const GameContext = createContext<Context>({
	state: {} as Model,
	dispatch: () => {}
})

function App() {
	const [state, dispatch] = useReducer(reducer, game)

	useEffect(() => {
		const currentPlayer = state.getCurrentPlayer()
		dispatch({ type: 'MOVE_PLAYER', value: {  newPosition: {x: 5, y: 5}, previousPosition: currentPlayer.position }})
	}, [])

	return (
		<GameContext.Provider value={{ state, dispatch }}>
			<div className='flex justify-center items-center'>
				<Board board={Array(state.gridWidth).fill(Array(state.gridWidth).fill('0'))}></Board>
			</div>
		</GameContext.Provider>
	)
}

export default App
