import React from 'react';

interface IPlayerCardProps {
	color: string;
	wallsAmount: number;
	isTurn: boolean;
}

const PlayerCard: React.FC<IPlayerCardProps> = ({ color, wallsAmount, isTurn }) => {
	return (
		<div
			className={`${color} p-9 rounded mb-3 text-gray-500 w-64 font-bold flex flex-col justify-start items-start	`}
		>
			<span className="invert-1">Walls left: {wallsAmount}</span>
			<span className="invert-1">Is player turn: {isTurn ? 'Yes' : 'No'}</span>
		</div>
	);
};

export default PlayerCard;
