import React, { useContext, useMemo } from 'react';
import './index.scss';
import { GameContext } from '../../App';
import { Orientation } from '../../model/Wall';
import { getColor } from '../../utils';

interface ICellProps {
	x: number;
	y: number;
	vWallPlaced: boolean;
	hWallPlaced: boolean;
	playerIndex?: number;
	isPossibleMove: boolean;
}

const Cell: React.FC<ICellProps> = props => {
	const { x, vWallPlaced, hWallPlaced, y, playerIndex, isPossibleMove } = props;
	const { state, dispatch } = useContext(GameContext);

	const [isVWallAvailable, isHWallAvailable] = useMemo(() => {
		return [state.wallsAvailable.has(`${x}${y}v`), state.wallsAvailable.has(`${x}${y}h`)];
	}, [JSON.stringify([...state.wallsAvailable])]);

	const placeWall = (e: React.MouseEvent<HTMLElement>, xPos: number, yPos: number, orientation: Orientation) => {
		e.preventDefault();
		e.stopPropagation();
		if (orientation === Orientation.Horizontal && isHWallAvailable) {
			dispatch({ type: 'PLACE_WALL', value: { position: `${xPos}${yPos}${orientation}`, removedWalls: [] } });
		}
		if (orientation === Orientation.Vertical && isVWallAvailable) {
			dispatch({ type: 'PLACE_WALL', value: { position: `${xPos}${yPos}${orientation}`, removedWalls: [] } });
		}
	};

	const movePlayer = (e: React.MouseEvent<HTMLElement>, xPos: number, yPos: number) => {
		e.preventDefault();
		e.stopPropagation();
		if (isPossibleMove) {
			const { position } = state.getCurrentPlayer();
			dispatch({ type: 'MOVE_PLAYER', value: { newPosition: { x: xPos, y: yPos }, previousPosition: position } });
		}
	};

	return (
		<div
			onClick={e => movePlayer(e, x, y)}
			className={`cell size-[55px]  m-[10px] relative ${isPossibleMove ? 'bg-emerald-900' : 'bg-slate-500'} ${x} ${y}`}
		>
			<div
				onClick={e => placeWall(e, x, y, Orientation.Horizontal)}
				className={`absolute
				w-[240%]
				h-1/5
				mt-[4.5px]
				top-full
				z-10
				rounded
				opacity-0
				bg-zinc-300
				${hWallPlaced ? 'opacity-100' : 'opacity-0'}
				${isHWallAvailable ? 'hover:opacity-100' : ''}`}
			/>
			<div
				onClick={e => placeWall(e, x, y, Orientation.Vertical)}
				className={`absolute
				w-1/5
				h-[240%]
				ml-[4.5px]
				left-full
				z-10
				rounded
				opacity-0
				bg-zinc-300
				${vWallPlaced ? 'opacity-100' : 'opacity-0'}
				${isVWallAvailable ? 'hover:opacity-100' : ''}`}
			/>
			<div className={`rounded-full size-10	${Number.isInteger(playerIndex) ? getColor(playerIndex) : ''}`} />
		</div>
	);
};

export default Cell;
