import React, { useContext, useMemo } from 'react';
import { GameContext } from '../../App';
import { Orientation } from '../../model/Wall';
import { getColor } from '../../utils';
import './index.scss';

interface ICellProps {
	x: number;
	y: number;
	vWallPlaced: boolean;
	hWallPlaced: boolean;
	playerIndex?: number;
	isPossibleMove: boolean;
}

interface IWallProps {
	orientation: Orientation;
	position: string;
	isPlaced: boolean;
	isAvailable: boolean;
}

const Wall: React.FC<IWallProps> = ({ orientation, position, isPlaced, isAvailable }) => {
	const { dispatch } = useContext(GameContext);

	const styles: Record<Orientation, string> = {
		[Orientation.Horizontal]: `w-[240%] h-1/5 mt-[4.5px]`,
		[Orientation.Vertical]: `w-1/5 h-[240%] left-full top-0 ml-[4.5px]`
	};

	const placeWall = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (isAvailable) {
			dispatch({ type: 'PLACE_WALL', value: { position, removedWalls: [] } });
		}
	};

	return (
		<div
			onClick={e => placeWall(e)}
			className={`
			  absolute top-full z-10 rounded opacity-0 bg-zinc-300
				${styles[orientation]}
				${isPlaced ? 'opacity-100' : 'opacity-0'}
				${isAvailable ? 'hover:opacity-100' : ''}`}
		/>
	);
};

const Cell: React.FC<ICellProps> = props => {
	const { x, vWallPlaced, hWallPlaced, y, playerIndex, isPossibleMove } = props;
	const { state, dispatch } = useContext(GameContext);

	const [isVWallAvailable, isHWallAvailable] = useMemo(() => {
		return [state.wallsAvailable.has(`${x}${y}v`), state.wallsAvailable.has(`${x}${y}h`)];
	}, [JSON.stringify([...state.wallsAvailable])]);

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
			className={`cell flex size-[55px] m-[10px] relative ${isPossibleMove ? 'bg-emerald-900' : 'bg-slate-500'}`}
		>
			<Wall
				orientation={Orientation.Horizontal}
				position={`${x}${y}h`}
				isPlaced={hWallPlaced}
				isAvailable={isHWallAvailable}
			/>
			<Wall
				orientation={Orientation.Vertical}
				position={`${x}${y}v`}
				isPlaced={vWallPlaced}
				isAvailable={isVWallAvailable}
			/>
			{Number.isInteger(playerIndex) ? (
				<div className={`rounded-full size-10 m-auto	 ${getColor(playerIndex)}`} />
			) : null}
		</div>
	);
};

export default Cell;
