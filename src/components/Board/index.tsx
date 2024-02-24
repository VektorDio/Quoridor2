import React, { useContext } from 'react';
import Cell from '../Cell';
import { GameContext } from '../../App.tsx';

interface IBoard {
	board: string[][];
}

const Board: React.FC<IBoard> = ({ board }) => {
	const { state } = useContext(GameContext);

	const renderCell = (x: number, y: number): React.ReactNode => {

		const isOccupied: boolean = !!(state.players.filter(player => {
			return player.position.x === x && player.position.y === y;
		}).length)

		return <Cell key={`${x}-${y}`} x={y} y={x} isOccupied={isOccupied} ></Cell>
	}

	return (
		<div className='flex flex-wrap w-[675px] h-full min-h-full'>
			{board.map((row, idx) => {
				return (<React.Fragment key={idx}>
					{row.map((_, idy) => {
						return renderCell(idy, idx)
					})}
				</React.Fragment>);
			})}
		</div>
	);
};

export default Board;
