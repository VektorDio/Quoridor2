import React from 'react';

interface ICellProps {
	x: number,
	y: number,
	isOccupied: boolean
}

const Cell: React.FC<ICellProps> = ({ x, y, isOccupied }) => {
	return (
		<div className={`size-[55px] bg-slate-500 m-[10px] ${x} ${y}`}>
			{isOccupied ? 'x' : ''}
		</div>
	);
};

export default Cell;
