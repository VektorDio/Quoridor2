import React, { useState, useRef, useEffect } from 'react';
import './treeBuilder.css';
import { TreeNode } from '../../bots/PVS.ts';

type Props = {
	rootNode: TreeNode;
};

const TreeBuilder: React.FC<Props> = ({ rootNode }) => {
	const [currentNode, setCurrentNode] = useState<TreeNode>(rootNode);
	const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

	const handleClick = (node: TreeNode) => {
		setCurrentNode(node);
	};

	// Function to calculate line positions between parent and children
	const calculateLinePositions = () => {
		const parentEl = nodeRefs.current[0]; // Parent node
		const containerEl = document.querySelector('.tree-container'); // Container

		if (!parentEl || !containerEl) return;

		const containerRect = containerEl.getBoundingClientRect();
		const parentRect = parentEl.getBoundingClientRect();

		// Calculate parent center point relative to the container
		const parentCenterX = parentRect.left - containerRect.left + parentRect.width / 2;
		const parentBottomY = parentRect.top - containerRect.top + parentRect.height;

		const newLines = currentNode.children.map((_child, index) => {
			const childEl = nodeRefs.current[index + 1]; // Child node
			if (!childEl) return null;

			const childRect = childEl.getBoundingClientRect();

			// Calculate child center point relative to the container
			const childCenterX = childRect.left - containerRect.left + childRect.width / 2;
			const childTopY = childRect.top - containerRect.top;

			return {
				x1: parentCenterX,
				y1: parentBottomY,
				x2: childCenterX,
				y2: childTopY
			};
		});

		setLines(newLines as { x1: number; y1: number; x2: number; y2: number }[]);
	};

	useEffect(() => {
		const parentEl = nodeRefs.current[0]; // Parent node
		if (parentEl) {
			parentEl.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center'
			});
		}
	}, [currentNode]);

	// Recalculate lines and center the viewport whenever the currentNode changes
	useEffect(() => {
		calculateLinePositions();
	}, [currentNode]);

	return (
		<div className="tree-container">
			<svg className="svg-lines">
				{lines.map((line, index) => (
					<line
						key={index}
						x1={line.x1}
						y1={line.y1}
						x2={line.x2}
						y2={line.y2}
						stroke="#000"
						strokeWidth="3"
					/>
				))}
			</svg>

			<div
				className="node parent"
				ref={el => (nodeRefs.current[0] = el)}
				onClick={() => currentNode.parent && handleClick(currentNode.parent)}
			>
				<div className="content">
					<p>S: {currentNode.score}</p>
					<p>M: {currentNode.move || ''}</p>
				</div>
			</div>

			<div className="children">
				{currentNode.children.map((child, index) => (
					<div
						key={index}
						className="node child"
						ref={el => (nodeRefs.current[index + 1] = el)}
						onClick={() => handleClick(child)}
					>
						<div className="content">
							<p>S: {child.score}</p>
							<p>M: {child.move || ''}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default TreeBuilder;
