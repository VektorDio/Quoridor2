import Board from '../components/Board';
import React, { useMemo } from 'react';
import PlayerCard from '../components/PlayerCard/index.tsx';
import { getColor } from '../utils';
import { AppState, GameContext } from '../App.tsx';
import { Action } from '../reducer/type';

type Props = {
	state: AppState;
	dispatch: React.Dispatch<Action>;
};

function GameBoard({ state, dispatch }: Props) {
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
					<Board board={Array(state.game.gridWidth).fill(Array(state.game.gridWidth).fill('0'))} />
					<div className="main-col w-1/4"></div>
				</div>
			</GameContext.Provider>
		);
	}, [JSON.stringify(state.game.moveHistory)]);
}

export default GameBoard;
