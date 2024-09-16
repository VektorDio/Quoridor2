import React, { useState, useRef, useEffect, useCallback } from 'react';
import './treeBuilder.css';
import { TreeNode } from '../../bots/PVS.ts';

type Props = { rootNode: TreeNode; color: 1 | -1 };

const TreeBuilder: React.FC<Props> = ({ rootNode, color }) => {
	const [currentNode, setCurrentNode] = useState(rootNode);
	const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
	const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

	const handleClick = (node: TreeNode) => setCurrentNode(node);

	const calculateLinePositions = useCallback(() => {
		const parentEl = nodeRefs.current[0];
		const containerRect = document.querySelector('.tree-container')?.getBoundingClientRect();
		if (!parentEl || !containerRect) return;

		const {
			left: parentLeft,
			top: parentTop,
			width: parentWidth,
			height: parentHeight
		} = parentEl.getBoundingClientRect();
		const parentCenterX = parentLeft - containerRect.left + parentWidth / 2;
		const parentBottomY = parentTop - containerRect.top + parentHeight;

		const newLines = currentNode.children
			.map((_, i) => {
				const childEl = nodeRefs.current[i + 1];
				if (!childEl) return null;

				const { left: childLeft, top: childTop, width: childWidth } = childEl.getBoundingClientRect();
				return {
					x1: parentCenterX,
					y1: parentBottomY,
					x2: childLeft - containerRect.left + childWidth / 2,
					y2: childTop - containerRect.top
				};
			})
			.filter(Boolean);

		setLines(newLines as { x1: number; y1: number; x2: number; y2: number }[]);
	}, [currentNode]);

	useEffect(() => {
		let highlightIndex: number | null = null;
		if (currentNode.children.length > 0) {
			const isEvenDepth = currentNode.depth % 2 === 0;
			const targetScore =
				color === 1
					? (isEvenDepth ? Math.min : Math.max)(...currentNode.children.map(child => child.score))
					: (isEvenDepth ? Math.max : Math.min)(...currentNode.children.map(child => child.score));

			highlightIndex = currentNode.children.findIndex(child => child.score === targetScore);
		}
		setHighlightedIndex(highlightIndex);
	}, [currentNode, color]);

	useEffect(() => {
		nodeRefs.current[0]?.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
	}, [currentNode]);

	useEffect(calculateLinePositions, [currentNode, calculateLinePositions]);

	const getContainerWidth = () => {
		const childCount = currentNode.children.length;
		if (childCount > 140) return '32000px';
		if (childCount > 70) return '16000px';
		if (childCount > 10) return '8000px';
		return '100vw';
	};

	const highlightNode = (index: number) => (index === highlightedIndex ? 'selected-node' : '');

	return (
		<div className="tree-container" style={{ width: getContainerWidth() }}>
			<svg className="svg-lines">
				{lines.map((line, i) => (
					<line
						key={i}
						x1={line.x1}
						y1={line.y1}
						x2={line.x2}
						y2={line.y2}
						stroke={highlightedIndex === i ? 'green' : '#000'}
						strokeWidth={highlightedIndex === i ? '3' : '1'}
					/>
				))}
			</svg>

			<div
				className={`node parent ${currentNode === rootNode ? 'root-node' : ''}`}
				ref={el => (nodeRefs.current[0] = el)}
				onClick={() => currentNode.parent && handleClick(currentNode.parent)}
			>
				<div className="content">
					<p>S: {currentNode.score}</p>
					<p>M: {currentNode.move || ''}</p>
					<div className="top-right">{currentNode.depth}</div>
					<div className="bottom-right">{currentNode.children.length}</div>
				</div>
			</div>

			<div className="children">
				{currentNode.children.map((child, i) => (
					<div
						key={i}
						className={`node child ${highlightNode(i)}`}
						ref={el => (nodeRefs.current[i + 1] = el)}
						onClick={child.children.length > 0 ? () => handleClick(child) : undefined}
					>
						<div className="content">
							<p>S: {child.score}</p>
							<p>M: {child.move || ''}</p>
							<div className="top-right">{child.depth}</div>
							<div className="bottom-right">{child.children.length}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default TreeBuilder;
