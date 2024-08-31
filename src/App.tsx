import './App.css';
import GameBoard from './pages/gameboard.tsx';
import TreeCanvas from './components/TreeBuilder';
import { useState } from 'react';

function App() {
	const [showBoard, setShowBoard] = useState(true);
	const [botState, setBotState] = useState([]);

	//console.log(state);

	return (
		<div className={showBoard ? 'boardRoot' : 'visualizerRoot'}>
			<button
				className="absolute p-4 z-100 left-4 top-4 bg-gray-500 rounded"
				onClick={() => setShowBoard(prev => !prev)}
			>
				Change
			</button>
			{showBoard ? <GameBoard setBotState={setBotState} /> : <TreeCanvas rootNode={botState[0]} />}
		</div>
	);
}

export default App;
