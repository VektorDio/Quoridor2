import { useEffect, useRef, useState } from 'react';

type TreeNode = {
	depth: number;
	score: number;
	move: string | undefined;
	children: TreeNode[];
};

const NODE_RADIUS = 25;
const VERTICAL_GAP = 400;
const HORIZONTAL_GAP = 55;

function TreeCanvas({ rootNode }: { rootNode: TreeNode }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [start, setStart] = useState({ x: 0, y: 0 });

	let lastDepthNodeX: number = 10;
	const maxDepth = rootNode.depth;

	function drawTree(
		ctx: CanvasRenderingContext2D,
		node: TreeNode,
		offsetX: number,
		offsetY: number
	): [number, number] {
		if (node.children.length > 0) {
			let firstX = 0;
			let lastX = 0;
			const childrenCords: [number, number][] = [];

			for (let i = 0; i < node.children.length; i++) {
				const childCords = drawTree(ctx, node.children[i], offsetX, offsetY);
				childrenCords.push(childCords);

				const [childX] = childCords;

				if (node.children.length >= 2) {
					if (i === 0) {
						firstX = childX;
					} else if (i === node.children.length - 1) {
						lastX = childX;
					}
				} else {
					firstX = childX;
					lastX = firstX;
				}
			}

			const currentX = (firstX + lastX) / 2;
			const currentY = (maxDepth - node.depth) * VERTICAL_GAP;
			drawNode(ctx, currentX + offsetX, currentY + offsetY, `${node.score}`, node.move);

			for (const [childX, childY] of childrenCords) {
				ctx.beginPath();
				ctx.strokeStyle = '#000000';
				ctx.moveTo(childX + offsetX, childY + offsetY - NODE_RADIUS);
				ctx.lineTo(currentX + offsetX, currentY + offsetY + NODE_RADIUS);
				ctx.stroke();
			}

			return [currentX, currentY];
		} else {
			lastDepthNodeX += HORIZONTAL_GAP;
			const x = lastDepthNodeX;
			const y = (maxDepth - node.depth) * VERTICAL_GAP;
			drawNode(ctx, x + offsetX, y + offsetY, node.score + '', node.move);

			return [x, y];
		}
	}

	function drawNode(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		firstText: string,
		secondText: string | undefined
	) {
		ctx.fillStyle = '#3e88a6';
		ctx.beginPath();
		ctx.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
		ctx.fill();
		ctx.strokeStyle = '#000000';
		ctx.stroke();

		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.font = '14px Arial';
		ctx.fillText(firstText, x, y - 5);
		if (secondText) {
			ctx.fillText(secondText, x, y + 13);
		}
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		if (canvas) {
			const ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				drawTree(ctx, rootNode, offset.x, offset.y);
			}
		}
	}, [rootNode, offset]);

	useEffect(() => {
		const handleResize = () => {
			const canvas = canvasRef.current;
			if (canvas) {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}
		};

		handleResize(); // Initial resize
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		setStart({ x: e.clientX, y: e.clientY });
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging) {
			const dx = e.clientX - start.x;
			const dy = e.clientY - start.y;
			setOffset(prevOffset => ({
				x: prevOffset.x + dx,
				y: prevOffset.y + dy
			}));
			setStart({ x: e.clientX, y: e.clientY });
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	return (
		<canvas
			ref={canvasRef}
			width={window.innerWidth}
			height={window.innerHeight}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			style={{
				border: '1px solid black',
				cursor: isDragging ? 'grabbing' : 'grab',
				width: '100lvw',
				height: '100lvh'
			}}
		></canvas>
	);
}

export default TreeCanvas;
