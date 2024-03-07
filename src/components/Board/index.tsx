import React, { useContext, useMemo } from 'react';
import Cell from '../Cell';
import { GameContext } from '../../App.tsx';
import { MoveWall, isPlayerMove } from '../../model/Move.ts';

interface IBoard {
	board: string[][];
}

const Board: React.FC<IBoard> = ({ board }) => {
	const { state } = useContext(GameContext);
	const wallHistory: Array<MoveWall> = useMemo(
		() => state.moveHistory.filter(move => !isPlayerMove(move)) as Array<MoveWall>,
		[JSON.stringify(state.moveHistory)]
	);

	const isWallExist = (history: Array<MoveWall>, wall: string) => {
		return !!history.find(wallMove => wallMove.position === wall);
	};

	const playersPos = useMemo(() => {
		return state.players.map((player, index) => ({ index, position: player.position }));
	}, [JSON.stringify(state.players)]);

	const possibleMoves = useMemo(() => {
		return state.possiblePlayerMoves();
	}, [JSON.stringify(state.moveHistory)]);

	const renderCell = (x: number, y: number): React.ReactNode => {
		const playerIndex: number | undefined = playersPos.find(
			player => player.position.x === x && player.position.y === y
		)?.index;

		const hWallPlaced = isWallExist(wallHistory, `${x}${y}h`);
		const vWallPlaced = isWallExist(wallHistory, `${x}${y}v`);
		const isPossibleMove = !!possibleMoves.find(move => move.newPosition.x === x && move.newPosition.y === y);

		const props = {
			key: `${x}-${y}`,
			x,
			y,
			hWallPlaced,
			vWallPlaced,
			playerIndex,
			isPossibleMove
		};

		return <Cell {...props} />;
	};

	return (
		<div className="flex flex-wrap w-[675px] h-full min-h-full">
			{board.map((row, idx) => {
				return (
					<React.Fragment key={idx}>
						{row.map((_, idy) => {
							return renderCell(idy, idx);
						})}
					</React.Fragment>
				);
			})}
		</div>
	);
};

export default Board;
